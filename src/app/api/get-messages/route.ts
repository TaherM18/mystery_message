import { auth } from "../auth/[...nextauth]/options";
import UserModel from "@/models/User";
import { User } from "next-auth";
import connectDB from "@/lib/dbConnect";
import mongoose from "mongoose";

export async function GET() {
    await connectDB();

    const session = await auth();
    const user = session?.user as User;

    if (!session || !user)  {
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

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([
            {
                $match: { _id: userId }
            },
            {
                $unwind: "$messages"
            },
            {
                $sort: { "messages.createdAt": -1 }
            },
            {
                $group: { _id: "$_id", messages: { $push: "$messages" } }
            }
        ]);

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "Could not get user messages",
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Got user messages",
                messages: user[0].messages
            },
            {
                status: 200
            }
        );

    } catch (error) {
        console.error("ERROR: There was some error getting user messages.\n", error);
        return Response.json(
            {
                success: false,
                message: "There was some error getting user messages"
            },
            {
                status: 500,
            }
        );
    }
}