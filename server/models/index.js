const User = require('./User');
const Job = require('./Job');
const Profile = require('./Profile');
const Resume = require('./Resume');
const Application = require('./Application');
const Interview = require('./Interview');
const Resource = require('./Resource');
const ApprovalRequest = require('./ApprovalRequest');
const Notification = require('./Notification');

// 1:1 User -> Profile
User.hasOne(Profile, { foreignKey: 'user_id' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// 1:N User -> Resume
User.hasMany(Resume, { foreignKey: 'user_id' });
Resume.belongsTo(User, { foreignKey: 'user_id' });

// 1:N User -> Application (Student applies to Jobs)
User.hasMany(Application, { foreignKey: 'student_id', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'student_id', as: 'student' });

// 1:N User -> Job (Interviewer posts Jobs)
User.hasMany(Job, { foreignKey: 'interviewer_id', as: 'posted_jobs' });
Job.belongsTo(User, { foreignKey: 'interviewer_id', as: 'interviewer' });

// 1:N Job -> Application
Job.hasMany(Application, { foreignKey: 'job_id' });
Application.belongsTo(Job, { foreignKey: 'job_id' });

// 1:N Resume -> Application
Resume.hasMany(Application, { foreignKey: 'resume_id' });
Application.belongsTo(Resume, { foreignKey: 'resume_id' });

// 1:1 Application -> Interview
Application.hasOne(Interview, { foreignKey: 'application_id' });
Interview.belongsTo(Application, { foreignKey: 'application_id' });

// 1:N User -> Resource (Author creates Resources)
User.hasMany(Resource, { foreignKey: 'author_id', as: 'resources' });
Resource.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

// 1:N User -> ApprovalRequest
User.hasMany(ApprovalRequest, { foreignKey: 'user_id' });
ApprovalRequest.belongsTo(User, { foreignKey: 'user_id' });

// 1:N User -> Notification
User.hasMany(Notification, { foreignKey: 'user_id' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Job,
  Profile,
  Resume,
  Application,
  Interview,
  Resource,
  ApprovalRequest,
  Notification,
};
