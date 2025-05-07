-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentors table
CREATE TABLE mentors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommend_mentor_id UUID NOT NULL,
    recommended_mentor_id UUID,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentees table
CREATE TABLE mentees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommend_mentee_id UUID NOT NULL,
    recommended_mentee_id UUID,
    user_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    interested TEXT[] NOT NULL,
    goal TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mentoring requests table
CREATE TABLE mentoring_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mentor_id UUID NOT NULL REFERENCES mentors(id),
    mentee_id UUID NOT NULL REFERENCES mentees(id),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    mentoring_fee INTEGER NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_mentees_user_id ON mentees(user_id);
CREATE INDEX idx_mentoring_requests_mentor_id ON mentoring_requests(mentor_id);
CREATE INDEX idx_mentoring_requests_mentee_id ON mentoring_requests(mentee_id); 