import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function ToolCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-5 w-32 rounded bg-muted" />
            <div className="h-5 w-16 rounded-full bg-muted" />
          </div>
          <div className="h-4 w-48 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function CredentialsSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-11 w-full rounded-lg bg-muted" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-muted" />
        <div className="h-11 w-full rounded-lg bg-muted" />
      </div>
      <div className="h-11 w-full rounded-lg bg-muted" />
    </div>
  );
}