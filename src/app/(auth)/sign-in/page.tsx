"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

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
        console.debug("DEBUG:: sign-in data:", data);
        setSubmitting(true);
        try {
            const response = await axios.post<ApiResponse>("/api/sign-in", data);
            // show success toast
            toast.success(response.data.message);
            
        } catch (error) {
            setMessage("");
            // show error toast
            toast.error("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div></div>
    );
}
