import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  MapPin, 
  MoreVertical, 
  Trash2, 
  Edit,
  ExternalLink,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Supplier } from '@/types/warehouse';
import { cn } from '@/lib/utils';

interface SupplierManagementProps {
  suppliers: Supplier[];
  onAddSupplier: (data: any) => void;
  onUpdateSupplier: (id: string, data: any) => void;
  onDeleteSupplier: (id: string) => void;
  isAdmin: boolean;
}

export function SupplierManagement({ suppliers, onAddSupplier, onUpdateSupplier, onDeleteSupplier, isAdmin }: SupplierManagementProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.category?.toLowerCase().includes(search.toLowerCase()) ||
    s.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = {
      name: formData.get('name'),
      contactPerson: formData.get('contactPerson'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      address: formData.get('address'),
      category: formData.get('category'),
      notes: formData.get('notes'),
    };

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, data);
    } else {
      onAddSupplier(data);
    }
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-elnusa-blue uppercase tracking-tight">Supplier Management</h2>
          <p className="text-muted-foreground text-sm font-medium">Manage your vendor database and contact information.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input 
              placeholder="Search suppliers..." 
              className="pl-10 h-11 font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {isAdmin && (
            <Button 
              className="bg-elnusa-blue hover:bg-elnusa-blue/90 h-11 font-black uppercase tracking-widest gap-2"
              onClick={() => {
                setEditingSupplier(null);
                setIsModalOpen(true);
              }}
            >
              <Plus size={18} />
              Add Supplier
            </Button>
          )}
        </div>
      </div>

      <Card className="border-none shadow-xl overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-elnusa-blue rounded-xl">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <CardTitle className="text-sm uppercase font-black tracking-widest">Vendor List</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">Total {suppliers.length} active suppliers</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="text-[10px] uppercase font-black">Company Name</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Contact Person</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Category</TableHead>
                <TableHead className="text-[10px] uppercase font-black">Contact Info</TableHead>
                <TableHead className="text-[10px] uppercase font-black text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Building2 size={32} className="opacity-20" />
                      <p className="text-xs font-bold uppercase tracking-widest">No suppliers found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSuppliers.map(supplier => (
                  <TableRow key={supplier.id} className="hover:bg-muted/30 transition-colors group">
                    <TableCell>
                      <div>
                        <p className="font-black text-xs uppercase tracking-tight">{supplier.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
                          <MapPin size={10} /> {supplier.address || 'No address'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <User size={12} className="text-elnusa-blue" />
                        {supplier.contactPerson || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[9px] uppercase font-black bg-white">
                        {supplier.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {supplier.email && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Mail size={10} /> {supplier.email}
                          </div>
                        )}
                        {supplier.phone && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                            <Phone size={10} /> {supplier.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={16} />
                            </Button>
                          } />
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                            <DropdownMenuItem 
                              className="rounded-lg font-bold text-xs gap-2 cursor-pointer"
                              onClick={() => {
                                setEditingSupplier(supplier);
                                setIsModalOpen(true);
                              }}
                            >
                              <Edit size={14} />
                              Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="rounded-lg font-bold text-xs gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                              onClick={() => onDeleteSupplier(supplier.id)}
                            >
                              <Trash2 size={14} />
                              Delete Supplier
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-black text-elnusa-blue uppercase tracking-tight">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest">
                Enter vendor details for the sparepart database.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] uppercase font-black">Company Name</Label>
                  <Input id="name" name="name" defaultValue={editingSupplier?.name} required className="h-11 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-[10px] uppercase font-black">Category</Label>
                  <Input id="category" name="category" defaultValue={editingSupplier?.category} placeholder="e.g. Electrical, PPE" className="h-11 font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-[10px] uppercase font-black">Contact Person</Label>
                  <Input id="contactPerson" name="contactPerson" defaultValue={editingSupplier?.contactPerson} className="h-11 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] uppercase font-black">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={editingSupplier?.phone} className="h-11 font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] uppercase font-black">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={editingSupplier?.email} className="h-11 font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-[10px] uppercase font-black">Office Address</Label>
                <Input id="address" name="address" defaultValue={editingSupplier?.address} className="h-11 font-bold" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[10px] uppercase font-black">Notes</Label>
                <Input id="notes" name="notes" defaultValue={editingSupplier?.notes} className="h-11 font-bold" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="font-bold">Cancel</Button>
              <Button type="submit" className="bg-elnusa-blue hover:bg-elnusa-blue/90 font-black uppercase tracking-widest">
                {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
