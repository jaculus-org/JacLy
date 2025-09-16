import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, Blocks, FileText, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/404')({
  component: Route404,
});

export function Route404() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="relative z-10 w-full max-w-lg">
        <Card className="shadow-2xl border-0 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            {/* 404 Icon */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>

            {/* 404 Number */}
            <div className="mb-2">
              <h1 className="text-8xl font-black text-primary tracking-tighter">
                404
              </h1>
              <div className="mx-auto h-1 w-16 rounded-full bg-primary/30" />
            </div>

            <CardTitle className="text-2xl font-bold text-foreground">
              Page Not Found
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {/* Error Description */}
            <p className="text-muted-foreground leading-relaxed">
              Sorry, we couldn't find the page you're looking for. It might have
              been moved, deleted, or you entered the wrong URL.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Link to="/editor/new">
                  <Blocks className="mr-2 h-4 w-4" />
                  Start Building
                </Link>
              </Button>
            </div>

            {/* Help Section */}
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Need help? Check out our{' '}
                <Button
                  asChild
                  variant="link"
                  className="h-auto p-0 text-sm font-medium"
                >
                  <Link to="/docs">
                    <FileText className="mr-1 h-3 w-3" />
                    documentation
                  </Link>
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
