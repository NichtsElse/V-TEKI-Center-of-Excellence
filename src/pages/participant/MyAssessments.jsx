/**
 * Purpose: Show assessment submissions and scores for the signed-in participant.
 * Used by: Participant route `/participant/assessments`.
 * Main dependencies: Local app client, React Query, shared status badge, and shadcn cards.
 * Public/main functions: Default `MyAssessments` page export.
 * Important side effects: Reads local assessment result records scoped to the current user.
 */
import React from 'react';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import { FileCheck } from 'lucide-react';
import { getAssessmentLifecycleSummary } from '@/domain/assessments/summary';

export default function MyAssessments() {
  const { user } = useAuth();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['my-assessment-results'],
    queryFn: () => appClient.entities.AssessmentResult.filter({ participant_email: user?.email }),
    enabled: !!user?.email,
  });
  const { data: registrations = [] } = useQuery({
    queryKey: ['my-assessment-registrations'],
    queryFn: () => appClient.entities.Registration.filter({ email: user?.email }),
    enabled: !!user?.email,
  });
  const passedCount = results.filter((result) => result.passed === true).length;
  const averageScore = results.length > 0
    ? Math.round(results.reduce((sum, result) => sum + (result.percentage || 0), 0) / results.length)
    : 0;
  const postAssessmentCompleted = registrations.filter(
    (registration) => getAssessmentLifecycleSummary(registration).postAssessmentCompleted,
  ).length;

  return (
    <div>
      <PageHeader title="My Assessments" subtitle={`${results.length} submissions`} />

      {!isLoading && results.length > 0 && (
        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Submissions</p>
            <p className="mt-2 text-2xl font-bold font-heading">{results.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Passed</p>
            <p className="mt-2 text-2xl font-bold font-heading">{passedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Average Score</p>
            <p className="mt-2 text-2xl font-bold font-heading">{averageScore}%</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Post-Assessments Done</p>
            <p className="mt-2 text-2xl font-bold font-heading">{postAssessmentCompleted}</p>
          </div>
        </div>
      )}

      {!isLoading && registrations.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Certificate readiness depends on post-assessment completion. Keep your post-assessment submitted and reviewed before final certificate release.
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-20 bg-muted rounded-xl" />)}
        </div>
      ) : results.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No assessments</h3>
            <p className="text-sm text-muted-foreground">You haven't completed any assessments yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {results.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold">{r.title || 'Assessment Result'}</h4>
                  <div className="flex gap-2 mt-1">
                    <StatusBadge status={r.status} />
                    {r.passed !== undefined && <StatusBadge status={r.passed ? 'passed' : 'failed'} />}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold font-heading">{r.percentage != null ? `${r.percentage}%` : '-'}</p>
                  <p className="text-[10px] text-muted-foreground">{r.score}/{r.total_points} points</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
