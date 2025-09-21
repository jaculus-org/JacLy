import { createFileRoute } from '@tanstack/react-router';
import { Homepage } from '@/components/page/homepage';

export const Route = createFileRoute('/')({
  component: Index,
});

function Index() {
  return <Homepage />;
}
