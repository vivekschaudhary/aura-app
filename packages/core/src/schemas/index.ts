/**
 * Zod schemas mirroring the types in ./types — validates payloads at boundaries
 * (tRPC inputs, webhook handlers, DB write paths).
 */
import { z } from 'zod';
// Language type is the canonical export from ./types; we do not re-export it here.
// languageSchema below derives its runtime shape from the same union ('en' | 'hi').

export const languageSchema = z.enum(['en', 'hi']); // v1 launch set

export const handleSchema = z
  .string()
  .min(3, 'Handle must be at least 3 characters')
  .max(32, 'Handle must be at most 32 characters')
  .regex(/^[a-z0-9_]+$/, 'Handle: lowercase letters, digits, underscore only');

export const turnRoleSchema = z.enum(['user', 'assistant']);

export const ratingTypeSchema = z.enum(['clarity', 'nps']);

export const userCreateSchema = z.object({
  handle: handleSchema,
  primaryLanguage: languageSchema,
});

export const conversationCreateSchema = z.object({
  userId: z.string().uuid(),
  language: languageSchema,
  title: z.string().min(1).max(200).optional(), // auto-summarised if absent
});

export const turnAppendSchema = z.object({
  conversationId: z.string().uuid(),
  role: turnRoleSchema,
  content: z.string().min(1),
});

export const memoryWriteSchema = z.object({
  userId: z.string().uuid(),
  content: z.string().min(1),
  topic: z.string().min(1).max(100),
});

export const ratingSubmitSchema = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid().nullable(),
  type: ratingTypeSchema,
  score: z.number().int().min(1).max(10),
  comment: z.string().max(2000).nullable(),
});
