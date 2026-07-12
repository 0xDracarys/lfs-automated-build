'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Clock, BookOpen, Award, MessageSquare, Zap, Lightbulb, 
  HelpCircle, CheckCircle2, Terminal, Code2, Copy, Check, ChevronRight 
} from 'lucide-react';
import { Lesson } from '@/lib/types/learning';

interface EnhancedLessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onQuizStart: () => void;
  onAIChatOpen?: () => void;
}

export default function EnhancedLessonViewer({
  lesson,
  onComplete,
  onQuizStart,
  onAIChatOpen,
}: EnhancedLessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'facts' | 'quiz'>('content');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(text);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    if (!quizSubmitted) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerIndex
      }));
    }
  };

  const calculateQuizScore = () => {
    let correct = 0;
    lesson.quiz.forEach(q => {
      if (selectedAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / lesson.quiz.length) * 100);
  };

  const quizScore = calculateQuizScore();
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="w-full max-w-6xl mx-auto font-sora text-foreground">
      {/* Lesson Hero Card */}
      <div className="mb-8 p-8 bg-black/70 backdrop-blur-xl border border-primary/40 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs uppercase tracking-wider font-semibold mb-3">
              <Terminal className="w-3.5 h-3.5" />
              <span>Interactive LFS Lesson</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 uppercase tracking-tight">{lesson.title}</h1>
            <p className="text-gray-300 text-base sm:text-lg font-light leading-relaxed">{lesson.description}</p>
          </div>
          <button
            onClick={onAIChatOpen}
            className="px-5 py-3 bg-primary/10 border border-primary/30 hover:bg-primary text-primary hover:text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shrink-0"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ask AI Assistant</span>
          </button>
        </div>

        {/* Lesson Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/10">
          <div className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-primary" />
              Duration
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.duration} mins</p>
          </div>
          <div className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-primary" />
              FAQs
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.faqs.length}</p>
          </div>
          <div className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
              <Lightbulb className="w-4 h-4 text-primary" />
              Key Facts
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.funFacts.length}</p>
          </div>
          <div className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl">
            <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-primary" />
              Quiz Questions
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.quiz.length}</p>
          </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(['content', 'faqs', 'facts', 'quiz'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
              activeTab === tab
                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                : 'bg-black/60 border border-white/10 text-gray-300 hover:border-primary/50'
            }`}
          >
            {tab === 'content' && '📖 Lesson Content'}
            {tab === 'faqs' && `❓ FAQs (${lesson.faqs.length})`}
            {tab === 'facts' && `💡 Quick Facts (${lesson.funFacts.length})`}
            {tab === 'quiz' && `🏆 Knowledge Quiz (${lesson.quiz.length})`}
          </button>
        ))}
      </div>

      {/* Main Lesson Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <Card className="bg-black/65 backdrop-blur-xl border-white/10 text-white">
            <CardHeader className="border-b border-white/10 pb-6">
              <CardTitle className="text-2xl font-bold uppercase tracking-tight flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Lesson Walkthrough & Theory
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                {typeof lesson.content === 'string' ? (
                  <p>{lesson.content}</p>
                ) : (
                  lesson.content
                )}
              </div>

              {/* Interactive Code / Command Examples */}
              {lesson.codeExamples && lesson.codeExamples.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-primary" />
                    Interactive Command Reference
                  </h3>
                  {lesson.codeExamples.map((example, idx) => (
                    <div key={idx} className="bg-black/80 rounded-xl border border-white/10 overflow-hidden">
                      <div className="bg-black/60 px-4 py-3 border-b border-white/10 flex items-center justify-between">
                        <span className="font-mono text-xs text-primary font-semibold">{example.title}</span>
                        <button
                          onClick={() => handleCopy(example.code)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-primary/20 text-gray-300 hover:text-primary transition-colors flex items-center gap-1.5 text-xs font-mono"
                        >
                          {copiedCode === example.code ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-primary" />
                              <span className="text-primary">COPIED</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>COPY</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-4 overflow-x-auto font-mono text-xs sm:text-sm text-gray-200">
                        <code>{example.code}</code>
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mark Complete Action */}
          <div className="flex justify-end">
            <button
              onClick={onComplete}
              className="px-8 py-4 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Lesson Complete</span>
            </button>
          </div>
        </div>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-3">
          {lesson.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden hover:border-primary/40 transition-colors"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx.toString() ? null : idx.toString())}
                className="w-full p-5 text-left flex items-start justify-between gap-4 hover:bg-white/5 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-white font-semibold">{faq.question}</span>
                </div>
                <span className="text-primary font-bold">{expandedFAQ === idx.toString() ? '−' : '+'}</span>
              </button>

              {expandedFAQ === idx.toString() && (
                <div className="px-5 pb-5 pt-3 border-t border-white/10 bg-black/40 text-gray-300 text-sm leading-relaxed">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Facts Tab */}
      {activeTab === 'facts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.funFacts.map((fact, idx) => (
            <div key={idx} className="bg-black/65 backdrop-blur-xl border border-white/10 hover:border-primary/40 rounded-xl p-6 transition-all">
              <div className="flex items-start gap-3.5">
                <Lightbulb className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                <p className="text-gray-300 text-sm leading-relaxed">
                  {typeof fact === 'string' ? fact : fact.fact}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-black/65 backdrop-blur-xl border border-primary/30 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-primary font-bold text-sm uppercase tracking-wider">Quiz Progress</p>
              <p className="text-xs text-gray-300 mt-0.5">
                {answeredCount} of {lesson.quiz.length} questions answered
              </p>
            </div>
            {quizSubmitted && (
              <div className="text-3xl font-extrabold text-primary">{quizScore}%</div>
            )}
          </div>

          {lesson.quiz.map((question, qIdx) => {
            const isAnswered = selectedAnswers[question.id] !== undefined;
            const isCorrect = isAnswered && selectedAnswers[question.id] === question.correctAnswer;

            return (
              <div key={qIdx} className="bg-black/65 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    Q{qIdx + 1}
                  </div>
                  <p className="text-white font-bold text-base flex-1">{question.question}</p>
                </div>

                <div className="space-y-2.5 ml-11">
                  {question.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[question.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizAnswer(question.id, optIdx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-primary/20 border-primary text-white font-semibold'
                            : 'bg-black/40 border-white/10 text-gray-300 hover:border-white/30'
                        }`}
                      >
                        <span>{option}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setQuizSubmitted(true)}
              className="px-8 py-3.5 rounded-xl bg-primary text-black font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all"
            >
              Submit Quiz Answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
