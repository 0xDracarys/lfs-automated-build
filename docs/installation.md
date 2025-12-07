---
title: Installation Guide
description: How to set up and configure the LFS Learning Platform
---

# Installation Guide

This guide covers everything you need to get started with the LFS Learning Platform.

## Prerequisites

- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Stable internet connection
- Email address for account creation

## Account Setup

### Creating Your Account

1. Navigate to [/signup](/signup)
2. Choose your preferred method:
   - **Email & Password**: Enter your email and create a secure password
   - **Google Sign-In**: Use your existing Google account

3. Verify your email address (if using email signup)
4. Complete your profile

### Profile Configuration

After signing up, complete your profile:

```typescript
{
  displayName: "Your Name",
  bio: "Brief introduction",
  experienceLevel: "beginner" | "intermediate" | "advanced",
  learningGoals: ["Build LFS", "Learn kernel", "System admin"],
  timezone: "Your timezone"
}
```

## Platform Features

### Learning Modules

Access structured learning content:

- **6 Core Modules**: Fundamentals through Advanced Topics
- **40+ Lessons**: Comprehensive coverage of Linux concepts
- **Progress Tracking**: Automatic saving of completed lessons
- **Achievements**: Unlock badges as you progress

### Interactive Terminal

Our Docker-powered terminal provides:

- **Isolated Environment**: Safe space to experiment
- **Pre-configured Tools**: All necessary Linux utilities
- **Command History**: Review your past commands
- **Session Persistence**: Resume where you left off

### Build System

Automated LFS building:

- **Cloud-Based**: Runs in Google Cloud infrastructure
- **Real-Time Logs**: Watch your build progress
- **Customizable**: Configure build parameters
- **Downloadable**: Get your completed system

## Browser Configuration

### Recommended Settings

Enable these browser features for the best experience:

```bash
# Allow pop-ups from lfslearning.com
# Enable JavaScript
# Allow cookies (for authentication)
# Enable local storage
```

### Chrome

1. Settings → Privacy and Security
2. Site Settings → Permissions
3. Allow JavaScript, Cookies, Pop-ups for lfslearning.com

### Firefox

1. Settings → Privacy & Security
2. Custom settings
3. Allow cookies and JavaScript

## Troubleshooting

### Login Issues

**Problem**: Can't log in

**Solutions**:
- Clear browser cache and cookies
- Try incognito/private mode
- Reset password via "Forgot Password"
- Check email for verification link

### Terminal Not Loading

**Problem**: Terminal shows loading spinner indefinitely

**Solutions**:
- Refresh the page
- Check internet connection
- Disable browser extensions
- Try a different browser

### Progress Not Saving

**Problem**: Completed lessons not marked as done

**Solutions**:
- Ensure you're logged in
- Check internet connection
- Complete the lesson quiz/exercise
- Contact support if persists

## Getting Support

Need help? Contact us:

- **Email**: support@lfslearning.com
- **GitHub**: [github.com/lfs-learning](https://github.com/lfs-learning)
- **Discord**: Join our community server

---

**Next**: [Getting Started Guide →](/docs/getting-started)
