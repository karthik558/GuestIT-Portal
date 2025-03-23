
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      setIsLoading(false);
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
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="heading-2">Request WiFi Assistance</h2>
        <p className="subtitle">
          Fill out this form and our IT team will assist you shortly
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="John Doe"
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
              placeholder="john.doe@example.com"
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
  );
}
