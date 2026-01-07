import { z } from 'zod';

export const ConfigSchema = z.object({
  llm: z
    .object({
      type: z.enum(['cloud', 'self-hosted']).optional(),
      baseURL: z.string().optional(),
      apiKey: z.string().optional(),
    })
    .optional(),
  chains: z
    .object({
      enabled: z.array(z.string()).optional(),
      rpcUrls: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  apiKeys: z
    .object({
      codex: z.string().optional(),
    })
    .passthrough()
    .optional(),
});

export type Config = z.infer<typeof ConfigSchema>;
