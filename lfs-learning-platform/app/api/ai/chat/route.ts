import { NextRequest, NextResponse } from 'next/server';

// This is a placeholder API route for Vertex AI integration
// To use this, you need to:
// 1. Set up Google Cloud Vertex AI
// 2. Create a service account and download credentials
// 3. Set GOOGLE_APPLICATION_CREDENTIALS environment variable
// 4. Enable Vertex AI API in your Google Cloud project

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
- Use markdown formatting for code blocks
- Keep explanations clear and structured
- Provide examples when possible
- Reference the LFS project concepts when applicable
- Offer to elaborate on any topic`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Check if Vertex AI credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) {
      return NextResponse.json(
        {
          message: `To enable AI features, you need to:\n1. Create a Google Cloud project\n2. Enable Vertex AI API\n3. Create a service account with Vertex AI permissions\n4. Download the JSON key and set GOOGLE_APPLICATION_CREDENTIALS environment variable\n\nFor now, here's a response based on Linux knowledge: The query was "${query}". When Vertex AI is configured, I'll provide detailed responses.`,
          sources: [],
          relatedTopics: [],
        },
        { status: 200 }
      );
    }

    // Dynamic import to avoid requiring the library if not using Vertex AI
    const { VertexAI } = await import('@google-cloud/vertexai');

    const project = process.env.GOOGLE_CLOUD_PROJECT || '';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

    const client = new VertexAI({
      project,
      location,
    });

    const systemPrompt = context 
      ? `${LINUX_LEARNING_SYSTEM_PROMPT}\n\nCurrent lesson context: ${context}`
      : LINUX_LEARNING_SYSTEM_PROMPT;

    const model = 'gemini-2.0-flash-exp'; // Latest model
    
    const request_body = {
      system_instruction: {
        parts: [
          {
            text: systemPrompt,
          },
        ],
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: query,
            },
          ],
        },
      ],
    };

    const response = await client.getGenerativeModel({ model }).generateContent(request_body);

    const messageContent = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract code blocks and topics from response for additional metadata
    const relatedTopics: string[] = [];
    
    // Simple pattern to find potential topics
    const topicMatches = messageContent.match(/(?:topic|concept|command|tool):\s*([^.\n]+)/gi);
    if (topicMatches) {
      topicMatches.forEach((match: string) => {
        const topic = match.replace(/(?:topic|concept|command|tool):\s*/i, '').trim();
        if (topic && !relatedTopics.includes(topic)) {
          relatedTopics.push(topic);
        }
      });
    }

    return NextResponse.json({
      message: messageContent,
      sources: ['Vertex AI - Linux Learning Assistant'],
      relatedTopics: relatedTopics.slice(0, 3), // Top 3 related topics
    });
  } catch (error) {
    console.error('Error in AI chat API:', error);
    
    // Provide helpful error message
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          message: 'I encountered an issue processing your question. Please ensure Vertex AI is properly configured.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unknown error occurred' },
      { status: 500 }
    );
  }
}
