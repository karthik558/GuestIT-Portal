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
import { X, Plus, Mail, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EscalationSettings as EscalationSettingsType } from "@/types/escalation";
import { Separator } from "@/components/ui/separator";

export function EscalationSettings() {
  const [emails, setEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCronSetup, setIsCronSetup] = useState(false);
  const [isSettingUpCron, setIsSettingUpCron] = useState(false);
  const [pendingThreshold, setPendingThreshold] = useState(20);
  const [progressThreshold, setProgressThreshold] = useState(45);

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
        const emailList = Array.isArray(data.emails) 
          ? data.emails.map(email => String(email)) 
          : [];
        setEmails(emailList);
        
        // Set escalation thresholds if available in settings
        if (data.pending_threshold) {
          setPendingThreshold(data.pending_threshold);
        }
        
        if (data.progress_threshold) {
          setProgressThreshold(data.progress_threshold);
        }
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
      
      const settingsData = {
        emails: emails,
        pending_threshold: pendingThreshold,
        progress_threshold: progressThreshold
      };
      
      if (data) {
        const { error } = await supabase
          .from('escalation_settings')
          .update(settingsData)
          .eq('id', data.id);
          
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('escalation_settings')
          .insert([settingsData]);
          
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

  const setupEscalationCron = async () => {
    setIsSettingUpCron(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-cron');
      
      if (error) {
        throw error;
      }
      
      toast.success("Escalation schedule configured successfully");
      setIsCronSetup(true);
    } catch (error: any) {
      console.error("Error setting up escalation schedule:", error);
      toast.error("Failed to set up escalation schedule");
    } finally {
      setIsSettingUpCron(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="mr-2 h-5 w-5" />
          Escalation Email Settings
        </CardTitle>
        <CardDescription className="text-left">
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
            <div className="flex flex-col sm:flex-row gap-2 text-left">
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
              <div className="flex sm:items-end pt-2 sm:pt-0">
                <Button onClick={handleAddEmail} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            
            <div>
              {/* <Label>Current Escalation Emails</Label> */}
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
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium">Escalation Timing Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label htmlFor="pending-threshold">
                    Pending Request Threshold (minutes)
                  </Label>
                  <Input
                    id="pending-threshold"
                    type="number"
                    min="1"
                    max="300"
                    value={pendingThreshold}
                    onChange={(e) => setPendingThreshold(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Requests will be escalated if they remain pending for longer than this time
                  </p>
                </div>
                
                <div className="space-y-2 text-left">
                  <Label htmlFor="progress-threshold">
                    In-Progress Request Threshold (minutes)
                  </Label>
                  <Input
                    id="progress-threshold"
                    type="number"
                    min="1"
                    max="300"
                    value={progressThreshold}
                    onChange={(e) => setProgressThreshold(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    In-progress requests will be escalated if they aren't completed within this time
                  </p>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="border-t pt-4">
              <Label className="mb-2 block text-left">Automatic Escalation</Label>
              <div className="bg-accent/50 rounded-md p-4 text-sm space-y-2 text-left">
                <p>When enabled, the system will automatically:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Escalate requests that remain <strong>pending</strong> for more than <strong>{pendingThreshold} minutes</strong></li>
                  <li>Escalate requests that remain <strong>in progress</strong> for more than <strong>{progressThreshold} minutes</strong></li>
                </ul>
                <p className="mt-2 text-left">Escalated requests will trigger email notifications to all configured addresses above.</p>
                <p className="text-xs italic mt-2 text-left">Note: The escalation check runs automatically every 5 minutes.</p>
              </div>
              <div className="mt-3 flex justify-center sm:justify-start">
                <Button 
                  variant="outline" 
                  onClick={setupEscalationCron}
                  disabled={isSettingUpCron || isCronSetup}
                  className="w-full sm:w-auto"
                >
                  {isSettingUpCron ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                      Setting Up...
                    </>
                  ) : isCronSetup ? (
                    "Escalation Schedule Configured"
                  ) : (
                    "Setup Automatic Escalation"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving || isLoading} 
          className="w-full"
        >
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
