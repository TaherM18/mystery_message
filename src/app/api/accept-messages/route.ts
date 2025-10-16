import { auth } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

// to change user's accept-message status
export async function POST(request: Request) {
    await connectDB();

    const session = await auth();
    const user = session?.user as User;

    if (!session || user)  {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            {
                status: 401
            }
        );
    }

    const userId = user._id;

    const keys = ["acceptMessages"];
    let jsonRequest;

    try {
        jsonRequest = await request.json();
        
        if (Object.keys(jsonRequest).some( (field) => (!keys.includes(field)) )) {
            throw new Error();
        }
    } catch (error) {
        console.log("ERROR: Request does not contain the required parameters");
        return Response.json(
                {
                    success: false,
                    message: "Request does not contain the required parameters"
                }
            );
    }
    
    const { acceptMessages } = jsonRequest;

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Could not update user accept message status"
                },
                {
                    status: 404,
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Updated user accept message status",
                data: updatedUser
            },
            {
                status: 200,
            }
        );
        
    } catch (error) {
        console.error("ERROR: Failed to update user accept messsage status.\n", error);
        return Response.json(
            {
                success: false,
                message: "There was some error updating user accept message status"
            },
            {
                status: 500,
            }
        );
    }
}


// to get user's accept-message status
export async function GET(request: Request) {
    await connectDB();

    const session = await auth();
    const user: User = session?.user as User;

    if (!session || user)  {
        return Response.json(
            {
                success: false,
                message: "Not Authenticated",
            },
            {
                status: 401
            }
        );
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);
        
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "Could not get user accept message status"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Got user accept message status",
                data: foundUser.isAcceptingMessages,
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("ERROR: There was some error getting user accept message status.\n", error);
        return Response.json(
            {
                success: false,
                message: "There was some error getting user accept message status"
            },
            {
                status: 500
            }
        );
    }
}