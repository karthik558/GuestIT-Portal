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
import { UserPlus, Pencil, RefreshCw, Info } from "lucide-react";

export function AdminUsers() {
  const [users, setUsers] = useState<AssignmentProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AssignmentProps | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "", // Added for new user creation
    name: "",
    role: "user" as UserRole,
    team: "",
    can_escalate: false,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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
            email: formData.email,
          })
          .eq('id', editingUser.id);
        
        if (profileError) throw profileError;
        
        toast.success("User updated successfully");
      } else {
        // Create new user
        if (!formData.email || !formData.password) {
          toast.error("Email and password are required");
          return;
        }
        
        // Create the user through Supabase's built-in signup
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.name,
            }
          }
        });
        
        if (signUpError) {
          toast.error("Failed to create user account", {
            description: signUpError.message
          });
          return;
        }
        
        if (!authData.user) {
          toast.error("Failed to create user - no user returned");
          return;
        }
        
        // Create or update the profile with additional information
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            first_name: formData.name,
            role: formData.role,
            team: formData.team,
            can_escalate: formData.can_escalate,
            email: formData.email,
          });
        
        if (profileError) {
          toast.error("User created but profile update failed", {
            description: profileError.message
          });
        } else {
          toast.success("User created successfully", {
            description: "An email confirmation has been sent."
          });
        }
      }
      
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error saving user:", error);
      const message = error instanceof Error ? error.message : "Failed to save user";
      toast.error(message);
    }
  };

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
        
        // Format profiles with better display names
        const formattedUsers = profiles.map(profile => {
          return {
            id: profile.id,
            name: profile.first_name || 'Unnamed User',
            email: profile.email || '',
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
      
      // Create combined user list with full information
      const formattedUsers = authData.users.map(user => {
        const profile = userProfiles.get(user.id);
        return {
          id: user.id,
          name: profile?.first_name || user.user_metadata?.name || 'Unnamed User',
          email: user.email || profile?.email || '',
          role: (profile?.role as UserRole) || 'user',
          team: profile?.team || '',
          can_escalate: profile?.can_escalate || false,
        };
      });
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      const message = error instanceof Error ? error.message : "Please try again later";
      toast.error("Failed to load users", {
        description: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean | UserRole) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user: AssignmentProps) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: "", // Reset password field when editing
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
      password: "",
      name: "",
      role: "user",
      team: "",
      can_escalate: false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          {/* <h2 className="text-2xl font-bold">User Management</h2> */}
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
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-left">Name</TableHead>
                <TableHead className="text-left">Email / ID</TableHead>
                <TableHead className="text-left">Role</TableHead>
                <TableHead className="text-left">Team</TableHead>
                <TableHead className="text-left">Escalation</TableHead>
                <TableHead className="text-left">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-left">{user.name}</TableCell>
                    <TableCell className="text-left max-w-[200px] truncate">{user.email}</TableCell>
                    <TableCell className="text-left">
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className={user.role === 'admin' ? 'bg-primary' : ''}
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-left">{user.team || 'N/A'}</TableCell>
                    <TableCell className="text-left">
                      {user.can_escalate ? 
                        <Badge className="bg-green-600">Allowed</Badge> : 
                        <Badge variant="outline">Not allowed</Badge>
                      }
                    </TableCell>
                    <TableCell className="text-left">
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Edit User' : 'Add New User'}
            </DialogTitle>
            <DialogDescription>
              {editingUser 
                ? 'Update user details and permissions' 
                : 'Create a new user account with the specified permissions'}
            </DialogDescription>
          </DialogHeader>
          
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
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="user@example.com"
                disabled={editingUser !== null}
              />
            </div>
            
            {!editingUser && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  className="col-span-3"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
            )}
            
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
