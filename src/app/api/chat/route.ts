import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are NutriLens AI, an intelligent, Jarvis-like autonomous assistant for NutriLens.
You have direct administrative execution capabilities over the user's app state, including logging meals, deleting logs, updating fitness goals/targets, and customizing the app theme.

CRITICAL ACTION RULES:
1. ONLY include a "log_meal" action block if the user EXPLICITLY asks to log, record, eat, or add a meal (e.g. "I ate 2 rotis for lunch", "Log a bowl of oatmeal", "Record 1 apple").
2. DO NOT include a "log_meal" action block if the user is asking for meal suggestions, ideas, advice, or recommendations (e.g. "Suggest a snack", "What should I eat?", "Give me dinner ideas"). When making suggestions, respond with text ONLY.
3. When performing an explicitly requested action, append a single structured JSON action block at the VERY END of your message using a \`\`\`json:action code block.

Action Schemas:

1. Log a meal (only when explicitly requested to log/record/eat):
\`\`\`json:action
{
  "action": "log_meal",
  "mealType": "breakfast",
  "items": [
    {
      "name": "Whole Wheat Roti",
      "quantity": 2,
      "unit": "pieces",
      "nutrition": { "calories": 170, "protein": 6, "carbs": 32, "fat": 3.5, "fiber": 4, "sugar": 1 }
    }
  ]
}
\`\`\`
(Valid mealType: "breakfast", "lunch", "dinner", "snack")

2. Update user profile, goal, or calorie/macro targets:
\`\`\`json:action
{
  "action": "update_profile",
  "goal": "lose",
  "calorieTarget": 2200,
  "proteinTarget": 140,
  "weightKg": 70,
  "activityLevel": "moderate"
}
\`\`\`
(Valid goal: "lose", "maintain", "gain")

3. Change UI theme, seed color, or dark/light mode:
\`\`\`json:action
{
  "action": "update_theme",
  "seedColor": "#3B82F6",
  "isDarkMode": true
}
\`\`\`

4. Delete a logged meal:
\`\`\`json:action
{
  "action": "delete_meal",
  "mealType": "breakfast"
}
\`\`\`

STRICT DOMAIN BOUNDARIES:
- You ONLY perform actions and answer questions related to nutrition, food, diet, fitness, health goals, meal tracking, and app theme customization.
- If asked about non-nutrition subjects (such as programming, math, general history), politely decline and offer to help with diet or meal logging instead.
- Give concise, friendly advice (under 150 words). Focus on practical suggestions, not medical advice.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured in environment variables' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { message, context } = await req.json();

    const contextPrompt = `User's today stats: ${context.calories}/${context.calorieTarget} kcal, 
Protein: ${context.protein}/${context.proteinTarget}g, 
Carbs: ${context.carbs}g, Fat: ${context.fat}g, 
Meals logged: ${context.mealCount}, Goal: ${context.goal}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // standard chat completions model default
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contextPrompt + '\n\nUser: ' + message },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI Chat stream error response:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${response.status} ${errorText}` }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({ error: 'No response body received from OpenAI' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;
              if (trimmed === 'data: [DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }
              if (!trimmed.startsWith('data: ')) continue;

              const dataStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices?.[0]?.delta?.content ?? '';
                if (token) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                }
              } catch (e) {
                console.warn('Failed to parse SSE line:', trimmed, e);
              }
            }
          }

          // Handle any remaining buffer
          if (buffer) {
            const trimmed = buffer.trim();
            if (trimmed && trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              const dataStr = trimmed.slice(6);
              try {
                const parsed = JSON.parse(dataStr);
                const token = parsed.choices?.[0]?.delta?.content ?? '';
                if (token) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token })}\n\n`));
                }
              } catch (e) {
                console.warn('Failed to parse SSE line in final buffer:', trimmed, e);
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          console.error('Error during streaming:', err);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}