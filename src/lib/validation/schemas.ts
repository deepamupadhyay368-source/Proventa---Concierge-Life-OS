import { z } from 'zod';

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const emailSchema = z
  .string()
  .trim()
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

export const authenticationKeySchema = z
  .string()
  .min(8, 'Authentication Key must be at least 8 characters')
  .max(32, 'Authentication Key must not exceed 32 characters')
  .regex(
    /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~ ]+$/,
    'Authentication Key contains invalid characters',
  );

// Backward-compatible alias
export const securityKeySchema = authenticationKeySchema;

export interface AuthKeyStrengthResult {
  strength: 'WEAK' | 'MODERATE' | 'STRONG';
  score: number;
  label: string;
  feedback: string;
}

export function getAuthenticationKeyStrength(key: string): AuthKeyStrengthResult {
  if (!key || key.length === 0) {
    return { strength: 'WEAK', score: 0, label: 'Weak', feedback: 'Enter at least 8 characters.' };
  }
  if (key.length < 8) {
    return { strength: 'WEAK', score: Math.min(key.length * 4, 30), label: 'Weak', feedback: 'Must be at least 8 characters long.' };
  }

  let score = 30;
  const hasLower = /[a-z]/.test(key);
  const hasUpper = /[A-Z]/.test(key);
  const hasNumber = /[0-9]/.test(key);
  const hasSymbol = /[^a-zA-Z0-9]/.test(key);

  if (key.length >= 10) score += 15;
  if (key.length >= 14) score += 15;
  if (hasLower && hasUpper) score += 15;
  if (hasNumber) score += 15;
  if (hasSymbol) score += 10;

  if (score >= 75) {
    return { strength: 'STRONG', score: Math.min(score, 100), label: 'Strong', feedback: 'Strong private key complexity.' };
  }
  if (score >= 50) {
    return { strength: 'MODERATE', score, label: 'Moderate', feedback: 'Good key. Mix uppercase, lowercase, numbers, and symbols for maximum strength.' };
  }
  return { strength: 'WEAK', score, label: 'Weak', feedback: 'Add numbers, symbols, or mix uppercase and lowercase letters.' };
}

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    authenticationKey: authenticationKeySchema.optional(),
    confirmAuthenticationKey: z.string().optional(),
    securityKey: z.string().optional(),
    confirmSecurityKey: z.string().optional(),
    phone: phoneSchema.optional(),
    city: z.string().optional(),
    preferredComm: z.enum(['IN_APP', 'EMAIL', 'WHATSAPP', 'SMS']).optional(),
    dob: z.string().optional(),
    address: z.string().optional(),
    termsConsent: z.boolean().optional(),
  })
  .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (data) => {
      const key = data.authenticationKey || data.securityKey;
      const confirm = data.confirmAuthenticationKey || data.confirmSecurityKey;
      if (!key && !confirm) return true;
      return key === confirm;
    },
    {
      message: 'Authentication Keys do not match',
      path: ['confirmAuthenticationKey'],
    },
  );

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  authenticationKey: z.string().optional(),
  securityKey: z.string().optional(),
});

export const changeAuthenticationKeySchema = z
  .object({
    currentAuthenticationKey: z.string().min(1, 'Current Authentication Key is required'),
    newAuthenticationKey: authenticationKeySchema,
    confirmNewAuthenticationKey: z.string().min(1, 'Please confirm your new Authentication Key'),
  })
  .refine((data) => data.newAuthenticationKey === data.confirmNewAuthenticationKey, {
    message: 'New Authentication Keys do not match',
    path: ['confirmNewAuthenticationKey'],
  })
  .refine((data) => data.currentAuthenticationKey !== data.newAuthenticationKey, {
    message: 'New Authentication Key must be different from current key',
    path: ['newAuthenticationKey'],
  });

export const forgotAuthenticationKeySchema = z.object({
  email: emailSchema,
});

export const resetAuthenticationKeySchema = z
  .object({
    token: z.string().min(1, 'Recovery token is required'),
    newAuthenticationKey: authenticationKeySchema,
    confirmNewAuthenticationKey: z.string().min(1, 'Please confirm your new Authentication Key'),
  })
  .refine((data) => data.newAuthenticationKey === data.confirmNewAuthenticationKey, {
    message: 'New Authentication Keys do not match',
    path: ['confirmNewAuthenticationKey'],
  });

export const conciergeSignUpSchema = z
  .object({
    name: z.string().min(2, 'Full legal name must be at least 2 characters').max(100),
    email: emailSchema,
    phone: phoneSchema.optional(),
    employeeId: z.string().optional(),
    role: z.enum(['CONCIERGE', 'SENIOR_CONCIERGE', 'CONCIERGE_MANAGER', 'ADMIN']).default('CONCIERGE'),
    department: z.string().max(100).default('National Concierge Desk'),
    city: z.string().max(100).default('Ahmedabad'),
    password: passwordSchema,
    confirmPassword: z.string(),
    authenticationKey: authenticationKeySchema,
    confirmAuthenticationKey: z.string(),
    inviteCode: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.authenticationKey === data.confirmAuthenticationKey, {
    message: 'Authentication Keys do not match',
    path: ['confirmAuthenticationKey'],
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

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(10, 'New password must be at least 10 characters')
      .max(128, 'Password is too long')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/,
        'New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'New passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });


// ============================================================
// WAVE 1 SCHEMAS
// ============================================================

export const wave1RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  phone: phoneSchema,
  city: z.string().min(2, 'City is required').max(100).default('Ahmedabad'),
  profession: z.string().max(100).optional().or(z.literal('')),
  company: z.string().max(100).optional().or(z.literal('')),
  linkedinUrl: z.string().url('Please enter a valid LinkedIn URL').optional().or(z.literal('')),
  membershipTier: z.enum([
    'PRIVATE_INDIVIDUAL',
    'FOUNDING_FAMILY',
    'CORPORATE_EXECUTIVE',
  ]).default('PRIVATE_INDIVIDUAL'),
  annualLifestyleSpend: z.enum([
    'UNDER_10L',
    '10L_25L',
    '25L_50L',
    '50L_PLUS',
  ]).optional().or(z.literal('')),
  primaryInterests: z.array(z.string()).default([]),
  householdMembers: z.coerce.number().int().min(1).max(20).default(1),
  dietaryPreferences: z.string().max(300).optional().or(z.literal('')),
  frequentDestinations: z.string().max(300).optional().or(z.literal('')),
  intendedUse: z.string().max(1000).optional(),
  urgentRequirements: z.string().max(1000).optional(),
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
