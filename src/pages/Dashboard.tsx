/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmModal } from '@/components/ConfirmModal';
import { usePartners } from '@/contexts/PartnersContext';
import { useToast } from '@/hooks/use-toast';
import { usersApi } from '@/lib/api';
import {
  Users,
  UserPlus,
  Copy,
  Pencil,
  Eye,
  EyeOff,
  RefreshCw,
  Trash2,
  BarChart3,
  Send,
  MessageCircle,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const tools = [
  { id: 'rebatetools', name: 'Rebatetools', icon: BarChart3 },
  { id: 'telebulk', name: 'Telebulk', icon: Send },
  { id: 'msgchat', name: 'MsgChat', icon: MessageCircle },
];
export default function Dashboard() {
  const { partners, isLoading, addPartner, deletePartner, regeneratePassword, refreshPartners } = usePartners();
  const { toast } = useToast();
  
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [partnerToDelete, setPartnerToDelete] = useState<string | null>(null);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);
  const [partnerToRegenerate, setPartnerToRegenerate] = useState<{ id: string; name: string; username: string } | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditPartnerOpen, setIsEditPartnerOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<any | null>(null);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [newPartnerCredentials, setNewPartnerCredentials] = useState<{ username: string; password: string; name: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    region: '',
    timezone: '',
    enabledTools: [] as string[],
    telegram: '',
    whatsapp: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    company: '',
    region: '',
    timezone: '',
    telegram: '',
    whatsapp: '',
  });

  const stats = {
    total: partners.length,
    active: partners.filter(p => p.status === 'active').length,
    pending: partners.filter(p => p.status === 'pending').length,
    inactive: partners.filter(p => p.status === 'inactive').length,
  };

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: 'Validation error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.enabledTools.length === 0) {
      toast({
        title: 'Validation error',
        description: 'Please select at least one tool.',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      const newPartner = await addPartner({
        name: formData.name,
        email: formData.email,
        company: formData.company || undefined,
        region: formData.region || undefined,
        timezone: formData.timezone || undefined,
        enabledTools: formData.enabledTools,
        telegram: formData.telegram || undefined,
        whatsapp: formData.whatsapp || undefined,
      });

      // Show credentials modal
      setNewPartnerCredentials({
        username: newPartner.username,
        password: newPartner.password,
        name: newPartner.name,
      });
      setIsCredentialsModalOpen(true);

      toast({
        title: 'Partner created!',
        description: `Credentials generated for ${newPartner.name}.`,
      });

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        company: '',
        region: '',
        timezone: '',
        enabledTools: [],
        telegram: '',
        whatsapp: '',
      });
      setIsAddPartnerOpen(false);
      setSelectedPartner(newPartner.id);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create partner. Please try again.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard.`,
    });
  };

  const handleDelete = async () => {
    if (!partnerToDelete) return;
    try {
      await deletePartner(partnerToDelete);
      toast({
        title: 'Partner deleted',
        description: 'The partner has been removed.',
      });
      setIsDeleteModalOpen(false);
      setPartnerToDelete(null);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to delete partner.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!partnerToRegenerate) return;
    setIsRegenerating(true);
    try {
      const newPassword = await regeneratePassword(partnerToRegenerate.id);
      setNewPartnerCredentials({
        username: partnerToRegenerate.username,
        password: newPassword,
        name: partnerToRegenerate.name,
      });
      setIsCredentialsModalOpen(true);
      setIsRegenerateModalOpen(false);
      setPartnerToRegenerate(null);
      toast({
        title: 'Password regenerated',
        description: 'Save the new password — it will not be shown again.',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to regenerate password.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setFormData(prev => ({
      ...prev,
      enabledTools: prev.enabledTools.includes(toolId)
        ? prev.enabledTools.filter(id => id !== toolId)
        : [...prev.enabledTools, toolId],
    }));
  };

  const openEditPartner = (partner: any) => {
    setPartnerToEdit(partner);
    setEditFormData({
      name: partner.name || '',
      email: partner.email || '',
      company: partner.company || '',
      region: partner.region || '',
      timezone: partner.timezone || '',
      telegram: partner.telegram || '',
      whatsapp: partner.whatsapp || '',
    });
    setIsEditPartnerOpen(true);
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerToEdit) return;
    if (!editFormData.name.trim() || !editFormData.email.trim()) {
      toast({
        title: 'Validation error',
        description: 'Name and email are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsUpdating(true);
    try {
      const id = parseInt(partnerToEdit.id, 10);
      await usersApi.update(id, {
        name: editFormData.name.trim(),
        email: editFormData.email.trim(),
        company: editFormData.company || undefined,
        region: editFormData.region || undefined,
        timezone: editFormData.timezone || undefined,
        telegram: editFormData.telegram || undefined,
        whatsapp: editFormData.whatsapp || undefined,
      });
      await refreshPartners();
      setIsEditPartnerOpen(false);
      setPartnerToEdit(null);
      toast({
        title: 'Partner updated',
        description: 'Partner information has been updated successfully.',
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to update partner.';
      toast({
        title: 'Error',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="font-medium">Active</Badge>;
      case 'pending':
        return <Badge variant="warning" className="font-medium">Pending</Badge>;
      case 'inactive':
        return <Badge variant="secondary" className="font-medium">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getToolIcons = (enabledTools: string[]) => {
    return enabledTools.map(toolId => {
      const tool = tools.find(t => t.id === toolId);
      if (!tool) return null;
      const Icon = tool.icon;
      return (
        <div key={toolId} className="flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium">{tool.name}</span>
        </div>
      );
    }).filter(Boolean);
  };

  return (
    <Layout>
      <div className="container py-8 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Users</h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Manage platform users (local DB) separately from satellite users
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="lg" onClick={() => setIsAddPartnerOpen(true)} className="h-11">
              <UserPlus className="h-4 w-4" />
              Add Partner
            </Button>
            <Button size="lg" variant="outline" asChild className="h-11">
              <Link to="/dashboard/satellites/users">Satellite Users</Link>
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Platform Users</CardTitle>
              <CardDescription>
                Local users stored in the main platform database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link to="/dashboard">Open platform users</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Satellite Users</CardTitle>
              <CardDescription>
                Users managed directly on MsgChat, TeleBulk and RebTools.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" asChild>
                <Link to="/dashboard/satellites/users">Open satellite users</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="animate-fade-in-up shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Platform Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up animation-delay-100 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up animation-delay-200 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card className="animate-fade-in-up animation-delay-300 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inactive}</div>
            </CardContent>
          </Card>
        </div>

        {/* Partners Table */}
        <Card className="animate-fade-in-up animation-delay-400 shadow-lg">
          <CardHeader>
            <CardTitle>All Platform Users</CardTitle>
            <CardDescription>
              Users stored in the local platform database (`partners_portal.users`)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading partners...</div>
            ) : partners.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No platform users yet</p>
                <Button onClick={() => setIsAddPartnerOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add first platform user
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Partner</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Tools</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Credentials</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id} className={cn(
                        selectedPartner === partner.id && "bg-accent/5"
                      )}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-muted-foreground">{partner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{partner.company || '-'}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5">
                            {getToolIcons(partner.enabledTools)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(partner.status)}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                                {partner.username}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleCopy(partner.username, 'Username')}
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <code className="text-xs bg-secondary px-2 py-1 rounded font-mono">
                                {partner.password
                                  ? (showPasswords[partner.id] ? partner.password : '••••••••')
                                  : '—'}
                              </code>
                              {partner.password && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => setShowPasswords(prev => ({
                                      ...prev,
                                      [partner.id]: !prev[partner.id],
                                    }))}
                                  >
                                    {showPasswords[partner.id] ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleCopy(partner.password, 'Password')}
                                  >
                                    <Copy className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(partner.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openEditPartner(partner)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setPartnerToRegenerate({
                                  id: partner.id,
                                  name: partner.name,
                                  username: partner.username,
                                });
                                setIsRegenerateModalOpen(true);
                              }}
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => {
                                setPartnerToDelete(partner.id);
                                setIsDeleteModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Partner Dialog */}
      <Dialog open={isAddPartnerOpen} onOpenChange={setIsAddPartnerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Partner</DialogTitle>
            <DialogDescription>
              Generate login credentials for a new affiliate partner
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPartner} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Smith"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@company.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company / Brand</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Acme Trading Ltd"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={formData.region} onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Americas">Americas</SelectItem>
                    <SelectItem value="Europe">Europe</SelectItem>
                    <SelectItem value="Asia Pacific">Asia Pacific</SelectItem>
                    <SelectItem value="Middle East & Africa">Middle East & Africa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(value) => setFormData(prev => ({ ...prev, timezone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC-8 (Pacific)">UTC-8 (Pacific)</SelectItem>
                    <SelectItem value="UTC-5 (Eastern)">UTC-5 (Eastern)</SelectItem>
                    <SelectItem value="UTC+0 (London)">UTC+0 (London)</SelectItem>
                    <SelectItem value="UTC+1 (Central Europe)">UTC+1 (Central Europe)</SelectItem>
                    <SelectItem value="UTC+8 (Singapore)">UTC+8 (Singapore)</SelectItem>
                    <SelectItem value="UTC+9 (Tokyo)">UTC+9 (Tokyo)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Enabled Tools *</Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = formData.enabledTools.includes(tool.id);
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      onClick={() => toggleTool(tool.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 text-left transition-all",
                        isSelected
                          ? "border-accent bg-accent/5 ring-2 ring-accent"
                          : "border-border hover:border-accent/50 hover:bg-secondary/50"
                      )}
                    >
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                        isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{tool.name}</div>
                      </div>
                      <div className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2 transition-all",
                        isSelected
                          ? "border-accent bg-accent text-accent-foreground"
                          : "border-border"
                      )}>
                        {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="telegram">Telegram Username</Label>
                <Input
                  id="telegram"
                  value={formData.telegram}
                  onChange={(e) => setFormData(prev => ({ ...prev, telegram: e.target.value }))}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="+1 234 567 8900"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddPartnerOpen(false)}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Partner'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Partner Dialog */}
      <Dialog open={isEditPartnerOpen} onOpenChange={setIsEditPartnerOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Partner</DialogTitle>
            <DialogDescription>
              Update partner profile information.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePartner} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-company">Company / Brand</Label>
              <Input
                id="edit-company"
                value={editFormData.company}
                onChange={(e) => setEditFormData(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Input
                  id="edit-region"
                  value={editFormData.region}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, region: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-timezone">Timezone</Label>
                <Input
                  id="edit-timezone"
                  value={editFormData.timezone}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, timezone: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-telegram">Telegram Username</Label>
                <Input
                  id="edit-telegram"
                  value={editFormData.telegram}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, telegram: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-whatsapp">WhatsApp Number</Label>
                <Input
                  id="edit-whatsapp"
                  value={editFormData.whatsapp}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditPartnerOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Partner?"
        description="This action cannot be undone. This will permanently delete the partner and all associated data."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        variant="destructive"
      />

      {/* Regenerate Password Confirmation */}
      <ConfirmModal
        open={isRegenerateModalOpen}
        onOpenChange={setIsRegenerateModalOpen}
        title="Regenerate Password?"
        description="This will generate a new password and invalidate the current one. Make sure to notify the partner."
        confirmLabel="Regenerate"
        onConfirm={handleRegenerate}
      />

      {/* New Partner Credentials Modal */}
      <Dialog open={isCredentialsModalOpen} onOpenChange={setIsCredentialsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Partner Credentials Generated</DialogTitle>
            <DialogDescription>
              Save these credentials for {newPartnerCredentials?.name}. They won't be shown again.
            </DialogDescription>
          </DialogHeader>
          {newPartnerCredentials && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Username</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-mono font-medium">
                    {newPartnerCredentials.username}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(newPartnerCredentials.username, 'Username')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Password</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-lg bg-secondary border border-border px-4 py-3 text-sm font-mono font-medium">
                    {newPartnerCredentials.password}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(newPartnerCredentials.password, 'Password')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Make sure to securely share these credentials with the partner. They can use these to access their enabled tools.
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsCredentialsModalOpen(false)} className="w-full">
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}