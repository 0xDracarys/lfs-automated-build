/**
 * Quiz Support Button Component
 * Allows students to transfer quiz questions/doubts directly to HR support
 */

'use client';

import React, { useState } from 'react';
import { useSupportHR } from '@/lib/hooks/useSupportHR';

interface QuizSupportButtonProps {
  userId: string;
  lessonId: string;
  moduleId: string;
  questionId: string;
  questionText: string;
  userAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  lessonTitle?: string;
  selectedText?: string;
}

export function QuizSupportButton({
  userId,
  lessonId,
  moduleId,
  questionId,
  questionText,
  userAnswer,
  correctAnswer,
  explanation,
  lessonTitle,
  selectedText
}: QuizSupportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { isLoading, error, transferQuestionWithContext } = useSupportHR();

  const handleTransfer = async () => {
    try {
      const result = await transferQuestionWithContext(
        userId,
        lessonId,
        moduleId,
        questionId,
        questionText,
        selectedText || questionText,
        userAnswer,
        correctAnswer,
        explanation,
        lessonTitle
      );

      if (result.success) {
        setSubmitted(true);
        setCustomMessage('');
        
        // Reset after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          setIsOpen(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Failed to transfer question:', err);
    }
  };

  return (
    <div className="relative">
      {/* Button to open dialog */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
        title="Transfer this question to HR/Support team for help"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-4a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        Ask HR
      </button>

      {/* Support Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Ask HR for Help
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-6">
                <div className="text-green-500 text-4xl mb-3">✓</div>
                <p className="text-green-600 font-medium">
                  Your question has been sent to the HR team!
                </p>
                <p className="text-gray-600 text-sm mt-2">
                  You will receive a response shortly.
                </p>
              </div>
            ) : (
              <>
                {/* Question preview */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-semibold text-gray-600 uppercase">
                    Question
                  </p>
                  <p className="text-sm text-gray-800 mt-1 line-clamp-3">
                    {questionText}
                  </p>
                </div>

                {/* Additional message */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Details (Optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Explain what you are struggling with or what you would like help with..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTransfer}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      'Send to HR'
                    )}
                  </button>
                </div>

                {/* Info note */}
                <p className="text-xs text-gray-500 mt-4 text-center">
                  Your question and context will be sent to our support team.
                  They will review it and provide detailed help.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
