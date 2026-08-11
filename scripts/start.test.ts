import { execSync } from "node:child_process";

// Set the environment variable for tests
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";

try {
  // First, setup the test database
  console.log("Running setup-test-db.ts...");
  execSync("node --import tsx tests/setup/setup-test-db.ts", { 
    env: process.env, 
    stdio: "inherit" 
  });
  
  // Then, run the tests
  console.log("Running tests...");
  execSync("node --import tsx --test \"tests/**/*.test.ts\"", { 
    env: process.env, 
    stdio: "inherit" 
  });
} catch (error) {
  // If tests or setup fail, exit with error code
  process.exit(1);
}
