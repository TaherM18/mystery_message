import { z } from "zod";

export const SignInSchema = z.object({
    identifier: z.string().nonempty({ error: "Identifier is required" }),
    password: z.string().nonempty({ error: "Password is required" }),
});
