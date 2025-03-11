import { connectDB } from '../src/lib/mongodb';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../src/lib/db/models/User';

// Load environment variables
dotenv.config();

// Define the old User model schema
const oldUserSchema = new mongoose.Schema({
  email: String,
  securityQuestion: {
    question: String,
    answer: String
  }
});

interface OldUserDocument extends mongoose.Document {
  email: string;
  securityQuestion?: {
    question?: string;
    answer?: string;
  };
}

async function migrateSecurityQuestions() {
  try {
    console.log('Connecting to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB');

    // Create a model for the old User collection
    const OldUser = mongoose.model<OldUserDocument>('OldUser', oldUserSchema, 'users');
    
    // Find all users with security questions in the old model
    const usersWithSecurityQuestions = await OldUser.find({
      'securityQuestion.question': { $exists: true, $ne: '' },
      'securityQuestion.answer': { $exists: true, $ne: '' }
    });

    console.log(`Found ${usersWithSecurityQuestions.length} users with security questions in the old model`);

    // Migrate security questions to the new model
    let migratedCount = 0;
    for (const oldUser of usersWithSecurityQuestions) {
      const newUser = await User.findOne({ email: oldUser.email });
      
      if (newUser && oldUser.securityQuestion && oldUser.securityQuestion.question && oldUser.securityQuestion.answer) {
        newUser.securityQuestion = {
          question: oldUser.securityQuestion.question,
          answer: oldUser.securityQuestion.answer
        };
        
        await newUser.save();
        migratedCount++;
        console.log(`Migrated security question for user: ${oldUser.email}`);
      } else {
        console.log(`User not found in new model or missing security question: ${oldUser.email}`);
      }
    }

    console.log(`Migrated security questions for ${migratedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Error migrating security questions:', error);
    process.exit(1);
  }
}

migrateSecurityQuestions(); 