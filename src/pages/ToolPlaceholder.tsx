import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Wrench } from 'lucide-react';

const toolNames: Record<string, { name: string; url: string }> = {
  rebatetools: { name: 'Rebatetools', url: 'https://rebatetools.com' },
  telebulk: { name: 'Telebulk', url: 'https://telebulk.com' },
  msgchat: { name: 'MsgChat', url: 'https://www.msgchat.com' },
};

export default function ToolPlaceholder() {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? toolNames[toolId] : null;

  return (
    <Layout>
      <div className="container py-12 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8 animate-fade-in">
            <Button variant="ghost" asChild className="mb-6">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
            </Button>
          </div>

          <Card className="animate-fade-in shadow-lg">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
                <Wrench className="h-8 w-8 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold">
                {tool ? `${tool.name} Integration` : 'Tool Integration'}
              </CardTitle>
              <CardDescription className="text-base">
                Integration coming soon
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-border bg-secondary/30 p-6 text-center">
                <p className="text-muted-foreground">
                  This tool integration is currently under development. 
                  {tool && (
                    <>
                      {' '}Visit{' '}
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-accent underline-offset-4 hover:underline inline-flex items-center gap-1"
                      >
                        {tool.name}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      {' '}directly in the meantime.
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  What to expect
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Direct access to {tool?.name || 'the tool'} from your dashboard</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Single sign-on with your partner credentials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-accent mt-0.5">•</span>
                    <span>Unified analytics and reporting</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row pt-4">
                <Button variant="outline" className="flex-1" asChild>
                  <Link to="/dashboard">
                    <ArrowLeft className="h-4 w-4" />
                    Back to dashboard
                  </Link>
                </Button>
                {tool && (
                  <Button className="flex-1" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      Visit {tool.name}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}