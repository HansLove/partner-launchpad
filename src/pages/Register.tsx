import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    telegram: '',
    whatsapp: '',
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'You must agree to the terms';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        company: formData.company,
        telegram: formData.telegram,
        whatsapp: formData.whatsapp,
      });
      
      toast({
        title: 'Account created!',
        description: 'Welcome to the Partner Portal. Let\'s set up your account.',
      });
      
      setTimeout(() => navigate('/onboarding'), 500);
    } catch {
      toast({
        title: 'Registration failed',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'password' || field === 'confirmPassword') {
      if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      }
    }
  };

  const passwordStrength = formData.password.length >= 8 && 
    /[A-Z]/.test(formData.password) && 
    /[a-z]/.test(formData.password) && 
    /[0-9]/.test(formData.password);

  return (
    <Layout showFooter={false}>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl animate-fade-in shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-3xl font-bold">Create your account</CardTitle>
            <CardDescription className="text-base">
              Get started with Partner Portal in minutes
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Fields */}
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    error={!!errors.fullName && touched.fullName}
                    className="h-11"
                  />
                  {errors.fullName && touched.fullName && (
                    <p className="text-xs text-destructive animate-fade-in">{errors.fullName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    error={!!errors.email && touched.email}
                    className="h-11"
                  />
                  {errors.email && touched.email && (
                    <p className="text-xs text-destructive animate-fade-in">{errors.email}</p>
                  )}
                </div>
                
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      error={!!errors.password && touched.password}
                      className="h-11"
                    />
                    {formData.password && (
                      <div className="space-y-1.5">
                        {passwordStrength ? (
                          <div className="flex items-center gap-1.5 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Strong password</span>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            Must be 8+ characters with uppercase, lowercase, and numbers
                          </p>
                        )}
                      </div>
                    )}
                    {errors.password && touched.password && (
                      <p className="text-xs text-destructive animate-fade-in">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      error={!!errors.confirmPassword && touched.confirmPassword}
                      className="h-11"
                    />
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="flex items-center gap-1.5 text-xs text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Passwords match</span>
                      </div>
                    )}
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="text-xs text-destructive animate-fade-in">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Optional Fields */}
              <div className="border-t border-border pt-6">
                <p className="mb-4 text-sm font-medium text-muted-foreground">
                  Optional information
                </p>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-sm font-medium">Company / Brand name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={formData.company}
                      onChange={(e) => handleChange('company', e.target.value)}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="telegram" className="text-sm font-medium">Telegram username</Label>
                      <Input
                        id="telegram"
                        placeholder="@username"
                        value={formData.telegram}
                        onChange={(e) => handleChange('telegram', e.target.value)}
                        className="h-11"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp" className="text-sm font-medium">WhatsApp number</Label>
                      <Input
                        id="whatsapp"
                        placeholder="+1 234 567 8900"
                        value={formData.whatsapp}
                        onChange={(e) => handleChange('whatsapp', e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Terms */}
              <div className="flex items-start gap-3 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleChange('agreeTerms', !!checked)}
                  className="mt-0.5"
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    I agree to the{' '}
                    <Link to="#" className="text-accent underline-offset-4 hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link to="#" className="text-accent underline-offset-4 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.agreeTerms && (
                    <p className="text-xs text-destructive animate-fade-in">{errors.agreeTerms}</p>
                  )}
                </div>
              </div>
              
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
            
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}