import { config } from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from '../src/lib/mongodb';
import { User } from '../src/lib/db/models/User';
import { compare } from 'bcryptjs';
import { validateEnv } from '../src/lib/config/env';

// Load environment variables
config();

interface SecurityCheck {
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning';
  details?: string;
}

async function checkEnvironmentVariables(): Promise<SecurityCheck> {
  try {
    validateEnv();
    return {
      name: 'Environment Variables',
      description: 'Check environment variables configuration',
      status: 'pass'
    };
  } catch (error) {
    return {
      name: 'Environment Variables',
      description: 'Check environment variables configuration',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkAdminPassword(): Promise<SecurityCheck> {
  try {
    await connectDB();
    const admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    
    if (!admin) {
      return {
        name: 'Admin Account',
        description: 'Verify admin account security',
        status: 'fail',
        details: 'Admin account not found'
      };
    }

    // Check password complexity
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
    const isPasswordComplex = passwordRegex.test(process.env.ADMIN_PASSWORD || '');

    if (!isPasswordComplex) {
      return {
        name: 'Admin Account',
        description: 'Verify admin account security',
        status: 'warning',
        details: 'Admin password does not meet complexity requirements'
      };
    }

    return {
      name: 'Admin Account',
      description: 'Verify admin account security',
      status: 'pass'
    };
  } catch (error) {
    return {
      name: 'Admin Account',
      description: 'Verify admin account security',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkFilePermissions(): Promise<SecurityCheck> {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envStats = fs.statSync(envPath);
    const envPerms = envStats.mode & 0o777;

    if (envPerms !== 0o600) {
      return {
        name: 'File Permissions',
        description: 'Check sensitive file permissions',
        status: 'warning',
        details: '.env file permissions are too permissive'
      };
    }

    return {
      name: 'File Permissions',
      description: 'Check sensitive file permissions',
      status: 'pass'
    };
  } catch (error) {
    return {
      name: 'File Permissions',
      description: 'Check sensitive file permissions',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkDatabaseConnection(): Promise<SecurityCheck> {
  try {
    await connectDB();
    return {
      name: 'Database Connection',
      description: 'Verify database connection security',
      status: 'pass'
    };
  } catch (error) {
    return {
      name: 'Database Connection',
      description: 'Verify database connection security',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function checkSecurityHeaders(): Promise<SecurityCheck> {
  try {
    const nextConfigPath = path.resolve(process.cwd(), 'next.config.js');
    const configContent = fs.readFileSync(nextConfigPath, 'utf-8');

    const requiredHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Referrer-Policy',
      'Content-Security-Policy',
      'Strict-Transport-Security',
      'Permissions-Policy'
    ];

    const missingHeaders = requiredHeaders.filter(header => 
      !configContent.includes(header)
    );

    if (missingHeaders.length > 0) {
      return {
        name: 'Security Headers',
        description: 'Check security headers configuration',
        status: 'warning',
        details: `Missing headers: ${missingHeaders.join(', ')}`
      };
    }

    return {
      name: 'Security Headers',
      description: 'Check security headers configuration',
      status: 'pass'
    };
  } catch (error) {
    return {
      name: 'Security Headers',
      description: 'Check security headers configuration',
      status: 'fail',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function runSecurityChecks() {
  console.log('Running security checks...\n');

  const checks = [
    checkEnvironmentVariables(),
    checkAdminPassword(),
    checkFilePermissions(),
    checkDatabaseConnection(),
    checkSecurityHeaders()
  ];

  const results = await Promise.all(checks);

  // Display results
  console.log('Security Check Results:\n');
  results.forEach(check => {
    const icon = check.status === 'pass' ? '✅' :
                 check.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${icon} ${check.name}`);
    console.log(`   Description: ${check.description}`);
    console.log(`   Status: ${check.status.toUpperCase()}`);
    if (check.details) {
      console.log(`   Details: ${check.details}`);
    }
    console.log('');
  });

  // Summary
  const summary = results.reduce(
    (acc, check) => {
      acc[check.status]++;
      return acc;
    },
    { pass: 0, warning: 0, fail: 0 }
  );

  console.log('Summary:');
  console.log(`✅ Passed: ${summary.pass}`);
  console.log(`⚠️ Warnings: ${summary.warning}`);
  console.log(`❌ Failed: ${summary.fail}`);

  // Exit with error if any checks failed
  if (summary.fail > 0) {
    process.exit(1);
  }
}

// Run the checks
runSecurityChecks().catch(error => {
  console.error('Error running security checks:', error);
  process.exit(1);
}); 