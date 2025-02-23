import { connectDB } from '@/lib/mongodb';
import { User } from '@/lib/db/models/User';
import { BlogPost } from '@/models/BlogPost';
import { Gallery } from '@/models/Gallery';
import { AnnouncementPage } from '@/models/Announcement';

export type CollectionName = 'users' | 'blogPosts' | 'gallery' | 'announcements' | 'all';

interface CleanupOptions {
  preserveAdmins?: boolean;
  dryRun?: boolean;
}

export async function cleanDatabase(collections: CollectionName[], options: CleanupOptions = {}) {
  const { preserveAdmins = true, dryRun = false } = options;

  try {
    await connectDB();
    const results: Record<string, number> = {};

    for (const collection of collections) {
      switch (collection) {
        case 'users':
          if (dryRun) {
            const count = await User.countDocuments(
              preserveAdmins ? { role: { $ne: 'admin' } } : {}
            );
            results['users'] = count;
          } else {
            const result = await User.deleteMany(
              preserveAdmins ? { role: { $ne: 'admin' } } : {}
            );
            results['users'] = result.deletedCount;
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

        case 'announcements':
          if (dryRun) {
            const count = await AnnouncementPage.countDocuments({});
            results['announcements'] = count;
          } else {
            const result = await AnnouncementPage.deleteMany({});
            results['announcements'] = result.deletedCount;
          }
          break;

        case 'all':
          if (dryRun) {
            results['users'] = await User.countDocuments(
              preserveAdmins ? { role: { $ne: 'admin' } } : {}
            );
            results['blogPosts'] = await BlogPost.countDocuments({});
            results['gallery'] = await Gallery.countDocuments({});
            results['announcements'] = await AnnouncementPage.countDocuments({});
          } else {
            const [users, blogPosts, gallery, announcements] = await Promise.all([
              User.deleteMany(preserveAdmins ? { role: { $ne: 'admin' } } : {}),
              BlogPost.deleteMany({}),
              Gallery.deleteMany({}),
              AnnouncementPage.deleteMany({})
            ]);
            
            results['users'] = users.deletedCount;
            results['blogPosts'] = blogPosts.deletedCount;
            results['gallery'] = gallery.deletedCount;
            results['announcements'] = announcements.deletedCount;
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