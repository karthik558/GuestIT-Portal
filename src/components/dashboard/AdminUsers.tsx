
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { UserRole, AssignmentProps } from "@/types/user";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Pencil, RefreshCw } from "lucide-react";

export function AdminUsers() {
  const [users, setUsers] = useState<AssignmentProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AssignmentProps | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "user" as UserRole,
    team: "",
    can_escalate: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Get auth users
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Auth error:", authError);
        // Fallback to profiles table only
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
        
        if (profilesError) throw profilesError;
        
        // Format profiles without auth data
        const formattedUsers = profiles.map(profile => {
          return {
            id: profile.id,
            name: profile.first_name || 'Unknown',
            email: "User ID: " + profile.id.substring(0, 8) + "...",
            role: (profile.role as UserRole) || 'user',
            team: profile.team || '',
            can_escalate: profile.can_escalate || false,
          };
        });
        
        setUsers(formattedUsers);
        setIsLoading(false);
        return;
      }
      
      // Get profiles to match with auth users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      // Map profiles to users
      const userProfiles = new Map();
      profiles.forEach(profile => {
        userProfiles.set(profile.id, profile);
      });
      
      // Create combined user list
      const formattedUsers = authData.users.map(user => {
        const profile = userProfiles.get(user.id);
        return {
          id: user.id,
          name: profile?.first_name || user.user_metadata?.name || 'Unknown',
          email: user.email || "No email",
          role: (profile?.role as UserRole) || 'user',
          team: profile?.team || '',
          can_escalate: profile?.can_escalate || false,
        };
      });
      
      setUsers(formattedUsers);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users", {
        description: error.message || "Please try again later",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditUser = (user: AssignmentProps) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      name: user.name,
      role: user.role,
      team: user.team || '',
      can_escalate: user.can_escalate,
    });
    setIsDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      email: "",
      name: "",
      role: "user",
      team: "",
      can_escalate: false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingUser) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            role: formData.role,
            first_name: formData.name,
            team: formData.team,
            can_escalate: formData.can_escalate,
          })
          .eq('id', editingUser.id);
        
        if (profileError) throw profileError;
        
        toast.success("User updated successfully");
      } else {
        // Create new user
        // Note: The user must be created through the auth signup process first
        // This is a limitation of Supabase's RLS and auth system
        toast.error("Direct user creation is not supported", {
          description: "Users must sign up through the authentication flow first.",
        });
        setIsDialogOpen(false);
        return;
      }
      
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error("Error saving user:", error);
      toast.error(error.message || "Failed to save user");
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user access and permissions</p>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={fetchUsers}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Button 
            onClick={handleAddUser} 
            className="flex items-center"
            disabled={true}
            title="Direct user creation is not supported. Users must sign up through the authentication flow."
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email / ID</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Escalation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{user.email}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className={user.role === 'admin' ? 'bg-primary' : ''}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.team || 'N/A'}</TableCell>
                    <TableCell>
                      {user.can_escalate ? 
                        <Badge className="bg-green-600">Allowed</Badge> : 
                        <Badge variant="outline">Not allowed</Badge>
                      }
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditUser(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Update user details and permissions' 
                : 'Direct user creation is not supported. Users must sign up through the authentication flow.'}
            </DialogDescription>
          </DialogHeader>
          
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Display Name"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => handleChange('role', value as UserRole)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">
                  Team
                </Label>
                <Input
                  id="team"
                  className="col-span-3"
                  value={formData.team}
                  onChange={(e) => handleChange('team', e.target.value)}
                  placeholder="IT Support, Network, etc."
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="can-escalate" className="text-right">
                  Can Escalate
                </Label>
                <div className="flex items-center col-span-3">
                  <Switch
                    id="can-escalate"
                    checked={formData.can_escalate}
                    onCheckedChange={(checked) => handleChange('can_escalate', checked)}
                  />
                  <span className="ml-2 text-sm text-muted-foreground">
                    Allow user to receive escalation emails
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {editingUser && (
              <Button onClick={handleSubmit}>
                Update
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
