-- V-TEKI MVP Database Schema (Supabase PostgreSQL)
-- Phase 4: Data Migration Preparation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Core Identity & Organization Entities
-- ==========================================

-- Organizations (for corporate_pic)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    industry VARCHAR(100),
    contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Profiles (extends Supabase auth.users)
CREATE TABLE users_profile (
    id UUID PRIMARY KEY, -- References auth.users.id
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'academy_admin', 'trainer', 'participant', 'corporate_pic')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    organization_name VARCHAR(255), -- Denormalized for convenience
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainers (extends users_profile for trainers)
CREATE TABLE trainers (
    id UUID PRIMARY KEY, -- References users_profile.id
    full_name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    expertise TEXT,
    experience_years INTEGER,
    bio TEXT,
    profile_picture_url TEXT,
    linkedin_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 2. Learning Catalog & Delivery Entities
-- ==========================================

-- Programs
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    program_type VARCHAR(50) CHECK (program_type IN ('workshop', 'bootcamp', 'executive_program', 'webinar', 'course')),
    delivery_mode VARCHAR(50) CHECK (delivery_mode IN ('online', 'offline', 'hybrid')),
    duration_hours INTEGER,
    price DECIMAL(15, 2),
    capacity INTEGER,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    thumbnail_url TEXT,
    category VARCHAR(100),
    level VARCHAR(50),
    passing_score INTEGER DEFAULT 70,
    min_attendance_pct INTEGER DEFAULT 80,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batches
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    program_name VARCHAR(255), -- Denormalized
    name VARCHAR(255) NOT NULL,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    trainer_name VARCHAR(255), -- Denormalized
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'ongoing', 'closed', 'cancelled')),
    capacity INTEGER,
    enrolled_count INTEGER DEFAULT 0,
    venue VARCHAR(255),
    meeting_link TEXT,
    sessions JSONB, -- Storing session schedules as JSON array for MVP simplicity
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 3. Enrollment & Payment Entities
-- ==========================================

-- Invoices (Grouped billing for corporate or individual)
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    organization_name VARCHAR(255),
    total_amount DECIMAL(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'issued' CHECK (status IN ('issued', 'paid', 'cancelled', 'overdue')),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enrollments (Registrations)
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    batch_name VARCHAR(255),
    program_name VARCHAR(255),
    participant_id UUID REFERENCES users_profile(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    organization_name VARCHAR(255),
    
    registration_type VARCHAR(50) DEFAULT 'individual' CHECK (registration_type IN ('individual', 'corporate')),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    
    -- Lifecycle statuses
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'registered')),
    payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'verifying', 'paid', 'failed')),
    completion_status VARCHAR(50) DEFAULT 'not_started' CHECK (completion_status IN ('not_started', 'in_progress', 'completed', 'dropped')),
    
    -- Progress tracking
    attendance_percentage DECIMAL(5, 2) DEFAULT 0,
    pre_assessment_status VARCHAR(50) DEFAULT 'pending',
    pre_assessment_score INTEGER,
    post_assessment_status VARCHAR(50) DEFAULT 'pending',
    post_assessment_score INTEGER,
    feedback_status VARCHAR(50) DEFAULT 'pending',
    feedback_submitted BOOLEAN DEFAULT FALSE,
    certificate_id UUID, -- Forward reference
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    invoice_number VARCHAR(100),
    registration_id UUID REFERENCES enrollments(id) ON DELETE SET NULL,
    organization_name VARCHAR(255),
    participant_name VARCHAR(255),
    program_name VARCHAR(255),
    
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(100),
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE,
    verified_date TIMESTAMP WITH TIME ZONE,
    
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. Learning Activity Entities
-- ==========================================

-- Attendance Sessions
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    session_title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(batch_id, session_date, session_title)
);

-- Attendance Records
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attendance_session_id UUID NOT NULL REFERENCES attendance_sessions(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    session_title VARCHAR(255),
    session_date DATE,
    
    status VARCHAR(50) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    join_time VARCHAR(20),
    leave_time VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attendance_session_id, registration_id)
);

-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(50) CHECK (assessment_type IN ('pre_assessment', 'post_assessment')),
    question_type VARCHAR(50),
    total_points INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 70,
    duration_minutes INTEGER,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Results (Submissions)
CREATE TABLE assessment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    participant_email VARCHAR(255),
    participant_name VARCHAR(255),
    
    score INTEGER NOT NULL,
    percentage DECIMAL(5, 2),
    passed BOOLEAN,
    status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed')),
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assessment_id, registration_id)
);

-- ==========================================
-- 5. Feedback & Certificate Entities
-- ==========================================

-- Feedback
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    batch_name VARCHAR(255),
    program_name VARCHAR(255),
    participant_name VARCHAR(255),
    participant_email VARCHAR(255),
    trainer_name VARCHAR(255),
    
    trainer_rating INTEGER CHECK (trainer_rating >= 1 AND trainer_rating <= 5),
    material_rating INTEGER CHECK (material_rating >= 1 AND material_rating <= 5),
    program_rating INTEGER CHECK (program_rating >= 1 AND program_rating <= 5),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(registration_id)
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    participant_email VARCHAR(255) NOT NULL,
    participant_name VARCHAR(255) NOT NULL,
    program_name VARCHAR(255) NOT NULL,
    program_code VARCHAR(50),
    batch_name VARCHAR(255),
    trainer_name VARCHAR(255),
    
    completion_date DATE NOT NULL,
    score INTEGER,
    verification_status VARCHAR(50) DEFAULT 'valid' CHECK (verification_status IN ('valid', 'revoked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(registration_id)
);
