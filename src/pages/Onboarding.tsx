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
  const { user, completeOnboarding } = useAuth();
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
    
    // Complete onboarding
    completeOnboarding({
      enabledTools: selectedTools,
      company: profile.company,
      region: profile.region,
      timezone: profile.timezone,
    });
    
    toast({
      title: 'Setup complete!',
      description: 'Your partner account is ready to use.',
    });
    
    setTimeout(() => navigate('/dashboard'), 500);
  };

  return (
    <Layout showFooter={false}>
      <div className="container py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          {/* Stepper */}
          <div className="mb-10 animate-fade-in">
            <Stepper steps={steps} currentStep={currentStep} />
          </div>

          {/* Step Content */}
          <Card className="animate-fade-in shadow-lg">
            {currentStep === 1 && (
              <>
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Choose your tools</CardTitle>
                  <CardDescription className="text-base">
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
                            "group flex items-center gap-4 rounded-lg border p-5 text-left transition-all duration-200",
                            "hover:shadow-md",
                            isSelected
                              ? "border-accent bg-accent/5 ring-2 ring-accent ring-offset-2"
                              : "border-border hover:border-accent/50 hover:bg-secondary/50"
                          )}
                        >
                          <div className={cn(
                            "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                            isSelected 
                              ? "bg-accent text-accent-foreground scale-110" 
                              : "bg-secondary text-foreground group-hover:bg-accent/10"
                          )}>
                            {tool.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-base">{tool.name}</div>
                            <div className="text-sm text-muted-foreground mt-0.5">{tool.description}</div>
                          </div>
                          <div className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
                            isSelected
                              ? "border-accent bg-accent text-accent-foreground scale-110"
                              : "border-border group-hover:border-accent/50"
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
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Confirm your profile</CardTitle>
                  <CardDescription className="text-base">
                    Help us personalize your experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Company / Brand name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={profile.company}
                      onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="region" className="text-sm font-medium">Region</Label>
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
                    <Label htmlFor="timezone" className="text-sm font-medium">Timezone</Label>
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
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold">Review & Finish</CardTitle>
                  <CardDescription className="text-base">
                    Confirm your selections before completing setup
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="rounded-lg border border-border bg-secondary/30 p-5">
                    <h4 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Selected tools</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTools.map(toolId => {
                        const tool = tools.find(t => t.id === toolId);
                        return tool ? (
                          <div
                            key={toolId}
                            className="flex items-center gap-2 rounded-full bg-background border border-border px-4 py-2 text-sm font-medium shadow-sm"
                          >
                            {tool.icon}
                            {tool.name}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-border bg-secondary/30 p-5">
                    <h4 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Profile</h4>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Name</dt>
                        <dd className="font-semibold text-foreground">{user?.name}</dd>
                      </div>
                      <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd className="font-semibold text-foreground">{user?.email}</dd>
                      </div>
                      {profile.company && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Company</dt>
                          <dd className="font-semibold text-foreground">{profile.company}</dd>
                        </div>
                      )}
                      {profile.region && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Region</dt>
                          <dd className="font-semibold text-foreground">{profile.region}</dd>
                        </div>
                      )}
                      {profile.timezone && (
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Timezone</dt>
                          <dd className="font-semibold text-foreground">{profile.timezone}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </CardContent>
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between border-t border-border p-6 bg-secondary/20">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1 || isLoading}
                className="h-11"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              
              {currentStep < 3 ? (
                <Button onClick={handleNext} className="h-11 px-6">
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={isLoading} className="h-11 px-6">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Finishing...
                    </>
                  ) : (
                    <>
                      Finish setup
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}