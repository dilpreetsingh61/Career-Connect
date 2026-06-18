-- Clear existing data
TRUNCATE TABLE users RESTART IDENTITY CASCADE;

-- Insert 1 Admin
-- Note: 'password123' hashed (using a dummy hash for this seed script, in a real app this should be bcrypt)
-- Since we are doing a raw sql script and we might not have a bcrypt extension, we will use a dummy hash or plaintext for demonstration.
-- In production, the application logic handles the bcrypt hashing. Let's assume a generic hash string for seed.
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@careerconnect.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'ADMIN');

-- Insert 3 Interviewers
INSERT INTO users (name, email, password_hash, role) VALUES
('Interviewer One', 'interviewer1@careerconnect.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'INTERVIEWER'),
('Interviewer Two', 'interviewer2@careerconnect.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'INTERVIEWER'),
('Interviewer Three', 'interviewer3@careerconnect.com', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'INTERVIEWER');

-- Insert 10 Students
INSERT INTO users (name, email, password_hash, role) VALUES
('Student One', 'student1@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Two', 'student2@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Three', 'student3@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Four', 'student4@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Five', 'student5@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Six', 'student6@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Seven', 'student7@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Eight', 'student8@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Nine', 'student9@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT'),
('Student Ten', 'student10@university.edu', '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiCR/Tg.F.T/p0yC1i9.vI.G.X/v0y', 'STUDENT');
