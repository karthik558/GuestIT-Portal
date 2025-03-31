import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="w-full max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-left space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Track Your Request</h2>
        <p className="text-muted-foreground">
          Enter your request ID to check the status and communicate with IT staff
        </p>
      </div>
      
      <Card className="border-none shadow-none">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="requestId">Request ID</Label>
              <Input
                id="requestId"
                placeholder="Enter your request ID"
                value={requestId}
                onChange={(e) => setRequestId(e.target.value)}
                className="w-full"
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Searching..." : "Track Request"}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {request && (
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Request Details</CardTitle>
                  {getStatusBadge(request.status)}
                </div>
                <CardDescription>
                  Submitted on {formatDate(request.created_at)}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4">
                  {[
                    { label: "Name", value: request.name },
                    { label: "Email", value: request.email, noCapitalize: true },
                    { label: "Room Number", value: request.room_number },
                    { label: "Device Type", value: request.device_type },
                    { label: "Issue Type", value: request.issue_type },
                  ].map((field, index) => (
                    <div 
                      key={index}
                      className="bg-muted/50 p-3 rounded-md space-y-1"
                    >
                      <Label className="text-sm text-muted-foreground">
                        {field.label}
                      </Label>
                      <p className={`font-medium ${!field.noCapitalize ? 'capitalize' : ''}`}>
                        {field.value}
                      </p>
                    </div>
                  ))}
                  
                  {request.description && (
                    <div className="bg-muted/50 p-3 rounded-md space-y-1">
                      <Label className="text-sm text-muted-foreground">
                        Description
                      </Label>
                      <p className="whitespace-pre-wrap text-sm">
                        {request.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col space-y-2">
                <CardTitle className="text-xl">Communication</CardTitle>
                <CardDescription>
                  Stay updated on your request status
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {comments.length > 0 ? (
                      comments.map((comment, index) => (
                        <div 
                          key={index} 
                          className={`p-4 rounded-lg ${
                            comment.user_name === "Guest" 
                              ? "bg-accent" 
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <Label className="text-sm text-muted-foreground">
                              {comment.user_name}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-sm font-medium">
                            {comment.comment_text}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-left text-muted-foreground py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 p-3 rounded-md space-y-3">
                  <Label className="text-sm text-muted-foreground">
                    Add Comment
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Type your message here..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="resize-none bg-background"
                  />
                  <Button 
                    onClick={handleAddComment} 
                    disabled={isLoading || !comment.trim()}
                    className="w-full"
                  >
                    {isLoading ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
