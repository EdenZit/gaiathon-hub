import { connectDB } from './db/connection';
import { User } from './db/models/User';

export async function generateUniqueRegistrationNumber(): Promise<string> {
  const prefix = 'G25-';
  const length = 6;
  
  for (let attempts = 0; attempts < 10; attempts++) {
    // Generate a random string
    const randomStr = Math.random()
      .toString(36)
      .substring(2, 2 + length)
      .toUpperCase();
    
    const registrationNumber = `${prefix}${randomStr}`;
    
    try {
      await connectDB();
      
      // Verify uniqueness using Mongoose model
      const existing = await User.findOne({ registrationNumber });
      if (!existing) {
        return registrationNumber;
      }
    } catch (error) {
      console.error('Error generating registration number:', error);
      throw new Error('Failed to generate unique registration number');
    }
  }
  
  throw new Error('Failed to generate unique registration number after multiple attempts');
} 