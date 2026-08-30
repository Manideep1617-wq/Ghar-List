// Deno Supabase Edge Function: spending-insights
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "Missing ANTHROPIC_API_KEY secret on Edge Function." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { currentMonth, previousMonth, house, personal } = await req.json();

    // Prepare prompt payload for Claude
    const prompt = `Analyze this month-over-month household grocery & expense report separately for shared "House" and private "Personal" budgets.
The current month is ${currentMonth} and the previous month was ${previousMonth}.

DATA:
1. Shared House Expenses:
   - Current Month Total: ₹${house.currentTotal.toLocaleString('en-IN')}
   - Previous Month Total: ₹${house.previousTotal.toLocaleString('en-IN')}
   - Categories breakdown this month: ${JSON.stringify(house.categories)}

2. Private Personal Expenses:
   - Current Month Total: ₹${personal.currentTotal.toLocaleString('en-IN')}
   - Previous Month Total: ₹${personal.previousTotal.toLocaleString('en-IN')}
   - Categories breakdown this month: ${JSON.stringify(personal.categories)}

Return a short natural-language summary analyzing the two budgets separately. For example:
"Your house spent ₹18,400 on shared household expenses this month, compared with ₹15,700 last month. The biggest increase came from groceries, which increased by ₹1,800.
Your personal spending was ₹3,200, mainly on personal-care products.
Suggestion: Household grocery spending increased significantly this month. Consider setting a monthly grocery budget and reviewing frequently purchased items."

Keep it concise (3-4 sentences total) and match this exact style. Do not use markdown headers, just plain prose paragraphs. Highlight the numbers clearly in Indian Rupees (₹).`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 400,
        temperature: 0.5,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API request failed: ${errorText}`);
    }

    const result = await response.json();
    const insight = result.content?.[0]?.text || "Unable to generate insights at this time.";

    return new Response(
      JSON.stringify({ insight }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
