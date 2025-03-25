
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req) => {
  try {
    // Get the Supabase URL and ANON key from environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || ""
    
    // First, enable the pg_cron and pg_net extensions if not already enabled
    await supabaseClient.rpc('setup_escalation_cron', {
      function_url: `${supabaseUrl}/functions/v1/escalate-requests`,
      auth_key: supabaseAnonKey
    })
    
    return new Response(
      JSON.stringify({ success: true, message: "Cron job setup successful" }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error setting up cron job:", error)
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" } 
      }
    )
  }
})
