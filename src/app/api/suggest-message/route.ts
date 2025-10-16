import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import OpenAI from "openai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous messaging platform like Qooh.me and should be suitable for a diverse audience. Avoid personal or sensitive topics and instead focus on universal themes that encourage friendly interaction. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    try {
        const { text } = await generateText({
            model: openai("gpt-4o"),
            prompt,
            maxOutputTokens: 400,
        });

        return Response.json(
            {
                success: true,
                message: "Text generated successfully",
                data: text,
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        if (error instanceof OpenAI.APIError) {
            const { status, headers, message } = error;

            return Response.json(
                {
                    success: false,
                    headers,
                    message,
                },
                {
                    status,
                }
            );
        }
    }
}
