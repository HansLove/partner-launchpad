import { FormEvent, Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useSatellite } from '@/contexts/SatelliteContext';
import { satellitesApi, type UserScrapeStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { ChevronDown, KeyRound, LayoutGrid, LayoutList, LogIn, Pencil, RefreshCw, Trash2, UserPlus } from 'lucide-react';
import { BrokerIbDetailPanel, BrokerSummaryBadges } from '@/pages/satellite-users/BrokerIbDetails';
import { cn } from '@/lib/utils';

type Row = Record<string, unknown>;
type UsersLayoutMode = 'table' | 'cards';

const LAYOUT_STORAGE_KEY = 'satellite-users-layout';

function formatCreatedAt(value: unknown): string {
  if (value == null || value === '') return '';
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return format(date, 'MMM d, yyyy · h:mm a');
}

function readStoredLayout(): UsersLayoutMode {
  try {
    const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (raw === 'cards' || raw === 'table') return raw;
  } catch {
    // ignore
  }
  return 'table';
}

const rebToolsRoleOptions = [
  { value: '3', label: 'Partner (3)' },
  { value: '2', label: 'Manager (2)' },
  { value: '1', label: 'Admin (1)' },
];

const rebToolsStatusOptions = [
  { value: '1', label: 'Active (1)' },
  { value: '0', label: 'Inactive (0)' },
];

const msgChatProfileOptions = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
];

function getRebToolsRoleLabel(value: unknown): string {
  const found = rebToolsRoleOptions.find((o) => o.value === String(value ?? ''));
  return found ? found.label : String(value ?? '');
}

function getRebToolsStatusLabel(value: unknown): string {
  const found = rebToolsStatusOptions.find((o) => o.value === String(value ?? ''));
  return found ? found.label : String(value ?? '');
}

function normalizeMsgChatProfile(value: unknown): 'user' | 'admin' {
  if (value === 1 || value === '1' || String(value).toLowerCase() === 'admin') return 'admin';
  return 'user';
}

function getDisplayName(slug: string, satellites: Record<string, string>) {
  return satellites[slug] || slug;
}

const rebToolsLoginBaseUrl = (
  import.meta.env.VITE_REBTOOLS_LOGIN_URL ||
  'https://rebatetools.com/support-login'
).trim();

const rebToolsSupportPassword: string = (import.meta.env.VITE_REBTOOLS_SUPPORT_PASSWORD || '').trim();

function getColumnLabel(col: string): string {
  if (col === 'account_status') return 'Account Status';
  if (col === 'brokers') return 'Brokers';
  if (col === 'created_at') return 'Created';
  if (col === 'expand') return '';
  return col;
}

function normalizeRows(rows: Row[]): Row[] {
  return rows.map((row) => ({
    id: row.id ?? row._id ?? '',
    name: row.name ?? row.firstName ?? row.email ?? '',
    email: row.email ?? '',
    userName: row.userName ?? row.username ?? '',
    status: row.status ?? '',
    created_at: row.created_at ?? row.createdAt ?? '',
    ...row,
  }));
}

