import { connectDB } from '../lib/mongodb';
import { AnnouncementPage } from '../models/Announcement';

async function updateAnnouncements() {
  try {
    await connectDB();

    const newData = {
      upcomingEvents: [{
        topic: 'GAIAthon 2025 Webinar Series',
        date: new Date('2025-04-08'),
        description: 'The GAIAthon webinar series will begin on 8 April 2025. Experts will engage students on a range of topics designed to enhance their learning and participation in GAIAthon.'
      }],
      importantDates: [
        { date: new Date('2025-04-08'), description: 'GAIAthon\'25 Webinar Series' },
        { date: new Date('2025-05-16'), description: 'Submission of Round One PowerPoint Pitch' },
        { date: new Date('2025-05-23'), description: 'Announcement of finalists' },
        { date: new Date('2025-05-23'), description: 'Development of Solution/Prototypes' },
        { date: new Date('2025-06-27'), description: 'Submission of Final Products' },
        { date: new Date('2025-07-01'), description: 'Announcement of Local Winner' },
        { date: new Date('2025-08-18'), description: 'GAIAfest (Accra, Ghana)' }
      ]
    };

    let page = await AnnouncementPage.findOne();
    
    if (!page) {
      page = await AnnouncementPage.create(newData);
    } else {
      page.upcomingEvents = newData.upcomingEvents;
      page.importantDates = newData.importantDates;
      page.lastUpdated = new Date();
      await page.save();
    }

    console.log('Announcements page updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error updating announcements page:', error);
    process.exit(1);
  }
}

updateAnnouncements(); 