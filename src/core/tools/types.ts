import { z } from "zod";

export interface ToolDefinition<T extends z.ZodRawShape = z.ZodRawShape> {
  toolName: string;
  description: string;
  inputSchema?: z.ZodObject<T>;
  handler: (args: any) => Promise<any> | any;
}
