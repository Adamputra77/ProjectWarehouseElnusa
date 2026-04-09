import React from 'react';
import { WarehouseItem } from '@/types/warehouse';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapPin, Package, Search } from 'lucide-react';

interface LocationMapProps {
  items: WarehouseItem[];
}

export function LocationMap({ items }: LocationMapProps) {
  const [search, setSearch] = React.useState('');
  const zones = ['A', 'B', 'C', 'D', 'E'];
  const slots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const getItemsAt = (location: string) => {
    return items.filter(item => item.location === location);
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <MapPin size={20} className="text-elnusa-blue" />
            Warehouse Floor Map
          </CardTitle>
          <CardDescription>Visual distribution of items across storage zones</CardDescription>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-3 w-3" />
          <Input 
            placeholder="Search item location..." 
            className="pl-9 h-9 text-xs font-bold"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <div className="grid gap-6">
          {zones.map(zone => (
            <div key={zone} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-elnusa-blue text-white flex items-center justify-center font-black text-sm shadow-md">
                  {zone}
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Zone {zone}</span>
              </div>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {slots.map(slot => {
                  const loc = `${zone}-${slot.toString().padStart(2, '0')}`;
                  const itemsAtLoc = getItemsAt(loc);
                  const hasItems = itemsAtLoc.length > 0;
                  
                  const isMatch = search && itemsAtLoc.some(item => 
                    item.name.toLowerCase().includes(search.toLowerCase()) || 
                    item.sku.toLowerCase().includes(search.toLowerCase())
                  );
                  
                  return (
                    <div 
                      key={loc}
                      className={cn(
                        "aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-1 transition-all relative group",
                        hasItems 
                          ? "bg-elnusa-blue/5 border-elnusa-blue/20 shadow-sm" 
                          : "bg-muted/30 border-dashed border-muted-foreground/20",
                        isMatch ? "border-elnusa-yellow bg-elnusa-yellow/20 ring-4 ring-elnusa-yellow/20 animate-pulse scale-110 z-20" : ""
                      )}
                    >
                      <span className="text-[8px] font-bold opacity-30 absolute top-1 left-1">{slot}</span>
                      {hasItems ? (
                        <>
                          <Package size={14} className={cn(
                            "text-elnusa-blue animate-in fade-in zoom-in duration-300",
                            isMatch ? "text-elnusa-blue scale-125" : ""
                          )} />
                          <div className={cn(
                            "absolute inset-0 bg-elnusa-blue text-white rounded-xl transition-opacity flex flex-col items-center justify-center p-2 text-center z-10",
                            isMatch ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                          )}>
                            <p className="text-[8px] font-black leading-tight">{itemsAtLoc[0].name}</p>
                            <p className="text-[6px] font-bold mt-1">QTY: {itemsAtLoc[0].quantity}</p>
                          </div>
                        </>
                      ) : (
                        <div className="w-1 h-1 rounded-full bg-muted-foreground/20" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-dashed flex flex-wrap gap-6 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-elnusa-blue/20 border border-elnusa-blue/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Occupied Slot</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-muted/30 border border-dashed border-muted-foreground/20" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Empty Slot</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
