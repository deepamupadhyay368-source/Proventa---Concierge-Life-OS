import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const emailSchema = z
  .string()
  .email('Please enter a valid email address')
  .min(5)
  .max(254)
  .toLowerCase();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password is too long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain uppercase, lowercase, and a number',
  );

export const phoneSchema = z
  .string()
  .regex(
    /^(\+91)?[6-9]\d{9}$/,
    'Please enter a valid Indian mobile number',
  )
  .optional()
  .or(z.literal(''));

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ============================================================
// WAVE 1 SCHEMAS
// ============================================================

export const wave1RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().min(2).max(100).default('Global'),
  profession: z.string().max(100).optional().or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  intendedUse: z.string().max(500).optional(),
  communicationPref: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).default('EMAIL'),
  referralSource: z.string().max(200).optional().or(z.literal('')),
  consentGiven: z.boolean().refine((v) => v === true, {
    message: 'You must agree to the terms and privacy policy',
  }),
});

// ============================================================
// REQUEST SCHEMAS
// ============================================================

export const createRequestSchema = z.object({
  rawInput: z
    .string()
    .min(5, 'Please describe what you need in a bit more detail')
    .max(2000, 'Request is too long — please break it into parts'),
  urgency: z.enum(['NORMAL', 'URGENT', 'ASAP']).default('NORMAL'),
  cityId: z.string().cuid().optional(),
});

export const sendMessageSchema = z.object({
  requestId: z.string().cuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'FILE']).default('TEXT'),
});

export const approvalResponseSchema = z.object({
  approvalId: z.string().cuid(),
  response: z.enum(['APPROVED', 'DECLINED', 'CHANGED']),
  note: z.string().max(500).optional(),
});

// ============================================================
// CUSTOMER SCHEMAS
// ============================================================

export const onboardingSchema = z.object({
  primaryUseCases: z
    .array(z.enum(['dining', 'travel', 'shopping', 'experiences', 'appointments', 'home', 'personal', 'business', 'other']))
    .min(1, 'Please select at least one'),
  communicationPref: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).default('IN_APP'),
  city: z.string().min(2).max(100).default('Ahmedabad'),
});

export const updatePreferenceSchema = z.object({
  category: z.string().min(1).max(50),
  key: z.string().min(1).max(100),
  value: z.any(),
});

// ============================================================
// ADMIN SCHEMAS
// ============================================================

export const inviteRegistrationSchema = z.object({
  registrationId: z.string().cuid(),
  note: z.string().max(500).optional(),
});

export const updateRegistrationStatusSchema = z.object({
  registrationId: z.string().cuid(),
  status: z.enum(['WAITLISTED', 'INVITED', 'REGISTERED', 'ONBOARDED', 'ACTIVE', 'DECLINED']),
  note: z.string().max(500).optional(),
});

export const createProviderSchema = z.object({
  name: z.string().min(2).max(200),
  cityId: z.string().cuid(),
  categoryId: z.string().cuid(),
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  email: emailSchema.optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  bookingMethod: z.enum(['PHONE', 'EMAIL', 'WALK_IN', 'WEBSITE', 'API', 'WHATSAPP', 'APP']).default('PHONE'),
  notes: z.string().max(2000).optional(),
});

export const feedbackSchema = z.object({
  requestId: z.string().cuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const supportTicketSchema = z.object({
  subject: z.string().min(5).max(200),
  description: z.string().min(10).max(2000),
  requestId: z.string().cuid().optional(),
});
