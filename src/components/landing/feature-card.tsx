import { Card, CardDescription, CardHeader, CardTitle } from "~/components/ui";
import { cn } from "~/lib/utils";

export interface FeatureCardProps {
  title: string;
  description: string;
  class?: string;
}

export default function FeatureCard(props: FeatureCardProps) {
  return (
    <Card class={cn("h-full border-border/60 shadow-apple", props.class)}>
      <CardHeader>
        <CardTitle>{props.title}</CardTitle>
        <CardDescription class="text-pretty">{props.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
