/**
 * Support/HR System Hook
 * Handles transferring quiz doubts, lesson issues, and feedback to HR team
 */

import { useCallback, useState } from 'react';

export interface SupportRequestOptions {
  type: 'quiz_doubt' | 'lesson_doubt' | 'technical_issue' | 'feedback';
  message: string;
  selectedText?: string;
  lessonId?: string;
  moduleId?: string;
  questionId?: string;
  priority?: 'low' | 'medium' | 'high';
  context?: {
    quizQuestion?: string;
    userAnswer?: string;
    correctAnswer?: string;
    explanation?: string;
    lessonTitle?: string;
  };
}

export interface SupportResponse {
  success: boolean;
  supportId?: string;
  message: string;
  error?: string;
}

export function useSupportHR() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSupportId, setLastSupportId] = useState<string | null>(null);

  /**
   * Transfer a quiz doubt directly to HR/Support team
   */
  const transferQuizDoubt = useCallback(
    async (
      userId: string,
      options: SupportRequestOptions
    ): Promise<SupportResponse> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/support/hr', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-email': `user-${userId}@lfs.local` // Can be enhanced with real email
          },
          body: JSON.stringify({
            userId,
            ...options
          })
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Failed to create support request';
          setError(errorMsg);
          return {
            success: false,
            message: errorMsg,
            error: errorMsg
          };
        }

        setLastSupportId(data.supportId);
        return {
          success: true,
          supportId: data.supportId,
          message: data.message
        };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return {
          success: false,
          message: 'Failed to transfer to HR',
          error: errorMsg
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Transfer entire quiz question/section to HR with full context
   */
  const transferQuestionWithContext = useCallback(
    async (
      userId: string,
      lessonId: string,
      moduleId: string,
      questionId: string,
      question: string,
      selectedText: string,
      userAnswer?: string,
      correctAnswer?: string,
      explanation?: string,
      lessonTitle?: string
    ): Promise<SupportResponse> => {
      return transferQuizDoubt(userId, {
        type: 'quiz_doubt',
        message: `I have a doubt about this quiz question:\n\n"${question}"\n\nMy selection: "${selectedText}"\n\nPlease help me understand this better.`,
        selectedText,
        lessonId,
        moduleId,
        questionId,
        priority: 'high',
        context: {
          quizQuestion: question,
          userAnswer,
          correctAnswer,
          explanation,
          lessonTitle
        }
      });
    },
    [transferQuizDoubt]
  );

  /**
   * Transfer lesson content doubt to HR
   */
  const transferLessonDoubt = useCallback(
    async (
      userId: string,
      lessonId: string,
      moduleId: string,
      message: string,
      selectedText?: string,
      lessonTitle?: string
    ): Promise<SupportResponse> => {
      return transferQuizDoubt(userId, {
        type: 'lesson_doubt',
        message,
        selectedText,
        lessonId,
        moduleId,
        priority: 'medium',
        context: {
          lessonTitle
        }
      });
    },
    [transferQuizDoubt]
  );

  /**
   * Get user's support requests
   */
  const getSupportRequests = useCallback(
    async (userId: string): Promise<any[]> => {
      try {
        const response = await fetch(`/api/support/hr?userId=${userId}`);
        const data = await response.json();
        return data.success ? data.data : [];
      } catch (err) {
        console.error('Failed to fetch support requests:', err);
        return [];
      }
    },
    []
  );

  /**
   * Get specific support request details
   */
  const getSupportDetails = useCallback(
    async (supportId: string): Promise<any> => {
      try {
        const response = await fetch(`/api/support/hr?supportId=${supportId}`);
        const data = await response.json();
        return data.success ? data.data : null;
      } catch (err) {
        console.error('Failed to fetch support details:', err);
        return null;
      }
    },
    []
  );

  return {
    isLoading,
    error,
    lastSupportId,
    transferQuizDoubt,
    transferQuestionWithContext,
    transferLessonDoubt,
    getSupportRequests,
    getSupportDetails
  };
}
