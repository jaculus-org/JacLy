import { GeneralHeader } from '@/features/shared/components/custom/general-header';
import { createFileRoute } from '@tanstack/react-router';
// import { Card, CardContent } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/')({
  component: Root,
});

function Root() {
  // const features = [
  //   {
  //     title: 'Visual Programming',
  //     description: 'Create visual programming interfaces with ease.',
  //     icon: Blocks,
  //   },
  //   {
  //     title: 'Code Generation',
  //     description: 'Generate code from visual blocks effortlessly.',
  //     icon: Code,
  //   },
  //   {
  //     title: 'Integrated Terminal',
  //     description: 'Access a powerful terminal directly within the editor.',
  //     icon: Terminal,
  //   },
  // ];

  return (
    <div className="min-h-screen bg-linear-to-br from-background to-secondary/20">
      <GeneralHeader />
    </div>
  );
}
