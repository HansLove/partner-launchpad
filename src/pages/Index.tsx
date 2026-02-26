import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ToolCard } from '@/components/ToolCard';
import { BarChart3, MessageCircle, Send, ArrowRight, Sparkles } from 'lucide-react';

const tools = [
  {
    id: 'rebatetools',
    name: 'Rebatetools',
    description: 'Broker commission analytics and tracking for affiliate partnerships',
    icon: <BarChart3 className="h-6 w-6" />,
    url: 'https://rebatetools.com',
  },
  {
    id: 'telebulk',
    name: 'Telebulk',
    description: 'Bulk messaging solution for Telegram outreach and campaigns',
    icon: <Send className="h-6 w-6" />,
    url: 'https://telebulk.com',
  },
  {
    id: 'msgchat',
    name: 'MsgChat',
    description: 'WhatsApp bulk messaging for partner communications and marketing',
    icon: <MessageCircle className="h-6 w-6" />,
    url: 'https://www.msgchat.com',
  },
];

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/30 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_50%)]" />
        
        <div className="container py-20 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-1.5 text-sm text-muted-foreground backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span>Partner Access Portal</span>
            </div>
            
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-in animation-delay-100">
              Partner Access
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl animate-fade-in animation-delay-200">
              Create your affiliate login to access powerful tools for analytics, messaging, and partner management.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in animation-delay-300">
              <Button size="xl" className="group" asChild>
                <Link to="/register">
                  Create account
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
      <section className="border-b border-border bg-background">
        <div className="container py-20 sm:py-24">
          <div className="mb-12 text-center animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Partner Tools</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Access industry-leading solutions designed for affiliate marketing and communication
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool, index) => (
              <div
                key={tool.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container py-20 text-center">
          <div className="mx-auto max-w-2xl animate-fade-in">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to get started?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join our partner network and start growing your business with powerful affiliate tools.
            </p>
            <Button size="lg" className="mt-8 group" asChild>
              <Link to="/register">
                Create your account
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}