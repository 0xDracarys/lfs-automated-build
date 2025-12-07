'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, BookOpen, Award } from 'lucide-react';
import { Lesson, FAQ, InterestingFact, FunFact, QuizQuestion } from '@/lib/types/learning';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onQuizStart: () => void;
}

export default function LessonViewer({ lesson, onComplete, onQuizStart }: LessonViewerProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'faqs' | 'facts' | 'quiz'>('content');
  const [completedQuestions, setCompletedQuestions] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: number }>({});

  const handleQuizAnswer = (questionId: string, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
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

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Lesson Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-slate-700">
        <h1 className="text-3xl font-bold text-white mb-2">{lesson.title}</h1>
        <p className="text-slate-300 mb-4">{lesson.description}</p>
        
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-5 h-5" />
            <span>{lesson.duration} minutes</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <BookOpen className="w-5 h-5" />
            <span>{lesson.quiz.length} questions</span>
          </div>
          <Badge variant="secondary">{lesson.moduleId}</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        {(['content', 'faqs', 'facts', 'quiz'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <Card className="bg-slate-900 border-slate-700 mb-6">
          <CardContent className="pt-6">
            <div 
              className="prose prose-invert max-w-none text-slate-300"
              dangerouslySetInnerHTML={{ __html: lesson.content }}
            />
            
            {lesson.codeExamples && lesson.codeExamples.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-bold text-white mb-4">Code Examples</h3>
                {lesson.codeExamples.map((example) => (
                  <Card key={example.id} className="bg-slate-800 border-slate-700 mb-4">
                    <CardHeader>
                      <CardTitle className="text-base">{example.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="bg-slate-950 p-4 rounded-lg overflow-x-auto mb-3">
                        <code className="text-green-400 font-mono text-sm">{example.code}</code>
                      </pre>
                      <p className="text-slate-300">{example.explanation}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            <button
              onClick={onComplete}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Mark as Complete
            </button>
          </CardContent>
        </Card>
      )}

      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4 mb-6">
          {lesson.faqs.map((faq) => (
            <Card key={faq.id} className="bg-slate-900 border-slate-700">
              <CardHeader className="cursor-pointer hover:bg-slate-800 transition-colors">
                <CardTitle className="text-base text-white">{faq.question}</CardTitle>
                <Badge className="w-fit" variant="outline">{faq.category}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Interesting Facts Tab */}
      {activeTab === 'facts' && (
        <div className="grid gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Interesting Facts</h3>
            {lesson.interestingFacts.map((fact) => (
              <Card key={fact.id} className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-4">
                <CardHeader>
                  <CardTitle className="text-base text-blue-400">{fact.title}</CardTitle>
                  <Badge variant="secondary">{fact.category}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">{fact.description}</p>
                  {fact.source && <p className="text-sm text-slate-400 mt-2">Source: {fact.source}</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4">Fun Facts</h3>
            {lesson.funFacts.map((fact) => (
              <Card key={fact.id} className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 mb-4">
                <CardContent className="pt-6">
                  <p className="text-slate-300 text-lg mb-2">{fact.fact}</p>
                  <Badge 
                    variant="outline"
                    className={fact.difficulty === 'easy' ? 'bg-green-900' : fact.difficulty === 'medium' ? 'bg-yellow-900' : 'bg-red-900'}
                  >
                    Difficulty: {fact.difficulty}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quiz Tab */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 mb-6">
          {lesson.quiz.map((question, idx) => (
            <Card key={question.id} className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-base">
                  Question {idx + 1}: {question.question}
                </CardTitle>
                <Badge 
                  variant="outline"
                  className={question.difficulty === 'easy' ? 'bg-green-900' : question.difficulty === 'medium' ? 'bg-yellow-900' : 'bg-red-900'}
                >
                  {question.difficulty}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {question.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuizAnswer(question.id, idx)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        selectedAnswers[question.id] === idx
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}) {option}
                    </button>
                  ))}
                </div>
                
                {selectedAnswers[question.id] !== undefined && (
                  <div className={`mt-4 p-3 rounded-lg ${
                    selectedAnswers[question.id] === question.correctAnswer
                      ? 'bg-green-900 text-green-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    <p className="font-semibold mb-1">
                      {selectedAnswers[question.id] === question.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    <p className="text-sm">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {Object.keys(selectedAnswers).length === lesson.quiz.length && (
            <Card className="bg-gradient-to-r from-blue-900 to-slate-900 border-blue-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-yellow-400" />
                  Quiz Complete!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white mb-4">
                  Score: {calculateQuizScore()}%
                </p>
                <button
                  onClick={() => {
                    onQuizStart();
                    onComplete();
                  }}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Finish and Continue
                </button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
