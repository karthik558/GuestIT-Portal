
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type WifiRequestFormData = {
  name: string;
  email: string;
  room_number: string;
  device_type: "smartphone" | "laptop" | "tablet" | "other";
  issue_type: "connect" | "slow" | "disconnect" | "login" | "other";
  description: string;
};

export const submitWifiRequest = async (formData: WifiRequestFormData) => {
  // Ensure the data matches the expected types
  const typedData = {
    name: formData.name,
    email: formData.email,
    room_number: formData.room_number,
    device_type: formData.device_type,
    issue_type: formData.issue_type,
    description: formData.description,
    status: "pending" as const
  };
  
  try {
    // Generate custom tracking ID in the format first4letters + room_number
    let trackingId = generateTrackingId(formData.name, formData.room_number);
    
    // Check if this tracking ID already exists to avoid duplicates
    const { data: existingRequest, error: checkError } = await supabase
      .from('wifi_requests')
      .select('id')
      .eq('id', trackingId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking for existing ID:', checkError);
    }
    
    // If ID exists, append a random number to make it unique
    if (existingRequest) {
      trackingId = `${trackingId}-${Math.floor(Math.random() * 100)}`;
    }
    
    // Insert with custom ID
    const { data, error } = await supabase
      .from('wifi_requests')
      .insert({
        ...typedData,
        id: trackingId
      })
      .select('id')
      .single();
    
    if (error) {
      console.error('Error submitting request:', error);
      toast.error('Failed to submit request');
      return { success: false, error, data: null };
    }
    
    toast.success('Request submitted successfully', {
      description: `Your tracking ID is: ${data.id}`
    });
    
    return { success: true, error: null, data };
  } catch (error) {
    console.error('Unexpected error:', error);
    toast.error('An unexpected error occurred');
    return { success: false, error, data: null };
  }
};

// Helper function to generate tracking ID in the format first4letters + room_number
function generateTrackingId(name: string, roomNumber: string): string {
  // Get first 4 letters of name (or fewer if name is shorter)
  const namePrefix = name.substring(0, 4).toLowerCase();
  
  // Clean up room number (remove spaces, etc.)
  const cleanRoomNumber = roomNumber.replace(/\s+/g, '');
  
  // Combine to create the tracking ID
  return `${namePrefix}${cleanRoomNumber}`;
}
