import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";

interface RequiredRequest {
    username: string,
    code: string
}

export async function POST(request: Request) {
    const keys = ["username", "code"];
    let reqJson: RequiredRequest;

    // check for request body parameters
    try {
        reqJson = await request.json();
        if ( Object.keys(reqJson).some((field) => (!keys.includes(field))) ) {
            throw new Error();
        }    
    } catch (error) {
        return Response.json(
            {
                success: false,
                message: "Request body empty or invalid arguments"
            },
            {
                status: 400
            }
        );
    }

    // connect to database
    await connectDB();

    try {
        const { username, code } = reqJson;
    
        const userWithCode = await UserModel.findOne({
            username,
            verificationCode: code
        });
    
        // check user's code is correct
        if (!userWithCode) {
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                {
                    status: 400
                }
            );
        }
    
        // check time is before expiry
        if (Date.now() > userWithCode.codeExpiry.getTime()) {
            return Response.json(
                {
                    success: false,
                    message: "Code is expired"
                },
                {
                    status: 400
                }
            );
        }

        // Set user's verification status
        userWithCode.isVerified = true;

        const result = userWithCode.save();

        if (!result) {
            throw new Error("Failed to update user's verification status");
        }

        return Response.json(
            {
                success: true,
                message: "Account verified successfully"
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("ERROR: Failed to verify code", error);
        return Response.json(
            {
                success: false,
                message: "Failed to verify code due to some internal error"
            },
            {
                status: 500
            }
        );
    }
}