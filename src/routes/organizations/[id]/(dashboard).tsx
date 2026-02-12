import { Container, Text } from "~/components/ui";

export default function OrganizationDashboard() {
  return (
    <div class="flex flex-1 flex-col px-6 py-6">
      <Container size="xl" class="flex flex-1 flex-col px-0">
        <Text variant="footnote" muted>
          Your dashboard content will go here.
        </Text>
      </Container>
    </div>
  );
}
