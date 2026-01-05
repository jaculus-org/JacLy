import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/features/shared/components/ui/card';
import { Button } from '@/features/shared/components/ui/button';
import {
  BlocksIcon,
  Code2Icon,
  ZapIcon,
  ListIcon,
  PlusCircleIcon,
} from 'lucide-react';

export const Route = createFileRoute('/')({
  component: Root,
});

function Root() {
  const features = [
    {
      title: 'Visual Programming',
      description:
        'Design your projects using intuitive visual blocks - no coding required.',
      icon: BlocksIcon,
    },
    {
      title: 'TypeScript Code',
      description:
        'Write powerful code directly in TypeScript with full editor support.',
      icon: Code2Icon,
    },
    {
      title: 'Fast & Modern',
      description:
        'Built with cutting-edge tools for a smooth development experience.',
      icon: ZapIcon,
    },
  ];

  return (
    <div className="py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-600 bg-clip-text text-transparent">
          Welcome to Jacly
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your journey into visual programming starts here. Build amazing
          projects with blocks or code.
        </p>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Button asChild size="lg" className="gap-2">
            <Link to="/project/new">
              <PlusCircleIcon className="h-5 w-5" />
              Create New Project
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="gap-2">
            <Link to="/project">
              <ListIcon className="h-5 w-5" />
              View Projects
            </Link>
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {features.map(feature => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.title}
              className="transition-all hover:shadow-lg hover:-translate-y-1"
            >
              <CardHeader>
                <div className="mb-4 p-3 rounded-lg bg-primary/10 w-fit">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Getting Started Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Get Started</CardTitle>
          <CardDescription className="text-base">
            Choose your preferred way to build your project
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="p-2 rounded-md bg-primary/10">
              <BlocksIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Visual Blocks</h3>
              <p className="text-sm text-muted-foreground">
                Perfect for beginners or quick prototyping. Drag and drop blocks
                to build your logic.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
            <div className="p-2 rounded-md bg-primary/10">
              <Code2Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">TypeScript Code</h3>
              <p className="text-sm text-muted-foreground">
                Full control with professional TypeScript development.
                IntelliSense and debugging included.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
