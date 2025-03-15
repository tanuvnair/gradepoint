import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Bug } from "lucide-react";
import { useState } from "react";

export default function ReportABugSection() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        description: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.description) {
            toast({
                title: "Error",
                description: "All fields are required!",
                variant: "destructive",
            });
            return;
        }
        setLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            toast({ title: "Success", description: "Bug report submitted!" });
            setFormData({ name: "", email: "", description: "" });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong!",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section
            id="reportabug"
            className="min-h-screen w-full bg-background flex flex-col items-center justify-center py-20"
        >
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-4">
                        Report A Bug
                    </h2>
                    <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Found something not working as expected? Help us improve
                        GradePoint by reporting any bugs you encounter.
                    </p>
                </div>

                <Card className="w-full max-w-lg mx-auto bg-card">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center justify-center mb-4">
                            <Bug className="w-12 h-12 text-primary" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-center">
                            Submit Bug Report
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Your Name"
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Your Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Your Email"
                                    className="w-full"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Bug Description
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Please describe the bug in detail. Include steps to reproduce if possible."
                                    className="w-full min-h-[150px]"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit Bug Report"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}
