import { getDb, closeDb } from "@/db";
import { createProject, getProjects, getProject, deleteProject } from "@/db/queries";
import fs from "fs";
import path from "path";

const TEST_DB_PATH = path.join(__dirname, "test.db");

beforeEach(() => {
  closeDb(); // reset cached connection
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  process.env.DB_PATH = TEST_DB_PATH;
});

afterEach(() => {
  closeDb();
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

describe("projects", () => {
  test("create and retrieve a project", () => {
    const db = getDb();
    const id = createProject(db, {
      title: "Coconut Research",
      description: "Global coconut industry analysis",
      researchBrief: "Analyze global and regional coconut trends",
      autonomyLevel: "guided",
    });

    const project = getProject(db, id);
    expect(project).toBeDefined();
    expect(project!.title).toBe("Coconut Research");
    expect(project!.autonomy_level).toBe("guided");
  });

  test("list all projects", () => {
    const db = getDb();
    createProject(db, { title: "Project 1", description: "", researchBrief: "", autonomyLevel: "autonomous" });
    createProject(db, { title: "Project 2", description: "", researchBrief: "", autonomyLevel: "checkpoint" });

    const projects = getProjects(db);
    expect(projects).toHaveLength(2);
  });

  test("delete a project", () => {
    const db = getDb();
    const id = createProject(db, { title: "To Delete", description: "", researchBrief: "", autonomyLevel: "autonomous" });
    deleteProject(db, id);

    const project = getProject(db, id);
    expect(project).toBeUndefined();
  });
});
