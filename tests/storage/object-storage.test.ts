import { describe, it, expect, vi, beforeEach } from 'vitest';

// Top-level mock for auth to avoid next-auth ESM resolution issue in Vitest
vi.mock('@/lib/auth/session', () => ({
  requireAuth: vi.fn(),
  requireRole: vi.fn(),
  requireAnyRole: vi.fn(),
  hasRole: vi.fn((user: any, role: string) => (user.roles || []).includes(role)),
  hasAnyRole: vi.fn((user: any, roles: string[]) => roles.some((r) => (user.roles || []).includes(r))),
  getSession: vi.fn(),
}));

import {
  validateUploadMetadata,
  sanitizeFilename,
  sanitizePathSegment,
  generateCustomerObjectKey,
  assertKeyAccess,
  MAX_FILE_SIZE_BYTES,
} from '@/lib/storage/validation';
import {
  getStorageConfig,
  isStorageConfigured,
  generatePresignedUploadUrl,
} from '@/lib/storage/s3';
import { POST as uploadUrlHandler } from '@/app/api/storage/upload-url/route';
import { POST as downloadUrlHandler } from '@/app/api/storage/download-url/route';
import { DELETE as deleteHandler } from '@/app/api/storage/delete/route';
import { requireAuth } from '@/lib/auth/session';
import { AuthenticationError } from '@/lib/errors';
import { db } from '@/lib/db';

