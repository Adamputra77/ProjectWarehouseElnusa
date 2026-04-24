import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldAlert, 
  Mail, 
  Search,
  MoreVertical,
  Trash2,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserProfile, UserRole } from '@/types/warehouse';
import { cn } from '@/lib/utils';

interface UserManagementProps {
  users: UserProfile[];
  onUpdateRole: (userId: string, role: UserRole) => void;
  onDeleteUser: (userId: string) => void;
}

export function UserManagement({ users, onUpdateRole, onDeleteUser }: UserManagementProps) {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-elnusa-blue uppercase tracking-tight">User Management</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage staff access and roles for the sparepart management system.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 h-11 font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-elnusa-blue rounded-xl">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-sm uppercase font-black tracking-widest">System Users</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Total {users.length} registered accounts</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="text-[10px] uppercase font-black">User Profile</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Email Address</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Role</TableHead>
                <TableHead className="text-[10px] uppercase font-black text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Users size={32} className="opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No users found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map(user => (
                  <TableRow key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-elnusa-blue/10">
                          <AvatarImage src={user.photoUrl} />
                          <AvatarFallback className="bg-elnusa-blue/10 text-elnusa-blue font-black">
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-black text-xs uppercase tracking-tight">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">ID: {user.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                        <Mail size={12} />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={user.role === 'admin' ? 'default' : 'outline'}
                        className={cn(
                          "text-[9px] uppercase font-black px-2 py-0.5",
                          user.role === 'admin' 
                            ? "bg-elnusa-yellow text-elnusa-blue border-none" 
                            : "bg-zinc-100 text-zinc-600 border-zinc-200"
                        )}
                      >
                        {user.role === 'admin' ? (
                          <span className="flex items-center gap-1"><Shield size={10} /> Admin</span>
                        ) : (
                          <span className="flex items-center gap-1"><UserCheck size={10} /> Staff</span>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical size={16} />
                          </Button>
                        } />
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                          <DropdownMenuItem 
                            className="rounded-lg font-bold text-xs gap-2 cursor-pointer"
                            onClick={() => onUpdateRole(user.id, user.role === 'admin' ? 'staff' : 'admin')}
                          >
                            {user.role === 'admin' ? <ShieldAlert size={14} /> : <Shield size={14} />}
                            Change to {user.role === 'admin' ? 'Staff' : 'Admin'}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="rounded-lg font-bold text-xs gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                            onClick={() => onDeleteUser(user.id)}
                          >
                            <Trash2 size={14} />
                            Remove Access
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-none shadow-lg bg-elnusa-blue text-white overflow-hidden relative">
          <div className="absolute right-[-5%] top-[-10%] opacity-10">
            <Shield size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-sm uppercase font-black tracking-widest">Admin Privileges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs font-medium opacity-80">Admins can manage inventory, start audits, manage users, and view full transaction history.</p>
            <div className="pt-2">
              <Badge className="bg-elnusa-yellow text-elnusa-blue border-none font-black text-[9px]">FULL ACCESS</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg bg-zinc-900 text-white overflow-hidden relative">
          <div className="absolute right-[-5%] top-[-10%] opacity-10">
            <UserCheck size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-sm uppercase font-black tracking-widest">Staff Privileges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-xs font-medium opacity-80">Staff can perform stock in/out, borrow items, and scan QR codes for quick info.</p>
            <div className="pt-2">
              <Badge className="bg-white/20 text-white border-none font-black text-[9px]">LIMITED ACCESS</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
