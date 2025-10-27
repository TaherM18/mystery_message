import { z } from "zod";

export const VerificationSchema = z.object({
    code: z.string()
            .nonempty({ error: "OTP is required" })
            .length(6, "Verification code must have 6 digits")
});
