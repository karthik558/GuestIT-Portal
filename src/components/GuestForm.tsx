
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
import { submitWifiRequest, WifiRequestFormData } from "@/utils/formSubmission";

export function GuestForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<WifiRequestFormData>({
    name: "",
    email: "",
    room_number: "",
    device_type: "smartphone",
    issue_type: "connect",
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
    if (name === "deviceType") {
      setFormData((prev) => ({ 
        ...prev, 
        device_type: value as "smartphone" | "laptop" | "tablet" | "other"
      }));
    } else if (name === "issueType") {
      setFormData((prev) => ({ 
        ...prev, 
        issue_type: value as "connect" | "slow" | "disconnect" | "login" | "other"
      }));
    }
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
      if (!formData.name || !formData.email || !formData.room_number || !formData.device_type || !formData.issue_type) {
        throw new Error("Please fill in all required fields");
      }
      
      // Submit using our utility function
      const result = await submitWifiRequest(formData);
      
      if (!result.success) {
        throw result.error;
      }
      
      // Store the submitted request ID
      if (result.data) {
        setSubmittedRequestId(result.data.id);
        setIsSuccessDialogOpen(true);
      }
      
      if (permission === "granted") {
        showNotification("WiFi Request Submitted", "Your request has been received and will be processed shortly.");
      }
      
      // Reset form after submission
      setFormData({
        name: "",
        email: "",
        room_number: "",
        device_type: "smartphone",
        issue_type: "connect",
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
            <Label htmlFor="room_number">Room Number</Label>
            <Input
              id="room_number"
              name="room_number"
              placeholder="e.g. 101"
              required
              value={formData.room_number}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="device_type">Device Type</Label>
            <Select 
              value={formData.device_type} 
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
            <Label htmlFor="issue_type">Issue Type</Label>
            <Select 
              value={formData.issue_type} 
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
