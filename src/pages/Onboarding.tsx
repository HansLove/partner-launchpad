import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Stepper } from '@/components/Stepper';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, MessageCircle, Send, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = [
  { id: 1, title: 'Select tools' },
  { id: 2, title: 'Profile' },
  { id: 3, title: 'Review' },
];

const tools = [
  {
    id: 'rebatetools',
    name: 'Rebatetools',
    description: 'Analytics & commissions',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    id: 'telebulk',
    name: 'Telebulk',
    description: 'Telegram messaging',
    icon: <Send className="h-5 w-5" />,
  },
  {
    id: 'msgchat',
    name: 'MsgChat',
    description: 'WhatsApp messaging',
    icon: <MessageCircle className="h-5 w-5" />,
  },
];

const regions = [
  'Americas',
  'Europe',
  'Asia Pacific',
  'Middle East & Africa',
];

const timezones = [
  'UTC-8 (Pacific)',
  'UTC-5 (Eastern)',
  'UTC+0 (London)',
  'UTC+1 (Central Europe)',
  'UTC+8 (Singapore)',
  'UTC+9 (Tokyo)',
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [profile, setProfile] = useState({
    company: user?.company || '',
    region: '',
    timezone: '',
  });

  const toggleTool = (toolId: string) => {
    setSelectedTools(prev =>
      prev.includes(toolId)
        ? prev.filter(id => id !== toolId)
        : [...prev, toolId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && selectedTools.length === 0) {
      toast({
        title: 'Select at least one tool',
        description: 'Please choose the tools you want access to.',
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleFinish = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Setup complete!',
      description: 'Your partner account is ready to use.',
    });
    
    navigate('/dashboard');
  };

  return (
    <Layout showFooter={false}>
      <div className="container py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Stepper */}
          <div className="mb-8 animate-fade-in">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <Card className="animate-fade-in">
            {currentStep === 1 && (
              <>
                <CardHeader className="text-center">
                  <CardTitle>Choose your tools</CardTitle>
                  <CardDescription>
                    Select the tools you want access to. You can change this later.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {tools.map((tool) => {
                      const isSelected = selectedTools.includes(tool.id);
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => toggleTool(tool.id)}
                          className={cn(
                            "flex items-center gap-4 rounded-lg border p-4 text-left transition-all",
                            isSelected
                              ? "border-accent bg-accent/5 ring-2 ring-accent"
                              : "border-border hover:border-muted-foreground/30 hover:bg-secondary/50"
                          )}
                        >
                          <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                            isSelected ? "bg-accent text-accent-foreground" : "bg-secondary text-foreground"
                          )}>
                            {tool.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{tool.name}</div>
                            <div className="text-sm text-muted-foreground">{tool.description}</div>
                          </div>
                          <div className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all",
                            isSelected
                              ? "border-accent bg-accent text-accent-foreground"
                              : "border-border"
                          )}>
                            {isSelected && <Check className="h-4 w-4" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 2 && (
              <>
                <CardHeader className="text-center">
                  <CardTitle>Confirm your profile</CardTitle>
                  <CardDescription>
                    Help us personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company / Brand name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <select
                      id="region"
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      value={profile.region}
                      onChange={(e) => setProfile(prev => ({ ...prev, region: e.target.value }))}
                    >
                      <option value="">Select region</option>
                      {regions.map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <select
                      id="timezone"
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-4 py-2 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                      value={profile.timezone}
                      onChange={(e) => setProfile(prev => ({ ...prev, timezone: e.target.value }))}
                    >
                      <option value="">Select timezone</option>
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </>
            )}

            {currentStep === 3 && (
              <>
                <CardHeader className="text-center">
                  <CardTitle>Review & Finish</CardTitle>
                  <CardDescription>
                    Confirm your selections before completing setup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">Selected tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTools.map(toolId => {
                        const tool = tools.find(t => t.id === toolId);
                        return tool ? (
                          <div
                            key={toolId}
                            className="flex items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm"
                          >
                            {tool.icon}
                            {tool.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-border p-4">
                    <h4 className="mb-3 text-sm font-medium text-muted-foreground">Profile</h4>
                    <dl className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="font-medium">{user?.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-medium">{user?.email}</dd>
                      </div>
                      {profile.company && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Company</dt>
                          <dd className="font-medium">{profile.company}</dd>
                        </div>
                      )}
                      {profile.region && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Region</dt>
                          <dd className="font-medium">{profile.region}</dd>
                        </div>
                      )}
                      {profile.timezone && (
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Timezone</dt>
                          <dd className="font-medium">{profile.timezone}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-border p-6">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Finish setup
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
