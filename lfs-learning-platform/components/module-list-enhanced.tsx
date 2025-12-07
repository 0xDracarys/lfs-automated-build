'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BookOpen,
  ArrowRight,
  HelpCircle,
  Lightbulb,
  Award,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Module, UserProgress } from '@/lib/types/learning';

interface EnhancedModuleListProps {
  modules: Module[];
  userProgress?: UserProgress[];
}

export default function EnhancedModuleList({
  modules,
  userProgress = [],
}: EnhancedModuleListProps) {
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.completionPercentage || 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-900/30 text-green-300 border border-green-700';
      case 'intermediate':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-700';
      case 'advanced':
        return 'bg-red-900/30 text-red-300 border border-red-700';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Linux Learning Path
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Master Linux File System, kernel compilation, and essential commands through interactive lessons with AI assistance
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Modules</p>
              <p className="text-3xl font-bold text-white mt-1">{modules.length}</p>
            </div>
            <BookOpen className="w-8 h-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Lessons</p>
              <p className="text-3xl font-bold text-white mt-1">
                {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
              </p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">FAQs & Facts</p>
              <p className="text-3xl font-bold text-white mt-1">
                {modules.reduce(
                  (sum, m) =>
                    sum +
                    m.lessons.reduce(
                      (lsum, l) =>
                        lsum +
                        l.faqs.length +
                        l.interestingFacts.length +
                        l.funFacts.length,
                      0
                    ),
                  0
                )}
              </p>
            </div>
            <Lightbulb className="w-8 h-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Quiz Questions</p>
              <p className="text-3xl font-bold text-white mt-1">
                {modules.reduce(
                  (sum, m) =>
                    sum + m.lessons.reduce((lsum, l) => lsum + l.quiz.length, 0),
                  0
                )}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="space-y-4">
        {modules.map((module, idx) => {
          const progress = getModuleProgress(module.id);
          const isCompleted = progress === 100;
          const isExpanded = expandedModule === module.id;

          return (
            <div key={module.id}>
              <button
                onClick={() =>
                  setExpandedModule(isExpanded ? null : module.id)
                }
                className="w-full text-left"
              >
                <Card className="bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 font-bold">
                            {idx + 1}
                          </div>
                          <CardTitle className="text-2xl text-white">
                            {module.title}
                          </CardTitle>
                          {isCompleted && (
                            <Badge className="bg-green-600 text-white">
                              Completed
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400 mb-4">{module.description}</p>

                        {/* Module Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                            <span className="text-slate-300">
                              {module.lessons.length} lessons
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <HelpCircle className="w-4 h-4 text-purple-400" />
                            <span className="text-slate-300">
                              {module.lessons.reduce(
                                (sum, l) => sum + l.faqs.length,
                                0
                              )}{' '}
                              FAQs
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Lightbulb className="w-4 h-4 text-yellow-400" />
                            <span className="text-slate-300">
                              {module.lessons.reduce(
                                (sum, l) =>
                                  sum +
                                  l.funFacts.length +
                                  l.interestingFacts.length,
                                0
                              )}{' '}
                              facts
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="w-4 h-4 text-green-400" />
                            <span className="text-slate-300">
                              {module.lessons.reduce(
                                (sum, l) => sum + l.quiz.length,
                                0
                              )}{' '}
                              quizzes
                            </span>
                          </div>
                          <Badge className={getDifficultyColor(module.difficulty)}>
                            {module.difficulty}
                          </Badge>
                        </div>

                        {/* Progress Bar */}
                        <div className="flex items-center gap-3">
                          <Progress value={progress} className="flex-1" />
                          <span className="text-xs text-slate-400 font-medium">
                            {progress}%
                          </span>
                        </div>
                      </div>

                      <ChevronRight
                        className={`w-6 h-6 text-slate-400 transition-transform flex-shrink-0 ${
                          isExpanded ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </CardHeader>
                </Card>
              </button>

              {/* Expanded Lessons View */}
              {isExpanded && (
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-blue-600 pl-4">
                  {module.lessons.map((lesson, lIdx) => (
                    <Link
                      key={lesson.id}
                      href={`/learn/${module.id}/${lesson.id}`}
                    >
                      <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-blue-500 hover:bg-slate-800 transition-all group cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-700 text-slate-300 text-sm font-semibold">
                              {lIdx + 1}
                            </div>
                            <div>
                              <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-slate-400">
                                {lesson.duration} min
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>

                        {/* Lesson Content Preview */}
                        <div className="grid grid-cols-4 gap-2 text-xs text-slate-400">
                          <div>
                            <span className="text-slate-500">FAQs:</span>{' '}
                            {lesson.faqs.length}
                          </div>
                          <div>
                            <span className="text-slate-500">Facts:</span>{' '}
                            {lesson.funFacts.length + lesson.interestingFacts.length}
                          </div>
                          <div>
                            <span className="text-slate-500">Quiz:</span>{' '}
                            {lesson.quiz.length}
                          </div>
                          <div>
                            <span className="text-slate-500">Code:</span>{' '}
                            {lesson.codeExamples?.length || 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
