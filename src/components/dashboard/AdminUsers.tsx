
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
import { UserPlus, Pencil, Trash, RefreshCw } from "lucide-react";

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
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      const formattedUsers = users.map(user => ({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'Unknown',
        email: user.email || 'No email',
        role: (user.user_metadata?.role as UserRole) || 'user',
        team: user.user_metadata?.team || '',
        can_escalate: user.user_metadata?.can_escalate || false,
      }));
      
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
        const { error } = await supabase.auth.admin.updateUserById(
          editingUser.id,
          { 
            user_metadata: { 
              role: formData.role,
              name: formData.name,
              team: formData.team,
              can_escalate: formData.can_escalate,
            }
          }
        );
        
        if (error) throw error;
        
        toast.success("User updated successfully");
      } else {
        // Create new user
        const { error } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: "tempPassword123", // Users should change this
          email_confirm: true,
          user_metadata: { 
            role: formData.role,
            name: formData.name,
            team: formData.team,
            can_escalate: formData.can_escalate,
          }
        });
        
        if (error) throw error;
        
        toast.success("User created successfully");
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
          
          <Button onClick={handleAddUser} className="flex items-center">
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
                <TableHead>Email</TableHead>
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
                    <TableCell>{user.email}</TableCell>
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
                : 'Create a new user and set their access permissions'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {!editingUser && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="col-span-3"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
            )}
            
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
