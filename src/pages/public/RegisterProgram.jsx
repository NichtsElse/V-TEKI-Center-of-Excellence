/**
 * Purpose: Collect individual or corporate program inquiries for the local MVP preview.
 * Used by: Public route `/register-program/:batchId`.
 * Main dependencies: React Router params, local app client, React Query, shadcn form controls, and toast feedback.
 * Public/main functions: Default `RegisterProgram` page export.
 * Important side effects: Creates local individual enrollment interest records and corporate inquiry records.
 */
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CheckCircle, Loader2, User, Building2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

export default function RegisterProgram() {
  const { batchId } = useParams();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [tab, setTab] = useState('individual');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [individual, setIndividual] = useState({ full_name: '', email: '', phone: '', company: '', job_title: '', industry: '' });
  const [corporate, setCorporate] = useState({ company_name: '', pic_name: '', pic_email: '', pic_phone: '', participant_count: 1 });

  const { data: batch, isLoading } = useQuery({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const batches = await appClient.entities.Batch.filter({ id: batchId });
      return batches[0];
    },
  });

  const { data: program } = useQuery({
    queryKey: ['program-for-batch', batch?.program_id],
    queryFn: async () => {
      const programs = await appClient.entities.Program.filter({ id: batch.program_id });
      return programs[0];
    },
    enabled: !!batch?.program_id,
  });

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await appClient.entities.Registration.create({
      ...individual,
      batch_id: batchId,
      program_id: batch.program_id,
      program_name: program?.name || batch.program_name,
      batch_name: batch.name,
      registration_type: 'individual',
      status: 'registered',
    });
    setLoading(false);
    setSuccess(true);
    toast({ title: 'Enrollment Submitted', description: 'Your program interest has been saved successfully.' });
  };

  const handleCorporateSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await appClient.entities.CorporateRegistration.create({
      ...corporate,
      batch_id: batchId,
      program_id: batch.program_id,
      program_name: program?.name || batch.program_name,
      batch_name: batch.name,
      status: 'submitted',
      total_amount: (program?.price || 0) * corporate.participant_count,
    });
    setLoading(false);
    setSuccess(true);
    toast({ title: 'Corporate Registration Submitted', description: 'Your registration has been submitted for review.' });
  };

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=/register-program/${batchId}`} replace />;
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-10">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-xl font-bold font-heading mb-2">Inquiry Submitted!</h2>
            <p className="text-sm text-muted-foreground mb-6">This MVP stores your inquiry locally and simulates the next confirmation and payment steps.</p>
            <Link to="/programs">
              <Button className="bg-secondary hover:bg-secondary/90 text-white">Browse More Programs</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <section className="bg-primary text-primary-foreground py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to={`/programs/${batch?.program_id}`} className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground mb-4">
            <ArrowLeft className="w-4 h-4" /> Back to Program
          </Link>
          <h1 className="text-2xl font-bold font-heading">Join {program?.name || batch?.program_name}</h1>
          <p className="text-primary-foreground/70 text-sm mt-1">Batch: {batch?.name}</p>
          {batch?.start_date && (
            <p className="text-primary-foreground/60 text-xs mt-1">
              {format(new Date(batch.start_date), 'MMM d, yyyy')}{batch.end_date && ` - ${format(new Date(batch.end_date), 'MMM d, yyyy')}`}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-6 border-secondary/20">
          <CardContent className="p-5">
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Program</p>
                <p className="font-medium mt-1">{program?.name || batch?.program_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Format</p>
                <p className="font-medium mt-1 capitalize">{program?.delivery_mode || 'Hybrid'}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Fee</p>
                <p className="font-medium mt-1">{program?.price ? `IDR ${program.price.toLocaleString()}` : 'Free'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 w-full">
            <TabsTrigger value="individual" className="flex-1 gap-2"><User className="w-4 h-4" />Individual</TabsTrigger>
            <TabsTrigger value="corporate" className="flex-1 gap-2"><Building2 className="w-4 h-4" />Corporate</TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            <Card>
              <CardHeader><CardTitle>Individual Enrollment Request</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleIndividualSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Full Name *</Label><Input required value={individual.full_name} onChange={e => setIndividual({...individual, full_name: e.target.value})} /></div>
                    <div><Label>Email *</Label><Input type="email" required value={individual.email} onChange={e => setIndividual({...individual, email: e.target.value})} /></div>
                    <div><Label>Phone</Label><Input value={individual.phone} onChange={e => setIndividual({...individual, phone: e.target.value})} /></div>
                    <div><Label>Company</Label><Input value={individual.company} onChange={e => setIndividual({...individual, company: e.target.value})} /></div>
                    <div><Label>Job Title</Label><Input value={individual.job_title} onChange={e => setIndividual({...individual, job_title: e.target.value})} /></div>
                    <div><Label>Industry</Label><Input value={individual.industry} onChange={e => setIndividual({...individual, industry: e.target.value})} /></div>
                  </div>
                  {program?.price > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-bold text-lg ml-2">IDR {program.price.toLocaleString()}</span>
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Enrollment Request
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Your request will be stored as a local MVP inquiry and can be reviewed from the admin side.
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="corporate">
            <Card>
              <CardHeader><CardTitle>Corporate Training Inquiry</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleCorporateSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><Label>Company Name *</Label><Input required value={corporate.company_name} onChange={e => setCorporate({...corporate, company_name: e.target.value})} /></div>
                    <div><Label>PIC Name *</Label><Input required value={corporate.pic_name} onChange={e => setCorporate({...corporate, pic_name: e.target.value})} /></div>
                    <div><Label>PIC Email *</Label><Input type="email" required value={corporate.pic_email} onChange={e => setCorporate({...corporate, pic_email: e.target.value})} /></div>
                    <div><Label>PIC Phone</Label><Input value={corporate.pic_phone} onChange={e => setCorporate({...corporate, pic_phone: e.target.value})} /></div>
                    <div><Label>Number of Participants</Label><Input type="number" min="1" value={corporate.participant_count} onChange={e => setCorporate({...corporate, participant_count: parseInt(e.target.value) || 1})} /></div>
                  </div>
                  {program?.price > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 text-sm">
                      <span className="text-muted-foreground">Estimated Total ({corporate.participant_count} participants):</span>
                      <span className="font-bold text-lg ml-2">IDR {(program.price * corporate.participant_count).toLocaleString()}</span>
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-secondary hover:bg-secondary/90 text-white">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null} Submit Corporate Inquiry
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Corporate submissions are stored locally for preview and can later be converted into participant enrollments.
                  </p>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
