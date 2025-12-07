/**
 * Sample Learning Module Data
 * Complete course content with lessons, quizzes, FAQs, and fun facts
 */

import { Module, Lesson } from '@/lib/types/learning';

export const MODULE_1: Module = {
  id: '1',
  title: 'Introduction to LFS',
  description: 'Learn what Linux From Scratch is and why building your own Linux system is valuable',
  icon: 'book',
  duration: '15 min',
  difficulty: 'Beginner',
  totalLessons: 5,
  color: 'from-blue-500 to-cyan-500',
  lessons: [
    {
      id: 'lesson-1-1',
      moduleId: '1',
      title: 'What is Linux From Scratch?',
      description: 'Understanding LFS and its philosophy',
      content: `
        <h2>What is Linux From Scratch (LFS)?</h2>
        <p>Linux From Scratch is a project that provides you with step-by-step instructions for building your own custom Linux system, entirely from source code.</p>
        
        <h3>Key Concepts:</h3>
        <ul>
          <li><strong>Source Code:</strong> You compile everything from source, giving you complete control</li>
          <li><strong>Learning Experience:</strong> Understand how Linux works at a fundamental level</li>
          <li><strong>Customization:</strong> Create a system tailored to your specific needs</li>
          <li><strong>Optimization:</strong> Build only what you need, nothing more</li>
        </ul>
        
        <h3>Why Build LFS?</h3>
        <ul>
          <li>Understand your operating system deeply</li>
          <li>Create a minimal, optimized system</li>
          <li>Learn system administration and configuration</li>
          <li>Gain valuable experience in compilation and dependency management</li>
        </ul>
      `,
      duration: 15,
      order: 1,
      faqs: [
        {
          id: 'faq-1-1-1',
          question: 'How long does it take to build LFS?',
          answer: 'Building LFS typically takes 2-6 hours depending on your hardware and optimization level. A basic build takes about 2-3 hours.',
          category: 'General'
        },
        {
          id: 'faq-1-1-2',
          question: 'Can beginners build LFS?',
          answer: 'Yes! LFS is designed for intermediate users, but beginners can learn it with patience and following the instructions carefully.',
          category: 'Beginner'
        },
        {
          id: 'faq-1-1-3',
          question: 'What are the minimum hardware requirements?',
          answer: 'You need at least 2GB of RAM, 5GB of disk space, and a 1GHz processor. More is better for faster builds.',
          category: 'Hardware'
        }
      ],
      interestingFacts: [
        {
          id: 'fact-1-1-1',
          title: 'LFS Project Started in 1999',
          description: 'The Linux From Scratch project has been helping users build custom Linux systems for over two decades.',
          category: 'History',
          source: 'linuxfromscratch.org'
        },
        {
          id: 'fact-1-1-2',
          title: 'Over 100,000 People Have Built LFS',
          description: 'LFS has helped hundreds of thousands of developers understand how Linux systems work.',
          category: 'Community'
        }
      ],
      funFacts: [
        {
          id: 'fun-1-1-1',
          fact: 'The smallest LFS system ever built was only 89MB - small enough to fit on a floppy disk!',
          difficulty: 'easy'
        },
        {
          id: 'fun-1-1-2',
          fact: 'Some LFS builders use it to create optimized systems that boot in less than 2 seconds.',
          difficulty: 'medium'
        }
      ],
      quiz: [
        {
          id: 'q-1-1-1',
          question: 'What does LFS stand for?',
          options: ['Linux For Students', 'Linux From Scratch', 'Linux File System', 'Linux Framework Standard'],
          correctAnswer: 1,
          explanation: 'LFS stands for Linux From Scratch - a project for building custom Linux systems from source code.',
          difficulty: 'easy'
        },
        {
          id: 'q-1-1-2',
          question: 'Which of the following is NOT a benefit of building LFS?',
          options: ['Understanding your OS', 'Creating a minimal system', 'Faster than pre-built distros', 'Learning experience'],
          correctAnswer: 2,
          explanation: 'While LFS is educational, it\'s not necessarily faster than pre-built distros initially - it requires compilation time.',
          difficulty: 'medium'
        }
      ]
    },
    {
      id: 'lesson-1-2',
      moduleId: '1',
      title: 'LFS vs Other Distributions',
      description: 'How LFS compares to other Linux distributions',
      content: `
        <h2>LFS vs Other Linux Distributions</h2>
        <table>
          <tr>
            <th>Aspect</th>
            <th>LFS</th>
            <th>Ubuntu</th>
            <th>Arch Linux</th>
          </tr>
          <tr>
            <td>Installation Time</td>
            <td>2-6 hours</td>
            <td>10 minutes</td>
            <td>30 minutes</td>
          </tr>
          <tr>
            <td>Customization</td>
            <td>Complete</td>
            <td>Limited</td>
            <td>High</td>
          </tr>
          <tr>
            <td>Learning Curve</td>
            <td>Steep</td>
            <td>Easy</td>
            <td>Medium</td>
          </tr>
        </table>
      `,
      duration: 12,
      order: 2,
      faqs: [
        {
          id: 'faq-1-2-1',
          question: 'Should I use LFS for my daily driver?',
          answer: 'You can, but most LFS builders use it for learning or special-purpose systems. For production, consider Arch or Gentoo.',
          category: 'Usage'
        }
      ],
      interestingFacts: [
        {
          id: 'fact-1-2-1',
          title: 'Arch Linux Uses Similar Philosophy',
          description: 'Arch Linux adopted many LFS principles but provides a faster installation method.',
          category: 'Comparison'
        }
      ],
      funFacts: [
        {
          id: 'fun-1-2-1',
          fact: 'Some developers compile their entire system with -O3 optimization for maximum performance.',
          difficulty: 'hard'
        }
      ],
      quiz: [
        {
          id: 'q-1-2-1',
          question: 'Which distribution is most similar to LFS?',
          options: ['Ubuntu', 'Fedora', 'Arch Linux', 'Debian'],
          correctAnswer: 2,
          explanation: 'Arch Linux follows a similar "build it yourself" philosophy, though it provides pre-compiled packages.',
          difficulty: 'medium'
        }
      ]
    }
  ],
  interestingFacts: [],
  funFacts: [],
  tags: ['Linux', 'System Building', 'Basics', 'Beginner Friendly']
};

