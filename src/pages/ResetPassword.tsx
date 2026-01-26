import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <Layout showFooter={false}>
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
          <Card className="w-full max-w-md animate-fade-in text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-8 w-8 text-success" />
              </div>
              <CardTitle className="text-2xl">Check your email</CardTitle>
              <CardDescription>
                We've sent a password reset link to <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <p className="mb-6 text-sm text-muted-foreground">
                Didn't receive the email? Check your spam folder or try again with a different email address.
              </p>
              
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsSuccess(false)}
                >
                  Try another email
                </Button>
                <Button variant="ghost" className="w-full" asChild>
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
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset your password</CardTitle>
            <CardDescription>
              Enter your email and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  error={!!error}
                />
                {error && (
                  <p className="text-xs text-destructive">{error}</p>
                )}
              </div>
              
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send reset link
              </Button>
            </form>
            
            <Button variant="ghost" className="mt-4 w-full" asChild>
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
