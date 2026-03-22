import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log("--- Request Received (Gemini 2.0 Flash) ---");
    const { image } = await req.json();

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

    const mimeMatch = image.match(/^data:([^;]+);base64,(.+)$/);
    if (!mimeMatch) throw new Error("Invalid image format");

    const mimeType = mimeMatch[1];
    const base64Data = mimeMatch[2];

    const prompt = "Analyze the food in this image. Return ONLY a JSON object with: food_name, calories, protein, carbs, fat. No formatting, no markdown.";

    // ใช้ Gemini 2.0 Flash (หรือ gemini-2.0-flash-exp) เพื่อความเร็วสูงสุด
    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey // ส่งผ่าน Header ตามแบบที่คุณให้มา
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

    const result = await response.json();

    if (result.error) {
      console.error("Gemini API Error:", result.error);
      throw new Error(result.error.message);
    }

    const text = result.candidates[0].content.parts[0].text;
    console.log("Gemini 2.0 Success:", text);

    return new Response(text, {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
