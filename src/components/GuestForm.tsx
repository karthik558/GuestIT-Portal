
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export function GuestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roomNumber: "",
    deviceType: "",
    issueType: "",
    description: ""
  });
  const [submittedRequestId, setSubmittedRequestId] = useState<string | null>(null);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const { permission, requestPermission, showNotification } = useNotifications();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyRequestId = () => {
    if (submittedRequestId) {
      navigator.clipboard.writeText(submittedRequestId);
      toast.success("Request ID copied to clipboard");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Submitting form data:", formData);
      
      // Validate required fields
      if (!formData.name || !formData.email || !formData.roomNumber || !formData.deviceType || !formData.issueType) {
        throw new Error("Please fill in all required fields");
      }
      
      // Submit data to Supabase
      const { data, error } = await supabase
        .from('wifi_requests')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            room_number: formData.roomNumber,
            device_type: formData.deviceType as any,
            issue_type: formData.issueType as any,
            description: formData.description,
            status: "pending"
          }
        ])
        .select();
      
      console.log("Supabase response:", { data, error });
      
      if (error) throw error;
      
      // Store the submitted request ID
      if (data && data.length > 0) {
        setSubmittedRequestId(data[0].id);
        setIsSuccessDialogOpen(true);
        
        // Request notification permission and show notification for admin
        if (permission !== "granted") {
          await requestPermission();
        }
        
        // Show notification for admin when a new request is submitted
        // You would want this to happen on the admin side, not the guest side
        // We'll implement this separately in the admin component
      }
      
      toast.success("Your WiFi assistance request has been submitted!", {
        description: "An IT staff member will assist you shortly.",
      });
      
      // Reset form after submission
      setFormData({
        name: "",
        email: "",
        roomNumber: "",
        deviceType: "",
        issueType: "",
        description: ""
      });
    } catch (error: any) {
      console.error("Error submitting request:", error);
      toast.error("Failed to submit request", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="form-container space-y-6 animate-fade-in">
        <div className="space-y-2 text-center">
          <h2 className="heading-2">Request WiFi Assistance</h2>
          <p className="subtitle">
            Fill out this form and our IT team will assist you shortly
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Name"
                required
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="mail@example.com"
                required
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              name="roomNumber"
              placeholder="e.g. 101"
              required
              value={formData.roomNumber}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select 
              value={formData.deviceType} 
              onValueChange={(value) => handleSelectChange("deviceType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select device type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="smartphone">Smartphone</SelectItem>
                <SelectItem value="laptop">Laptop</SelectItem>
                <SelectItem value="tablet">Tablet</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="issueType">Issue Type</Label>
            <Select 
              value={formData.issueType} 
              onValueChange={(value) => handleSelectChange("issueType", value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select issue type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="connect">Cannot Connect</SelectItem>
                <SelectItem value="slow">Slow Connection</SelectItem>
                <SelectItem value="disconnect">Keeps Disconnecting</SelectItem>
                <SelectItem value="login">Login Problems</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Please describe your issue in detail..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Submitting..." : "Submit Request"}
        </Button>
      </form>
      
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Submitted Successfully</DialogTitle>
            <DialogDescription>
              Your WiFi assistance request has been received. Please keep your request ID for tracking.
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-accent rounded-md flex justify-between items-center">
            <span className="font-mono font-medium break-all">{submittedRequestId}</span>
            <Button variant="outline" size="icon" onClick={handleCopyRequestId}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            You can use this ID on the "Track Request" tab to check your request status and communicate with our IT team.
          </p>
          
          <DialogFooter>
            <Button onClick={() => setIsSuccessDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
