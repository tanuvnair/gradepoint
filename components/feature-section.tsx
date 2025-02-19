import FeatureCard from "@/components/feature-card";
import {
    AppWindow,
    ChartNoAxesCombined,
    Lock,
    MessageCircleQuestion,
    Presentation,
    Star,
} from "lucide-react";

const FeatureSection = () => {
    const features = [
        {
            icon: AppWindow,
            title: "Modern Exam Interface",
            description:
                "Experience a sleek and intuitive interface designed to make taking exams seamless and stress-free.",
        },
        {
            icon: MessageCircleQuestion,
            title: "Real-Time Feedback",
            description:
                "Get instant feedback on your performance to help you improve and stay on track.",
        },
        {
            icon: Presentation,
            title: "Interactive Learning",
            description:
                "Engage with interactive questions to enhance your learning experience.",
        },
        {
            icon: Star,
            title: "Customizable Exams",
            description:
                "Create and customize exams tailored to your specific needs and preferences.",
        },
        {
            icon: ChartNoAxesCombined,
            title: "Progress Tracking",
            description:
                "Track your  progress over time with detailed analytics and insights.",
        },
        {
            icon: Lock,
            title: "Secure & Reliable",
            description:
                "Rest assured with our secure and reliable platform, ensuring your data is always safe.",
        },
    ];

    return (
        <div className="container mx-auto px-4">
            {/* Section Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary mb-16">
                Features
            </h2>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </div>
    );
};

export default FeatureSection;
