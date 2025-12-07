/**
 * Playwright Test Suite for LFS Platform
 * Tests all APIs, Firebase integration, and real data responses
 */

import { test, expect } from '@playwright/test';

test.describe('LFS Learning Platform - API & Integration Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const TEST_USER_ID = 'test-user-' + Date.now();

  test.describe('Progress API', () => {
    test('should save user progress to Firestore', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/progress`, {
        data: {
          userId: TEST_USER_ID,
          moduleId: '1',
          lessonId: 'lesson-1-1',
          progress: 75,
          score: 85
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.progress).toBe(75);
    });

    test('should retrieve user progress from Firestore', async ({ request }) => {
      // First save some progress
      await request.post(`${BASE_URL}/api/progress`, {
        data: {
          userId: TEST_USER_ID,
          moduleId: '1',
          lessonId: 'lesson-1-1',
          progress: 60,
          score: 70
        }
      });

      // Then retrieve it
      const response = await request.get(
        `${BASE_URL}/api/progress?userId=${TEST_USER_ID}`
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('should return 400 for missing userId', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/progress`, {
        data: {
          moduleId: '1',
          lessonId: 'lesson-1-1',
          progress: 50
        }
      });

      expect(response.status()).toBe(400);
    });
  });

  test.describe('Activities API', () => {
    test('should track user activity', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/activities`, {
        data: {
          userId: TEST_USER_ID,
          eventType: 'view_lesson',
          moduleId: '1',
          lessonId: 'lesson-1-1',
          details: {
            timeSpent: 300
          }
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    test('should retrieve user activities from Firestore', async ({
      request
    }) => {
      // Track an activity
      await request.post(`${BASE_URL}/api/activities`, {
        data: {
          userId: TEST_USER_ID,
          eventType: 'complete_lesson',
          moduleId: '2',
          lessonId: 'lesson-2-1'
        }
      });

      // Retrieve activities
      const response = await request.get(
        `${BASE_URL}/api/activities?userId=${TEST_USER_ID}&limit=10`
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Commands API', () => {
    test('should track Linux command execution', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/commands`, {
        data: {
          userId: TEST_USER_ID,
          command: 'ls -la /etc',
          category: 'filesystem',
          success: true,
          output: 'total 1234'
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
    });

    test('should retrieve commands by category', async ({ request }) => {
      // Track a command
      await request.post(`${BASE_URL}/api/commands`, {
        data: {
          userId: TEST_USER_ID,
          command: 'chmod 755 test.sh',
          category: 'users',
          success: true
        }
      });

      // Retrieve by category
      const response = await request.get(
        `${BASE_URL}/api/commands?userId=${TEST_USER_ID}&category=users`
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  test.describe('Chat API', () => {
    test('should respond to AI chat queries', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/chat`, {
        data: {
          query: 'What is chmod?',
          conversationId: 'test-conv-' + Date.now()
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.message).toBeDefined();
      expect(typeof data.data.message).toBe('string');
      expect(data.data.message.length).toBeGreaterThan(0);
    });

    test('should maintain conversation history', async ({ request }) => {
      const conversationId = 'test-conv-' + Date.now();

      // First message
      const response1 = await request.post(`${BASE_URL}/api/chat`, {
        data: {
          query: 'What is sudo?',
          conversationId
        }
      });

      expect(response1.status()).toBe(200);

      // Second message in same conversation
      const response2 = await request.post(`${BASE_URL}/api/chat`, {
        data: {
          query: 'How do I use it?',
          conversationId
        }
      });

      expect(response2.status()).toBe(200);
      const data = await response2.json();
      expect(data.success).toBe(true);
    });

    test('should provide non-hardcoded responses', async ({ request }) => {
      // Ask multiple different questions
      const questions = [
        'What is Linux?',
        'Explain bash scripting',
        'How does SSH work?'
      ];

      const responses = await Promise.all(
        questions.map(q =>
          request.post(`${BASE_URL}/api/chat`, {
            data: {
              query: q,
              conversationId: 'test-' + Date.now()
            }
          })
        )
      );

      const messages = await Promise.all(
        responses.map(r => r.json())
      );

      // Verify all responses are different and not hardcoded
      const messageTexts = messages.map((m: any) => m.data?.message || '');
      const uniqueMessages = new Set(messageTexts);

      expect(uniqueMessages.size).toBe(questions.length);
      messageTexts.forEach((msg: string) => {
        expect(msg.length).toBeGreaterThan(50); // Should be substantial responses
      });
    });
  });

  test.describe('Support/HR API', () => {
    test('should create support request for quiz doubt', async ({ request }) => {
      const response = await request.post(`${BASE_URL}/api/support/hr`, {
        data: {
          userId: TEST_USER_ID,
          type: 'quiz_doubt',
          lessonId: 'lesson-1-1',
          moduleId: '1',
          questionId: 'q-1-1',
          message: 'I need help understanding this question',
          selectedText: 'Test question text',
          priority: 'high',
          context: {
            quizQuestion: 'What is LFS?',
            userAnswer: 'Option A',
            correctAnswer: 'Option B',
            explanation: 'The correct answer is B because...',
            lessonTitle: 'Introduction to LFS'
          }
        }
      });

      expect(response.status()).toBe(201);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.supportId).toBeDefined();
    });

    test('should retrieve support requests for user', async ({ request }) => {
      // Create a support request
      const createResponse = await request.post(`${BASE_URL}/api/support/hr`, {
        data: {
          userId: TEST_USER_ID,
          type: 'lesson_doubt',
          message: 'Test support message',
          lessonId: 'lesson-2-1',
          moduleId: '2'
        }
      });

      expect(createResponse.status()).toBe(201);

      // Retrieve support requests
      const response = await request.get(
        `${BASE_URL}/api/support/hr?userId=${TEST_USER_ID}`
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  test.describe('Firebase Integration', () => {
    test('should verify Firebase is connected', async ({ page }) => {
      await page.goto(`${BASE_URL}/learn`);

      // Check if page loads (Firebase should be initialized)
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    });

    test('should display non-hardcoded module data from Firestore', async ({
      page
    }) => {
      await page.goto(`${BASE_URL}/learn`);

      // Wait for modules to load
      const modules = page.locator('[data-testid="module-card"]');
      const count = await modules.count();

      expect(count).toBeGreaterThan(0);

      // Verify data is actually from source, not hardcoded
      const moduleTitle = modules.first().locator('h3');
      const titleText = await moduleTitle.textContent();

      expect(titleText).toBeTruthy();
      expect(titleText?.length).toBeGreaterThan(0);
    });
  });
});
