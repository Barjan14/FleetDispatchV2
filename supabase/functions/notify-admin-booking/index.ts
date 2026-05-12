import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Get secrets from Supabase environment
    const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY");
    const SENDER_EMAIL = Deno.env.get("SENDER_EMAIL");

    // Multiple admin emails
    const ADMIN_EMAILS = [
      "dar.regionaloffice.x@gmail.com",
      "nicolasruilan30@gmail.com",
    ];

    console.log("Processing new booking notification...");

    const {
      employeeName,
      destination,
      startDate,
      department,
      purpose,
    } = await req.json();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": BREVO_API_KEY || "",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        // Verified sender email from Brevo
        sender: {
          name: "Fleet System Notification",
          email: SENDER_EMAIL,
        },

        // Send to multiple admins
        to: ADMIN_EMAILS.map((email) => ({ email })),

        subject: `New Booking: ${employeeName} - ${destination}`,

        htmlContent: `
          <div style="font-family: sans-serif; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1d4ed8;">New Request for Review</h2>
            <p>A new vehicle booking has been submitted.</p>

            <div style="background: #f9fafb; padding: 15px; border-radius: 5px;">
              <p><b>Employee:</b> ${employeeName}</p>
              <p><b>Dept:</b> ${department}</p>
              <p><b>Destination:</b> ${destination}</p>
              <p><b>Date:</b> ${startDate}</p>
              <p><b>Purpose:</b> ${purpose}</p>
            </div>

            <br/>

            <a 
              href="https://darxfleetdispatch.vercel.app/admin-login"
              style="
                background: #1d4ed8;
                color: white;
                padding: 10px 15px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
              "
            >
              Go to Admin Dashboard
            </a>
          </div>
        `,
      }),
    });

    const result = await response.json();

    console.log("Brevo API Status:", response.status);
    console.log("Brevo Response Body:", result);

    if (!response.ok) {
      throw new Error(result.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error("Function Error:", error.message);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});