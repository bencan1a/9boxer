-- Database schema for session persistence
-- This file contains table definitions for storing session state in SQLite

-- Sessions table: Stores user sessions with all state information
-- Design: One session per user (user_id is primary key) for local-only app
-- JSON columns: Store complex objects (employees, changes, config) as JSON blobs
-- Indexes: Optimize lookups by user_id and session_id
CREATE TABLE IF NOT EXISTS sessions (
    user_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    original_filename TEXT NOT NULL,
    original_file_path TEXT NOT NULL,
    sheet_name TEXT NOT NULL,
    sheet_index INTEGER NOT NULL,
    job_function_config TEXT,  -- JSON blob: JobFunctionConfig or NULL
    original_employees TEXT NOT NULL,  -- JSON blob: list[Employee]
    current_employees TEXT NOT NULL,   -- JSON blob: list[Employee]
    changes TEXT NOT NULL,             -- JSON blob: list[EmployeeMove]
    updated_at TIMESTAMP NOT NULL
);

-- Index for fast user_id lookups
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- Index for fast session_id lookups (secondary index)
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
