
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Starting escalation check...")
    
    // Get escalation settings
    const { data: escalationSettings, error: settingsError } = await supabaseClient
      .from('escalation_settings')
      .select('emails')
      .single()
      
    if (settingsError) {
      throw new Error(`Error fetching escalation settings: ${settingsError.message}`)
    }
    
    // Extract email list
    const emails = escalationSettings?.emails || []
    
    if (emails.length === 0) {
      console.log("No escalation emails configured, skipping escalation")
      return new Response(
        JSON.stringify({ success: true, message: "No escalation emails configured" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    const now = new Date()
    
    // 1. Check pending requests older than 20 minutes
    const pendingCutoff = new Date(now.getTime() - 20 * 60 * 1000) // 20 minutes ago
    
    const { data: pendingRequests, error: pendingError } = await supabaseClient
      .from('wifi_requests')
      .select('*')
      .eq('status', 'pending')
      .lt('created_at', pendingCutoff.toISOString())
    
    if (pendingError) {
      throw new Error(`Error fetching pending requests: ${pendingError.message}`)
    }
    
    // 2. Check in-progress requests older than 45 minutes
    const progressCutoff = new Date(now.getTime() - 45 * 60 * 1000) // 45 minutes ago
    
    const { data: inProgressRequests, error: progressError } = await supabaseClient
      .from('wifi_requests')
      .select('*')
      .eq('status', 'in-progress')
      .lt('updated_at', progressCutoff.toISOString())
    
    if (progressError) {
      throw new Error(`Error fetching in-progress requests: ${progressError.message}`)
    }
    
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
    for (const request of requestsToEscalate) {
      // 1. Update the request status
      const { error: updateError } = await supabaseClient
        .from('wifi_requests')
        .update({ status: 'escalated' })
        .eq('id', request.id)
      
      if (updateError) {
        console.error(`Error updating status for request ${request.id}:`, updateError)
        continue
      }
      
      // 2. Add a system comment about escalation
      const wasStatus = request.status === 'pending' ? 'pending for 20+ minutes' : 'in progress for 45+ minutes'
      
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
      
      // 3. Send email notification
      try {
        // We're using the system's default email service
        // This would normally use a dedicated email service like Resend
        // For now, we're just logging that we would send an email
        
        console.log(`Would send escalation email to: ${emails.join(', ')}`)
        console.log(`Email subject: WiFi Request Escalated - ${request.id}`)
        console.log(`Email body: Request from ${request.name} (${request.email}) has been escalated.`)
        console.log(`Room: ${request.room_number}, Issue: ${request.issue_type}, Device: ${request.device_type}`)
        console.log(`Description: ${request.description}`)
        
        // This is where you would normally call your email sending function
        // Example: await sendEmail(emails, subject, body)
      } catch (emailError) {
        console.error(`Error sending email for request ${request.id}:`, emailError)
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Escalated ${requestsToEscalate.length} requests` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error("Error in escalation function:", error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
