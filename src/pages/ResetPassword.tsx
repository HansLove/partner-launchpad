import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ArrowLeft, Mail } from 'lucide-react';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <Layout showFooter={false}>
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
          <Card className="w-full max-w-md animate-fade-in text-center shadow-lg">
            <CardHeader className="space-y-1 pb-6">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-base">
                We've sent a password reset link to{' '}
                <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-secondary/30 p-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="text-left">
                    <p className="text-sm font-medium">Didn't receive the email?</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Check your spam folder or try again with a different email address.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <Button
                  variant="outline"
                  className="w-full h-11"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail('');
                    setTouched(false);
                  }}
                >
                  Try another email
                </Button>
                <Button variant="ghost" className="w-full h-11" asChild>
                  <Link to="/login">
                    <ArrowLeft className="h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <Card className="w-full max-w-md animate-fade-in shadow-lg">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Mail className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-3xl font-bold">Reset your password</CardTitle>
            <CardDescription className="text-base">
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  onBlur={() => setTouched(true)}
                  error={!!error && touched}
                  className="h-11"
                  autoComplete="email"
                />
                {error && touched && (
                  <p className="text-xs text-destructive animate-fade-in">{error}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </form>
            
            <Button variant="ghost" className="mt-6 w-full h-11" asChild>
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}