const db = require('./config/db');
const { Job, Application, User, Profile, Resume } = require('./models');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    await db.authenticate();
    console.log('Connected to DB');

    // Clear existing
    await Application.destroy({ where: {} });
    await Job.destroy({ where: {} });
    console.log('Cleared existing Jobs and Applications');

    // Find or create Interviewer
    let interviewer = await User.findOne({ where: { email: 'interviewer@gmail.com' } });
    if (!interviewer) {
      const password_hash = await bcrypt.hash('interviewer', 10);
      interviewer = await User.create({
        name: 'Aarav Sharma',
        email: 'interviewer@gmail.com',
        password_hash,
        role: 'INTERVIEWER',
        status: 'active',
        is_active: true
      });
    }

    // Find or create Student
    let student = await User.findOne({ where: { email: 'student@gmail.com' } });
    if (!student) {
      const password_hash = await bcrypt.hash('student', 10);
      student = await User.create({
        name: 'Rohan Gupta',
        email: 'student@gmail.com',
        password_hash,
        role: 'STUDENT',
        status: 'active',
        is_active: true
      });
      await Profile.create({ user_id: student.id, bio: 'Sample Bio' });
    }

    // Create Jobs
    const jobs = await Job.bulkCreate([
      {
        interviewer_id: interviewer.id,
        title: 'Software Development Engineer',
        company: 'Google',
        location: 'Mountain View, CA',
        type: 'Full-time',
        salary: '$150,000 - $200,000',
        description: 'Design, develop, and maintain large-scale software systems. Requires strong CS fundamentals and C++/Java/Python experience.',
        tags: ['C++', 'Java', 'Python', 'System Design'],
        status: 'active',
        total_rounds: 5,
        rounds_details: JSON.stringify(['Phone Screen', 'Coding 1', 'Coding 2', 'System Design', 'Behavioral'])
      },
      {
        interviewer_id: interviewer.id,
        title: 'Research Scientist',
        company: 'Google',
        location: 'Remote',
        type: 'Full-time',
        salary: '$180,000 - $250,000',
        description: 'Conduct cutting-edge research in AI/ML. Publish papers and collaborate with engineering teams.',
        tags: ['Machine Learning', 'AI', 'Python', 'TensorFlow', 'PyTorch'],
        status: 'active',
        total_rounds: 4,
        rounds_details: JSON.stringify(['Phone Screen', 'Research Presentation', 'Coding', 'Behavioral'])
      },
      {
        interviewer_id: interviewer.id,
        title: 'Backend Engineer',
        company: 'Amazon',
        location: 'Seattle, WA',
        type: 'Full-time',
        salary: '$130,000 - $180,000',
        description: 'Build scalable backend services for AWS. Strong distributed systems knowledge required.',
        tags: ['AWS', 'Java', 'Distributed Systems', 'Microservices'],
        status: 'active',
        total_rounds: 4,
        rounds_details: JSON.stringify(['OA', 'Phone', 'System Design', 'Loop'])
      },
      {
        interviewer_id: interviewer.id,
        title: 'AI Engineer',
        company: 'OpenAI',
        location: 'San Francisco, CA',
        type: 'Full-time',
        salary: '$160,000 - $220,000',
        description: 'Work on large language models and prompt engineering frameworks.',
        tags: ['LLM', 'Python', 'NLP', 'Generative AI'],
        status: 'active',
        total_rounds: 3,
        rounds_details: JSON.stringify(['Screen', 'Technical', 'Culture'])
      },
      {
        interviewer_id: interviewer.id,
        title: 'Quantitative Analyst',
        company: 'Blackrock',
        location: 'New York, NY',
        type: 'Full-time',
        salary: '$140,000 - $190,000',
        description: 'Apply statistical methods to financial markets. Strong math background needed.',
        tags: ['Math', 'Python', 'R', 'Finance', 'Statistics'],
        status: 'active',
        total_rounds: 4,
        rounds_details: JSON.stringify(['Math Test', 'Coding', 'Finance', 'Behavioral'])
      },
      {
        interviewer_id: interviewer.id,
        title: 'Junior Analyst',
        company: 'JP Morgan',
        location: 'Chicago, IL',
        type: 'Full-time',
        salary: '$90,000 - $110,000',
        description: 'Analyze financial data and prepare reports for senior management.',
        tags: ['Finance', 'Excel', 'Data Analysis', 'SQL'],
        status: 'active',
        total_rounds: 3,
        rounds_details: JSON.stringify(['HireVue', 'Superday', 'Final'])
      }
    ]);
    console.log('Created 6 Jobs');

    // Create Applications for Google SDE and JP Morgan Junior Analyst
    const googleSDE = jobs.find(j => j.company === 'Google' && j.title.includes('Software Development'));
    const jpMorgan = jobs.find(j => j.company === 'JP Morgan');

    // Find or Create Resume for student
    let resume = await Resume.findOne({ where: { user_id: student.id } });
    if (!resume) {
      resume = await Resume.create({
        user_id: student.id,
        title: 'Software Engineering Resume',
        file_url: '/dummy.pdf',
        parsed_content: 'Strong in C++ and Java. Finance degree, excellent Excel and SQL skills.',
        ai_score: 90
      });
    }

    if (googleSDE) {
      await Application.create({
        job_id: googleSDE.id,
        student_id: student.id,
        resume_id: resume.id,
        status: 'applied',
        ats_score: 85,
        applied_at: new Date()
      });
      console.log('Applied to Google SDE');
    }

    if (jpMorgan) {
      await Application.create({
        job_id: jpMorgan.id,
        student_id: student.id,
        resume_id: resume.id,
        status: 'shortlisted',
        ats_score: 92,
        applied_at: new Date()
      });
      console.log('Applied to JP Morgan Junior Analyst');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
}

seed();
