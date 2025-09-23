import { z } from "zod";

export const messageSchema = z.object({
    content: z
        .string()
        .min(10, "Content must have atleast 10 characters")
        .max(1000, "Content can have 1000 characters at max"),
});
