"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AuthError } from "next-auth";
import { signIn, SignInResponse } from "next-auth/react";

export default function Page() {
    // states
    const [message, setMessage] = useState("");
    const [isSubmitting, setSubmitting] = useState(false);
    // router
    const router = useRouter();
    // zod implementation
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            identifier: "",
            password: ""
        }
    })

    const onSubmit = async (data: z.infer<typeof signInSchema>) => {
        console.debug("DEBUG:: sign-in data:", {
            identifier: data.identifier,
            password: "****"
        });
        setSubmitting(true);
        try {
            const response: SignInResponse = await signIn("credentials", {
                identifier: data.identifier,
                password: data.password,
                redirect: false
            });
            // debug auth response
            console.debug("DEBUG:: signIn response:", response);
            if (response.url) {
                // show success toast
                toast.success("Login successful");
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1000);
            } else {
                // show error toast
                toast.error("Invalid credentials");
            }
        } catch (error) {
            const authError = error as AuthError;
            // show error toast
            toast.error(authError.message);
            // if (authError.response?.data.message === "Please verify your account") {
            //     toast.warning("Verify your account", {
            //         action: {
            //             label: "Verify",
            //             onClick: () => {
            //                 router.push(`/verify/${data.identifier}`)
            //             }
            //         }
            //     })
            // }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Welcome Back to Mystery Message
                    </h1>
                    <p>Sign in to continue your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="identifier"
                            control={form.control}
                            render={ ({field}) => (
                                <FormItem>
                                    <FormLabel>Identifier</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Username or Email" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            name="password"
                            control={form.control}
                            render={ ({field}) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" disabled={isSubmitting} className="w-100">
                            { isSubmitting 
                                ? <span className="flex items-center"><Spinner className="mr-1"/>Loading</span> 
                                : "Login"
                            }
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
