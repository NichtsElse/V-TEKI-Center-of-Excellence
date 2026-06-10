/**
 * Purpose: Allow participants to take and submit assessments.
 * Used by: Participant route `/participant/assessments/:assessmentId/take`.
 * Main dependencies: appClient, React Query, form components.
 * Public/main functions: Default `AssessmentTake` page export.
 * Important side effects: Creates assessment submission records.
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { appClient } from '@/api/appClient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function AssessmentTake() {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  // Get assessment
  const { data: assessment, isLoading } = useQuery({
    queryKey: ['assessment', assessmentId],
    queryFn: async () => {
      const assessments = await appClient.entities.Assessment.list();
      return assessments.find(a => a.id === assessmentId);
    },
  });

  // Get registrations to find current enrollment
  const { data: registrations = [] } = useQuery({
    queryKey: ['registrations'],
    queryFn: () => appClient.entities.Registration.list(),
  });

  // Get program for context
  const { data: program } = useQuery({
    queryKey: ['program', assessment?.program_id],
    queryFn: async () => {
      if (!assessment?.program_id) return null;
      const programs = await appClient.entities.Program.list();
      return programs.find(p => p.id === assessment.program_id);
    },
    enabled: !!assessment?.program_id,
  });

  // Get current registration (enrollment)
  const currentRegistration = registrations.find(
    r => r.email === user?.email && r.program_id === assessment?.program_id
  );

  // Mock questions for demo (in real app, would come from database)
  const mockQuestions = [
    {
      id: 'q1',
      question: 'What is the primary benefit of the topics covered in this program?',
      type: 'multiple_choice',
      options: [
        { id: 'opt1', text: 'Theoretical knowledge only' },
        { id: 'opt2', text: 'Practical application and real-world workflow improvement' },
        { id: 'opt3', text: 'Certification without learning' },
        { id: 'opt4', text: 'Social networking only' },
      ],
      correctAnswer: 'opt2',
    },
    {
      id: 'q2',
      question: 'Which of the following best describes the core learning objective?',
      type: 'multiple_choice',
      options: [
        { id: 'opt1', text: 'Random fact memorization' },
        { id: 'opt2', text: 'Structured skill development and mastery' },
        { id: 'opt3', text: 'Entertainment value only' },
        { id: 'opt4', text: 'Corporate espionage techniques' },
      ],
      correctAnswer: 'opt2',
    },
    {
      id: 'q3',
      question: 'How would you apply what you learned to your role?',
      type: 'multiple_choice',
      options: [
        { id: 'opt1', text: 'Ignore it completely' },
        { id: 'opt2', text: 'Integrate into workflows and share with team' },
        { id: 'opt3', text: 'Keep it secret' },
        { id: 'opt4', text: 'Use only on Mondays' },
      ],
      correctAnswer: 'opt2',
    },
    {
      id: 'q4',
      question: 'What is the expected outcome of successful completion?',
      type: 'multiple_choice',
      options: [
        { id: 'opt1', text: 'Nothing - just attendance' },
        { id: 'opt2', text: 'Competency development and readiness to execute' },
        { id: 'opt3', text: 'Certificate printing only' },
        { id: 'opt4', text: 'Free refreshments only' },
      ],
      correctAnswer: 'opt2',
    },
    {
      id: 'q5',
      question: 'How would you measure success after this program?',
      type: 'multiple_choice',
      options: [
        { id: 'opt1', text: 'By the certificate on the wall' },
        { id: 'opt2', text: 'By tangible improvements in work processes' },
        { id: 'opt3', text: 'By attendance only' },
        { id: 'opt4', text: 'Success is not measurable' },
      ],
      correctAnswer: 'opt2',
    },
  ];

  const questions = mockQuestions;

  const submitAssessmentMutation = useMutation({
    mutationFn: async () => {
      if (!currentRegistration) {
        throw new Error('No active enrollment found');
      }

      // Calculate score
      let correctCount = 0;
      const answerDetails = [];
      questions.forEach(q => {
        const userAnswer = answers[q.id];
        const isCorrect = userAnswer === q.correctAnswer;
        if (isCorrect) correctCount++;
        
        answerDetails.push({
          question: q.question,
          answer: questions.find(qq => qq.id === q.id)?.options.find(o => o.id === userAnswer)?.text || 'Not answered',
          is_correct: isCorrect,
          points_earned: isCorrect ? 20 : 0,
        });
      });

      const percentage = Math.round((correctCount / questions.length) * 100);
      const passed = percentage >= (assessment?.passing_score || 70);

      // Create assessment result
      const result = await appClient.entities.AssessmentResult.create({
        assessment_id: assessmentId,
        registration_id: currentRegistration.id,
        participant_email: user?.email,
        title: assessment?.title || 'Assessment',
        score: correctCount,
        total_points: questions.length,
        percentage,
        passed,
        status: 'submitted',
        submission_date: new Date().toISOString(),
        answers: answerDetails,
      });

      // Update registration status
      if (assessment?.assessment_type === 'pre_assessment') {
        await appClient.entities.Registration.update(currentRegistration.id, {
          pre_assessment_status: 'completed',
        });
      } else if (assessment?.assessment_type === 'post_assessment') {
        await appClient.entities.Registration.update(currentRegistration.id, {
          post_assessment_status: 'completed',
          post_assessment_score: percentage,
        });
      }

      return result;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assessment-results'] });
      qc.invalidateQueries({ queryKey: ['registrations'] });
      qc.invalidateQueries({ queryKey: ['my-assessments'] });
      toast({ title: 'Assessment submitted successfully!' });
      setTimeout(() => navigate('/participant/assessments'), 1500);
    },
    onError: (error) => {
      toast({ title: 'Failed to submit assessment', description: error.message, variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment || !currentRegistration) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Assessment not found or you're not enrolled in this program.</p>
        <Button onClick={() => navigate('/participant/assessments')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assessments
        </Button>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const selectedAnswer = answers[question.id];
  const isAnswered = selectedAnswer !== undefined;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="mb-4"
            onClick={() => navigate('/participant/assessments')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div>
            <p className="text-sm text-muted-foreground">{program?.name}</p>
            <h1 className="text-3xl font-bold font-heading mt-1">{assessment.title}</h1>
            <p className="text-sm text-muted-foreground mt-2">{assessment.description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 bg-card rounded-xl border border-border p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm font-medium">
              Question {currentQuestion + 1} of {questions.length}
            </p>
            <p className="text-sm text-muted-foreground">
              {answeredCount} answered
            </p>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="bg-card rounded-xl border border-border p-8 mb-8">
          <h2 className="text-xl font-semibold mb-8">{question.question}</h2>

          <RadioGroup value={selectedAnswer || ''} onValueChange={(value) => setAnswers({ ...answers, [question.id]: value })}>
            <div className="space-y-4">
              {question.options.map((option) => (
                <div key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted cursor-pointer transition">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                    {option.text}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Navigation */}
        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            disabled={currentQuestion === 0}
            onClick={() => setCurrentQuestion(prev => prev - 1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestion === questions.length - 1 ? (
            <Button
              className="bg-secondary hover:bg-secondary/90 text-white"
              disabled={!allAnswered || submitAssessmentMutation.isPending}
              onClick={() => setSubmitDialogOpen(true)}
            >
              {submitAssessmentMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Assessment
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              disabled={!isAnswered}
            >
              Next
              <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
            </Button>
          )}
        </div>

        {/* Submit Dialog */}
        <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Submit Assessment?</AlertDialogTitle>
              <AlertDialogDescription>
                You have answered all {questions.length} questions. Once submitted, you cannot make changes. Your score will be calculated automatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2 text-sm">
              <p>Passing Score: <span className="font-semibold">{assessment.passing_score}%</span></p>
              <p>Total Questions: <span className="font-semibold">{questions.length}</span></p>
            </div>
            <div className="flex justify-end gap-3">
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-secondary hover:bg-secondary/90"
                onClick={() => {
                  submitAssessmentMutation.mutate();
                  setSubmitDialogOpen(false);
                }}
              >
                Submit
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
