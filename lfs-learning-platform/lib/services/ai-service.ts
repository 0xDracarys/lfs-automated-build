// AI Service for Vertex AI integration
// Handles chat, FAQs, and learning assistance queries

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isLoading?: boolean;
}

export interface AIResponse {
  message: string;
  sources?: string[];
  relatedTopics?: string[];
}

// System prompt for AI to act as Linux learning assistant
const LINUX_LEARNING_SYSTEM_PROMPT = `You are an expert Linux learning assistant designed to help students learn the Linux From Scratch (LFS) project. 

Your responsibilities:
1. Answer questions about Linux, bash, system administration, and LFS
2. Explain Linux concepts in simple, beginner-friendly language
3. Provide practical examples and command demonstrations
4. Help clarify FAQs and concepts from the course
5. Suggest related topics when relevant
6. Keep responses concise but comprehensive
7. Always focus on educational value

When answering:
- Use markdown formatting for code blocks: \`\`\`bash ... \`\`\`
- Keep explanations clear and structured
- Provide examples when possible
- Reference the LFS project concepts when applicable
- Offer to elaborate on any topic`;

/**
 * Send a query to Google Vertex AI and get a response
 * This function is meant to be called from Next.js API routes
 */
export async function queryVertexAI(userQuery: string, context?: string): Promise<AIResponse> {
  try {
    // The actual API call will be handled via a Next.js API route
    // to protect the API key from being exposed to the client
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: userQuery,
        context: context,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error querying Vertex AI:', error);
    throw error;
  }
}

/**
 * Generate a response for FAQ questions
 */
export async function answerFAQ(faqQuestion: string, lessonContext?: string): Promise<string> {
  try {
    const response = await queryVertexAI(
      `FAQ Question: ${faqQuestion}\n\nProvide a concise, clear answer suitable for a FAQ section.`,
      lessonContext
    );
    return response.message;
  } catch (error) {
    console.error('Error answering FAQ:', error);
    return 'I encountered an error processing your question. Please try again.';
  }
}

/**
 * Generate interesting facts about a Linux topic
 */
export async function generateInterestingFact(topic: string): Promise<string> {
  try {
    const response = await queryVertexAI(
      `Generate an interesting fact about: ${topic}\n\nKeep it concise (1-2 sentences) and educational.`
    );
    return response.message;
  } catch (error) {
    console.error('Error generating fact:', error);
    return 'Could not generate fact at this time.';
  }
}

/**
 * Generate fun facts about Linux
 */
export async function generateFunFact(topic: string): Promise<string> {
  try {
    const response = await queryVertexAI(
      `Generate a fun and interesting fact about: ${topic}\n\nMake it engaging for students learning Linux (1-2 sentences).`
    );
    return response.message;
  } catch (error) {
    console.error('Error generating fun fact:', error);
    return 'Could not generate fun fact at this time.';
  }
}

export { LINUX_LEARNING_SYSTEM_PROMPT };
