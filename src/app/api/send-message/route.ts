import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { Message } from "@/models/Message";

export async function POST(request: Request) {
    await connectDB();
    const keys = ["username", "content"];
    let jsonRequest;

    try {
        jsonRequest = await request.json();

        if (Object.keys(jsonRequest).some( (field) => (!keys.includes(field)) )) {
            throw new Error();
        }
    } catch (error) {
        console.error("ERROR: Request body empty or does not contain required parameters");
        return Response.json(
            {
                success: false,
                message: "Request body empty or does not contain required parameters"
            },
            {
                status: 401
            }
        );
    }

    const { username, content } = jsonRequest;

    try {
        const foundUser = await UserModel.findOne({ username });

        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status: 404
                }
            );
        }

        if (!foundUser.isAcceptingMessages) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                },
                {
                    status: 403
                }
            );
        }

        const newMessage = {
            content,
            createdAt: new Date()
        } as Message;

        foundUser.messages.push(newMessage);

        const result = await foundUser.save();
        if (!result) {
            return Response.json(
                {
                    success: false,
                    message: "Could not send message"
                },
                {
                    status: 404
                }
            );
        }

        return Response.json(
                {
                    success: true,
                    message: "Message sent successfully"
                },
                {
                    status: 200
                }
            );
        
    } catch (error) {
        console.error("ERROR: There was some error while sending message.\n", error);
        return Response.json(
            {
                success: false,
                message: "There was some error while sending message."
            },
            {
                status: 500
            }
        );
    }
}