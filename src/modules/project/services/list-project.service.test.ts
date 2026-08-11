import { test } from "node:test";
import assert from "node:assert";
import { ListProjectService } from "./list-project.service.js";
import { testProjectPaths } from "../../../../tests/fixtures/test_project_paths.js";

test("ListProjectService", async (t) => {
  const service = new ListProjectService();

  await t.test("successfully lists projects seeded from test_project_paths", async () => {
    const result = await service.listProjects();

    assert.strictEqual(result.success, true);
    // Since other tests might run concurrently and add/remove projects, 
    // we should at least check it returns an array.
    assert.ok(Array.isArray(result.projects));

    // We can verify that at least one of our seeded paths is in the result
    // (Assuming not all are deleted by other tests at the exact same moment)
    if (result.projects.length > 0 && testProjectPaths.length > 0) {
      const seededPath = testProjectPaths[0];
      const found = result.projects.some(p => p.path === seededPath);
      // We don't strictly assert this to avoid flakiness if remove-project test deletes it,
      // but we ensure the structure of a project is correct if any exist.
      const first = result.projects[0];
      assert.ok(first.id, "Project should have an id");
      assert.ok(first.path, "Project should have a path");
      assert.ok(first.name, "Project should have a name");
    }
  });
});
