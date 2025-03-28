
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { Resend } from "https://esm.sh/resend@2.0.0"

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Create a Supabase client with the Deno runtime
const supabaseClient = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
)

// Initialize Resend with API key
const resendApiKey = Deno.env.get("RESEND_API_KEY") || ""
const resend = new Resend(resendApiKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Starting escalation check...")
    
    // Check if Resend API key is configured
    if (!resendApiKey) {
      console.error("Resend API key not configured. Emails will not be sent.")
    } else {
      console.log("Resend API key is configured.")
    }
    
    // Get escalation settings
    const { data: escalationSettings, error: settingsError } = await supabaseClient
      .from('escalation_settings')
      .select('*')
      .single()
      
    if (settingsError) {
      console.error("Error fetching escalation settings:", settingsError)
      throw new Error(`Error fetching escalation settings: ${settingsError.message}`)
    }
    
    // Extract email list and thresholds
    const emails = escalationSettings?.emails || []
    const pendingThresholdMinutes = escalationSettings?.pending_threshold || 20
    const progressThresholdMinutes = escalationSettings?.progress_threshold || 45
    
    console.log("Escalation emails found:", emails)
    console.log(`Pending threshold: ${pendingThresholdMinutes} minutes`)
    console.log(`In-progress threshold: ${progressThresholdMinutes} minutes`)
    
    if (emails.length === 0) {
      console.log("No escalation emails configured, skipping escalation")
      return new Response(
        JSON.stringify({ success: true, message: "No escalation emails configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    const now = new Date()
    
    // 1. Check pending requests older than the threshold
    const pendingCutoff = new Date(now.getTime() - pendingThresholdMinutes * 60 * 1000)
    
    const { data: pendingRequests, error: pendingError } = await supabaseClient
      .from('wifi_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', pendingCutoff.toISOString())
    
    if (pendingError) {
      console.error("Error fetching pending requests:", pendingError)
      throw new Error(`Error fetching pending requests: ${pendingError.message}`)
    }
    
    console.log(`Found ${pendingRequests?.length || 0} pending requests older than ${pendingThresholdMinutes} minutes`)
    
    // 2. Check in-progress requests older than the threshold
    const progressCutoff = new Date(now.getTime() - progressThresholdMinutes * 60 * 1000)
    
    const { data: inProgressRequests, error: progressError } = await supabaseClient
      .from('wifi_requests')
      .select('*')
      .eq('status', 'in-progress')
      .lt('updated_at', progressCutoff.toISOString())
    
    if (progressError) {
      console.error("Error fetching in-progress requests:", progressError)
      throw new Error(`Error fetching in-progress requests: ${progressError.message}`)
    }
    
    console.log(`Found ${inProgressRequests?.length || 0} in-progress requests older than ${progressThresholdMinutes} minutes`)
    
    const requestsToEscalate = [...(pendingRequests || []), ...(inProgressRequests || [])]
    
    if (requestsToEscalate.length === 0) {
      console.log("No requests to escalate")
      return new Response(
        JSON.stringify({ success: true, message: "No requests to escalate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    console.log(`Found ${requestsToEscalate.length} requests to escalate`)
    
    // Escalate each request and send notification emails
    let escalatedCount = 0
    for (const request of requestsToEscalate) {
      try {
        // Skip if already escalated
        if (request.status === 'escalated') {
          console.log(`Request ${request.id} already escalated, skipping`)
          continue
        }
        
        // 1. Update the request status
        const { error: updateError } = await supabaseClient
          .from('wifi_requests')
          .update({ 
            status: 'escalated',
            was_escalated: true
          })
          .eq('id', request.id)
        
        if (updateError) {
          console.error(`Error updating status for request ${request.id}:`, updateError)
          continue
        }
        
        // 2. Add a system comment about escalation
        const wasStatus = request.status === 'pending' ? 
          `pending for ${pendingThresholdMinutes}+ minutes` : 
          `in progress for ${progressThresholdMinutes}+ minutes`
        
        const { error: commentError } = await supabaseClient
          .from('request_comments')
          .insert({
            request_id: request.id,
            user_name: "System",
            comment_text: `This request was automatically escalated because it was ${wasStatus} without resolution.`
          })
        
        if (commentError) {
          console.error(`Error adding comment for request ${request.id}:`, commentError)
        }
        
        // 3. Send email notification using Resend
        try {
          const emailSubject = `WiFi Request Escalated - ${request.id}`;
          const emailBody = `
Request ID: ${request.id}
From: ${request.name} (${request.email})
Room: ${request.room_number}
Issue Type: ${request.issue_type}
Device Type: ${request.device_type}
Description: ${request.description}

This request was automatically escalated because it was ${wasStatus} without resolution.

Please address this request as soon as possible.
`;
          
          if (resendApiKey && emails.length > 0) {
            console.log(`Sending escalation email for request ${request.id} to: ${emails.join(', ')}`)
            
            const { data: emailData, error: emailError } = await resend.emails.send({
              from: "WiFi Support <onboarding@resend.dev>",
              to: emails,
              subject: emailSubject,
              text: emailBody,
            });
            
            if (emailError) {
              console.error(`Error sending email for request ${request.id}:`, emailError);
            } else {
              console.log(`Email sent successfully for request ${request.id}`);
              escalatedCount++;
            }
          } else {
            // Log the email that would have been sent
            console.log(`Would send escalation email to: ${emails.join(', ')}`);
            console.log(`Email subject: ${emailSubject}`);
            console.log(`Email body: ${emailBody}`);
            escalatedCount++;
          }
        } catch (emailError) {
          console.error(`Error sending email for request ${request.id}:`, emailError);
        }
      } catch (requestError) {
        console.error(`Error processing request ${request.id}:`, requestError);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Escalated ${escalatedCount} requests`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in escalation function:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
