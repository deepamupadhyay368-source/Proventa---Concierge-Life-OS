import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { DEFAULT_URL_EXPIRATION_SECONDS, MAX_URL_EXPIRATION_SECONDS } from './validation';

export interface StorageConfig {
  provider: 's3' | 'r2';
  bucket: string;
  region: string;
  endpoint?: string;
  isConfigured: boolean;
}

const globalForStorage = globalThis as unknown as {
  s3Client: S3Client | undefined;
};

export function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 's3').toLowerCase() === 'r2' ? 'r2' : 's3';

  if (provider === 'r2') {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET || process.env.AWS_S3_BUCKET || 'proventa-uploads';
    const isConfigured = Boolean(accountId && accessKeyId && secretAccessKey && bucket);

    return {
      provider: 'r2',
      bucket,
      region: 'auto',
      endpoint: accountId ? `https://${accountId}.r2.cloudflarestorage.com` : undefined,
      isConfigured,
    };
  }

  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = process.env.AWS_S3_BUCKET || 'proventa-uploads';
  const region = process.env.AWS_REGION || 'ap-south-1';
  const endpoint = process.env.AWS_S3_ENDPOINT;
  const isConfigured = Boolean(accessKeyId && secretAccessKey && bucket);

  return {
    provider: 's3',
    bucket,
    region,
    endpoint,
    isConfigured,
  };
}

export function isStorageConfigured(): boolean {
  return getStorageConfig().isConfigured;
}

export function getS3Client(): S3Client | null {
  const config = getStorageConfig();
  if (!config.isConfigured) {
    return null;
  }

  if (globalForStorage.s3Client) {
    return globalForStorage.s3Client;
  }

  try {
    const client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      credentials: {
        accessKeyId: (config.provider === 'r2'
          ? process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID
          : process.env.AWS_ACCESS_KEY_ID) || '',
        secretAccessKey: (config.provider === 'r2'
          ? process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY
          : process.env.AWS_SECRET_ACCESS_KEY) || '',
      },
    });

    globalForStorage.s3Client = client;
    return globalForStorage.s3Client;
  } catch (err: any) {
    logger.error({ err: err.message }, '[Storage] Failed to initialize S3 client');
    return null;
  }
}

/**
 * Generates a presigned PUT URL for client-direct uploads.
 * Objects are stored privately with no public ACL.
 */
export async function generatePresignedUploadUrl(params: {
  key: string;
  contentType: string;
  sizeBytes?: number;
  expiresInSeconds?: number;
}): Promise<{ uploadUrl: string; key: string; expiresInSeconds: number }> {
  const config = getStorageConfig();
  if (!config.isConfigured) {
    throw new AppError('Object storage is not configured on this server', 'STORAGE_NOT_CONFIGURED', 503);
  }

  const client = getS3Client();
  if (!client) {
    throw new AppError('Failed to initialize storage client', 'STORAGE_CLIENT_ERROR', 500);
  }

  const expiresIn = Math.min(
    Math.max(params.expiresInSeconds || DEFAULT_URL_EXPIRATION_SECONDS, 60),
    MAX_URL_EXPIRATION_SECONDS
  );

  try {
    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: params.key,
      ContentType: params.contentType,
      ...(params.sizeBytes ? { ContentLength: params.sizeBytes } : {}),
      // Crucial: do not set public ACL; bucket policy remains private
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn });

    return {
      uploadUrl,
      key: params.key,
      expiresInSeconds: expiresIn,
    };
  } catch (err: any) {
    logger.error({ err: err.message }, '[Storage] Failed to generate presigned upload URL');
    throw new AppError('Failed to generate secure upload URL', 'STORAGE_PRESIGN_ERROR', 500);
  }
}

/**
 * Generates a presigned GET URL for authenticated downloads.
 */
export async function generatePresignedDownloadUrl(params: {
  key: string;
  filename?: string;
  expiresInSeconds?: number;
}): Promise<{ downloadUrl: string; key: string; expiresInSeconds: number }> {
  const config = getStorageConfig();
  if (!config.isConfigured) {
    throw new AppError('Object storage is not configured on this server', 'STORAGE_NOT_CONFIGURED', 503);
  }

  const client = getS3Client();
  if (!client) {
    throw new AppError('Failed to initialize storage client', 'STORAGE_CLIENT_ERROR', 500);
  }

  const expiresIn = Math.min(
    Math.max(params.expiresInSeconds || DEFAULT_URL_EXPIRATION_SECONDS, 60),
    MAX_URL_EXPIRATION_SECONDS
  );

  try {
    const command = new GetObjectCommand({
      Bucket: config.bucket,
      Key: params.key,
      ...(params.filename
        ? {
            ResponseContentDisposition: `attachment; filename="${encodeURIComponent(params.filename)}"`,
          }
        : {}),
    });

    const downloadUrl = await getSignedUrl(client, command, { expiresIn });

    return {
      downloadUrl,
      key: params.key,
      expiresInSeconds: expiresIn,
    };
  } catch (err: any) {
    logger.error({ err: err.message }, '[Storage] Failed to generate presigned download URL');
    throw new AppError('Failed to generate secure download URL', 'STORAGE_DOWNLOAD_ERROR', 500);
  }
}

/**
 * Checks whether an object exists in the storage bucket.
 */
export async function checkObjectExists(key: string): Promise<boolean> {
  const config = getStorageConfig();
  if (!config.isConfigured) {
    return false;
  }

  const client = getS3Client();
  if (!client) {
    return false;
  }

  try {
    const command = new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (err: any) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) {
      return false;
    }
    logger.warn({ err: err.message }, '[Storage] Error checking object existence');
    return false;
  }
}

/**
 * Deletes an object from the storage bucket.
 */
export async function deleteStorageObject(key: string): Promise<boolean> {
  const config = getStorageConfig();
  if (!config.isConfigured) {
    throw new AppError('Object storage is not configured on this server', 'STORAGE_NOT_CONFIGURED', 503);
  }

  const client = getS3Client();
  if (!client) {
    throw new AppError('Failed to initialize storage client', 'STORAGE_CLIENT_ERROR', 500);
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: config.bucket,
      Key: key,
    });
    await client.send(command);
    return true;
  } catch (err: any) {
    logger.error({ err: err.message }, '[Storage] Failed to delete object');
    throw new AppError('Failed to delete storage object', 'STORAGE_DELETE_ERROR', 500);
  }
}
