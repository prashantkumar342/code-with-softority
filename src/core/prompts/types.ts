import { z } from "zod";

export interface PromptDefinition<T extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  description: string;
  argsSchema?: z.ZodObject<T>;
  handler: (args: any) => Promise<{
    messages: {
      role: "user" | "assistant";
      content: { type: "text"; text: string } | { type: "resource"; resource: { uri: string; text: string; mimeType?: string } };
    }[];
  }>;
}
