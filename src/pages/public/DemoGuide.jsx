/**
 * Purpose: Provide a clear walkthrough for presenting the MVP by role and key workflow.
 * Used by: Public route `/demo-guide`.
 * Main dependencies: React Router links, shadcn button/badge/card, and lucide icons.
 * Public/main functions: Default `DemoGuide` page export.
 * Important side effects: None.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, UserCog, GraduationCap, Search, ArrowRight } from 'lucide-react';

const roleGuides = [
  {
    title: 'Visitor Flow',
    icon: Search,
    badge: 'Public',
    steps: [
      'Open Programs to browse the catalog.',
      'Check Trainers to review expert profiles.',
      'Open Certificate Verification and use one of the sample codes.',
      'Open Register Program from any active batch to show the inquiry/registration flow.',
    ],
    links: [
      { label: 'Programs', to: '/programs' },
      { label: 'Verify Certificate', to: '/verify-certificate' },
    ],
  },
  {
    title: 'Participant Flow',
    icon: GraduationCap,
    badge: 'Demo Account',
    steps: [
      'Login using participant@vteki.local / participant123.',
      'Open Participant Dashboard to show progress and next milestone.',
      'Open My Programs, My Assessments, and My Certificates to show learning history.',
      'Download a sample certificate PDF from the certificate page.',
    ],
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Participant Dashboard', to: '/participant/dashboard' },
    ],
  },
  {
    title: 'Admin Flow',
    icon: UserCog,
    badge: 'Demo Account',
    steps: [
      'Login using admin@vteki.local / admin123.',
      'Open Admin Dashboard for the management overview.',
      'Walk through Programs, Batches, Registrations, Certificates, Trainers, and Users.',
      'Use the local actions to update status, generate records, or invite demo users.',
    ],
    links: [
      { label: 'Login', to: '/login' },
      { label: 'Admin Dashboard', to: '/admin/dashboard' },
    ],
  },
];

export default function DemoGuide() {
  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-white/10 text-primary-foreground border border-white/20 mb-4">MVP Walkthrough</Badge>
          <h1 className="text-3xl lg:text-5xl font-bold font-heading mb-4">Demo Guide</h1>
          <p className="text-primary-foreground/70 max-w-2xl">
            A guided path for presenting the V-TEKI Center of Excellence MVP using the local free-tier preview.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Card className="border-secondary/20">
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link to="/login"><Button className="w-full bg-secondary hover:bg-secondary/90 text-white">Open Login</Button></Link>
            <Link to="/programs"><Button variant="outline" className="w-full">Browse Programs</Button></Link>
            <Link to="/verify-certificate"><Button variant="outline" className="w-full">Verify Certificate</Button></Link>
            <Link to="/admin/dashboard"><Button variant="outline" className="w-full">Open Admin Demo</Button></Link>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {roleGuides.map((guide) => (
            <Card key={guide.title} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                      <guide.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                  </div>
                  <Badge variant="outline">{guide.badge}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {guide.steps.map((step) => (
                    <div key={step} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {guide.links.map((link) => (
                    <Link key={link.to} to={link.to}>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        {link.label}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl border border-border p-4">
              <p className="font-medium">Admin</p>
              <p className="text-muted-foreground mt-1">admin@vteki.local</p>
              <p className="text-muted-foreground">admin123</p>
            </div>
            <div className="rounded-xl border border-border p-4">
              <p className="font-medium">Participant</p>
              <p className="text-muted-foreground mt-1">participant@vteki.local</p>
              <p className="text-muted-foreground">participant123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
