'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ArrowRight, Lock } from 'lucide-react';
import { Module, UserProgress } from '@/lib/types/learning';

interface ModuleListProps {
  modules: Module[];
  userProgress?: UserProgress[];
}

export default function   ModuleList({ modules, userProgress = [] }: ModuleListProps) {
  const getModuleProgress = (moduleId: string) => {
    const progress = userProgress.find(p => p.moduleId === moduleId);
    return progress?.completionPercentage || 0;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-900 text-green-200';
      case 'intermediate':
        return 'bg-yellow-900 text-yellow-200';
      case 'advanced':
        return 'bg-red-900 text-red-200';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Learning Modules</h1>
        <p className="text-slate-300">Master Linux File System and kernel concepts through interactive lessons</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {modules.map((module) => {
          const progress = getModuleProgress(module.id);
          const isCompleted = progress === 100;

          return (
            <Card 
              key={module.id} 
              className="bg-slate-900 border-slate-700 hover:border-blue-600 transition-all hover:shadow-lg hover:shadow-blue-500/20"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <CardTitle className="text-2xl text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-blue-400" />
                      {module.title}
                    </CardTitle>
                    <CardDescription className="text-slate-400">{module.description}</CardDescription>
                  </div>
                  <Badge className={getDifficultyColor(module.difficulty)}>
                    {module.difficulty}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Module Info */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate-800 rounded-lg">
                  <div>
                    <p className="text-slate-400 text-sm">Lessons</p>
                    <p className="text-white font-bold text-lg">{module.lessons.length}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Duration</p>
                    <p className="text-white font-bold text-lg">
                      {module.lessons.reduce((sum, l) => sum + l.duration, 0)} min
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Quizzes</p>
                    <p className="text-white font-bold text-lg">
                      {module.lessons.reduce((sum, l) => sum + l.quiz.length, 0)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-slate-300 font-semibold">Progress</p>
                    <span className="text-blue-400 font-bold">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2 bg-slate-700" />
                </div>

                {/* Lessons Preview */}
                <div className="mb-6">
                  <p className="text-slate-300 font-semibold mb-3">Lessons</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {module.lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id} 
                        className="flex items-center gap-2 text-sm p-2 bg-slate-800 rounded hover:bg-slate-700 transition-colors"
                      >
                        <span className="text-blue-400 font-bold w-6">{idx + 1}.</span>
                        <span className="text-slate-300 flex-1">{lesson.title}</span>
                        <span className="text-slate-500">{lesson.duration}m</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {module.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-slate-800 text-slate-300 border-slate-600">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                <Link
                  href={`/learn/${module.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                >
                  {isCompleted ? '✓ Review Module' : 'Start Learning'}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {modules.length === 0 && (
        <Card className="bg-slate-900 border-slate-700 text-center py-12">
          <BookOpen className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">No modules available yet</p>
        </Card>
      )}
    </div>
  );
}
