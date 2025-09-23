import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { signUpSchema } from "@/schemas/signUpSchema";

interface RequiredRequest {
    username: string,
    email: string,
    password: string
}

export async function POST(request: Request) {
    await connectDB();
    const keys = ["username", "email", "password"];
    let reqJson: RequiredRequest;

    try {
        reqJson = await request.json();
        if (Object.keys(reqJson).some((field) => (!keys.includes(field)))) {
            throw new Error();
        }
    }
    catch (error) {
        return Response.json(
            {
                success: false,
                message: "Request body empty or invalid arguments"
            },
            {
                status: 400,
            }
        );
    }

    try {
        const result = signUpSchema.safeParse(reqJson);

        if (result.error?.format()._errors?.length) {
            return Response.json(
                {
                    success: false,
                    message: result.error.message
                }
            );
        }

        const { username, email, password } = reqJson;

        const existingUserWithUsername = await UserModel.findOne({
            username,
            isVerified: true,
        });

        if (existingUserWithUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                {
                    status: 400,
                }
            );
        }

        const existingUserWithEmail = await UserModel.findOne({
            email,
        });

        const expiryDate = new Date();
        expiryDate.setHours(expiryDate.getHours() + 1);
        const verificationCode = Math.floor(
            Math.random() * 1000000 + 100000
        ).toString();
        const hashedPassword = await bcrypt.hash(password, 10);

        if (existingUserWithEmail) {
            if (existingUserWithEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "A user is already registered with this email",
                    },
                    {
                        status: 400,
                    }
                );
            }

            existingUserWithEmail.password = hashedPassword;
            existingUserWithEmail.verificationCode = verificationCode;
            existingUserWithEmail.codeExpiry = expiryDate;
        }

        const newUser = new UserModel({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            verificationCode,
            codeExpiry: expiryDate,
            isAcceptingMessage: true,
            messages: [],
        });

        await newUser.save();

        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verificationCode
        );

        if (!emailResponse.success) {
            return Response.json(
                {
                    success: true,
                    message: `User registered, but ${emailResponse.message}`,
                },
                {
                    status: 201,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "User registered. Please verify your email.",
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("ERROR: Failed to register user", error);
        return Response.json(
            {
                success: false,
                message: "Failed to register user",
            },
            {
                status: 500,
            }
        );
    }
}
