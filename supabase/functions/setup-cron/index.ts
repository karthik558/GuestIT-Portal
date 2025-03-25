
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS headers for API responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    // Get the Supabase URL and ANON key from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || ""
    
    console.log("Setting up escalation cron job...")
    console.log(`Function URL: ${supabaseUrl}/functions/v1/escalate-requests`)
    
    // Set up the escalation cron job using the database function
    const { data, error } = await supabaseClient.rpc('setup_escalation_cron', {
      function_url: `${supabaseUrl}/functions/v1/escalate-requests`,
      auth_key: supabaseAnonKey
    })
    
    if (error) {
      throw error
    }
    
    console.log("Cron job setup result:", data)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Cron job setup successful",
        details: data
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error setting up cron job:", error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    )
  }
})
