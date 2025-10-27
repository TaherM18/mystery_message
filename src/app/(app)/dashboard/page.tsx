"use client";

import MessageCard from "@/components/MessageCard";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Message } from "@/models/Message";
import { AcceptMessagesSchema } from "@/schemas/AcceptMessagesSchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "next-auth";
import { Loader2, RefreshCcw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

export default function Page() {
    // states
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setLoading] = useState(false);
    const [isSwitchLoading, setSwitchLoading] = useState(false);
    // react-hook-form
    const form = useForm<z.infer<typeof AcceptMessagesSchema>>({
        resolver: zodResolver(AcceptMessagesSchema),
    });
    // watch form field
    const acceptMessages = form.watch("acceptMessages");
    // session
    const { data: session } = useSession();

    const { username } = session?.user as User;
    const profileUrl = `${window.location.origin}/u/${username}`;

    const fetchAcceptMessage = useCallback(async () => {
        setSwitchLoading(true);
        try {
            const response = await axios.get<ApiResponse>("/api/accept-messages");
            if (response.data.isAcceptingMessages !== undefined) {
                form.setValue("acceptMessages", response.data.isAcceptingMessages);
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message);
        } finally {
            setSwitchLoading(false);
        }
    }, [form.setValue]);

    const fetchMessages = useCallback(
        async (isRefreshing: boolean = false) => {
            setLoading(true);
            setSwitchLoading(true);
            try {
                const response = await axios.get<ApiResponse>("/api/get-messages");
                setMessages(response.data.messages ?? []);
                if (isRefreshing) {
                    toast.info("Showing latest messges");
                }
                if (response.data.messages?.length == 0) {
                    toast.info("No messages found");
                    return;
                } else {
                    toast.success(response.data.message);
                }
            } catch (error) {
                const axiosError = error as AxiosError<ApiResponse>;
                toast.error(axiosError.response?.data.message ??"There was some error getting messages");
            } finally {
                setLoading(false);
                setSwitchLoading(false);
            }
        },
        [setLoading, setMessages]
    );

    useEffect(() => {
        if (!session || !session.user) { return; }
        fetchMessages();
        fetchAcceptMessage();
    }, [session, form.setValue, fetchAcceptMessage, fetchMessages]);

    async function handleDeleteMessage(messageId: string) {
        setMessages(messages.filter((msg) => msg._id !== messageId));
    }

    async function handleSwitchChange() {
        setSwitchLoading(true);
        try {
            const response = await axios.post("/api/accept-messages", {
                acceptMessages: !acceptMessages,
            });
            form.setValue("acceptMessages", !acceptMessages);
            toast.success(response.data.message);
        } catch (error) {
            form.setValue("acceptMessages", !acceptMessages);
            const axiosError = error as AxiosError<ApiResponse>;
            toast(axiosError.response?.data.message);
        } finally {
            setSwitchLoading(false);
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(profileUrl);
        toast.success("Url copied");
    }

    if (!session || !session.user) {
        return <div>Please login</div>;
    }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">
                    Copy Your Unique Link
                </h2>{" "}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...form.register("acceptMessages")}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? "On" : "Off"}
                </span>
            </div>
            <Separator />

            <Button
                type="button"
                className="mt-4"
                variant="outline"
                onClick={() => {
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard
                            key={String(message._id)}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}
