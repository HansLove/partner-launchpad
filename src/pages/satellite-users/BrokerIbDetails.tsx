import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { NetworkAttribution, UserBrokerConnection, UserBrokerIb, UserScrapeStatus } from '@/lib/api';
import { cn } from '@/lib/utils';
import { GitBranch, Loader2 } from 'lucide-react';

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

function networkBadgeVariant(
  status: NetworkAttribution['network_status'] | 'not_checked'
): 'success' | 'secondary' | 'outline' | 'destructive' {
  if (status === 'in_network') return 'success';
  if (status === 'standalone') return 'secondary';
  if (status === 'check_failed') return 'destructive';
  return 'outline';
}

function networkStatusLabel(status: NetworkAttribution['network_status'] | 'not_checked'): string {
  if (status === 'in_network') return 'In network';
  if (status === 'standalone') return 'Standalone';
  if (status === 'no_ib') return 'No IB yet';
  if (status === 'check_failed') return 'Check failed';
  return 'Not checked';
}

function deriveNetworkSummary(
  status: UserScrapeStatus | undefined,
  attributions: NetworkAttribution[]
): NetworkAttribution['network_status'] | 'not_checked' {
  if (attributions.length > 0) {
    if (attributions.some((a) => a.network_status === 'in_network')) return 'in_network';
    if (attributions.some((a) => a.network_status === 'standalone')) return 'standalone';
    return attributions[0].network_status;
  }
  const hasBroker = (status?.brokers?.length ?? 0) > 0;
  const hasIb = (status?.ibs?.length ?? 0) > 0;
  if (hasBroker && hasIb) return 'not_checked';
  if (hasBroker && !hasIb) return 'no_ib';
  return 'not_checked';
}

function canCheckNetwork(status: UserScrapeStatus | undefined): boolean {
  if (!status) return false;
  const hasBroker = (status.brokers?.length ?? 0) > 0;
  const hasIb = (status.ibs?.length ?? 0) > 0;
  // Enable when broker + IB exist (do not require last_used_at / account_status alone).
  return hasBroker && hasIb;
}

export function NetworkAttributionPanel({
  status,
  attributions = [],
  isChecking = false,
  onCheck,
  className,
}: {
  status?: UserScrapeStatus;
  attributions?: NetworkAttribution[];
  isChecking?: boolean;
  onCheck?: () => void;
  className?: string;
}) {
  const summary = deriveNetworkSummary(status, attributions);
  const checkEnabled = canCheckNetwork(status) && Boolean(onCheck);

  return (
    <div className={cn('rounded-lg border bg-muted/20 p-3', className)}>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Network attribution
          </span>
          <Badge variant={networkBadgeVariant(summary)}>{networkStatusLabel(summary)}</Badge>
        </div>
        {onCheck && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!checkEnabled || isChecking}
            onClick={onCheck}
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Checking…
              </>
            ) : (
              'Check network'
            )}
          </Button>
        )}
      </div>

      {summary === 'not_checked' && checkEnabled && (
        <p className="text-xs text-muted-foreground">
          Broker and IB are connected. Run a network check to see if this account sits under an existing scraped tree.
        </p>
      )}

      {summary === 'no_ib' && (
        <p className="text-xs text-muted-foreground">
          Broker connected — wait for IB scrape before checking network attribution.
        </p>
      )}

      {attributions.length === 0 && summary === 'not_checked' && !checkEnabled && (
        <p className="text-xs text-muted-foreground">Connect broker and scrape IBs to enable network check.</p>
      )}

      {attributions.length > 0 && (
        <ul className="mt-2 space-y-2">
          {attributions.map((attr) => (
            <li
              key={`${attr.ib_rebate_account_login}-${attr.network_status}`}
              className="rounded-md border bg-background/80 px-2.5 py-2 text-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium tabular-nums">{attr.ib_rebate_account_login || '—'}</span>
                <Badge variant={networkBadgeVariant(attr.network_status)} className="text-[10px]">
                  {networkStatusLabel(attr.network_status)}
                </Badge>
                {attr.checked_at && (
                  <span className="text-muted-foreground">
                    checked {new Date(attr.checked_at).toLocaleString()}
                  </span>
                )}
              </div>
              {attr.network_status === 'in_network' && (
                <div className="mt-1.5 space-y-0.5 text-muted-foreground">
                  {attr.related_owner_name && (
                    <p>
                      Upline: <span className="text-foreground">{attr.related_owner_name}</span>
                    </p>
                  )}
                  {attr.related_main_ib_login && (
                    <p>
                      Main IB: <span className="tabular-nums text-foreground">{attr.related_main_ib_login}</span>
                    </p>
                  )}
                  {(attr.related_user_name || attr.related_user_email) && (
                    <p>
                      Anchor account:{' '}
                      <span className="text-foreground">
                        {[attr.related_user_name, attr.related_user_email].filter(Boolean).join(' · ')}
                        {attr.related_rebtools_user_id != null ? ` (user ${attr.related_rebtools_user_id})` : ''}
                      </span>
                    </p>
                  )}
                  {attr.upline_chain.length > 0 && (
                    <p className="line-clamp-2" title={attr.upline_chain.map((n) => n.owner_name).join(' → ')}>
                      Chain: {attr.upline_chain.map((n) => n.owner_name).join(' → ')}
                    </p>
                  )}
                </div>
              )}
              {attr.network_status === 'standalone' && (
                <p className="mt-1 text-muted-foreground">
                  Not listed as a sub-IB under any other scraped account in the system.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
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
  const networkSummary = deriveNetworkSummary(status, status?.network_attributions ?? []);

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
      {(status?.network_attributions?.length ?? 0) > 0 || networkSummary !== 'not_checked' ? (
        <Badge variant={networkBadgeVariant(networkSummary)} className="text-[10px]">
          {networkStatusLabel(networkSummary)}
        </Badge>
      ) : null}
    </div>
  );
}

export function BrokerIbDetailPanel({
  status,
  isCheckingNetwork = false,
  onCheckNetwork,
  className,
}: {
  status?: UserScrapeStatus;
  isCheckingNetwork?: boolean;
  onCheckNetwork?: () => void;
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
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2">
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

      <NetworkAttributionPanel
        status={status}
        attributions={status?.network_attributions ?? []}
        isChecking={isCheckingNetwork}
        onCheck={onCheckNetwork}
      />
    </div>
  );
}