export default function SatelliteUsers() {
  const { toast } = useToast();
  const { satellites, activeSatellite } = useSatellite();
  const [isLoading, setIsLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<Row | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<Row | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createData, setCreateData] = useState({
    name: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userName: '',
    profile: 'user',
    status: '0',
    rol: '3',
  });
  const [editData, setEditData] = useState({
    name: '',
    email: '',
    userName: '',
    profile: 'user',
    password: '',
    status: '1',
  });

  const [scrapeStatus, setScrapeStatus] = useState<Record<string, UserScrapeStatus>>({});
  const [isScrapeStatusLoading, setIsScrapeStatusLoading] = useState(false);
  const [usersLayout, setUsersLayout] = useState<UsersLayoutMode>(() => readStoredLayout());
  const [expandedUserIds, setExpandedUserIds] = useState<Set<string>>(() => new Set());
  const [resetSendingId, setResetSendingId] = useState<string | null>(null);

  const isApiSatellite = activeSatellite === 'msgchat' || activeSatellite === 'telebulk';
  const isRebTools = activeSatellite === 'rebatetools';

  const setLayoutMode = (mode: UsersLayoutMode) => {
    setUsersLayout(mode);
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const toggleExpanded = (userId: string) => {
    setExpandedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await satellitesApi.listUsers(activeSatellite);
      setRows(normalizeRows(res.data || []));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed loading satellite users.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
      setRows([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeSatellite, toast]);

  const loadScrapeStatus = useCallback(async () => {
    if (activeSatellite !== 'rebatetools') return;
    setIsScrapeStatusLoading(true);
    try {
      const res = await satellitesApi.getRebtoolsScrapeStatus();
      setScrapeStatus(res.data || {});
    } catch {
      setScrapeStatus({});
    } finally {
      setIsScrapeStatusLoading(false);
    }
  }, [activeSatellite]);

  const reload = useCallback(async () => {
    await Promise.all([loadUsers(), loadScrapeStatus()]);
  }, [loadUsers, loadScrapeStatus]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setExpandedUserIds(new Set());
  }, [activeSatellite]);

  const tableColumns = useMemo(() => {
    const base = isRebTools ? ['expand', 'id', 'name', 'email'] : ['id', 'name', 'email'];
    if (isRebTools) {
      // base.push('account_status');
      base.push('brokers');
      base.push('status');
    } else {
      base.push('userName');
      base.push('status');
    }
    base.push('created_at');
    base.push('actions');
    return base;
  }, [isRebTools]);

  function renderAccountStatus(userId: string) {
    const s = scrapeStatus[userId]?.account_status;
    if (isScrapeStatusLoading) return <span className="text-muted-foreground text-xs">…</span>;
    if (s === 'connected') return <Badge variant="success">Connected</Badge>;
    if (s === 'syncing') {
      const entry = scrapeStatus[userId];
      const pct = entry?.total > 0 ? Math.round((entry.current / entry.total) * 100) : null;
      return (
        <div className="flex min-w-[120px] flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <Badge variant="warning">Syncing</Badge>
            {pct !== null && <span className="text-xs text-muted-foreground">{pct}%</span>}
          </div>
          {pct !== null ? (
            <Progress value={pct} className="h-1.5 w-full" />
          ) : (
            <div className="h-1.5 w-full animate-pulse rounded-full bg-primary/30" />
          )}
        </div>
      );
    }
    return <Badge variant="secondary">Not Connected</Badge>;
  }

  function renderRowActions(row: Row) {
    const userId = String(row.id ?? '');
    const isSendingReset = resetSendingId === userId;
    return (
      <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        {isRebTools && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openRebToolsLogin(String(row.email ?? ''))}
              title="Open RebTools login with this email"
            >
              <LogIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              disabled={!userId || isSendingReset}
              onClick={() => void handleSendReset(row)}
              title="Send password reset email"
            >
              <KeyRound className={cn('h-4 w-4', isSendingReset && 'animate-pulse')} />
            </Button>
          </>
        )}
        <Button variant="ghost" size="icon" onClick={() => openEdit(row)} title="Edit user">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setRowToDelete(row);
            setIsDeleteOpen(true);
          }}
          title="Delete user"
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </span>
    );
  }

  const handleSendReset = async (row: Row) => {
    const userId = String(row.id ?? '');
    if (!userId) return;
    const email = String(row.email ?? '').trim();
    if (!email) {
      toast({
        title: 'Email missing',
        description: 'This user has no email. Add an email before sending a reset link.',
        variant: 'destructive',
      });
      return;
    }

    setResetSendingId(userId);
    try {
      const res = await satellitesApi.sendRebToolsPasswordReset(userId);
      toast({
        title: 'Reset email sent',
        description: `Password reset link sent to ${res.data?.email || email}.`,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to send reset email.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setResetSendingId(null);
    }
  };

  const openEdit = (row: Row) => {
    setEditingRow(row);
    setEditData({
      name: String(row.name ?? ''),
      email: String(row.email ?? ''),
      userName: String(row.userName ?? ''),
      profile: activeSatellite === 'msgchat' ? normalizeMsgChatProfile(row.profile) : 'user',
      password: '',
      status: String(row.status ?? '1'),
    });
    setIsEditOpen(true);
  };

  function getDeleteIdentifier(row: Row): string | number {
    if (activeSatellite === 'telebulk') {
      return String(row.userName ?? row.username ?? row.email ?? row.id ?? '');
    }
    // return row.id ?? row._id ?? '';
    return String(row.id ?? row._id ?? '');
  }

  const handleDelete = async () => {
    if (!rowToDelete) return;
    const identifier = getDeleteIdentifier(rowToDelete);
    setIsDeleting(true);
    try {
      await satellitesApi.deleteUser(activeSatellite, identifier);
      toast({ title: 'User deleted', description: 'Satellite user was removed.' });
      setIsDeleteOpen(false);
      setRowToDelete(null);
      await reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete user.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingRow?.id) return;
    setIsUpdating(true);
    try {
      if (activeSatellite === 'rebatetools') {
        const updateRes = await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          name: editData.name,
          email: editData.email,
          password: editData.password || undefined,
          status: Number(editData.status),
        });
        const emailState = updateRes.data;
        if (!emailState?.activationEmailAttempted) {
          toast({
            title: 'User updated (no email)',
            description: 'No activation email was sent because this change did not trigger it.',
          });
        } else if (emailState.activationEmailError) {
          toast({
            title: 'User updated (email failed)',
            description: emailState.activationEmailError,
            variant: 'destructive',
          });
        } else if (emailState.activationEmailSkipped) {
          toast({
            title: 'User updated (email skipped)',
            description:
              'Activation email was skipped. Check RESEND_API_KEY and RESEND_FROM_EMAIL in the API .env, then restart the API.',
            variant: 'destructive',
          });
        } else if (emailState.activationEmailSent) {
          const reason =
            emailState.activationEmailTrigger === 'status_activated'
              ? 'status changed to Active'
              : 'role changed to Admin';
          toast({
            title: 'User updated (email sent)',
            description: `Activation email sent (${reason}).`,
          });
        } else {
          toast({
            title: 'User updated (email not sent)',
            description: 'Activation email was attempted but was not sent.',
            variant: 'destructive',
          });
        }
      } else if (activeSatellite === 'msgchat') {
        await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          email: editData.email,
          profile: editData.profile,
          ...(editData.password ? { password: editData.password } : {}),
        });
        toast({ title: 'User updated', description: 'Satellite user updated successfully.' });
      } else {
        await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          email: String(editingRow.email ?? editData.email),
          firstName: editData.name,
          userName: editData.userName || editData.email,
          ...(editData.password ? { password: editData.password } : {}),
        });
        toast({ title: 'User updated', description: 'Satellite user updated successfully.' });
      }
      setIsEditOpen(false);
      setEditingRow(null);
      await reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed updating user.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!createData.email || !createData.password) {
      toast({ title: 'Validation', description: 'Email and password are required.', variant: 'destructive' });
      return;
    }
    if (activeSatellite === 'rebatetools' && !createData.name) {
      toast({ title: 'Validation', description: 'Name is required for Rebatetools.', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      if (activeSatellite === 'rebatetools') {
        await satellitesApi.createUser(activeSatellite, {
          name: createData.name,
          email: createData.email,
          password: createData.password,
          rol: Number(createData.rol),
          status: Number(createData.status),
        });
      } else {
        await satellitesApi.createUser(activeSatellite, {
          firstName: createData.firstName || createData.name || '',
          lastName: createData.lastName || '',
          userName: createData.userName || createData.email,
          email: createData.email,
          password: createData.password,
          ...(activeSatellite === 'msgchat' ? { profile: createData.profile } : {}),
        });
      }
      toast({ title: 'User created', description: `User created on ${getDisplayName(activeSatellite, satellites)}.` });
      setIsCreateOpen(false);
      setCreateData({
        name: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        userName: '',
        profile: 'user',
        status: '0',
        rol: '3',
      });
      await reload();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed creating user.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const openRebToolsLogin = (email: string) => {
    const target = email.trim();
    if (!target) {
      toast({
        title: 'Email missing',
        description: 'This RebTools user has no email to prefill.',
        variant: 'destructive',
      });
      return;
    }
    const params = new URLSearchParams({ email: target });
    if (rebToolsSupportPassword) params.set('password', rebToolsSupportPassword);
    const loginUrl = `${rebToolsLoginBaseUrl}?${params.toString()}`;
    window.open(loginUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <div className="container py-8 sm:py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Satellite Users</h1>
            <p className="mt-2 text-muted-foreground">
              Manage users on {getDisplayName(activeSatellite, satellites)}.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {isRebTools && (
              <ToggleGroup
                type="single"
                value={usersLayout}
                onValueChange={(value) => {
                  if (value === 'table' || value === 'cards') setLayoutMode(value);
                }}
                variant="outline"
                size="sm"
                className="justify-start"
                aria-label="Users layout"
              >
                <ToggleGroupItem value="table" aria-label="Table layout" className="gap-1.5 px-3">
                  <LayoutList className="h-4 w-4" />
                  Table
                </ToggleGroupItem>
                <ToggleGroupItem value="cards" aria-label="Cards layout" className="gap-1.5 px-3">
                  <LayoutGrid className="h-4 w-4" />
                  Cards
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            <Button variant="outline" onClick={() => void reload()} disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setIsCreateOpen(true)}>
              <UserPlus className="h-4 w-4" />
              Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getDisplayName(activeSatellite, satellites)} users</CardTitle>
            <CardDescription>
              {isApiSatellite
                ? 'Users are managed via satellite API integration.'
                : isRebTools
                  ? 'Users are managed in the RebTools database. Switch Table/Cards to inspect connected brokers and scraped IBs.'
                  : 'Users are managed directly in the satellite MySQL database.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading users...</div>
            ) : rows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No users found on this satellite.</div>
            ) : isRebTools && usersLayout === 'cards' ? (
              <div className="space-y-3">
                {rows.map((row, idx) => {
                  const userId = String(row.id ?? idx);
                  const status = scrapeStatus[userId];
                  return (
                    <div
                      key={userId}
                      className="rounded-xl border bg-gradient-to-br from-background to-muted/30 p-4 shadow-sm transition hover:border-border/80"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-base font-semibold tracking-tight">
                              {String(row.name || 'Unnamed')}
                            </h3>
                            <Badge variant={String(row.status ?? '') === '1' ? 'success' : 'secondary'}>
                              {getRebToolsStatusLabel(row.status)}
                            </Badge>
                            <span className="text-xs text-muted-foreground tabular-nums">#{userId}</span>
                          </div>
                          <p className="truncate text-sm text-muted-foreground">{String(row.email ?? '')}</p>
                          {row.created_at != null && String(row.created_at) !== '' && (
                            <p className="text-[11px] text-muted-foreground">
                              Created {formatCreatedAt(row.created_at)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-6">
                          {/* <div className="space-y-1.5">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Account
                            </p>
                            {renderAccountStatus(userId)}
                          </div> */}
                          <div className="space-y-1.5">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                              Brokers
                            </p>
                            {isScrapeStatusLoading ? (
                              <span className="text-xs text-muted-foreground">…</span>
                            ) : (
                              <BrokerSummaryBadges status={status} />
                            )}
                          </div>
                          <div className="sm:ml-2">{renderRowActions(row)}</div>
                        </div>
                      </div>

                      <div className="mt-4 border-t pt-4">
                        {isScrapeStatusLoading ? (
                          <p className="text-xs text-muted-foreground">Loading broker details…</p>
                        ) : (
                          <BrokerIbDetailPanel status={status} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((col) => (
                      <TableHead key={col} className={col === 'expand' ? 'w-8' : undefined}>
                        {getColumnLabel(col)}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => {
                    const userId = String(row.id ?? idx);
                    const isExpanded = isRebTools && expandedUserIds.has(userId);
                    const colSpan = tableColumns.length;
                    return (
                      <Fragment key={userId}>
                        <TableRow
                          className={cn(isRebTools && 'cursor-pointer', isExpanded && 'bg-muted/40')}
                          onClick={isRebTools ? () => toggleExpanded(userId) : undefined}
                        >
                          {tableColumns.map((col) => (
                            <TableCell key={col}>
                              {col === 'expand' ? (
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 text-muted-foreground transition-transform',
                                    isExpanded && 'rotate-180'
                                  )}
                                />
                              ) : col === 'account_status' && isRebTools ? (
                                renderAccountStatus(userId)
                              ) : col === 'brokers' && isRebTools ? (
                                isScrapeStatusLoading ? (
                                  <span className="text-xs text-muted-foreground">…</span>
                                ) : (
                                  <BrokerSummaryBadges status={scrapeStatus[userId]} />
                                )
                              ) : col === 'status' && isRebTools ? (
                                <Badge variant={String(row.status ?? '') === '1' ? 'success' : 'secondary'}>
                                  {getRebToolsStatusLabel(row.status)}
                                </Badge>
                              ) : col === 'rol' && isRebTools ? (
                                <Badge variant="outline">{getRebToolsRoleLabel(row.rol)}</Badge>
                              ) : col === 'actions' ? (
                                renderRowActions(row)
                              ) : col === 'created_at' ? (
                                formatCreatedAt(row.created_at)
                              ) : (
                                String(row[col] ?? '')
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={colSpan} className="bg-muted/20 p-4">
                              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Connected brokers & scraped IBs
                              </div>
                              {isScrapeStatusLoading ? (
                                <p className="text-xs text-muted-foreground">Loading broker details…</p>
                              ) : (
                                <BrokerIbDetailPanel status={scrapeStatus[userId]} />
                              )}
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create satellite user</DialogTitle>
            <DialogDescription>
              This creates a user on {getDisplayName(activeSatellite, satellites)}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            {activeSatellite === 'rebatetools' ? (
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={createData.name}
                  onChange={(e) => setCreateData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={createData.firstName}
                    onChange={(e) => setCreateData((p) => ({ ...p, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={createData.lastName}
                    onChange={(e) => setCreateData((p) => ({ ...p, lastName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userName">Username</Label>
                  <Input
                    id="userName"
                    value={createData.userName}
                    onChange={(e) => setCreateData((p) => ({ ...p, userName: e.target.value }))}
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={createData.email}
                onChange={(e) => setCreateData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={createData.password}
                onChange={(e) => setCreateData((p) => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            {activeSatellite === 'msgchat' && (
              <div className="space-y-2">
                <Label htmlFor="profile">Profile</Label>
                <Select
                  value={createData.profile}
                  onValueChange={(value) => setCreateData((p) => ({ ...p, profile: value }))}
                >
                  <SelectTrigger id="profile">
                    <SelectValue placeholder="Select profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {msgChatProfileOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeSatellite === 'rebatetools' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol</Label>
                  <Select
                    value={createData.rol}
                    onValueChange={(value) => setCreateData((p) => ({ ...p, rol: value }))}
                  >
                    <SelectTrigger id="rol">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {rebToolsRoleOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={createData.status}
                    onValueChange={(value) => setCreateData((p) => ({ ...p, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {rebToolsStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Creating...' : 'Create user'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit satellite user</DialogTitle>
            <DialogDescription>
              Update user data on {getDisplayName(activeSatellite, satellites)}.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editData.name}
                onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email}
                onChange={(e) => setEditData((p) => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={editData.password}
                onChange={(e) => setEditData((p) => ({ ...p, password: e.target.value }))}
                placeholder="Leave blank to keep current password"
              />
            </div>
            {activeSatellite !== 'rebatetools' && (
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  value={editData.userName}
                  onChange={(e) => setEditData((p) => ({ ...p, userName: e.target.value }))}
                />
              </div>
            )}
            {activeSatellite === 'msgchat' && (
              <div className="space-y-2">
                <Label htmlFor="edit-profile">Profile</Label>
                <Select
                  value={editData.profile}
                  onValueChange={(value) => setEditData((p) => ({ ...p, profile: value }))}
                >
                  <SelectTrigger id="edit-profile">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {msgChatProfileOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {activeSatellite === 'rebatetools' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData((p) => ({ ...p, status: value }))}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rebToolsStatusOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isUpdating}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={(open) => { if (!open) { setIsDeleteOpen(false); setRowToDelete(null); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete satellite user</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user from {getDisplayName(activeSatellite, satellites)}? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsDeleteOpen(false); setRowToDelete(null); }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => void handleDelete()} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete user'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

