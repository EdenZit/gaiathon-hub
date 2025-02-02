import { z } from 'zod';

const envSchema = z.object({
  // MongoDB
  MONGODB_URI: z.string().url().startsWith('mongodb+srv://'),

  // Next Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),

  // Session Configuration
  SESSION_MAX_AGE: z.string().transform((val) => parseInt(val, 10)),
  JWT_MAX_AGE: z.string().transform((val) => parseInt(val, 10)),

  // Admin Configuration
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/,
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  ),

  // Rate Limiting
  ENABLE_RATE_LIMITING: z.string().transform((val) => val === 'true'),
  RATE_LIMIT_REQUESTS: z.string().transform((val) => parseInt(val, 10)),
  RATE_LIMIT_WINDOW: z.string().transform((val) => parseInt(val, 10)),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Security
  ENABLE_CSRF_PROTECTION: z.string().transform((val) => val === 'true'),

  // Redis
  REDIS_URL: z.string().url(),

  // API Keys (optional as they might not be needed in all environments)
  OPENAI_API_KEY: z.string().optional(),
  WEKEO_API_KEY: z.string().optional(),
  DUNIA_API_KEY: z.string().optional(),

  // Other
  NODE_ENV: z.enum(['development', 'production', 'test']),
  NEXT_TELEMETRY_DISABLED: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(): Env {
  try {
    const parsed = envSchema.parse(process.env);
    
    // Additional validation for production environment
    if (parsed.NODE_ENV === 'production') {
      if (!parsed.UPSTASH_REDIS_REST_URL || !parsed.UPSTASH_REDIS_REST_TOKEN) {
        throw new Error('Redis configuration is required in production');
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
    } else {
      console.error('❌ Error validating environment variables:', error);
    }
    process.exit(1);
  }
}

// Validate environment variables
export const env = validateEnv(); 