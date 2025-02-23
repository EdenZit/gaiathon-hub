import { Schema, model, models } from 'mongoose';

export interface IUpcomingEvent {
  topic: string;
  date: Date;
  description: string;
}

export interface IAnnouncement {
  topic: string;
  date: Date;
  description: string;
}

export interface IImportantDate {
  date: Date;
  description: string;
}

export interface IAnnouncementPage {
  upcomingEvents: IUpcomingEvent[];
  announcements: IAnnouncement[];
  importantDates: IImportantDate[];
  lastUpdated: Date;
  updatedBy: Schema.Types.ObjectId;
}

const upcomingEventSchema = new Schema<IUpcomingEvent>({
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
});

const announcementSchema = new Schema<IAnnouncement>({
  topic: {
    type: String,
    required: [true, 'Topic is required'],
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  }
});

const importantDateSchema = new Schema<IImportantDate>({
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  }
});

const announcementPageSchema = new Schema<IAnnouncementPage>({
  upcomingEvents: {
    type: [upcomingEventSchema],
    default: []
  },
  announcements: {
    type: [announcementSchema],
    default: []
  },
  importantDates: {
    type: [importantDateSchema],
    default: []
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updater is required']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret._id = ret._id.toString();
      ret.updatedBy = ret.updatedBy.toString();
      return ret;
    }
  }
});

export const AnnouncementPage = models.AnnouncementPage || model<IAnnouncementPage>('AnnouncementPage', announcementPageSchema); 