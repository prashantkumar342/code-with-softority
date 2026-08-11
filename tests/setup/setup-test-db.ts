import { execSync } from "node:child_process";
import { testProjectPaths } from "../fixtures/test_project_paths.js";
import { PrismaService } from "../../src/core/database/prisma.service.js";
import path from "node:path";
import crypto from "node:crypto";

async function setupTestDb() {
  console.log("Setting up test database...");

  // Set NODE_ENV to ensure prisma.service uses test.db
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL = "file:./test.db";

  // Ensure the DB exists and schema is pushed
  const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  execSync(`${npxCmd} prisma db push`, {
    env: { ...process.env, NODE_ENV: "test", DATABASE_URL: "file:./test.db" },
    stdio: "inherit"
  });

  const prisma = PrismaService.getInstance();

  try {
    console.log("Clearing existing records...");
    await prisma.project.deleteMany();

    console.log("Seeding test projects...");
    for (const projectPath of testProjectPaths) {
      // Basic logic to guess project name from path
      const name = path.basename(projectPath);

      await prisma.project.create({
        data: {
          id: crypto.randomUUID(),
          name,
          path: projectPath,
          type: "unknown",
          git: true,
          docker: false
        }
      });
      console.log(`Seeded project: ${name} (${projectPath})`);
    }
    console.log("Test database setup complete.");
  } catch (err) {
    console.error("Error setting up test DB:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupTestDb();
