import "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        name?: string | null;
        email?: string | null;
        emailVerified?: Date | null;
        image?: string | null;
    }
}
