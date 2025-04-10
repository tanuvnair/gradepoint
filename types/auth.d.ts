import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: "Student" | "Instructor" | "Admin" | "Owner";
        } & DefaultSession["user"];
    }
}
