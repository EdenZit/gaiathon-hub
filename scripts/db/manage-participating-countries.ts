import mongoose from 'mongoose';
import { config } from 'dotenv';
import path from 'path';
import * as fs from 'fs';

function loadEnv() {
  // Try loading from different possible .env file locations
  const envPaths = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env.development'),
    path.resolve(process.cwd(), '.env.development.local')
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      config({ path: envPath });
      console.log(`Loaded environment from ${envPath}`);
    }
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }
  return uri;
}

const MONGODB_URI = loadEnv();

const participatingCountriesData = [
  {
    name: 'Ghana',
    universities: ['University of Ghana'],
    isActive: true
  },
  {
    name: 'Nigeria',
    universities: [
      'University of Lagos',
      'Obafemi Awolowo University'
    ],
    isActive: true
  },
  {
    name: 'Togo',
    universities: ['University of Lome'],
    isActive: true
  }
];

async function updateParticipatingCountries() {
  try {
    // Connect to database
    console.log('\nAttempting to connect to MongoDB Atlas...');
    console.log('Using connection string:', MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//<credentials>@'));
    await mongoose.connect(MONGODB_URI);
    console.log('🌟 Connected to MongoDB Atlas');
    
    // Define the schema
    const participatingCountrySchema = new mongoose.Schema({
      name: {
        type: String,
        required: [true, 'Country name is required'],
        unique: true,
        trim: true,
      },
      universities: [{
        type: String,
        required: [true, 'University name is required'],
        trim: true,
      }],
      isActive: {
        type: Boolean,
        default: true,
      }
    });

    // Get or create the model
    const ParticipatingCountry = mongoose.models.ParticipatingCountry || 
      mongoose.model('ParticipatingCountry', participatingCountrySchema);
    
    // Track statistics
    const stats = {
      added: 0,
      updated: 0,
      failed: 0
    };

    // Process each country
    for (const countryData of participatingCountriesData) {
      try {
        // Try to find existing country
        const existingCountry = await ParticipatingCountry.findOne({ 
          name: { $regex: new RegExp(`^${countryData.name}$`, 'i') }
        });

        if (existingCountry) {
          // Update existing country
          const updatedCountry = await ParticipatingCountry.findByIdAndUpdate(
            existingCountry._id,
            {
              $set: {
                universities: countryData.universities,
                isActive: countryData.isActive
              }
            },
            { new: true }
          );
          console.log(`✅ Updated country: ${updatedCountry?.name}`);
          stats.updated++;
        } else {
          // Create new country
          const newCountry = await ParticipatingCountry.create(countryData);
          console.log(`➕ Added new country: ${newCountry.name}`);
          stats.added++;
        }
      } catch (error) {
        console.error(`❌ Error processing ${countryData.name}:`, error);
        stats.failed++;
      }
    }

    // Verify the data
    console.log('\n📊 Current participating countries:');
    const allCountries = await ParticipatingCountry.find({ isActive: true })
      .sort({ name: 1 })
      .select('name universities -_id')
      .lean();

    console.log('\nParticipating Countries and Universities:');
    for (const country of allCountries) {
      console.log(`\n🌍 ${country.name}:`);
      for (const uni of country.universities) {
        console.log(`  • ${uni}`);
      }
    }

    // Print statistics
    console.log('\n📈 Update Statistics:');
    console.log(`Added: ${stats.added}`);
    console.log(`Updated: ${stats.updated}`);
    console.log(`Failed: ${stats.failed}`);

  } catch (error) {
    console.error('\n❌ Error updating participating countries:', error);
    process.exit(1);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('\n👋 Database connection closed');
  }
}

// Run the update
updateParticipatingCountries(); 