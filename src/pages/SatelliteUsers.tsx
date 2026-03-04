import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSatellite } from '@/contexts/SatelliteContext';
import { satellitesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Pencil, RefreshCw, UserPlus, Trash2 } from 'lucide-react';

type Row = Record<string, unknown>;

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
    rol: '3',
  });

  const isApiSatellite = activeSatellite === 'msgchat' || activeSatellite === 'telebulk';

  const loadUsers = async () => {
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
  };

  useEffect(() => {
    void loadUsers();
  }, [activeSatellite]);

  const tableColumns = useMemo(() => {
    const base = ['id', 'name', 'email'];
    if (activeSatellite === 'rebatetools') {
      base.push('rol');
      base.push('status');
    } else {
      base.push('userName');
      base.push('status');
    }
    base.push('created_at');
    base.push('actions');
    return base;
  }, [activeSatellite]);

  const openEdit = (row: Row) => {
    setEditingRow(row);
    setEditData({
      name: String(row.name ?? ''),
      email: String(row.email ?? ''),
      userName: String(row.userName ?? ''),
      profile: activeSatellite === 'msgchat' ? normalizeMsgChatProfile(row.profile) : 'user',
      password: '',
      rol: String(row.rol ?? '3'),
      status: String(row.status ?? '1'),
    });
    setIsEditOpen(true);
  };

  function getDeleteIdentifier(row: Row): string | number {
    if (activeSatellite === 'telebulk') {
      return String(row.userName ?? row.username ?? row.email ?? row.id ?? '');
    }
    return row.id ?? row._id ?? '';
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
      await loadUsers();
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
        await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          name: editData.name,
          email: editData.email,
          password: editData.password || undefined,
          rol: Number(editData.rol),
          status: Number(editData.status),
        });
      } else if (activeSatellite === 'msgchat') {
        await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          email: editData.email,
          profile: editData.profile,
          ...(editData.password ? { password: editData.password } : {}),
        });
      } else {
        await satellitesApi.updateUser(activeSatellite, String(editingRow.id), {
          email: String(editingRow.email ?? editData.email),
          firstName: editData.name,
          userName: editData.userName || editData.email,
          ...(editData.password ? { password: editData.password } : {}),
        });
      }
      toast({ title: 'User updated', description: 'Satellite user updated successfully.' });
      setIsEditOpen(false);
      setEditingRow(null);
      await loadUsers();
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
      toast({ title: 'Validation', description: 'Name is required for RebTools.', variant: 'destructive' });
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
      await loadUsers();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed creating user.';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => void loadUsers()} disabled={isLoading}>
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
                : 'Users are managed directly in the satellite MySQL database.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Loading users...</div>
            ) : rows.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">No users found on this satellite.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {tableColumns.map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, idx) => (
                    <TableRow key={`${String(row.id || idx)}`}>
                      {tableColumns.map((col) => (
                        <TableCell key={col}>
                          {col === 'status' && activeSatellite === 'rebatetools' ? (
                            <Badge variant={String(row.status ?? '') === '1' ? 'success' : 'secondary'}>
                              {getRebToolsStatusLabel(row.status)}
                            </Badge>
                          ) : col === 'rol' && activeSatellite === 'rebatetools' ? (
                            <Badge variant="outline">{getRebToolsRoleLabel(row.rol)}</Badge>
                          ) : col === 'actions' ? (
                            <span className="flex items-center gap-1">
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
                          ) : (
                            String(row[col] ?? '')
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
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
                  <Label htmlFor="edit-rol">Rol</Label>
                  <Select value={editData.rol} onValueChange={(value) => setEditData((p) => ({ ...p, rol: value }))}>
                    <SelectTrigger id="edit-rol">
                      <SelectValue />
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

