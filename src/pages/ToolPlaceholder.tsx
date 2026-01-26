import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Construction } from 'lucide-react';

const toolNames: Record<string, string> = {
  rebatetools: 'Rebatetools',
  telebulk: 'Telebulk',
  msgchat: 'MsgChat',
};

export default function ToolPlaceholder() {
  const { toolId } = useParams<{ toolId: string }>();
  const toolName = toolNames[toolId || ''] || 'Tool';

  return (
    <Layout>
      <div className="container flex min-h-[60vh] items-center justify-center py-8">
        <Card className="w-full max-w-md animate-fade-in text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
              <Construction className="h-8 w-8 text-muted-foreground" />
            </div>
            
            <h1 className="mb-2 text-2xl font-bold">{toolName}</h1>
            <p className="mb-6 text-muted-foreground">
              This is a placeholder UI. Integration with the actual tool will be implemented later.
            </p>
            
            <Button asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
