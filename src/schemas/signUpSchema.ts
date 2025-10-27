import { z } from "zod";

export const usernameValidation = z
    .string()
    .min(3, "Username must have atleast 3 characters")
    .max(20, "Username can have no more than 20 characters")
    .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain alphabets, numbers, and _"
    );

export const SignUpSchema = z.object({
    username: usernameValidation,
    email: z.string().nonempty({ error: "Email is required" }).email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(6, { message: "Password must have atleast 6 characters" }),
});
