import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Plus, 
  History,
  FileText,
  ArrowRight,
  Package,
  User,
  Clock
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
import { cn } from '@/lib/utils';
import { SparepartItem, AuditSession, AuditRecord } from '@/types/warehouse';
import { format } from 'date-fns';

interface AuditModuleProps {
  items: SparepartItem[];
  activeSession: AuditSession | null;
  auditRecords: AuditRecord[];
  onStartAudit: () => void;
  onCompleteAudit: (sessionId: string) => void;
  onVerifyItem: (data: { itemId: string; physicalQty: number }) => void;
  onExportAudit?: (session: AuditSession, records: AuditRecord[]) => void;
  isAdmin?: boolean;
}

export function AuditModule({ 
  items, 
  activeSession, 
  auditRecords, 
  onStartAudit, 
  onCompleteAudit, 
  onVerifyItem,
  onExportAudit,
  isAdmin 
}: AuditModuleProps) {
  const [search, setSearch] = useState('');
  const [physicalQty, setPhysicalQty] = useState<string>('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.sku.toLowerCase().includes(search.toLowerCase())
  );

  const getRecordForItem = (itemId: string) => {
    return auditRecords.find(r => r.itemId === itemId);
  };

  const handleVerify = () => {
    if (selectedItemId && physicalQty !== '') {
      onVerifyItem({ 
        itemId: selectedItemId, 
        physicalQty: parseInt(physicalQty) 
      });
      setSelectedItemId(null);
      setPhysicalQty('');
    }
  };

  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-elnusa-blue/10 rounded-full flex items-center justify-center">
          <ClipboardCheck size={48} className="text-elnusa-blue" />
        </div>
        <div className="space-y-2 max-w-md">
          <h2 className="text-2xl font-black uppercase tracking-tight">Sparepart Audit Module</h2>
          <p className="text-muted-foreground text-sm">
            Mulai sesi audit baru untuk memverifikasi jumlah stok fisik sparepart dengan data sistem.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={onStartAudit} className="bg-elnusa-blue hover:bg-elnusa-blue/90 font-bold gap-2 h-12 px-8">
            <Play size={18} />
            Mulai Audit Baru
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card className="border-none shadow-xl bg-zinc-900 text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-elnusa-yellow/10 skew-x-[-20deg] translate-x-16" />
        <CardHeader className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-elnusa-yellow rounded-2xl">
                <Clock size={24} className="text-elnusa-blue" />
              </div>
              <div>
                <CardTitle className="text-xl uppercase font-black tracking-widest">Audit Session Ongoing</CardTitle>
                <CardDescription className="text-white/50 font-bold uppercase text-[10px]">
                  Started on {activeSession.startDate ? format(activeSession.startDate.toDate(), 'dd MMM yyyy HH:mm') : '...'} by {activeSession.createdBy}
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right mr-2">
                <p className="text-[10px] uppercase font-black text-white/40">Progress</p>
                <p className="text-2xl font-black">{activeSession.verifiedItems} / {activeSession.totalItems}</p>
              </div>
              {onExportAudit && (
                <Button 
                  onClick={() => onExportAudit(activeSession, auditRecords)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold gap-2"
                >
                  <FileText size={16} />
                  Export
                </Button>
              )}
              {isAdmin && (
                <Button 
                  onClick={() => onCompleteAudit(activeSession.id)}
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold"
                >
                  Selesaikan Audit
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Verification Panel */}
        <Card className="md:col-span-1 border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              Verifikasi Sparepart
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input 
                placeholder="Cari SKU atau Nama..." 
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-auto pr-2">
              {filteredItems.map(item => {
                const record = getRecordForItem(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all group",
                      selectedItemId === item.id 
                        ? "border-elnusa-blue bg-elnusa-blue/5" 
                        : "border-zinc-100 hover:border-elnusa-blue/30",
                      record && "opacity-60 bg-zinc-50"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-black text-xs uppercase tracking-tight">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">{item.sku}</p>
                      </div>
                      {record ? (
                        <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[8px]">
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[8px]">{item.quantity} Sys</Badge>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedItemId && (
              <div className="pt-4 border-t space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="p-3 bg-muted rounded-xl">
                  <p className="text-[10px] uppercase font-black text-muted-foreground mb-1">Input Physical Count</p>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Qty Fisik" 
                      className="font-black text-lg h-12"
                      value={physicalQty}
                      onChange={(e) => setPhysicalQty(e.target.value)}
                    />
                    <Button 
                      onClick={handleVerify}
                      className="bg-elnusa-blue h-12 px-6 font-bold"
                    >
                      Verify
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Results Table */}
        <Card className="md:col-span-2 border-none shadow-xl overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
              <History size={18} className="text-elnusa-blue" />
              Hasil Audit Real-time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20">
                  <TableHead className="text-[10px] uppercase font-black">Sparepart</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-center">System</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-center">Physical</TableHead>
                  <TableHead className="text-[10px] uppercase font-black text-center">Variance</TableHead>
                  <TableHead className="text-[10px] uppercase font-black">Verified By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <Package size={32} className="opacity-20" />
                        <p className="text-xs font-bold uppercase tracking-widest">Belum ada sparepart terverifikasi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  auditRecords.map(record => {
                    const item = items.find(i => i.id === record.itemId);
                    return (
                      <TableRow key={record.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="font-bold text-xs">{item?.name}</div>
                          <div className="text-[10px] opacity-50">{item?.sku}</div>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">{record.systemQty}</TableCell>
                        <TableCell className="text-center font-black text-xs">{record.physicalQty}</TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={record.variance === 0 ? 'outline' : 'destructive'}
                            className={cn(
                              "text-[10px] font-black",
                              record.variance === 0 ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                            )}
                          >
                            {record.variance > 0 ? `+${record.variance}` : record.variance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-elnusa-blue/10 flex items-center justify-center">
                              <User size={12} className="text-elnusa-blue" />
                            </div>
                            <div className="text-[10px] font-bold uppercase">{record.verifiedBy}</div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
