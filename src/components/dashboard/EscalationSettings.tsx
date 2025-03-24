
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EscalationSettings as EscalationSettingsType } from "@/types/escalation";

export function EscalationSettings() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEscalationSettings();
  }, []);

  const fetchEscalationSettings = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('escalation_settings')
        .select('*')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        // Parse the emails from the JSONB field
        const emailList = Array.isArray(data.emails) ? data.emails : [];
        setEmails(emailList);
      } else {
        setEmails([]);
      }
    } catch (error: any) {
      console.error("Error fetching escalation settings:", error);
      toast.error("Failed to load escalation settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmail = () => {
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    if (emails.includes(newEmail)) {
      toast.error("This email is already in the list");
      return;
    }
    
    setEmails(prev => [...prev, newEmail]);
    setNewEmail("");
  };

  const handleRemoveEmail = (email: string) => {
    setEmails(prev => prev.filter(e => e !== email));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const { data, error: checkError } = await supabase
        .from('escalation_settings')
        .select('id')
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }
      
      if (data) {
        // Update existing record
        const { error } = await supabase
          .from('escalation_settings')
          .update({ emails: emails })
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('escalation_settings')
          .insert([{ emails: emails }]);
          
        if (error) throw error;
      }
      
      toast.success("Escalation settings saved successfully");
    } catch (error: any) {
      console.error("Error saving escalation settings:", error);
      toast.error("Failed to save escalation settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Escalation Email Settings
        </CardTitle>
        <CardDescription>
          Configure email addresses that will receive notifications when a request is escalated
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="new-email">Add Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="support@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEmail();
                    }
                  }}
                />
              </div>
              <Button onClick={handleAddEmail}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <div>
              <Label>Current Escalation Emails</Label>
              <div className="mt-2 border rounded-md p-4 min-h-[100px]">
                {emails.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {emails.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center">
                        {email}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0 ml-1"
                          onClick={() => handleRemoveEmail(email)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No escalation emails configured
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSaveSettings} disabled={isSaving || isLoading} className="w-full">
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
              Saving...
            </>
          ) : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
