import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import z from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const usernameQuerySchema = z.object({
    username: usernameValidation
});

export async function GET(request: Request) {
    await connectDB();

    try {
        const { searchParams } = new URL(request.url);
        const queryParam = {
            username: searchParams.get("username")
        }

        // validate with zod
        const result = usernameQuerySchema.safeParse(queryParam);
        console.debug("/check-username route, zod result:",result);
        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false,
                    message: usernameErrors.length > 0 ? usernameErrors.join(", ") : "Invalid query parameters"
                },
                {
                    status: 400
                }
            );
        }

        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true
        });
        if (existingVerifiedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Username already taken"
                },
                {
                    status: 400
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Username is available"
            },
            {
                status: 200
            }
        );
    }
    catch (error) {
        console.error("ERROR: Failed to check username\n",error);

        return Response.json(
            {
                success: false,
                message: "Failed to check username",
            },
            {
                status: 400
            }
        );
    }
} 