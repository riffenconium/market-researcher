export const SCHEMA = `
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    research_brief TEXT DEFAULT '',
    autonomy_level TEXT DEFAULT 'guided' CHECK(autonomy_level IN ('autonomous', 'guided', 'checkpoint')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sources (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('pdf', 'docx', 'xlsx', 'csv', 'url', 'text')),
    file_path TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'ready', 'error')),
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS chunks (
    id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    metadata TEXT DEFAULT '{}',
    chunk_index INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS agent_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'running' CHECK(status IN ('running', 'paused', 'completed', 'failed')),
    autonomy_level TEXT NOT NULL,
    started_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    task_type TEXT NOT NULL,
    input TEXT DEFAULT '{}',
    output TEXT DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed')),
    started_at TEXT,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS slides (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    run_id TEXT REFERENCES agent_runs(id),
    position INTEGER NOT NULL,
    title TEXT NOT NULL,
    body TEXT DEFAULT '',
    sources_cited TEXT DEFAULT '[]',
    speaker_notes TEXT DEFAULT '',
    is_deep_dive INTEGER DEFAULT 0,
    deep_dive_prompt TEXT
  );

  CREATE TABLE IF NOT EXISTS agent_prompts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    agent_type TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    UNIQUE(project_id, agent_type)
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`;
