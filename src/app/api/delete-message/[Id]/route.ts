import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { auth } from "../../auth/[...nextauth]/options";
import { User } from "next-auth";

export async function DELETE(request: Request, params : { Id: string }) {

    connectDB();
    try {
        const session = await auth();
        const user: User = session?.user as User;

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

        const deletedUserMessage = await UserModel.updateOne(
            { _id: user._id },
            { $pull: { messages: { _id: params.Id } } }
        )

        if (deletedUserMessage.modifiedCount == 0) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid message Id"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
            {
                success: true,
                message: "Message deleted"
            },
            {
                status: 200
            }
        );
    } catch (error) {
        console.error("ERROR:: Failed to delete message:", error);

        return Response.json(
            {
                success: false,
                message: "There was some error while deleting message"
            },
            {
                status: 500
            }
        );
    }
}