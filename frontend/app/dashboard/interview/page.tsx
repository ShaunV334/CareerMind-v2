"use client";

import { useState, useEffect } from "react";
import { useInterview } from "@/hooks/useInterview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function InterviewPage() {
  const { fetchQuestions, fetchQuestion, submitAnswer, loading, error } =
    useInterview();
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [category, setCategory] = useState("Behavioral");

  const categories = ["Behavioral", "Technical", "System Design"];

  useEffect(() => {
    loadQuestions();
  }, [category]);

  async function loadQuestions() {
    try {
      const data = await fetchQuestions({ category });
      setQuestions(data.questions || []);
      setFeedback(null);
      setAnswer("");
    } catch (err) {
      console.error("Failed to load questions", err);
    }
  }

  async function selectQuestion(q: any) {
    try {
      const full = await fetchQuestion(q.id);
      setSelectedQuestion(full);
      setAnswer("");
      setFeedback(null);
      setStartTime(Date.now());
    } catch (err) {
      console.error("Failed to load question", err);
    }
  }

  async function handleSubmitAnswer() {
    if (!selectedQuestion || !answer.trim()) return;

    setSubmitting(true);
    try {
      const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      const result = await submitAnswer(selectedQuestion.id, answer, timeSpent);
      setFeedback(result.feedback);
    } catch (err) {
      console.error("Failed to submit answer", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (selectedQuestion && feedback) {
    const scorePercentage = (feedback.score / 100) * 100;
    
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>

        <div className="space-y-6">
          {/* Question Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedQuestion.question}</CardTitle>
              <CardDescription className="flex gap-2 flex-wrap pt-2">
                <Badge variant="outline">{selectedQuestion.category}</Badge>
                <Badge variant="secondary">{selectedQuestion.difficulty}</Badge>
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Your Answer Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Answer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {answer}
              </p>
            </CardContent>
          </Card>

          {/* AI Feedback Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Feedback & Evaluation
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Section */}
              <div className="space-y-3">
                <div className="flex items-end justify-between">
                  <p className="text-sm font-semibold text-muted-foreground">Overall Score</p>
                  <p className="text-3xl font-bold text-blue-600">{feedback.score}/100</p>
                </div>
                <Progress value={scorePercentage} className="h-2" />
              </div>

              <Separator />

              {/* Strengths */}
              <div className="space-y-3">
                <h4 className="font-semibold text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Strengths
                </h4>
                <ul className="space-y-2 ml-6">
                  {feedback.strengths?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-foreground">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Areas for Improvement */}
              <div className="space-y-3">
                <h4 className="font-semibold text-amber-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2 ml-6">
                  {feedback.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-foreground">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              <Separator />

              {/* Detailed Feedback */}
              <div className="space-y-2">
                <h4 className="font-semibold">Detailed Feedback</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feedback.feedback}
                </p>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  💡 Suggestions
                </h4>
                <ul className="space-y-2 ml-6">
                  {feedback.suggestions?.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-foreground">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords */}
              {feedback.keywordsCovered?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Keywords Mentioned</h4>
                  <div className="flex flex-wrap gap-2">
                    {feedback.keywordsCovered.map((k: string, i: number) => (
                      <Badge key={i} variant="secondary">
                        {k}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={() => setSelectedQuestion(null)}
            className="w-full"
            size="lg"
          >
            Try Another Question
          </Button>
        </div>
      </div>
    );
  }

  if (selectedQuestion) {
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
    
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={() => setSelectedQuestion(null)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Questions
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{selectedQuestion.question}</CardTitle>
            <CardDescription className="flex gap-2 flex-wrap pt-2">
              <Badge variant="outline">{selectedQuestion.category}</Badge>
              <Badge variant="secondary">{selectedQuestion.difficulty}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-3">Your Answer</label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here. Take your time to provide a comprehensive response..."
                className="w-full min-h-64 p-3 border rounded-md border-input bg-background dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:focus:ring-offset-slate-950 resize-none"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-muted-foreground">
                  ⏱️ Time spent: <span className="font-semibold">{timeSpent}s</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {answer.length} characters
                </p>
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleSubmitAnswer}
              disabled={!answer.trim() || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Evaluating...
                </>
              ) : (
                "Submit Answer"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Interview Preparation</h1>
        <p className="text-lg text-muted-foreground">
          Practice interview questions with AI-powered feedback
        </p>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Questions Grid */}
        {categories.map((cat) => (
          <TabsContent key={cat} value={cat} className="space-y-4">
            {loading ? (
              <Card className="flex items-center justify-center py-12">
                <CardContent className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading questions...</p>
                </CardContent>
              </Card>
            ) : questions.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No questions available in this category yet. Check back soon!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-3">
                {questions.map((question) => (
                  <Card
                    key={question.id}
                    className="cursor-pointer hover:shadow-md transition-all hover:border-primary"
                    onClick={() => selectQuestion(question)}
                  >
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-base leading-relaxed line-clamp-2 hover:text-primary transition-colors">
                          {question.question}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{question.type}</Badge>
                          <Badge variant="outline">{question.difficulty}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
