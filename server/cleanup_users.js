const { Op } = require('sequelize');
const { User, Profile, Resume, Application, Job } = require('./models');

async function cleanup() {
  const keepEmails = ['bhavesh1553.be23@chitkara.edu.in', 'bhavesh.sabharwal.1@gmail.com', 'interviewer@gmail.com'];

  try {
    // Find users to delete
    const usersToDelete = await User.findAll({
      where: {
        email: {
          [Op.notIn]: keepEmails
        }
      }
    });

    console.log(`Found ${usersToDelete.length} users to delete.`);

    const userIds = usersToDelete.map(u => u.id);

    if (userIds.length > 0) {
      // Sequelize usually handles ON DELETE CASCADE if setup, but just in case, we can manually delete them,
      // or simply destroy the users if CASCADE is on. Let's try to destroy users directly.
      const deletedCount = await User.destroy({
        where: {
          id: {
            [Op.in]: userIds
          }
        }
      });
      console.log(`Successfully deleted ${deletedCount} users and their associated data (if CASCADE is enabled).`);
    } else {
      console.log('No users to delete.');
    }
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    process.exit(0);
  }
}

cleanup();
