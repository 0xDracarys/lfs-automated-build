'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import EnhancedLessonViewer from '@/components/lesson-viewer-enhanced';
import AIChat from '@/components/ai-chat';
import { Module, Lesson } from '@/lib/types/learning';
import { ALL_MODULES } from '@/lib/data/modules';
import { saveUserProgress, recordAPIUsage } from '@/lib/services/firestore-service';
import { ChevronLeft } from 'lucide-react';

export default function LessonPage() {
  const params = useParams();
  const moduleId = params?.moduleId as string;
  const lessonId = params?.lessonId as string;
  
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [module, setModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get user ID from localStorage or auth
    const userId = localStorage.getItem('userId') || `user-${Date.now()}`;
    setUserId(userId);

    // Find module and lesson from sample data
    const foundModule = ALL_MODULES.find((m) => m.id === moduleId);
    if (foundModule) {
      setModule(foundModule);
      const foundLesson = foundModule.lessons.find((l: Lesson) => l.id === lessonId);
      setLesson(foundLesson || null);
    }
    setLoading(false);
  }, [moduleId, lessonId]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-400">Loading lesson...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lesson || !module) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Lesson not found</p>
            <Link href={`/learn/${moduleId}`} className="text-blue-400 hover:text-blue-300">
              Back to module
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const handleLessonComplete = async () => {
    // Save progress to Firestore
    if (userId) {
      try {
        await saveUserProgress(userId, {
          userId,
          moduleId,
          lessonsCompleted: [lessonId],
          quizScores: {},
          lastAccessed: new Date(),
          completionPercentage: 100,
        });
        
        // Record API usage
        await recordAPIUsage(userId, '/api/progress', 'POST', 200, 120, 'lesson_complete');
        
        console.log('Progress saved:', lesson.id);
      } catch (error) {
        console.error('Error saving progress:', error);
      }
    }
  };

  const handleQuizStart = async () => {
    console.log('Quiz started:', lesson.id);
    // Record quiz start event
    if (userId) {
      try {
        await recordAPIUsage(userId, '/api/quiz', 'POST', 200, 50, 'quiz_start');
      } catch (error) {
        console.error('Error recording quiz start:', error);
      }
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-8">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <Link
            href={`/learn/${moduleId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to {module?.title}
          </Link>
        </div>

        {/* Lesson Viewer with AI Chat */}
        <div className="max-w-6xl mx-auto px-6">
          {lesson && (
            <EnhancedLessonViewer
              lesson={lesson}
              onComplete={handleLessonComplete}
              onQuizStart={handleQuizStart}
              onAIChatOpen={() => setAiChatOpen(true)}
            />
          )}
        </div>
      </div>

      {/* AI Chat Sidebar */}
      <AIChat
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        lessonTitle={lesson?.title}
        lessonContext={lesson?.content}
      />
    </ProtectedRoute>
  );
}

