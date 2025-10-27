"use client";

import { VerificationSchema } from "@/schemas/VerificationSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { REGEXP_ONLY_DIGITS } from "input-otp";

export default function Page() {
    const router = useRouter();
    // get username from url parameter
    const { username } = useParams<{ username: string }>();
    // form hook with zod implementation
    const form = useForm<z.infer<typeof VerificationSchema>>({
        resolver: zodResolver(VerificationSchema),
    });

    // submit handler function
    async function onSubmit(data: z.infer<typeof VerificationSchema>) {
        try {
            // make network request
            const response = await axios.post("/api/verify-code", {
                username,
                code: data.code
            });
            console.debug("DEBUG:: response of '/api/verify-code':", response);
            toast.success("Your account has been verified!");
            // redirect to dashboard after 1 second
            setTimeout(() => {
                router.replace("/dashboard");
            }, 1000);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast.error(axiosError.response?.data.message ?? "There was some error, please try again later.");
        }
        
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-3">Enter the verification code</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            name="code"
                            control={form.control}
                            render={ ({field}) => (
                                <FormItem>
                                    <FormControl>
                                        <InputOTP
                                            {...field}
                                            type="text"
                                            maxLength={6} minLength={6} 
                                            pattern={REGEXP_ONLY_DIGITS}
                                            className="w-full">
                                            <InputOTPGroup>
                                                <InputOTPSlot index={0} />
                                                <InputOTPSlot index={1} />
                                                <InputOTPSlot index={2} />
                                                <InputOTPSlot index={3} />
                                                <InputOTPSlot index={4} />
                                                <InputOTPSlot index={5} />
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </FormControl>
                                    <FormDescription>
                                        Enter verfication code sent on your registered email.
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )}
                            />
                            <Button className="w-full" type="submit">Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
