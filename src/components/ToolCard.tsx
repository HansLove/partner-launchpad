import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface ToolCardProps {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
  status?: 'active' | 'pending' | 'disabled';
  showStatus?: boolean;
  showAction?: boolean;
  url?: string;
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
  url,
}: ToolCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300",
      "hover:shadow-lg hover:-translate-y-1",
      "border-border"
    )}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-all duration-300",
            "bg-secondary text-foreground",
            "group-hover:bg-accent group-hover:text-accent-foreground group-hover:scale-110"
          )}>
            {icon}
          </div>
          
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-base">{name}</h3>
              {showStatus && (
                <Badge variant={statusInfo.variant} className="text-xs font-medium">
                  {statusInfo.label}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          </div>
        </div>
        
        {showAction && (
          <div className="mt-5 flex justify-end border-t border-border pt-4">
            <Button variant="ghost" size="sm" className="group/btn" asChild>
              <Link to={`/tool/${id}`}>
                Open tool
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}