import { Schema, model, models, Document } from 'mongoose';

export interface IErrorLog extends Document {
  code: string;
  message: string;
  stack?: string;
  details?: any;
  path: string;
  method: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  requestQuery?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
}

const errorLogSchema = new Schema<IErrorLog>({
  code: { type: String, required: true },
  message: { type: String, required: true },
  stack: String,
  details: Schema.Types.Mixed,
  path: { type: String, required: true },
  method: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  userId: String,
  userEmail: String,
  userRole: String,
  ip: String,
  userAgent: String,
  requestBody: Schema.Types.Mixed,
  requestQuery: Schema.Types.Mixed,
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: Date,
  resolvedBy: String,
  resolution: String
}, {
  timestamps: true
});

// Optimized indexes for common queries
errorLogSchema.index({ code: 1, timestamp: -1 });
errorLogSchema.index({ severity: 1, resolved: 1 });
errorLogSchema.index({ userId: 1, timestamp: -1 });
errorLogSchema.index({ timestamp: 1 }, { 
  expireAfterSeconds: 90 * 24 * 60 * 60,  // 90 days TTL
  background: true 
});

// Compound index for auth error tracking
errorLogSchema.index({ 
  code: 1, 
  timestamp: 1 
}, { 
  sparse: true,
  background: true 
});

// Ensure model is not redefined
export const ErrorLog = models.ErrorLog || model<IErrorLog>('ErrorLog', errorLogSchema); 