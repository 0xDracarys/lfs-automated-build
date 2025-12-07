import { NextRequest, NextResponse } from 'next/server';
import { getRealAnswer } from '@/lib/services/ai-enhanced';

interface AIRequest {
  query: string;
  context?: string;
  conversationId?: string;
}

interface AIResponse {
  message: string;
  sources?: string[];
  relatedTopics?: string[];
  conversationId?: string;
}

// Store conversations in memory (for demo; use database for production)
const conversations: Map<string, Array<{ role: string; content: string }>> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AIRequest;
    const { query, context, conversationId } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    // Get conversation history
    const convId = conversationId || `conv-${Date.now()}`;
    let history = conversations.get(convId) || [];

    // Add user message to history
    history.push({ role: 'user', content: query });

    try {
      // Get AI response
      const aiResponse = await getRealAnswer(query);

      // Add AI response to history
      history.push({ role: 'assistant', content: aiResponse.message });

      // Keep history limit to 50 messages
      if (history.length > 50) {
        history = history.slice(-50);
      }

      // Save conversation
      conversations.set(convId, history);

      const response: AIResponse = {
        message: aiResponse.message,
        sources: aiResponse.sources || [],
        relatedTopics: aiResponse.relatedTopics || [],
        conversationId: convId,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (aiError) {
      console.error('AI Error:', aiError);

      // Fallback response
      const fallbackMessage = `I had trouble processing your request about "${query}". Please try asking about:
- Linux basics and commands
- File systems and permissions
- Bash scripting
- Networking tools
- Package management
- System administration`;

      history.push({ role: 'assistant', content: fallbackMessage });
      conversations.set(convId, history);

      return NextResponse.json(
        {
          message: fallbackMessage,
          sources: [],
          relatedTopics: [],
          conversationId: convId,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

// Get conversation history
export async function GET(request: NextRequest) {
  try {
    const conversationId = request.nextUrl.searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const history = conversations.get(conversationId) || [];
    return NextResponse.json({ history, conversationId }, { status: 200 });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
