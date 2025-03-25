
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
    const { data, error } = await supabase
      .from('wifi_requests')
      .insert(typedData)
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
