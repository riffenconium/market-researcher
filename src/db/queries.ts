import type Database from "better-sqlite3";
import { generateId } from "@/lib/utils";

// --- Projects ---

interface CreateProjectInput {
  title: string;
  description: string;
  researchBrief: string;
  autonomyLevel: string;
}

export function createProject(db: Database.Database, input: CreateProjectInput): string {
  const id = generateId();
  db.prepare(
    `INSERT INTO projects (id, title, description, research_brief, autonomy_level) VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.title, input.description, input.researchBrief, input.autonomyLevel);
  return id;
}

export function getProjects(db: Database.Database) {
  return db.prepare(`SELECT * FROM projects ORDER BY created_at DESC`).all();
}

export function getProject(db: Database.Database, id: string) {
  return db.prepare(`SELECT * FROM projects WHERE id = ?`).get(id) as any | undefined;
}

export function updateProject(db: Database.Database, id: string, updates: Partial<CreateProjectInput>) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
  if (updates.description !== undefined) { fields.push("description = ?"); values.push(updates.description); }
  if (updates.researchBrief !== undefined) { fields.push("research_brief = ?"); values.push(updates.researchBrief); }
  if (updates.autonomyLevel !== undefined) { fields.push("autonomy_level = ?"); values.push(updates.autonomyLevel); }
  fields.push("updated_at = datetime('now')");
  values.push(id);
  db.prepare(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteProject(db: Database.Database, id: string) {
  db.prepare(`DELETE FROM projects WHERE id = ?`).run(id);
}

// --- Sources ---

interface CreateSourceInput {
  projectId: string;
  name: string;
  type: string;
  filePath?: string;
}

export function createSource(db: Database.Database, input: CreateSourceInput): string {
  const id = generateId();
  db.prepare(
    `INSERT INTO sources (id, project_id, name, type, file_path) VALUES (?, ?, ?, ?, ?)`
  ).run(id, input.projectId, input.name, input.type, input.filePath || null);
  return id;
}

export function getSourcesByProject(db: Database.Database, projectId: string) {
  return db.prepare(`SELECT * FROM sources WHERE project_id = ? ORDER BY created_at DESC`).all(projectId);
}

export function updateSourceStatus(db: Database.Database, id: string, status: string) {
  db.prepare(`UPDATE sources SET status = ? WHERE id = ?`).run(status, id);
}

export function deleteSource(db: Database.Database, id: string) {
  db.prepare(`DELETE FROM sources WHERE id = ?`).run(id);
}

// --- Chunks ---

export function createChunks(db: Database.Database, sourceId: string, chunks: { content: string; metadata: string; chunkIndex: number }[]) {
  const insert = db.prepare(
    `INSERT INTO chunks (id, source_id, content, metadata, chunk_index) VALUES (?, ?, ?, ?, ?)`
  );
  const insertMany = db.transaction((items: typeof chunks) => {
    for (const chunk of items) {
      insert.run(generateId(), sourceId, chunk.content, chunk.metadata, chunk.chunkIndex);
    }
  });
  insertMany(chunks);
}

export function getChunksByProject(db: Database.Database, projectId: string) {
  return db.prepare(`
    SELECT c.*, s.name as source_name, s.type as source_type
    FROM chunks c
    JOIN sources s ON c.source_id = s.id
    WHERE s.project_id = ?
    ORDER BY s.created_at, c.chunk_index
  `).all(projectId);
}

// --- Agent Runs ---

export function createAgentRun(db: Database.Database, projectId: string, autonomyLevel: string): string {
  const id = generateId();
  db.prepare(
    `INSERT INTO agent_runs (id, project_id, autonomy_level) VALUES (?, ?, ?)`
  ).run(id, projectId, autonomyLevel);
  return id;
}

export function updateAgentRun(db: Database.Database, id: string, status: string) {
  const completedAt = status === "completed" || status === "failed" ? "datetime('now')" : null;
  if (completedAt) {
    db.prepare(`UPDATE agent_runs SET status = ?, completed_at = datetime('now') WHERE id = ?`).run(status, id);
  } else {
    db.prepare(`UPDATE agent_runs SET status = ? WHERE id = ?`).run(status, id);
  }
}

export function getAgentRun(db: Database.Database, id: string) {
  return db.prepare(`SELECT * FROM agent_runs WHERE id = ?`).get(id) as any | undefined;
}

// --- Agent Tasks ---

export function createAgentTask(db: Database.Database, runId: string, agentType: string, taskType: string, input: string): string {
  const id = generateId();
  db.prepare(
    `INSERT INTO agent_tasks (id, run_id, agent_type, task_type, input, started_at) VALUES (?, ?, ?, ?, ?, datetime('now'))`
  ).run(id, runId, agentType, taskType, input);
  return id;
}

export function updateAgentTask(db: Database.Database, id: string, status: string, output?: string) {
  if (output) {
    db.prepare(`UPDATE agent_tasks SET status = ?, output = ?, completed_at = datetime('now') WHERE id = ?`).run(status, output, id);
  } else {
    db.prepare(`UPDATE agent_tasks SET status = ? WHERE id = ?`).run(status, id);
  }
}

// --- Slides ---

export function createSlide(db: Database.Database, input: {
  projectId: string; runId?: string; position: number; title: string;
  body: string; sourcesCited: string; speakerNotes: string;
  isDeepDive?: boolean; deepDivePrompt?: string;
}): string {
  const id = generateId();
  db.prepare(`
    INSERT INTO slides (id, project_id, run_id, position, title, body, sources_cited, speaker_notes, is_deep_dive, deep_dive_prompt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, input.projectId, input.runId || null, input.position, input.title, input.body,
    input.sourcesCited, input.speakerNotes, input.isDeepDive ? 1 : 0, input.deepDivePrompt || null);
  return id;
}

export function getSlidesByProject(db: Database.Database, projectId: string) {
  return db.prepare(`SELECT * FROM slides WHERE project_id = ? ORDER BY position`).all(projectId);
}

export function updateSlide(db: Database.Database, id: string, updates: { position?: number; title?: string; body?: string; speakerNotes?: string }) {
  const fields: string[] = [];
  const values: any[] = [];
  if (updates.position !== undefined) { fields.push("position = ?"); values.push(updates.position); }
  if (updates.title !== undefined) { fields.push("title = ?"); values.push(updates.title); }
  if (updates.body !== undefined) { fields.push("body = ?"); values.push(updates.body); }
  if (updates.speakerNotes !== undefined) { fields.push("speaker_notes = ?"); values.push(updates.speakerNotes); }
  if (fields.length === 0) return;
  values.push(id);
  db.prepare(`UPDATE slides SET ${fields.join(", ")} WHERE id = ?`).run(...values);
}

export function deleteSlide(db: Database.Database, id: string) {
  db.prepare(`DELETE FROM slides WHERE id = ?`).run(id);
}

// --- Agent Prompts ---

export function getAgentPrompt(db: Database.Database, projectId: string, agentType: string) {
  return db.prepare(`SELECT * FROM agent_prompts WHERE project_id = ? AND agent_type = ?`).get(projectId, agentType) as any | undefined;
}

export function upsertAgentPrompt(db: Database.Database, projectId: string, agentType: string, systemPrompt: string) {
  const id = generateId();
  db.prepare(`
    INSERT INTO agent_prompts (id, project_id, agent_type, system_prompt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(project_id, agent_type) DO UPDATE SET system_prompt = excluded.system_prompt
  `).run(id, projectId, agentType, systemPrompt);
}

// --- Settings ---

export function getSetting(db: Database.Database, key: string): string | undefined {
  const row = db.prepare(`SELECT value FROM settings WHERE key = ?`).get(key) as any;
  return row?.value;
}

export function setSetting(db: Database.Database, key: string, value: string) {
  db.prepare(`INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
}
