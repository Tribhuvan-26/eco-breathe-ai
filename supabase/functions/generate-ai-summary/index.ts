import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aqiData, city, type = 'summary' } = await req.json();
    const apiKey = Deno.env.get('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    let prompt = '';
    
    if (type === 'summary') {
      prompt = `Based on this air quality data for ${city}: AQI: ${aqiData.aqi}, PM2.5: ${aqiData.pm25}, PM10: ${aqiData.pm10}, NO2: ${aqiData.no2}, CO: ${aqiData.co}, O3: ${aqiData.o3}. 
      Generate a brief, friendly 2-3 sentence summary about today's air quality, any trends, and what it means for residents. Keep it conversational and easy to understand.`;
    } else if (type === 'health') {
      prompt = `Based on this air quality data: AQI: ${aqiData.aqi}, PM2.5: ${aqiData.pm25}, PM10: ${aqiData.pm10}. 
      Provide 3-4 specific health recommendations for residents today. Include activity suggestions and timing. Be concise and actionable.`;
    } else if (type === 'policy') {
      prompt = `As an AI analyzing air pollution data for ${city}: AQI: ${aqiData.aqi}, PM2.5: ${aqiData.pm25}, PM10: ${aqiData.pm10}, NO2: ${aqiData.no2}. 
      Suggest 2-3 specific policy interventions or measures that could help improve air quality. Focus on practical, evidence-based actions.`;
    }

    console.log('Making request to Gemini API with prompt:', prompt);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 300,
          }
        })
      }
    );

    console.log('Gemini API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response data:', JSON.stringify(data));
    
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';

    console.log('AI summary generated:', generatedText);

    return new Response(JSON.stringify({ summary: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});