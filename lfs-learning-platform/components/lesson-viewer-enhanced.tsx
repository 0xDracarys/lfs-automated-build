'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Award, MessageSquare, Zap, Lightbulb, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Lesson, FAQ, InterestingFact, FunFact, QuizQuestion } from '@/lib/types/learning';

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
    <div className="w-full max-w-6xl mx-auto">
      {/* Lesson Header - Enhanced */}
      <div className="mb-8 p-8 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl text-white shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
            <p className="text-blue-50 text-lg">{lesson.description}</p>
          </div>
          <button
            onClick={onAIChatOpen}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center gap-2 text-white transition-all"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Ask AI</span>
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Clock className="w-4 h-4" />
              Duration
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.duration}m</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.faqs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Lightbulb className="w-4 h-4" />
              Fun Facts
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.funFacts.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-100 text-sm">
              <Award className="w-4 h-4" />
              Quiz
            </div>
            <p className="text-2xl font-bold text-white mt-1">{lesson.quiz.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['content', 'faqs', 'facts', 'quiz'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {tab === 'content' && 'Content'}
            {tab === 'faqs' && `FAQs (${lesson.faqs.length})`}
            {tab === 'facts' && `Fun Facts (${lesson.funFacts.length})`}
            {tab === 'quiz' && `Quiz (${lesson.quiz.length})`}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none">
                <div 
                  className="space-y-6 text-slate-200 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />

                {/* Code Examples */}
                {lesson.codeExamples && lesson.codeExamples.length > 0 && (
                  <div className="mt-8 space-y-6">
                    <h2 className="text-2xl font-bold text-white mt-8">Code Examples</h2>
                    {lesson.codeExamples.map((example, idx) => (
                      <div key={idx} className="bg-slate-900 rounded-lg border border-slate-600 overflow-hidden">
                        <div className="bg-slate-950 px-4 py-3 border-b border-slate-600">
                          <h4 className="font-mono text-sm text-green-400">{example.title}</h4>
                        </div>
                        <pre className="p-4 overflow-x-auto">
                          <code className="text-sm text-green-300">{example.code}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQs Tab - Interactive Q&A Format */}
      {activeTab === 'faqs' && (
        <div className="space-y-3">
          <div className="text-sm text-slate-400 mb-4">
            {lesson.faqs.length} frequently asked questions
          </div>
          {lesson.faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
            >
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === idx.toString() ? null : idx.toString())}
                className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1">
                  <HelpCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{faq.question}</span>
                </div>
                <span className="text-slate-400">{expandedFAQ === idx.toString() ? '−' : '+'}</span>
              </button>
              
              {expandedFAQ === idx.toString() && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-700 bg-slate-900/50">
                  <div className="text-slate-200 leading-relaxed ml-8">{faq.answer}</div>
                  <button
                    onClick={onAIChatOpen}
                    className="mt-3 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Ask AI more about this
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fun Facts Tab */}
      {activeTab === 'facts' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lesson.funFacts.map((fact, idx) => (
            <Card key={idx} className="bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-slate-200 leading-relaxed">{typeof fact === 'string' ? fact : fact.fact}</p>
                    <button
                      onClick={onAIChatOpen}
                      className="mt-3 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Learn more
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quiz Tab - Interactive Q&A Format */}
      {activeTab === 'quiz' && (
        <div className="space-y-6">
          <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-blue-200 font-medium">Question Progress</p>
              <p className="text-sm text-blue-300">{answeredCount} of {lesson.quiz.length} answered</p>
            </div>
            <div className="text-right">
              {quizSubmitted && (
                <div className="text-2xl font-bold text-blue-400">{quizScore}%</div>
              )}
            </div>
          </div>

          {lesson.quiz.map((question, qIdx) => {
            const isAnswered = selectedAnswers[question.id] !== undefined;
            const isCorrect = isAnswered && selectedAnswers[question.id] === question.correctAnswer;

            return (
              <Card key={qIdx} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 font-semibold flex-shrink-0">
                      Q{qIdx + 1}
                    </div>
                    <p className="text-white font-medium flex-1">{question.question}</p>
                  </div>

                  <div className="space-y-2 ml-11">
                    {question.options.map((option, optIdx) => {
                      const isSelected = selectedAnswers[question.id] === optIdx;
                      const showCorrect = quizSubmitted && optIdx === question.correctAnswer;
                      const showIncorrect = quizSubmitted && isSelected && !isCorrect;

                      return (
                        <button
                          key={optIdx}
                          onClick={() => handleQuizAnswer(question.id, optIdx)}
                          disabled={quizSubmitted}
                          className={`w-full p-3 rounded-lg text-left transition-all flex items-center gap-3 ${
                            showCorrect
                              ? 'bg-green-900/50 border border-green-600 text-green-200'
                              : showIncorrect
                              ? 'bg-red-900/50 border border-red-600 text-red-200'
                              : isSelected
                              ? 'bg-blue-600 border border-blue-500 text-white'
                              : 'bg-slate-700 border border-slate-600 text-slate-200 hover:bg-slate-600'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? 'border-current bg-current' : 'border-current'
                            }`}
                          >
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-inherit" />}
                          </div>
                          <span>{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {quizSubmitted && isAnswered && (
                    <div className="mt-3 ml-11 text-sm">
                      {isCorrect ? (
                        <p className="text-green-300">✓ Correct!</p>
                      ) : (
                        <div>
                          <p className="text-red-300">✗ Incorrect</p>
                          <p className="text-slate-400 mt-1">Correct answer: {question.options[question.correctAnswer]}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="flex gap-3">
            {!quizSubmitted ? (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={answeredCount === 0}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Submit Quiz ({answeredCount}/{lesson.quiz.length})
              </button>
            ) : (
              <div className="flex-1 grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Retake
                </button>
                <button
                  onClick={onComplete}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
