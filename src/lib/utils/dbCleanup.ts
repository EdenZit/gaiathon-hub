import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { BlogPost } from '@/models/BlogPost';
import { Gallery } from '@/models/Gallery';
import { AnnouncementPage } from '@/models/Announcement';

export type CollectionName = 'users' | 'blogPosts' | 'gallery' | 'all';

interface CleanupOptions {
  preserveAdmins?: boolean;
  dryRun?: boolean;
}

export async function cleanDatabase(collections: CollectionName[], options: CleanupOptions = {}) {
  const { preserveAdmins = true, dryRun = false } = options;

  try {
    await connectDB();
    const results: Record<string, number> = {};

    // If preserving admins, verify they exist first
    if (preserveAdmins) {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount === 0) {
        throw new Error('No admin users found to preserve');
      }
      console.log(`Found ${adminCount} admin users to preserve`);
    }

    for (const collection of collections) {
      switch (collection) {
        case 'users':
          if (dryRun) {
            // For dry run, count non-admin users if preserving admins
            const query = preserveAdmins ? { role: { $ne: 'admin' } } : {};
            const count = await User.countDocuments(query);
            results['users'] = count;
          } else {
            // For actual deletion, explicitly protect admin users if preserveAdmins is true
            const query = preserveAdmins ? { role: { $ne: 'admin' } } : {};
            const result = await User.deleteMany(query);
            results['users'] = result.deletedCount;

            // Verify admins were preserved
            if (preserveAdmins) {
              const remainingAdmins = await User.countDocuments({ role: 'admin' });
              if (remainingAdmins === 0) {
                throw new Error('Admin users were accidentally deleted');
              }
              console.log(`Successfully preserved ${remainingAdmins} admin users`);
            }
          }
          break;

        case 'blogPosts':
          if (dryRun) {
            const count = await BlogPost.countDocuments({});
            results['blogPosts'] = count;
          } else {
            const result = await BlogPost.deleteMany({});
            results['blogPosts'] = result.deletedCount;
          }
          break;

        case 'gallery':
          if (dryRun) {
            const count = await Gallery.countDocuments({});
            results['gallery'] = count;
          } else {
            const result = await Gallery.deleteMany({});
            results['gallery'] = result.deletedCount;
          }
          break;

        case 'all':
          if (dryRun) {
            const userQuery = preserveAdmins ? { role: { $ne: 'admin' } } : {};
            
            // Count documents for each collection using a safer approach
            results['users'] = await User.countDocuments(userQuery);
            
            try {
              results['blogPosts'] = await BlogPost.estimatedDocumentCount();
            } catch (error) {
              results['blogPosts'] = 0;
            }
            
            try {
              results['gallery'] = await Gallery.estimatedDocumentCount();
            } catch (error) {
              results['gallery'] = 0;
            }
          } else {
            // For actual deletion, handle users separately to ensure admin preservation
            const userQuery = preserveAdmins ? { role: { $ne: 'admin' } } : {};
            const [users, blogPosts, gallery] = await Promise.all([
              User.deleteMany(userQuery),
              BlogPost.deleteMany({}),
              Gallery.deleteMany({})
            ]);
            
            results['users'] = users.deletedCount;
            results['blogPosts'] = blogPosts.deletedCount;
            results['gallery'] = gallery.deletedCount;

            // Verify admins were preserved for 'all' collection cleanup
            if (preserveAdmins) {
              const remainingAdmins = await User.countDocuments({ role: 'admin' });
              if (remainingAdmins === 0) {
                throw new Error('Admin users were accidentally deleted during full cleanup');
              }
              console.log(`Successfully preserved ${remainingAdmins} admin users during full cleanup`);
            }
          }
          break;
      }
    }

    return {
      success: true,
      dryRun,
      preserveAdmins,
      results
    };
  } catch (error) {
    console.error('Database cleanup error:', error);
    throw new Error(`Failed to clean database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 