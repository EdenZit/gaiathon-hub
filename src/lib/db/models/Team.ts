import { Schema, model, Types, Document, Model, models } from 'mongoose';

type TeamCategory = 
  | 'Digital Platforms and Interactive Applications'
  | 'IoT-Enabled Smart Systems'
  | 'Geospatial Intelligence and Policy Innovation';

interface ITeamDocument extends Document {
  name: string;
  category: TeamCategory;
  leaderId: Types.ObjectId;
  members: Types.ObjectId[];
  status: 'pending' | 'approved' | 'rejected';
  isLeader: (userId: string) => boolean;
}

interface ITeamModel extends Model<ITeamDocument> {
  findByMember: (userId: string) => Promise<ITeamDocument[]>;
}

const teamSchema = new Schema<ITeamDocument>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      unique: true
    },
    category: {
      type: String,
      required: [true, 'Team category is required'],
      enum: [
        'Digital Platforms and Interactive Applications',
        'IoT-Enabled Smart Systems',
        'Geospatial Intelligence and Policy Innovation'
      ]
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

// Add indexes
teamSchema.index({ name: 1 });
teamSchema.index({ leaderId: 1 });
teamSchema.index({ members: 1 });

// Add instance methods
teamSchema.methods.isLeader = function(userId: string): boolean {
  return this.leaderId.toString() === userId;
};

// Add static methods
teamSchema.statics.findByMember = function(userId: string): Promise<ITeamDocument[]> {
  return this.find({ 
    $or: [
      { leaderId: new Types.ObjectId(userId) },
      { members: new Types.ObjectId(userId) }
    ]
  });
};

// Export the model with a check to prevent recompilation
export const Team = models.Team || model<ITeamDocument, ITeamModel>('Team', teamSchema); 