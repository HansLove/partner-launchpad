import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  status?: 'active' | 'pending' | 'disabled';
  showStatus?: boolean;
  showAction?: boolean;
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  pending: { label: 'Pending', variant: 'warning' as const },
  disabled: { label: 'Not enabled', variant: 'secondary' as const },
};

export function ToolCard({ 
  id, 
  name, 
  description, 
  icon, 
  status = 'active',
  showStatus = false,
  showAction = false,
}: ToolCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card hover className="group relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {icon}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{name}</h3>
              {showStatus && (
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        
        {showAction && (
          <div className="mt-4 flex justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/tool/${id}`}>
                Open tool
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
