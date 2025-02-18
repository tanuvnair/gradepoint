import { auth } from "@/auth";
import Navbar from "@/components/navbar";

export default async function LandingPage() {
    const session = await auth();

    return (
        <div>
            <Navbar />
        </div>
    );
}
