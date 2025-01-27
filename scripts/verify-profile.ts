import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

async function verifyProfileData() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully to MongoDB Atlas');

    // Get all users with their profile data
    const users = await mongoose.connection.collection('users').find({}).toArray();
    
    console.log('\n=== User Profiles in Database ===\n');
    users.forEach((user: any, index: number) => {
      console.log(`User ${index + 1}:`);
      console.log('Email:', user.email);
      console.log('Name:', user.firstName, user.lastName);
      console.log('Full Name:', user.fullName);
      console.log('Institution:', user.institution);
      console.log('Department:', user.department);
      console.log('Location:', user.location);
      console.log('GAIA Club:', user.gaiaClubName);
      console.log('Role:', user.gaiaClubRole);
      console.log('Team Joining Preference:', user.teamJoiningPreference);
      console.log('Contact Info:', user.contactInfo);
      console.log('Bio:', user.bio);
      console.log('Phone Number:', user.phoneNumber);
      console.log('Field of Study:', user.fieldOfStudy);
      console.log('Year of Study:', user.yearOfStudy);
      console.log('Country:', user.country);
      console.log('Previous Hackathon Experience:', user.previousHackathonExperience);
      console.log('GitHub URL:', user.githubUrl);
      console.log('Personal Website:', user.personalWebsite);
      console.log('LinkedIn URL:', user.linkedinUrl);
      console.log('Tech Skills:', JSON.stringify(user.techSkills, null, 2));
      console.log('Profile Completed:', user.profileCompleted);
      console.log('Created At:', user.createdAt);
      console.log('Updated At:', user.updatedAt);
      console.log('Raw Document:', JSON.stringify(user, null, 2));
      console.log('-------------------\n');
    });

    console.log(`Total users found: ${users.length}`);
  } catch (error) {
    console.error('Error verifying profile data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

verifyProfileData(); 