export const MODULE_2: Module = {
  id: '2',
  title: 'Kernel Compilation',
  description: 'Build and configure Linux kernel 6.4.12 from source code',
  icon: 'cpu',
  duration: '45 min',
  difficulty: 'Advanced',
  totalLessons: 3,
  color: 'from-purple-500 to-pink-500',
  lessons: [
    {
      id: 'lesson-2-1',
      moduleId: '2',
      title: 'Understanding the Linux Kernel',
      description: 'Core concepts of kernel architecture',
      content: `
        <h2>The Linux Kernel</h2>
        <p>The kernel is the core of the operating system that manages all hardware resources.</p>
        
        <h3>Kernel Components:</h3>
        <ul>
          <li><strong>Process Management:</strong> Creating, scheduling, and terminating processes</li>
          <li><strong>Memory Management:</strong> Virtual memory, paging, and swap</li>
          <li><strong>Filesystem:</strong> Ext4, Btrfs, and other filesystems</li>
          <li><strong>Device Drivers:</strong> Hardware communication</li>
          <li><strong>Networking:</strong> TCP/IP stack and network interfaces</li>
        </ul>
      `,
      duration: 20,
      order: 1,
      codeExamples: [
        {
          id: 'code-2-1-1',
          title: 'Check Kernel Version',
          code: 'uname -r\n# Output: 6.4.12',
          language: 'bash',
          explanation: 'This command displays the currently running kernel version.'
        }
      ],
      faqs: [
        {
          id: 'faq-2-1-1',
          question: 'What does the kernel do?',
          answer: 'The kernel manages all hardware resources and acts as a bridge between applications and hardware.',
          category: 'Kernel'
        }
      ],
      interestingFacts: [
        {
          id: 'fact-2-1-1',
          title: 'Linux Kernel is Monolithic',
          description: 'Unlike some OS kernels, Linux is a monolithic kernel, meaning all core functionality runs in kernel mode.',
          category: 'Architecture'
        }
      ],
      funFacts: [
        {
          id: 'fun-2-1-1',
          fact: 'The Linux kernel source code is over 20 million lines of code in the latest versions!',
          difficulty: 'easy'
        }
      ],
      quiz: [
        {
          id: 'q-2-1-1',
          question: 'Which is NOT a kernel responsibility?',
          options: ['Process management', 'Memory management', 'Display rendering', 'Device drivers'],
          correctAnswer: 2,
          explanation: 'Display rendering is handled by user-space graphics drivers and the X server, not the kernel.',
          difficulty: 'easy'
        }
      ]
    },
    {
      id: 'lesson-2-2',
      moduleId: '2',
      title: 'Compiling the Kernel',
      description: 'Step-by-step kernel compilation process',
      content: `
        <h2>Kernel Compilation Steps</h2>
        <ol>
          <li><strong>Configuration:</strong> Select which features to include (make menuconfig)</li>
          <li><strong>Compilation:</strong> Compile the kernel and modules</li>
          <li><strong>Installation:</strong> Install kernel and modules</li>
          <li><strong>Bootloader Setup:</strong> Configure GRUB or other bootloaders</li>
        </ol>
      `,
      duration: 25,
      order: 2,
      codeExamples: [
        {
          id: 'code-2-2-1',
          title: 'Configure Kernel',
          code: 'cd /usr/src/linux\nmake menuconfig',
          language: 'bash',
          explanation: 'Opens an interactive kernel configuration menu.'
        },
        {
          id: 'code-2-2-2',
          title: 'Compile Kernel',
          code: 'make -j4\nmake modules',
          language: 'bash',
          explanation: 'Compile using 4 parallel jobs for faster compilation.'
        }
      ],
      faqs: [
        {
          id: 'faq-2-2-1',
          question: 'How long does kernel compilation take?',
          answer: 'On a modern CPU with 4 cores, 30-60 minutes. On 8+ cores, 10-20 minutes.',
          category: 'Performance'
        }
      ],
      interestingFacts: [
        {
          id: 'fact-2-2-1',
          title: 'Kernel Compilation Stress Test',
          description: 'Compiling the kernel is a great way to test if your hardware is stable - it\'s CPU-intensive and reveals unstable RAM or overclocking.',
          category: 'Testing'
        }
      ],
      funFacts: [
        {
          id: 'fun-2-2-1',
          fact: 'Using "-j" flag with make multiplies your compilation speed - use `nproc` to get your CPU core count!',
          difficulty: 'medium'
        }
      ],
      quiz: [
        {
          id: 'q-2-2-1',
          question: 'What does "make menuconfig" do?',
          options: ['Compiles the kernel', 'Configures kernel options', 'Installs modules', 'Cleans build files'],
          correctAnswer: 1,
          explanation: 'menuconfig opens an interactive menu to select kernel features and modules.',
          difficulty: 'easy'
        }
      ]
    }
  ],
  interestingFacts: [],
  funFacts: [],
  tags: ['Kernel', 'Compilation', 'Advanced', 'System Customization']
};

