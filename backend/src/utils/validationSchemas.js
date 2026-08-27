const { z } = require('zod');

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])/;

const signupSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .refine(
      (val) => passwordRegex.test(val),
      'Password must contain at least one uppercase letter (A-Z) and one special character (!@#$%^&*)'
    ),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters long')
    .max(16, 'New password must not exceed 16 characters')
    .refine(
      (val) => passwordRegex.test(val),
      'New password must contain at least one uppercase letter (A-Z) and one special character (!@#$%^&*)'
    ),
});

const createUserAdminSchema = z.object({
  name: z
    .string()
    .min(20, 'Name must be at least 20 characters long')
    .max(60, 'Name must not exceed 60 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(16, 'Password must not exceed 16 characters')
    .refine(
      (val) => passwordRegex.test(val),
      'Password must contain at least one uppercase letter (A-Z) and one special character (!@#$%^&*)'
    ),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(400, 'Address must not exceed 400 characters'),
  role: z.enum(['ADMIN', 'NORMAL_USER', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, NORMAL_USER, or STORE_OWNER' }),
  }),
});

const createStoreSchema = z.object({
  name: z.string().min(1, 'Store name is required').max(60, 'Store name cannot exceed 60 characters'),
  email: z.string().email('Please enter a valid store email address'),
  address: z
    .string()
    .min(1, 'Store address is required')
    .max(400, 'Store address cannot exceed 400 characters'),
  ownerId: z.string().min(1, 'Store owner ID is required'),
});

const rateStoreSchema = z.object({
  value: z
    .number({ invalid_type_error: 'Rating value must be a number' })
    .int('Rating value must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
});

module.exports = {
  signupSchema,
  loginSchema,
  updatePasswordSchema,
  createUserAdminSchema,
  createStoreSchema,
  rateStoreSchema,
};
