"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function Page() {
    // states
    const [username, setUsername] = useState("");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [isCheckingUsername, setCheckingUsername] = useState(false);
    const [isSubmitting, setSubmitting] = useState(false);
    // debouncing
    const debounced = useDebounceCallback(setUsername, 500);
    // router
    const router = useRouter();
    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            username: "",
            email: "",
            password: ""
        }
    })

    useEffect(() => {
        async function checkUsernameUnique() {
            if (username) {
                // set states
                setCheckingUsername(true);
                setUsernameMessage("");
                // make network request
                try {
                    const response = await axios.get(`/api/check-username?username=${username}`);
                    console.debug("DEBUG: axios response:",response);
                    setUsernameMessage(response.data.message);

                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(axiosError.response?.data.message ?? "Error checking username");
                }
                finally {
                    setCheckingUsername(false);
                }
            }
        }
        checkUsernameUnique();
    }, [username]);

    async function onSubmit(data: z.infer<typeof signUpSchema>) {
        console.debug("DEBUG:: sign-up data:", data);
        setSubmitting(true);
        try {
            // make network request
            const response = await axios.post<ApiResponse>("/api/sign-up", data);
            // show success toast
            toast.success(response.data.message);
            // redirect to verify after 1 second
            setTimeout(() => {
                router.replace(`/verify/${username}`);
            }, 1000);
            
        } catch (error) {
            console.error("ERROR in sign-up ::", error);
            const axiosError = error as AxiosError<ApiResponse>;
            // show error toast
            toast.error(axiosError.response?.data.message ?? "Failed to sign up");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Mystery Message
                    </h1>
                    <p>Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* username */}
                        <FormField
                            control={form.control}
                            name="username"
                            render={ ({field}) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e);
                                                debounced(e.target.value);
                                            }}
                                        />
                                    </FormControl>
                                    { isCheckingUsername && <span className="flex items-center text-sm"><Spinner className="mr-1"/> Checking...</span>}
                                    <span className={`text-sm ${usernameMessage === "Username is available" ? "text-green-500" : "text-red-500"}`}>
                                        {username && usernameMessage}
                                    </span>
                                    <FormDescription>This is your public display name</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {/* email */}
                        <FormField
                            control={form.control}
                            name="email"
                            render={ ({field}) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>This email address will receive verification code</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        {/* password */}
                        <FormField
                            control={form.control}
                            name="password"
                            render={ ({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Password"
                                            type="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>Your secret (our secret)</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Spinner/> Loading</> : "Sign Up"}
                        </Button>
                    </form>
                </Form>
                <div className="text-center mt-4">
                    <p>
                        Already a member?{" "}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
