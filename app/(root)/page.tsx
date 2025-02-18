import { auth } from "@/auth";
import Navbar from "@/components/navbar";

export default async function LandingPage() {
    const session = await auth();

    return (
        <div>
            <Navbar />
            {/* Hero Section */}
            <section
                id="top"
                className="min-h-screen w-full flex items-center justify-center bg-purple-500"
            >
                <div className="text-center">
                    <h1 className="text-4xl md:text-6xl font-bold text-white">
                        Welcome to GradePoint
                    </h1>
                    <p className="mt-4 text-lg md:text-xl text-purple-100">
                        Your ultimate solution for academic success.
                    </p>
                </div>
            </section>

            {/* Other Sections */}
            <section
                id="features"
                className="min-h-screen w-full bg-purple-500 flex items-center justify-center text-foreground text-2xl"
            >
                Features Section
            </section>
            <section
                id="aboutus"
                className="min-h-screen w-full bg-gray-800 flex items-center justify-center text-white text-2xl"
            >
                About Section
            </section>
            <section
                id="faqs"
                className="min-h-screen w-full bg-purple-500 flex items-center justify-center text-white text-2xl"
            >
                FAQs Section
            </section>
            <section
                id="contactus"
                className="min-h-screen w-full bg-green-500 flex items-center justify-center text-white text-2xl"
            >
                Contact Section
            </section>
            <section
                id="reportabug"
                className="min-h-screen w-full bg-blue-400 flex items-center justify-center text-white text-2xl"
            >
                Report a Bug Section
            </section>
        </div>
    );
}
