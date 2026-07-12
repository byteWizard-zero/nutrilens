import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are a nutrition analysis AI. Analyze the food in this image and return a JSON response with this exact structure:
{
  "items": [
    {
      "name": "Food item name",
      "quantity": 1,
      "unit": "serving/piece/cup/g",
      "nutrition": {
        "calories": 250,
        "protein": 12,
        "carbs": 30,
        "fat": 8,
        "fiber": 3,
        "sugar": 5
      },
      "confidence": 0.92
    }
  ],
  "suggestions": ["Tip 1", "Tip 2"],
  "overallConfidence": 0.89
}
Be precise with calorie and macronutrient estimates. Return ONLY valid JSON matching this exact structure.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured in environment variables' },
        { status: 500 }
      );
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Clean up base64 prefix if present
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const mimeType = imageBase64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Vision-capable OpenAI model default
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_PROMPT },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error response:', errorText);
      return NextResponse.json(
        { error: `OpenAI API responded with status ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content ?? '';

    if (!text) {
      throw new Error('Empty response from OpenAI');
    }

    // Attempt to parse JSON response directly or fall back to regex extraction
    let analysis;
    try {
      analysis = JSON.parse(text);
    } catch (e) {
      console.warn('Direct JSON parsing failed, trying extraction regex', e);
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(jsonMatch?.[0] || '{}');
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze image';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}