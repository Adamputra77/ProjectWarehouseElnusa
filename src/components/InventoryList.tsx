import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Filter, MoreVertical, Download, QrCode, Edit, Trash2, Package } from 'lucide-react';
import { WarehouseItem } from '@/types/warehouse';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

interface InventoryListProps {
  items: WarehouseItem[];
  isAdmin?: boolean;
  onItemClick: (item: WarehouseItem) => void;
  onShowQR?: (item: WarehouseItem) => void;
  onEdit?: (item: WarehouseItem) => void;
  onDelete?: (item: WarehouseItem) => void;
  onExport?: () => void;
  onPrintLabels?: () => void;
  selectedItems?: string[];
  onToggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
}

export function InventoryList({ 
  items, 
  isAdmin, 
  onItemClick, 
  onShowQR, 
  onEdit, 
  onDelete, 
  onExport, 
  onPrintLabels,
  selectedItems = [],
  onToggleSelect,
  onSelectAll
}: InventoryListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allSelected = filteredItems.length > 0 && filteredItems.every(i => selectedItems.includes(i.id));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search spareparts, SKU, category..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none">
            <Filter size={16} />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 flex-1 sm:flex-none" onClick={onExport}>
            <Download size={16} />
            Export
          </Button>
          <Button 
            variant={selectedItems.length > 0 ? "default" : "outline"} 
            className={cn(
              "gap-2 flex-1 sm:flex-none",
              selectedItems.length > 0 ? "bg-elnusa-blue" : "border-elnusa-blue/20 text-elnusa-blue hover:bg-elnusa-blue/5"
            )} 
            onClick={onPrintLabels}
          >
            <QrCode size={16} />
            {selectedItems.length > 0 ? `Labels (${selectedItems.length})` : 'Labels'}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input 
                  type="checkbox" 
                  className="rounded border-gray-300 text-elnusa-blue focus:ring-elnusa-blue"
                  checked={allSelected}
                  onChange={() => onSelectAll?.(allSelected ? [] : filteredItems.map(i => i.id))}
                />
              </TableHead>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Sparepart Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No spareparts found.
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "cursor-pointer hover:bg-muted/50 transition-colors group",
                    selectedItems.includes(item.id) && "bg-elnusa-blue/5"
                  )}
                  onClick={() => onItemClick(item)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300 text-elnusa-blue focus:ring-elnusa-blue"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => onToggleSelect?.(item.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden border shadow-sm">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <Package className="text-muted-foreground/40" size={20} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-bold group-hover:text-elnusa-blue transition-colors">{item.name}</TableCell>
                  <TableCell className="font-mono text-xs font-bold text-elnusa-blue">{item.sku}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-muted/50 text-[10px] uppercase font-bold">
                      {item.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={cn(
                      "font-mono font-bold text-lg",
                      item.quantity <= 5 ? "text-destructive" : "text-foreground"
                    )}>
                      {item.quantity}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-muted-foreground text-xs uppercase tracking-wider">{item.location}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <MoreVertical size={16} />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onItemClick(item)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onShowQR?.(item)}>
                          <QrCode className="mr-2 h-4 w-4" />
                          <span>Show QR Code</span>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuItem onClick={() => onEdit?.(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Sparepart</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive" 
                              onClick={() => onDelete?.(item)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Sparepart</span>
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>Inbound Stock</DropdownMenuItem>
                        <DropdownMenuItem>Outbound Stock</DropdownMenuItem>
                        <DropdownMenuItem>Borrow Sparepart</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
