import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

// 1. CORS Headers to allow your React app to talk to this function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  // 2. Handle Browser Pre-flight (CORS)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
  const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL');

  if (!BREVO_API_KEY || !SENDER_EMAIL) {
    return new Response(JSON.stringify({ error: 'Missing BREVO_API_KEY or SENDER_EMAIL environment variables.' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }

  try {
    const { userEmail, vehicleName, driverName, destination, startDate } = await req.json()

    // 3. Send Request to Brevo API
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": BREVO_API_KEY!,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "DAR Vehicle Dispatch", email: SENDER_EMAIL },
        to: [{ email: userEmail }],
        subject: "Booking Approved: Vehicle & Driver Assigned",
        htmlContent: `
          <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
            <h2 style="color: #10b981;">Your Booking is Approved!</h2>
            <p>Good day, your vehicle request has been processed and approved.</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px;">
              <p><b>Destination:</b> ${destination}</p>
              <p><b>Departure:</b> ${new Date(startDate).toLocaleString()}</p>
              <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;" />
              <p><b>Assigned Vehicle:</b> ${vehicleName}</p>
              <p><b>Assigned Driver:</b> ${driverName}</p>
            </div>
            <p>Please be at the dispatch area 15 minutes before departure.</p>
          </div>
        `,
      }),
    })

    const result = await response.json()
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})