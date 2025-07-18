-- =============================================
-- PROJECTS TABLE SCHEMA FOR SUPABASE
-- =============================================

-- Enum Types
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE position_status AS ENUM ('open', 'closed', 'filled', 'paused');
CREATE TYPE team_permission AS ENUM ('owner', 'co_owner', 'admin', 'editor', 'viewer', 'member');

-- Main projects table
CREATE TABLE projects (
    -- Primary identifiers
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Basic project information
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,

    -- Images and media
    project_image TEXT,
    project_image_metadata JSONB,
    background_image TEXT,
    background_image_metadata JSONB,
    demo TEXT[], -- Array of demo image URLs

    -- Project categorization
    category TEXT NOT NULL,
    current_stage TEXT NOT NULL,
    why_join TEXT,

    -- Skills and languages
    language_proficiency TEXT[], -- Array of languages
    skills TEXT[], -- Technology stack/skills (max 15)

    -- Project details
    target_audience TEXT,
    revenue_expectations TEXT,
    collaboration_model TEXT,
    funding_investment TEXT,
    compensation_model TEXT,

    -- Team and operations
    engagement_model TEXT,
    availability TEXT,
    working_hours TEXT,
    community_platforms TEXT[], -- Communication tools

    -- Additional fields for enhanced functionality
    project_website TEXT,

    is_project_public BOOLEAN DEFAULT FALSE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECT TEAM MEMBERS TABLE
-- =============================================

CREATE TABLE project_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Team member details
    role TEXT NOT NULL,
    joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Member status
    permission team_permission NOT NULL DEFAULT 'member',
    is_active BOOLEAN DEFAULT TRUE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, user_id)
);

-- =============================================
-- PROJECT OPEN POSITIONS TABLE
-- =============================================

CREATE TABLE project_open_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Position details
    title TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    requirements TEXT,

    -- Position specifications
    required_skills TEXT[], -- Array of required skills

    -- Additional position details
    collaboration_type TEXT,
    time_commitment TEXT,
    experience_level TEXT,

    -- Position status
    status position_status NOT NULL DEFAULT 'open',
    applicant_count INTEGER DEFAULT 0,

    -- Posted by information
    posted_by_user_id UUID REFERENCES auth.users(id),
    posted_date DATE DEFAULT CURRENT_DATE,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PROJECT APPLICATIONS TABLE (for open positions)
-- =============================================

CREATE TABLE project_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    position_id UUID NOT NULL REFERENCES project_open_positions(id) ON DELETE CASCADE,
    applicant_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'pending',

    -- Metadata
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    UNIQUE(position_id, applicant_user_id)
);

-- =============================================
-- PROJECT FOLLOWERS TABLE
-- =============================================

CREATE TABLE project_followers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    follower_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Metadata
    followed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraints
    UNIQUE(project_id, follower_user_id)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Projects indexes
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_current_stage ON projects(current_stage);
CREATE INDEX idx_projects_availability ON projects(availability);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_projects_skills ON projects USING GIN(skills);
CREATE INDEX idx_projects_language_proficiency ON projects USING GIN(language_proficiency);

-- Team members indexes
CREATE INDEX idx_team_members_project_id ON project_team_members(project_id);
CREATE INDEX idx_team_members_user_id ON project_team_members(user_id);
CREATE INDEX idx_team_members_permission ON project_team_members(permission);
CREATE INDEX idx_team_members_is_active ON project_team_members(is_active);

-- Open positions indexes
CREATE INDEX idx_open_positions_project_id ON project_open_positions(project_id);
CREATE INDEX idx_open_positions_status ON project_open_positions(status);
CREATE INDEX idx_open_positions_required_skills ON project_open_positions USING GIN(required_skills);

-- Applications indexes
CREATE INDEX idx_applications_position_id ON project_applications(position_id);
CREATE INDEX idx_applications_applicant_user_id ON project_applications(applicant_user_id);
CREATE INDEX idx_applications_status ON project_applications(status);

-- Followers indexes
CREATE INDEX idx_followers_project_id ON project_followers(project_id);
CREATE INDEX idx_followers_user_id ON project_followers(follower_user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_open_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_followers ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Projects are viewable by everyone" ON projects
    FOR SELECT USING (true);

CREATE POLICY "Users can create their own projects" ON projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
    FOR DELETE USING (auth.uid() = user_id);

-- Team members policies
CREATE POLICY "Team members are viewable by everyone" ON project_team_members
    FOR SELECT USING (true);

-- Project owners can add team members (for initial project creation and management)
CREATE POLICY "Project owners can add team members" ON project_team_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_team_members.project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Project owners and existing admins can update/delete team members
CREATE POLICY "Project owners and admins can update team members" ON project_team_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_team_members.project_id
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM project_team_members tm
            WHERE tm.project_id = project_team_members.project_id
            AND tm.user_id = auth.uid()
            AND tm.permission IN ('owner', 'co_owner', 'admin')
            AND tm.is_active = true
        )
    );

CREATE POLICY "Project owners and admins can delete team members" ON project_team_members
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_team_members.project_id
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM project_team_members tm
            WHERE tm.project_id = project_team_members.project_id
            AND tm.user_id = auth.uid()
            AND tm.permission IN ('owner', 'co_owner', 'admin')
            AND tm.is_active = true
        )
    );

-- Open positions policies
CREATE POLICY "Open positions are viewable by everyone" ON project_open_positions
    FOR SELECT USING (true);

CREATE POLICY "Project owners and admins can manage open positions" ON project_open_positions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_open_positions.project_id
            AND projects.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM project_team_members tm
            WHERE tm.project_id = project_open_positions.project_id
            AND tm.user_id = auth.uid()
            AND tm.permission IN ('owner', 'co_owner', 'admin')
            AND tm.is_active = true
        )
    );

-- Applications policies
CREATE POLICY "Users can view their own applications" ON project_applications
    FOR SELECT USING (auth.uid() = applicant_user_id);

CREATE POLICY "Project owners and admins can view applications for their positions" ON project_applications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_open_positions pos
            JOIN projects p ON p.id = pos.project_id
            WHERE pos.id = project_applications.position_id
            AND p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM project_open_positions pos
            JOIN project_team_members tm ON tm.project_id = pos.project_id
            WHERE pos.id = project_applications.position_id
            AND tm.user_id = auth.uid()
            AND tm.permission IN ('owner', 'co_owner', 'admin')
            AND tm.is_active = true
        )
    );

CREATE POLICY "Users can create applications" ON project_applications
    FOR INSERT WITH CHECK (auth.uid() = applicant_user_id);

CREATE POLICY "Project owners and admins can update application status" ON project_applications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM project_open_positions pos
            JOIN projects p ON p.id = pos.project_id
            WHERE pos.id = project_applications.position_id
            AND p.user_id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM project_open_positions pos
            JOIN project_team_members tm ON tm.project_id = pos.project_id
            WHERE pos.id = project_applications.position_id
            AND tm.user_id = auth.uid()
            AND tm.permission IN ('owner', 'co_owner', 'admin')
            AND tm.is_active = true
        )
    );

-- Followers policies
CREATE POLICY "Followers are viewable by everyone" ON project_followers
    FOR SELECT USING (true);

CREATE POLICY "Users can follow/unfollow projects" ON project_followers
    FOR ALL USING (auth.uid() = follower_user_id);

