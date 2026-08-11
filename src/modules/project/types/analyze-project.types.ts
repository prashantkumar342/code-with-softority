import z from "zod";
import * as ProjectSchemas from "../schemas/index.js";

export type AnalyzeProjectInput = z.infer<typeof ProjectSchemas.AnalyzeProjectInputSchema>;
export type AnalyzeProjectOutput = z.infer<typeof ProjectSchemas.AnalyzeProjectOutputSchema>;

export interface ProjectAnalysis {
  directoryType: "software" | "assets" | "workspace" | "empty" | "unknown";
  totalFiles: number;
  topFileTypes: Record<string, number>;
  languages: string[];
  frameworks: string[];
  packageManager: "npm" | "yarn" | "pnpm" | "bun" | "unknown";
  entryPoints: string[];
  sourceDirectories: string[];
  testDirectories: string[];
  configurationFiles: string[];
  environmentFiles: string[];
  dockerFiles: string[];
  hasGit: boolean;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  architectureIndicators: string[];
}

export interface AnalyzeProjectReturn {
  success: boolean;
  analysis: ProjectAnalysis;
}