export const MODULE_3: Module = {
  id: '3',
  title: 'Essential Linux Commands',
  description: 'Master the 50+ most important Linux commands and their usage',
  icon: 'terminal',
  duration: '30 min',
  difficulty: 'Beginner',
  totalLessons: 4,
  color: 'from-green-500 to-emerald-500',
  lessons: [
    {
      id: 'lesson-3-1',
      moduleId: '3',
      title: 'File System Navigation',
      description: 'Navigate and manage files in Linux',
      content: `
        <h2>File System Navigation Commands</h2>
        <p>These commands help you navigate and understand the Linux filesystem.</p>
      `,
      duration: 10,
      order: 1,
      codeExamples: [
        {
          id: 'code-3-1-1',
          title: 'List Files',
          code: 'ls -la /home\n# -l: long format\n# -a: show hidden files',
          language: 'bash',
          explanation: 'Lists all files in long format including hidden files.'
        },
        {
          id: 'code-3-1-2',
          title: 'Change Directory',
          code: 'cd /usr/local\npwd  # Show current directory',
          language: 'bash',
          explanation: 'Navigate to the /usr/local directory.'
        },
        {
          id: 'code-3-1-3',
          title: 'Find Files',
          code: 'find / -name "*.conf" 2>/dev/null\n# Find all .conf files',
          language: 'bash',
          explanation: 'Recursively search for configuration files.'
        }
      ],
      faqs: [
        {
          id: 'faq-3-1-1',
          question: 'What does ".." mean?',
          answer: 'It refers to the parent directory. "./" refers to the current directory.',
          category: 'Navigation'
        },
        {
          id: 'faq-3-1-2',
          question: 'How do I go back to my home directory?',
          answer: 'Use "cd ~" or just "cd" with no arguments.',
          category: 'Navigation'
        }
      ],
      interestingFacts: [
        {
          id: 'fact-3-1-1',
          title: 'Linux Filesystem Hierarchy Standard (FHS)',
          description: 'Linux filesystems follow FHS which defines standard directories like /bin, /etc, /home, etc.',
          category: 'Standards'
        }
      ],
      funFacts: [
        {
          id: 'fun-3-1-1',
          fact: 'In Linux, everything is a file - including devices like /dev/sda and directories!',
          difficulty: 'easy'
        }
      ],
      quiz: [
        {
          id: 'q-3-1-1',
          question: 'What command shows the current directory?',
          options: ['ls', 'pwd', 'cd', 'dir'],
          correctAnswer: 1,
          explanation: 'pwd stands for "Print Working Directory".',
          difficulty: 'easy'
        }
      ]
    }
  ],
  interestingFacts: [],
  funFacts: [],
  tags: ['Linux Commands', 'Practical', 'Terminal', 'Essential']
};

import { ADDITIONAL_MODULES } from './additional-modules';

export const ALL_MODULES = [MODULE_1, MODULE_2, MODULE_3, ...ADDITIONAL_MODULES];
