import { z } from "zod";

export const invitationSchema = z.object({ role: z.enum(["member", "guest"]) });
