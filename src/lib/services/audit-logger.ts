import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Schema, model, models } from 'mongoose';

// Define the audit log schema
const auditLogSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

// Get or create the model
const AuditLog = models.AuditLog || model('AuditLog', auditLogSchema);

export interface AuditLogEntry {
  action: string;
  resource: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAdminAction(entry: AuditLogEntry) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      throw new Error('No authenticated user found');
    }

    const log = new AuditLog({
      userId: session.user.id,
      action: entry.action,
      resource: entry.resource,
      details: entry.details,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });

    await log.save();

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Admin Audit] ${entry.action} on ${entry.resource}`, {
        userId: session.user.id,
        details: entry.details,
      });
    }
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - we don't want to break the main operation if logging fails
  }
}

export async function getAuditLogs(filters: {
  userId?: string;
  action?: string;
  resource?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  skip?: number;
}) {
  await connectDB();

  const query: Record<string, any> = {};
  if (filters.userId) query.userId = filters.userId;
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = filters.resource;
  if (filters.startDate || filters.endDate) {
    query.timestamp = {};
    if (filters.startDate) query.timestamp.$gte = filters.startDate;
    if (filters.endDate) query.timestamp.$lte = filters.endDate;
  }

  const logs = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .skip(filters.skip || 0)
    .limit(filters.limit || 50)
    .lean();

  const total = await AuditLog.countDocuments(query);

  return { logs, total };
} 