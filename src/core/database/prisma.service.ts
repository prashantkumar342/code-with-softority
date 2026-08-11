import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = __dirname.includes("build") || __dirname.endsWith("build");
const baseDir = isProd ? path.resolve(__dirname, "..") : path.resolve(__dirname, "../../../..");

const dbName = process.env.NODE_ENV === "test" ? "test.db" : "dev.db";
const dbPath = path.resolve(baseDir, dbName);
// @ts-ignore
const adapter = new PrismaBetterSqlite3({ url: dbPath });

export class PrismaService extends PrismaClient {
  private static instance: PrismaService;

  private constructor() {
    super({ adapter });
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getInstance();
