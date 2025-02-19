import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const FaqSection = () => {
    const faqs = [
        {
            question: "What is GradePoint?",
            answer: "GradePoint is a modern examination platform that provides an interactive and secure environment for taking tests. It features real-time feedback and progress tracking to enhance your learning experience.",
        },
        {
            question: "How secure is the platform?",
            answer: "GradePoint implements industry-standard security measures to protect your data and exam integrity. We use encryption for all data transmission and storage, and maintain strict access controls to ensure your information remains confidential.",
        },
        {
            question: "How does the real-time feedback system work?",
            answer: "Our real-time feedback system provides immediate responses to your answers, helping you understand where you excel and where you need improvement. You'll receive detailed explanations and performance analytics to track your progress.",
        },
        {
            question: "Is GradePoint accessible on mobile devices?",
            answer: "Yes, GradePoint is fully responsive and works seamlessly across all devices including smartphones, tablets, and desktop computers. You can access your exams and track your progress anywhere, anytime.",
        },
    ];

    return (
        <div className="container mx-auto px-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center text-primary mb-16">
                Frequently Asked Questions
            </h2>

            <div className="max-w-3xl mx-auto">
                <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            value={`item-${index}`}
                            className="border-b"
                        >
                            <AccordionTrigger className="text-lg md:text-xl font-medium py-4 hover:text-primary transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-base md:text-lg">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default FaqSection;
