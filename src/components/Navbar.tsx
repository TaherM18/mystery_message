"use client";

import { User } from "next-auth";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink, NavigationMenuTrigger, NavigationMenuContent } from "./ui/navigation-menu";
import { MessageCircleQuestion } from "lucide-react";
import { Button } from "./ui/button";

export default function Navbar() {
    
    const { data: session } = useSession();
    const user = session?.user as User;

    return (
        <nav className="p-2 md:p-4 shadow-md">
            <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
                <a href="#" className="text-xl font-bold mb-4 md:mb-0 flex gap-2 items-center">
                    <MessageCircleQuestion/>Mystery Message
                </a>
                { session ? (
                    <>
                        <span className="mr-4">Welcome {user.username}</span>
                        <Button
                            className="w-full md:w-auto"
                            onClick={() => signOut()}
                        >
                            Logout
                        </Button>
                    </> ) : (
                    <Link href="/sign-in">
                        <Button className="w-full md:w-auto" size="sm">Sign In</Button>
                    </Link>
                    )
                }
            </div>
        </nav>
    );
}
