import prismaPkg from "@prisma/client";
const { PrismaClient } = prismaPkg;
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";

const dbName = process.env.NODE_ENV === "test" ? "test.db" : "dev.db";
const dbPath = path.resolve(process.cwd(), dbName);
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
