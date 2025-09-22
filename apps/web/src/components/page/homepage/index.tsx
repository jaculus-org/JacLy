import { useIntlayer } from 'react-intlayer';
import { ArrowRight, Blocks, Code, Link, Terminal } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function Homepage() {
  const content = useIntlayer('homepage');

  const features = [
    {
      title: content.visualProgrammingTitle as string,
      description: content.visualProgrammingDescription as string,
      icon: Blocks,
    },
    {
      title: content.codeGenerationTitle as string,
      description: content.codeGenerationDescription as string,
      icon: Code,
    },
    {
      title: content.integratedTerminalTitle as string,
      description: content.integratedTerminalDescription as string,
      icon: Terminal,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">
            {content.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {content.subtitle}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {features.map(({ title, description, icon: Icon }) => (
            <Card
              key={title}
              className="transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Button asChild size="sm" className="text-lg px-8 py-6 h-auto">
            <Link to="/editor/new">
              {content.getStarted}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
