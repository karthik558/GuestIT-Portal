
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export function RequestTracker() {
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [request, setRequest] = useState<any>(null);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<any[]>([]);

  const handleSearch = async () => {
    if (!requestId.trim()) {
      toast.error("Please enter a request ID");
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the request details
      const { data: requestData, error: requestError } = await supabase
        .from('wifi_requests')
        .select('*')
        .eq('id', requestId)
        .single();

      if (requestError) {
        toast.error("Request not found", {
          description: "The request ID you entered is not valid or does not exist.",
        });
        setRequest(null);
        setComments([]);
        return;
      }

      // Fetch comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      if (commentsError) {
        console.error("Error fetching comments:", commentsError);
      }

      setRequest(requestData);
      setComments(commentsData || []);
    } catch (error) {
      console.error("Error searching for request:", error);
      toast.error("Something went wrong", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('request_comments')
        .insert([{
          request_id: requestId,
          user_name: "Guest",
          comment_text: comment,
        }]);

      if (error) throw error;

      toast.success("Comment added successfully");
      
      // Refresh comments
      const { data: commentsData } = await supabase
        .from('request_comments')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: true });

      setComments(commentsData || []);
      setComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to add comment", {
        description: "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'in-progress':
        return <Badge variant="default" className="bg-blue-500">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
      case 'escalated':
        return <Badge variant="default" className="bg-red-500">Escalated</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2 text-center">
        <h2 className="heading-2">Track Your Request</h2>
        <p className="subtitle">
          Enter your request ID to check the status and communicate with IT staff
        </p>
      </div>
      
      <Separator />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        <div className="flex-1 space-y-2 w-full">
          <Label htmlFor="requestId">Request ID</Label>
          <Input
            id="requestId"
            placeholder="Enter your request ID"
            value={requestId}
            onChange={(e) => setRequestId(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={isLoading}
          className="mb-[2px] w-full sm:w-auto"
        >
          {isLoading ? "Searching..." : "Track Request"}
        </Button>
      </div>
      
      {request && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Request Details</span>
                {getStatusBadge(request.status)}
              </CardTitle>
              <CardDescription>
                Submitted on {formatDate(request.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <p className="font-medium">{request.name}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{request.email}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Room Number</Label>
                  <p className="font-medium">{request.room_number}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Device Type</Label>
                  <p className="font-medium capitalize">{request.device_type}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Issue Type</Label>
                  <p className="font-medium capitalize">{request.issue_type}</p>
                </div>
              </div>
              
              {request.description && (
                <div>
                  <Label className="text-sm text-muted-foreground">Description</Label>
                  <p className="whitespace-pre-wrap">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>
                Stay updated on your request status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg ${
                        comment.user_name === "Guest" 
                          ? "bg-accent ml-8" 
                          : "bg-primary/10 mr-8"
                      }`}
                    >
                      <div className="flex justify-between mb-1">
                        <p className="font-medium text-sm">
                          {comment.user_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </p>
                      </div>
                      <p className="whitespace-pre-wrap">{comment.comment_text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No comments yet</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="comment">Add Comment</Label>
                <Textarea
                  id="comment"
                  placeholder="Type your message here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={isLoading || !comment.trim()}
                  className="w-full mt-2"
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