describe('Phase 3.3: Secure Object Storage Layer Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('1. File Validation & Path Traversal Defense', () => {
    it('accepts legitimate document and image metadata and sanitizes filenames', () => {
      const result = validateUploadMetadata({
        filename: 'Passport Scan (Copy).pdf',
        mimeType: 'application/pdf',
        sizeBytes: 1024 * 500, // 500 KB
      });

      expect(result.ext).toBe('.pdf');
      expect(result.sanitizedFilename).toBe('Passport_Scan__Copy_.pdf');
    });

    it('rejects files exceeding maximum file size', () => {
      expect(() =>
        validateUploadMetadata({
          filename: 'large_archive.pdf',
          mimeType: 'application/pdf',
          sizeBytes: MAX_FILE_SIZE_BYTES + 1,
        })
      ).toThrowError(/exceeds maximum allowed limit/);
    });

    it('rejects unsupported or spoofed MIME types', () => {
      expect(() =>
        validateUploadMetadata({
          filename: 'malicious.bin',
          mimeType: 'application/octet-stream',
          sizeBytes: 1024,
        })
      ).toThrowError(/Unsupported file MIME type/);
    });

    it('rejects mismatched extensions for a declared MIME type', () => {
      expect(() =>
        validateUploadMetadata({
          filename: 'photo.png',
          mimeType: 'image/jpeg',
          sizeBytes: 1024,
        })
      ).toThrowError(/does not match declared MIME type/);
    });

    it('strictly prohibits dangerous and executable extensions', () => {
      const dangerousList = ['.exe', '.sh', '.bat', '.js', '.php', '.svg'];
      for (const badExt of dangerousList) {
        expect(() =>
          validateUploadMetadata({
            filename: `exploit${badExt}`,
            mimeType: 'text/plain',
            sizeBytes: 100,
          })
        ).toThrowError(/strictly prohibited/);
      }
    });

    it('sanitizes path traversal tokens from filenames', () => {
      const sanitized = sanitizeFilename('../../../etc/passwd.pdf');
      expect(sanitized).not.toContain('/');
      expect(sanitized).not.toContain('..');
      expect(sanitized).toBe('passwd.pdf');
    });

    it('rejects invalid path segments in customer and request identifiers', () => {
      expect(() => sanitizePathSegment('../customer1')).toThrowError(/traversal/);
      expect(() => sanitizePathSegment('cust/omer')).toThrowError(/traversal/);
      expect(sanitizePathSegment('cust_123-abc')).toBe('cust_123-abc');
    });
  });

  describe('2. Customer Isolation & Key Generation', () => {
    it('constructs server-controlled keys strictly scoped under customers/{customerId}', () => {
      const key = generateCustomerObjectKey({
        customerId: 'cust_abc123',
        originalFilename: 'id_front.jpg',
      });

      expect(key.startsWith('customers/cust_abc123/uploads/')).toBe(true);
      expect(key.endsWith('-id_front.jpg')).toBe(true);
      expect(key).not.toContain('..');
    });

    it('constructs request-scoped keys under customers/{customerId}/requests/{requestId}', () => {
      const key = generateCustomerObjectKey({
        customerId: 'cust_abc123',
        requestId: 'req_xyz789',
        originalFilename: 'hotel_voucher.pdf',
      });

      expect(key.startsWith('customers/cust_abc123/requests/req_xyz789/')).toBe(true);
      expect(key.endsWith('-hotel_voucher.pdf')).toBe(true);
    });

    it('assertKeyAccess enforces customer isolation and prevents cross-tenant access', () => {
      const validKey = 'customers/cust_alpha/uploads/uuid-doc.pdf';
      expect(() => assertKeyAccess(validKey, 'cust_alpha')).not.toThrow();

      // Cross-tenant attempt
      expect(() => assertKeyAccess(validKey, 'cust_beta')).toThrowError(/does not belong to the authenticated customer/);

      // Traversal attempt
      expect(() => assertKeyAccess('customers/cust_alpha/../../secrets.txt', 'cust_alpha')).toThrowError(/path traversal/);
      expect(() => assertKeyAccess('/etc/shadow', 'cust_alpha')).toThrowError(/path traversal/);
      expect(() => assertKeyAccess('system/keys/auth.json', 'cust_alpha')).toThrowError(/outside customer namespace/);
    });
  });

  describe('3. Storage Configuration & Safe Fallback', () => {
    it('safely detects unconfigured storage without throwing or leaking secrets', () => {
      const originalAccessKey = process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_ACCESS_KEY_ID;

      try {
        const config = getStorageConfig();
        expect(config.isConfigured).toBe(false);
        expect(isStorageConfigured()).toBe(false);
      } finally {
        if (originalAccessKey) process.env.AWS_ACCESS_KEY_ID = originalAccessKey;
      }
    });

    it('rejects presigned URL generation when storage credentials are not configured', async () => {
      const originalAccessKey = process.env.AWS_ACCESS_KEY_ID;
      delete process.env.AWS_ACCESS_KEY_ID;

      try {
        await expect(
          generatePresignedUploadUrl({
            key: 'customers/c1/uploads/test.pdf',
            contentType: 'application/pdf',
          })
        ).rejects.toThrowError(/Object storage is not configured/);
      } finally {
        if (originalAccessKey) process.env.AWS_ACCESS_KEY_ID = originalAccessKey;
      }
    });
  });

  describe('4. Storage API Endpoints Security & RBAC', () => {
    it('POST /api/storage/upload-url rejects unauthenticated requests', async () => {
      vi.mocked(requireAuth).mockRejectedValue(new AuthenticationError() as any);

      const req = new Request('http://localhost:3000/api/storage/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'test.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 1000,
        }),
      });

      const res = await uploadUrlHandler(req as any);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.code).toBe('AUTHENTICATION_REQUIRED');
    });

    it('POST /api/storage/upload-url prevents customer A from uploading to customer B request', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        id: 'user_cust_A',
        email: 'a@example.com',
        roles: ['CUSTOMER'],
      } as any);

      vi.spyOn(db.customerProfile, 'findUnique').mockResolvedValue({
        id: 'profile_A',
        userId: 'user_cust_A',
      } as any);

      // Request belongs to profile_B
      vi.spyOn(db.conciergeRequest, 'findUnique').mockResolvedValue({
        id: 'req_belongs_to_B',
        customerId: 'profile_B',
      } as any);

      const req = new Request('http://localhost:3000/api/storage/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: 'booking.pdf',
          mimeType: 'application/pdf',
          sizeBytes: 5000,
          requestId: 'req_belongs_to_B',
        }),
      });

      const res = await uploadUrlHandler(req as any);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Access denied');
    });

    it('POST /api/storage/download-url enforces ownership and isolates customer downloads', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        id: 'user_cust_A',
        email: 'a@example.com',
        roles: ['CUSTOMER'],
      } as any);

      // Attachment belongs to user_cust_B
      vi.spyOn(db.requestAttachment, 'findUnique').mockResolvedValue({
        id: 'att_B',
        uploadedBy: 'user_cust_B',
        storageKey: 'customers/profile_B/uploads/secret.pdf',
        filename: 'secret.pdf',
        deletedAt: null,
        request: {
          customer: {
            userId: 'user_cust_B',
          },
        },
      } as any);

      const req = new Request('http://localhost:3000/api/storage/download-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId: 'att_B' }),
      });

      const res = await downloadUrlHandler(req as any);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Access denied');
    });

    it('DELETE /api/storage/delete prevents unauthorized deletion of other users attachments', async () => {
      vi.mocked(requireAuth).mockResolvedValue({
        id: 'user_cust_A',
        email: 'a@example.com',
        roles: ['CUSTOMER'],
      } as any);

      vi.spyOn(db.requestAttachment, 'findUnique').mockResolvedValue({
        id: 'att_B',
        uploadedBy: 'user_cust_B',
        storageKey: 'customers/profile_B/uploads/other.pdf',
        deletedAt: null,
        request: {
          customer: {
            userId: 'user_cust_B',
          },
        },
      } as any);

      const req = new Request('http://localhost:3000/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attachmentId: 'att_B' }),
      });

      const res = await deleteHandler(req as any);
      expect(res.status).toBe(403);
      const data = await res.json();
      expect(data.error).toContain('Access denied');
    });
  });
});
