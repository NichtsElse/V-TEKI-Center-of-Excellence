/**
 * Purpose: Show enrolled programs and progress details for the signed-in participant.
 * Used by: Participant route `/participant/programs`.
 * Main dependencies: Local app client, React Query, shared status badge, and progress components.
 * Public/main functions: Default `MyPrograms` page export.
 * Important side effects: Reads local enrollment records scoped to the current user.
 */
import React from 'react';
import { appClient } from '@/api/appClient';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatusBadge from '@/components/shared/StatusBadge';
import PageHeader from '@/components/shared/PageHeader';
import { BookOpen } from 'lucide-react';
import { getCertificateEligibilityChecklist } from '@/domain/certificates/eligibility';
import { getAssessmentLifecycleSummary } from '@/domain/assessments/summary';

export default function MyPrograms() {
  const { user } = useAuth();

  const { data: registrations = [], isLoading } = useQuery({
    queryKey: ['my-registrations'],
    queryFn: () => appClient.entities.Registration.filter({ email: user?.email }),
    enabled: !!user?.email,
  });
  const inProgressCount = registrations.filter((registration) => registration.completion_status === 'in_progress').length;
  const completedCount = registrations.filter((registration) => registration.completion_status === 'completed').length;
  const certificateReadyCount = registrations.filter((registration) => appClient.isCertificateEligible(registration)).length;
  const feedbackSubmittedCount = registrations.filter(
    (registration) => registration.feedback_submitted || registration.feedback_status === 'submitted',
  ).length;
  const attendanceVisibleCount = registrations.filter((registration) => (registration.attendance_percentage || 0) > 0).length;
  const averageAttendance = registrations.length > 0
    ? Math.round(registrations.reduce((sum, registration) => sum + (registration.attendance_percentage || 0), 0) / registrations.length)
    : 0;

  return (
    <div>
      <PageHeader title="My Programs" subtitle={`${registrations.length} enrollments`} />

      {!isLoading && registrations.length > 0 && (
        <div className="grid sm:grid-cols-5 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">In Progress</p>
            <p className="mt-2 text-2xl font-bold font-heading">{inProgressCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Completed</p>
            <p className="mt-2 text-2xl font-bold font-heading">{completedCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Attendance</p>
            <p className="mt-2 text-2xl font-bold font-heading">{averageAttendance}%</p>
            <p className="text-[10px] text-muted-foreground mt-1">{attendanceVisibleCount} enrollments show attendance</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Certificate Ready</p>
            <p className="mt-2 text-2xl font-bold font-heading">{certificateReadyCount}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Feedback Sent</p>
            <p className="mt-2 text-2xl font-bold font-heading">{feedbackSubmittedCount}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
        </div>
      ) : registrations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="font-semibold mb-1">No enrollments</h3>
            <p className="text-sm text-muted-foreground">You haven't enrolled in any programs yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {registrations.map(reg => (
            <Card key={reg.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold font-heading">{reg.program_name || 'Program'}</h3>
                    <p className="text-sm text-muted-foreground">{reg.batch_name}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <StatusBadge status={reg.status} />
                      <StatusBadge status={reg.completion_status} />
                      <StatusBadge status={reg.feedback_status || (reg.feedback_submitted ? 'submitted' : 'pending')} />
                      <StatusBadge status={appClient.isCertificateEligible(reg) ? 'eligible' : 'pending'} />
                    </div>
                  </div>
                  <div className="sm:text-right space-y-2">
                    <div className="w-32">
                      <p className="text-[10px] text-muted-foreground">
                        Attendance: {reg.attendance_percentage || 0}%
                      </p>
                      <Progress value={reg.attendance_percentage || 0} className="h-1.5" />
                    </div>
                    {reg.post_assessment_score != null && (
                      <p className="text-xs text-muted-foreground">Score: <span className="font-medium text-foreground">{reg.post_assessment_score}%</span></p>
                    )}
                    <p className="text-[11px] text-muted-foreground">
                      Assessments: {getAssessmentLifecycleSummary(reg).preAssessmentCompleted ? 'pre done' : 'pre pending'} / {getAssessmentLifecycleSummary(reg).postAssessmentCompleted ? 'post done' : 'post pending'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Feedback: {reg.feedback_submitted || reg.feedback_status === 'submitted' ? 'Submitted' : 'Pending'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Certificate: {appClient.isCertificateEligible(reg) ? 'Ready for issuance' : 'Waiting for remaining requirements'}
                    </p>
                    {!appClient.isCertificateEligible(reg) && (
                      <p className="text-[11px] text-muted-foreground">
                        Missing: {Object.entries(getCertificateEligibilityChecklist(reg))
                          .filter(([, value]) => !value)
                          .map(([key]) => {
                            if (key === 'paymentPaid') return 'payment';
                            if (key === 'attendanceReached') return 'attendance';
                            if (key === 'postAssessmentCompleted') return 'post-assessment';
                            if (key === 'feedbackSubmitted') return 'feedback';
                            if (key === 'completionDone') return 'completion';
                            return key;
                          })
                          .join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
