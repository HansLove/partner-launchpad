import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ToolCard } from '@/components/ToolCard';
import { ToolCardSkeleton, CredentialsSkeleton } from '@/components/Skeleton';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, MessageCircle, Send, Copy, RefreshCw, Eye, EyeOff } from 'lucide-react';

const tools = [
  {
    id: 'rebatetools',
    name: 'Rebatetools',
    description: 'Analytics & commissions',
    icon: <BarChart3 className="h-6 w-6" />,
    status: 'active' as const,
  },
  {
    id: 'telebulk',
    name: 'Telebulk',
    description: 'Telegram bulk messaging',
    icon: <Send className="h-6 w-6" />,
    status: 'pending' as const,
  },
  {
    id: 'msgchat',
    name: 'MsgChat',
    description: 'WhatsApp bulk messaging',
    icon: <MessageCircle className="h-6 w-6" />,
    status: 'disabled' as const,
  },
];

const mockCredentials = {
  username: 'partner_alex_001',
  password: 'Tmp$2024!Secure',
};

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isRegenerateModalOpen, setIsRegenerateModalOpen] = useState(false);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleCopyUsername = () => {
    navigator.clipboard.writeText(mockCredentials.username);
    toast({
      title: 'Copied!',
      description: 'Username copied to clipboard.',
    });
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(mockCredentials.password);
    toast({
      title: 'Copied!',
      description: 'Password copied to clipboard.',
    });
  };

  const handleRegeneratePassword = () => {
    toast({
      title: 'Password regenerated',
      description: 'Your new temporary password has been created.',
    });
    setIsRegenerateModalOpen(false);
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your partner tools and credentials
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Tools Section */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold">Your Access</h2>
            
            <div className="grid gap-4">
              {isLoading ? (
                <>
                  <ToolCardSkeleton />
                  <ToolCardSkeleton />
                  <ToolCardSkeleton />
                </>
              ) : (
                tools.map((tool, index) => (
                  <div
                    key={tool.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ToolCard
                      {...tool}
                      showStatus
                      showAction={tool.status === 'active'}
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Credentials Section */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Credentials</h2>
            
            {isLoading ? (
              <CredentialsSkeleton />
            ) : (
              <Card className="animate-fade-in animation-delay-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Your login details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Username</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm">
                        {mockCredentials.username}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyUsername}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Temporary password</label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-secondary px-3 py-2 text-sm font-mono">
                        {showPassword ? mockCredentials.password : '••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopyPassword}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsRegenerateModalOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate password
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={isRegenerateModalOpen}
        onOpenChange={setIsRegenerateModalOpen}
        title="Regenerate password?"
        description="This will create a new temporary password and invalidate the current one. Make sure to save the new password."
        confirmLabel="Regenerate"
        onConfirm={handleRegeneratePassword}
      />
    </Layout>
  );
}
