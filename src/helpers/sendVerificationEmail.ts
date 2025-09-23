import { resend } from "@/lib/resend";
import VerificationEmail from "@/emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verificationCode: string
): Promise<ApiResponse> {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.SENDER_EMAIL || "",
            to: email,
            subject: "Email verification",
            react: VerificationEmail({username, otp:verificationCode})
        });
        
        if (error) {
            throw error;
        }

        console.debug(`DEBUG: Verification email sent to ${email}`);
        console.debug("DEBUG: data:",data);
        return {
            success: false,
            message: `Sent verification email to ${email}`
        }
    }
    catch (error) {
        console.error("ERROR: Failed to send verification email:\n", error);
        return {
            success: false,
            message: "Failed to send verification email"
        }
    }
}