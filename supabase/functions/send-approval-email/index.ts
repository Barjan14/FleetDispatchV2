import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
  const SENDER_EMAIL = Deno.env.get('SENDER_EMAIL');

  try {
    const { userEmail, vehicleName, driverName, destination, startDate, status } = await req.json();
    const isApproved = status === 'Approved';
    
    const subject = isApproved ? "Booking Approved: Vehicle & Driver Assigned" : "Booking Update: Request Declined";
    const statusColor = isApproved ? "#10b981" : "#ef4444";
    const statusTitle = isApproved ? "Your Booking is Approved!" : "Booking Request Declined";

    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: ${statusColor}; text-align: center;">${statusTitle}</h2>
        <p>Good day, your vehicle request for <b>${destination}</b> has been processed.</p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><b>Destination:</b> ${destination}</p>
          <p><b>Departure:</b> ${startDate}</p>
          ${isApproved ? `
            <hr style="border: 0; border-top: 1px solid #ccc; margin: 10px 0;" />
            <p><b>Assigned Vehicle:</b> ${vehicleName}</p>
            <p><b>Assigned Driver:</b> ${driverName}</p>` : `
            <p style="color: #ef4444; font-weight: bold;">Reason: We cannot fulfill this request at this time due to scheduling or vehicle availability.</p>`}
        </div>
        <p style="text-align: center; font-size: 0.9em; color: #666;">
          ${isApproved ? "Please be at the dispatch area 15 minutes before departure." : "Please contact the admin office if you have questions."}
        </p>
      </div>`;

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
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const result = await response.json();
    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
})