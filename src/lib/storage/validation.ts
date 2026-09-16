import path from 'path';
import crypto from 'crypto';
import { ValidationError } from '@/lib/errors';

export const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const DEFAULT_URL_EXPIRATION_SECONDS = 900; // 15 minutes
export const MAX_URL_EXPIRATION_SECONDS = 3600; // 1 hour

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'image/heif': ['.heif'],
  // Documents
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/csv': ['.csv'],
};

// Blacklisted extensions that must never be uploaded regardless of declared MIME type
const DANGEROUS_EXTENSIONS = new Set([
  '.exe', '.bat', '.cmd', '.sh', '.bash', '.ps1', '.psm1', '.vbs', '.js', '.mjs',
  '.cjs', '.ts', '.tsx', '.jsx', '.html', '.htm', '.php', '.phtml', '.py', '.rb',
  '.jar', '.war', '.ear', '.com', '.scr', '.msi', '.dll', '.bin', '.iso', '.svg',
]);

/**
 * Strips path separators, control characters, null bytes, and traversal tokens from a filename.
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return 'document';
  }

  // Remove null bytes and control characters
  let clean = filename.replace(/[\x00-\x1F\x7F]/g, '');

  // Extract base filename to strip any path components
  clean = path.basename(clean);

  // Strip dangerous traversal characters
  clean = clean.replace(/[\/\\]/g, '').replace(/\.\.+/g, '.');

  // Replace special characters except safe ones (alphanumeric, dash, underscore, dot)
  clean = clean.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Limit length while preserving extension
  const ext = path.extname(clean);
  const base = path.basename(clean, ext);
  const truncatedBase = base.slice(0, 80) || 'file';

  return `${truncatedBase}${ext.toLowerCase()}`;
}

/**
 * Sanitizes a path segment (such as customer ID or request ID) to prevent directory traversal.
 */
export function sanitizePathSegment(segment: string): string {
  if (!segment || typeof segment !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(segment)) {
    throw new ValidationError('Path segment contains invalid or traversal characters');
  }
  return segment;
}

/**
 * Validates file upload metadata against security rules.
 */
export function validateUploadMetadata(params: {
  filename: string;
  mimeType: string;
  sizeBytes: number;
}): { sanitizedFilename: string; ext: string } {
  const { filename, mimeType, sizeBytes } = params;

  if (!filename || typeof filename !== 'string') {
    throw new ValidationError('Filename is required');
  }

  if (!mimeType || typeof mimeType !== 'string') {
    throw new ValidationError('MIME type is required');
  }

  if (typeof sizeBytes !== 'number' || isNaN(sizeBytes) || sizeBytes <= 0) {
    throw new ValidationError('Valid file size in bytes is required');
  }

  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new ValidationError(`File size exceeds maximum allowed limit of ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB`);
  }

  const normalizedMime = mimeType.toLowerCase().trim();
  const allowedExtensions = ALLOWED_MIME_TYPES[normalizedMime];

  if (!allowedExtensions) {
    throw new ValidationError(`Unsupported file MIME type: ${mimeType}`);
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ext) {
    throw new ValidationError('File must have a valid extension');
  }

  if (DANGEROUS_EXTENSIONS.has(ext)) {
    throw new ValidationError(`File extension ${ext} is strictly prohibited`);
  }

  if (!allowedExtensions.includes(ext)) {
    throw new ValidationError(`Extension ${ext} does not match declared MIME type ${mimeType}`);
  }

  const sanitizedFilename = sanitizeFilename(filename);

  return { sanitizedFilename, ext };
}

/**
 * Generates an isolated, server-controlled object key within the customer's namespace.
 */
export function generateCustomerObjectKey(params: {
  customerId: string;
  originalFilename: string;
  requestId?: string;
}): string {
  const cleanCustomer = sanitizePathSegment(params.customerId);
  const cleanFilename = sanitizeFilename(params.originalFilename);
  const uniqueToken = crypto.randomUUID();

  if (params.requestId) {
    const cleanRequest = sanitizePathSegment(params.requestId);
    return `customers/${cleanCustomer}/requests/${cleanRequest}/${uniqueToken}-${cleanFilename}`;
  }

  return `customers/${cleanCustomer}/uploads/${uniqueToken}-${cleanFilename}`;
}

/**
 * Validates that an object key belongs to the expected customer and has no traversal tokens.
 */
export function assertKeyAccess(key: string, expectedCustomerId?: string): void {
  if (!key || typeof key !== 'string') {
    throw new ValidationError('Storage key is required');
  }

  // Strictly disallow traversal or backslashes
  if (key.includes('..') || key.includes('\\') || key.startsWith('/')) {
    throw new ValidationError('Invalid storage key: path traversal detected');
  }

  // Must reside inside customers/ namespace
  if (!key.startsWith('customers/')) {
    throw new ValidationError('Invalid storage key: outside customer namespace');
  }

  if (expectedCustomerId) {
    const cleanCustomer = sanitizePathSegment(expectedCustomerId);
    const expectedPrefix = `customers/${cleanCustomer}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new ValidationError('Access denied: key does not belong to the authenticated customer');
    }
  }
}
