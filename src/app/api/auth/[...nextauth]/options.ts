import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import connectDB from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
    providers: [
        Credentials({
            id: "credentials",
            name: "Credentials",
            credentials: {
                identifier: { label: "Username or Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, request) {
                try {
                    await connectDB();
                    const user = await UserModel.findOne({
                        $or: [
                            { username: credentials.identifier },
                            { email: credentials.identifier }
                        ]
                    });
                    
                    if (!user) {
                        throw new Error("No user found for given username or email");
                    }
                    if (!user.isVerified) {
                        throw new Error("Please verify your account");
                    }
                    
                    const isPasswordCorrect = await bcrypt.compare(credentials.password as string, user.password);
                    if (!isPasswordCorrect) {
                        throw new Error("Invalid password");
                    }

                    return {
                        _id: user._id?.toString(),
                        username: user.username,
                        email: user.email,
                        isVerified: user.isVerified,
                        isAcceptingMessages: user.isAcceptingMessages,
                    };
                }
                catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        })
    ],
    callbacks: {
        async jwt ({ token, user, account, profile, isNewUser }) {
            if (user) {
                token._id = user._id;
                token.username = user.username;
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
            }

            return token;
        },
        async session ({ session, user, token }) {
            if (token) {
                session.user._id = token._id as string;
                session.user.username = token.username as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean;
            }
            return session;
        }
    },
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.AUTH_SECRET,
}
 
export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);