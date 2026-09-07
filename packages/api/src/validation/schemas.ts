import { z } from "zod";

/**
 * Canonical email input: trimmed and lowercased before validation so that
 * stored and compared emails are always in the same form.
 */
export const emailSchema = z.string().trim().toLowerCase().email();
