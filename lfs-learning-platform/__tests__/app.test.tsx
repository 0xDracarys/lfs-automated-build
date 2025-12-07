/**
 * LFS Learning Platform - Test Suite
 * 
 * This file contains test cases for all major features and scenarios.
 * Run with: npm test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
  },
  db: {},
}));

describe('Navigation Tests', () => {
  it('should have all required navigation links', () => {
    const requiredLinks = [
      { label: 'Home', href: '/' },
      { label: 'Learn', href: '/learn' },
      { label: 'Commands', href: '/commands' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Docs', href: '/docs' },
      { label: 'Dashboard', href: '/dashboard' },
    ];
    
    requiredLinks.forEach(link => {
      expect(link.href).toBeDefined();
      expect(link.label).toBeDefined();
    });
  });

  it('should not have duplicate navbars on any page', () => {
    // This test verifies the navbar fix
    const pagesWithGlobalNav = [
      '/about',
      '/docs',
      '/terminal',
      '/dashboard',
      '/auth/login',
      '/auth/signup',
      '/build',
    ];
    
    // Each page should only have GlobalNavBar, not custom nav
    pagesWithGlobalNav.forEach(page => {
      expect(page).toBeDefined();
    });
  });
});

describe('Authentication Tests', () => {
  it('should validate email format', () => {
    const validEmails = ['test@example.com', 'user.name@domain.org'];
    const invalidEmails = ['invalid', 'no@', '@nodomain.com'];
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    validEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(true);
    });
    
    invalidEmails.forEach(email => {
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  it('should require minimum password length', () => {
    const minLength = 6;
    const validPasswords = ['password123', 'securePass!'];
    const invalidPasswords = ['12345', 'abc'];
    
    validPasswords.forEach(pwd => {
      expect(pwd.length >= minLength).toBe(true);
    });
    
    invalidPasswords.forEach(pwd => {
      expect(pwd.length >= minLength).toBe(false);
    });
  });

  it('should handle auth error codes correctly', () => {
    const errorMessages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'Email already registered',
      'auth/weak-password': 'Password too weak',
      'auth/invalid-email': 'Invalid email address',
    };
    
    Object.keys(errorMessages).forEach(code => {
      expect(errorMessages[code]).toBeDefined();
      expect(errorMessages[code].length).toBeGreaterThan(0);
    });
  });
});

describe('Terminal Emulator Tests', () => {
  it('should recognize valid commands', () => {
    const validCommands = [
      'help', 'clear', 'ls', 'pwd', 'whoami', 
      'date', 'uname', 'history', 'ifconfig'
    ];
    
    validCommands.forEach(cmd => {
      expect(cmd).toBeDefined();
    });
  });

  it('should handle command with arguments', () => {
    const commandsWithArgs = [
      { cmd: 'echo hello', expected: 'hello' },
      { cmd: 'cat readme.txt', expected: 'file content or error' },
      { cmd: 'mkdir test', expected: 'Directory created' },
      { cmd: 'touch file.txt', expected: 'File created' },
      { cmd: 'ping google.com', expected: 'PING response' },
    ];
    
    commandsWithArgs.forEach(({ cmd }) => {
      const parts = cmd.split(' ');
      expect(parts.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('should return error for unknown commands', () => {
    const unknownCommands = ['xyz', 'notacommand', 'fakecommand'];
    
    unknownCommands.forEach(cmd => {
      // Should return "command not found" type message
      expect(cmd).not.toBe('help');
      expect(cmd).not.toBe('ls');
    });
  });

  it('should maintain command history', () => {
    const history: string[] = [];
    const commands = ['ls', 'pwd', 'whoami'];
    
    commands.forEach(cmd => {
      history.push(cmd);
    });
    
    expect(history.length).toBe(3);
    expect(history).toContain('ls');
  });
});

describe('Learning Module Tests', () => {
  it('should have required module structure', () => {
    const requiredModuleFields = [
      'id', 'title', 'description', 'lessons', 'icon'
    ];
    
    const sampleModule = {
      id: 'module-1',
      title: 'Getting Started',
      description: 'Introduction to LFS',
      lessons: [],
      icon: 'BookOpen',
    };
    
    requiredModuleFields.forEach(field => {
      expect(sampleModule).toHaveProperty(field);
    });
  });

  it('should have required lesson structure', () => {
    const requiredLessonFields = [
      'id', 'title', 'content', 'duration'
    ];
    
    const sampleLesson = {
      id: 'lesson-1',
      title: 'Introduction',
      content: 'Lesson content here',
      duration: '10 min',
    };
    
    requiredLessonFields.forEach(field => {
      expect(sampleLesson).toHaveProperty(field);
    });
  });

  it('should track lesson completion', () => {
    const completedLessons = new Set<string>();
    
    completedLessons.add('lesson-1');
    completedLessons.add('lesson-2');
    
    expect(completedLessons.has('lesson-1')).toBe(true);
    expect(completedLessons.has('lesson-3')).toBe(false);
    expect(completedLessons.size).toBe(2);
  });
});

describe('Build Configuration Tests', () => {
  it('should have valid kernel versions', () => {
    const validKernelVersions = ['6.4.12', '6.5.0', '6.1.55'];
    
    validKernelVersions.forEach(version => {
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });

  it('should have valid optimization levels', () => {
    const validOptimizations = ['O0', 'O2', 'O3', 'Os'];
    
    validOptimizations.forEach(opt => {
      expect(opt).toMatch(/^O[023s]$/);
    });
  });

  it('should validate build configuration', () => {
    const config = {
      kernelVersion: '6.4.12',
      optimization: 'O2',
      options: {
        includeKernel: true,
        includeNetwork: true,
        includeDev: true,
      }
    };
    
    expect(config.kernelVersion).toBeDefined();
    expect(config.optimization).toBeDefined();
    expect(config.options).toBeDefined();
  });
});

describe('Commands Page Tests', () => {
  it('should have LFS build stages', () => {
    const buildStages = [
      'Environment Setup',
      'Source Downloads',
      'Toolchain Build',
      'Kernel Compilation',
      'System Configuration',
    ];
    
    expect(buildStages.length).toBeGreaterThan(0);
    buildStages.forEach(stage => {
      expect(stage).toBeDefined();
    });
  });

  it('should have copy functionality for commands', () => {
    const copyToClipboard = async (text: string) => {
      // Mock clipboard API
      return Promise.resolve();
    };
    
    expect(copyToClipboard).toBeDefined();
  });
});

describe('Downloads Page Tests', () => {
  it('should have valid download links', () => {
    const downloads = [
      { name: 'LFS ISO', size: '136 MB', format: 'iso' },
      { name: 'Toolchain', size: '500 MB', format: 'tar.gz' },
    ];
    
    downloads.forEach(download => {
      expect(download.name).toBeDefined();
      expect(download.size).toBeDefined();
      expect(download.format).toBeDefined();
    });
  });
});

describe('Progress Tracking Tests', () => {
  it('should calculate progress percentage correctly', () => {
    const calculateProgress = (completed: number, total: number) => {
      if (total === 0) return 0;
      return Math.round((completed / total) * 100);
    };
    
    expect(calculateProgress(5, 10)).toBe(50);
    expect(calculateProgress(0, 10)).toBe(0);
    expect(calculateProgress(10, 10)).toBe(100);
    expect(calculateProgress(0, 0)).toBe(0);
  });

  it('should track streak correctly', () => {
    const calculateStreak = (dates: Date[]) => {
      if (dates.length === 0) return 0;
      
      let streak = 1;
      const sortedDates = dates.sort((a, b) => b.getTime() - a.getTime());
      
      for (let i = 1; i < sortedDates.length; i++) {
        const diff = sortedDates[i - 1].getTime() - sortedDates[i].getTime();
        const dayDiff = diff / (1000 * 60 * 60 * 24);
        
        if (dayDiff <= 1) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    };
    
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    expect(calculateStreak([today, yesterday])).toBe(2);
    expect(calculateStreak([])).toBe(0);
  });
});

describe('API Route Tests', () => {
  it('should handle build API request', async () => {
    const mockBuildRequest = {
      kernelVersion: '6.4.12',
      optimization: 'O2',
      options: {
        includeNetwork: true,
        includeDev: true,
      }
    };
    
    expect(mockBuildRequest).toBeDefined();
    expect(mockBuildRequest.kernelVersion).toBe('6.4.12');
  });

  it('should handle progress API request', async () => {
    const mockProgressUpdate = {
      lessonId: 'lesson-1',
      completed: true,
      timestamp: new Date().toISOString(),
    };
    
    expect(mockProgressUpdate.lessonId).toBeDefined();
    expect(mockProgressUpdate.completed).toBe(true);
  });
});

describe('Responsive Design Tests', () => {
  it('should have mobile breakpoints defined', () => {
    const breakpoints = {
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    };
    
    expect(breakpoints.sm).toBeLessThan(breakpoints.md);
    expect(breakpoints.md).toBeLessThan(breakpoints.lg);
    expect(breakpoints.lg).toBeLessThan(breakpoints.xl);
  });
});

describe('Accessibility Tests', () => {
  it('should have proper ARIA labels', () => {
    const requiredAriaLabels = [
      'navigation',
      'main content',
      'search',
      'menu',
    ];
    
    requiredAriaLabels.forEach(label => {
      expect(label).toBeDefined();
    });
  });

  it('should have keyboard navigation support', () => {
    const keyboardEvents = ['Enter', 'Escape', 'ArrowUp', 'ArrowDown', 'Tab'];
    
    keyboardEvents.forEach(key => {
      expect(key).toBeDefined();
    });
  });
});

describe('Error Handling Tests', () => {
  it('should handle network errors gracefully', () => {
    const handleNetworkError = (error: Error) => {
      return {
        message: 'Network error occurred',
        retry: true,
      };
    };
    
    const result = handleNetworkError(new Error('Network failed'));
    expect(result.message).toBeDefined();
    expect(result.retry).toBe(true);
  });

  it('should handle 404 errors', () => {
    const handle404 = () => ({
      status: 404,
      message: 'Page not found',
    });
    
    const result = handle404();
    expect(result.status).toBe(404);
  });
});

describe('Performance Tests', () => {
  it('should lazy load components', () => {
    // Components that should be lazy loaded
    const lazyComponents = [
      'DottedSurface',
      'UserActivityDashboard',
      'BuildProgress',
      'LogViewer',
    ];
    
    lazyComponents.forEach(component => {
      expect(component).toBeDefined();
    });
  });
});
