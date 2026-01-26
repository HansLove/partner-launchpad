import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/ToolCard';
import { BarChart3, MessageCircle, Send, ArrowRight } from 'lucide-react';

const tools = [
  {
    id: 'rebatetools',
    name: 'Rebatetools',
    description: 'Analytics and commission tracking for broker partnerships',
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    id: 'telebulk',
    name: 'Telebulk',
    description: 'Bulk messaging solution for Telegram outreach',
    icon: <Send className="h-6 w-6" />,
  },
  {
    id: 'msgchat',
    name: 'MsgChat',
    description: 'WhatsApp bulk messaging for partner communications',
    icon: <MessageCircle className="h-6 w-6" />,
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/50 to-background" />
        
        <div className="container py-20 sm:py-28">
          <div className="mx-auto max-w-2xl text-center animate-fade-in">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Partner Access
            </h1>
            <p className="mt-4 text-lg text-muted-foreground sm:text-xl">
              Create your affiliate login and unlock powerful tools for analytics, messaging, and partner management.
            </p>
            
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="xl" asChild>
                <Link to="/register">
                  Create account
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="border-t border-border bg-background">
        <div className="container py-16 sm:py-20">
          <div className="mb-10 text-center animate-fade-in">
            <h2 className="text-2xl font-bold sm:text-3xl">Our Partner Tools</h2>
            <p className="mt-2 text-muted-foreground">
              Access industry-leading solutions for affiliate marketing and communication
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                className={`animate-fade-in-up animation-delay-${(index + 1) * 100}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-secondary/30">
        <div className="container py-16 text-center">
          <div className="mx-auto max-w-xl animate-fade-in">
            <h2 className="text-2xl font-bold">Ready to get started?</h2>
            <p className="mt-2 text-muted-foreground">
              Join our partner network and start growing your business today.
            </p>
            <Button size="lg" className="mt-6" asChild>
              <Link to="/register">Create your account</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
