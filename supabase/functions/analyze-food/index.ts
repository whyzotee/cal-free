// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestPayload {
  image: string;
}

console.info('analyze-food server started');

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image }: RequestPayload = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const mimeMatch = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!mimeMatch) throw new Error("Invalid image format");

    const mimeType = mimeMatch[1];
    const base64Data = mimeMatch[2];

    const prompt = "Analyze the food in this image. Return ONLY a JSON object with: food_name, calories, protein, carbs, fat, sugar (g), sodium (mg), cholesterol (mg), serving_size (number), unit (e.g., 'g', 'piece', 'cup'). No formatting, no markdown.";

    // ใช้ Gemini 3.1 Flash-Lite เพื่อความเร็วสูงสุดและประหยัดที่สุด
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`;

    const geminiResponse = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          response_mime_type: "application/json"
        }
      })
    });

    const result = await geminiResponse.json();

    if (!geminiResponse.ok || result.error) {
      const status = geminiResponse.status;
      const errorDetail = result.error;
      console.error(`Gemini API Error (${status}):`, JSON.stringify(errorDetail, null, 2));

      return new Response(JSON.stringify({
        error: errorDetail?.message || "Gemini API Error",
        status,
        suggestion: status === 429 ? "Rate limit hit. Please wait a moment before trying again." : undefined
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
        status: status === 429 ? 429 : 500,
      });
    }

    const text = result.candidates[0].content.parts[0].text;
    console.log("Gemini 3.1 Success:", text);

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
      status: 200,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    console.error("Edge Function Error:", message);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Connection': 'keep-alive' },
      status: 500,
    });
  }
});
