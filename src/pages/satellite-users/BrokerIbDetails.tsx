import { Badge } from '@/components/ui/badge';
import type { UserBrokerConnection, UserBrokerIb, UserScrapeStatus } from '@/lib/api';
import { cn } from '@/lib/utils';

function formatBrokerLabel(slug: string, brokerName?: string | null): string {
  const raw = String(slug || '').toLowerCase();
  if (raw === 'vantage') return 'Vantage';
  if (raw === 'puprime') return 'PuPrime';
  if (brokerName) return brokerName;
  return slug || 'Broker';
}

function brokerBadgeVariant(
  broker: UserBrokerConnection
): 'success' | 'warning' | 'destructive' | 'outline' {
  if (broker.last_error) return 'destructive';
  if (broker.last_used_at) return 'success';
  return 'outline';
}

export function groupIbsBySlug(ibs: UserBrokerIb[]): Map<string, UserBrokerIb[]> {
  const map = new Map<string, UserBrokerIb[]>();
  for (const ib of ibs) {
    const key = String(ib.slug || 'unknown').toLowerCase();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(ib);
  }
  return map;
}

export function BrokerSummaryBadges({
  status,
  className,
}: {
  status?: UserScrapeStatus;
  className?: string;
}) {
  const brokers = status?.brokers ?? [];
  const ibs = status?.ibs ?? [];
  const ibsBySlug = groupIbsBySlug(ibs);

  if (brokers.length === 0) {
    return <span className={cn('text-xs text-muted-foreground', className)}>No broker connected</span>;
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {brokers.map((broker, idx) => {
        const slug = String(broker.slug || 'unknown').toLowerCase();
        const count = ibsBySlug.get(slug)?.length ?? 0;
        return (
          <div key={`${slug}-${broker.broker_email ?? idx}`} className="flex items-center gap-1">
            <Badge variant={brokerBadgeVariant(broker)}>{formatBrokerLabel(slug, broker.broker_name)}</Badge>
            <span className="text-[11px] text-muted-foreground tabular-nums">
              {count} IB{count === 1 ? '' : 's'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function BrokerIbDetailPanel({
  status,
  className,
}: {
  status?: UserScrapeStatus;
  className?: string;
}) {
  const brokers = status?.brokers ?? [];
  const ibs = status?.ibs ?? [];
  const ibsBySlug = groupIbsBySlug(ibs);

  if (brokers.length === 0) {
    return (
      <div className={cn('rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground', className)}>
        No broker connected
      </div>
    );
  }

  return (
    <div className={cn('grid gap-3 sm:grid-cols-2', className)}>
      {brokers.map((broker, idx) => {
        const slug = String(broker.slug || 'unknown').toLowerCase();
        const brokerIbs = ibsBySlug.get(slug) ?? [];
        return (
          <div
            key={`${slug}-${broker.broker_email ?? idx}`}
            className="rounded-lg border bg-background/80 p-3 shadow-sm"
          >
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant={brokerBadgeVariant(broker)}>
                  {formatBrokerLabel(slug, broker.broker_name)}
                </Badge>
                {broker.last_error ? (
                  <span className="text-[11px] text-destructive line-clamp-1" title={broker.last_error}>
                    Error
                  </span>
                ) : broker.last_used_at ? (
                  <span className="text-[11px] text-muted-foreground">Scraped</span>
                ) : (
                  <span className="text-[11px] text-muted-foreground">Connected</span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {brokerIbs.length} IB{brokerIbs.length === 1 ? '' : 's'}
              </span>
            </div>
            {broker.broker_email && (
              <p className="mb-2 truncate text-xs text-muted-foreground" title={broker.broker_email}>
                {broker.broker_email}
              </p>
            )}
            {brokerIbs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Connected — no IBs scraped yet</p>
            ) : (
              <ul className="max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {brokerIbs.map((ib) => (
                  <li
                    key={`${slug}-${ib.ib_rebate_account_login}-${ib.owner_name}`}
                    className="rounded-md bg-muted/40 px-2.5 py-1.5"
                  >
                    <p className="truncate text-sm font-medium leading-tight">
                      {ib.owner_name || 'Unnamed IB'}
                    </p>
                    <p className="truncate text-[11px] text-muted-foreground tabular-nums">
                      {ib.ib_rebate_account_login || '—'}
                      {Number.isFinite(ib.ib_level) ? ` · L${ib.ib_level}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
