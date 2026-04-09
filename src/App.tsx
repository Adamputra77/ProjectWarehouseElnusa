import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  Timestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { InventoryList } from './components/InventoryList';
import { Scanner } from './components/Scanner';
import { Login } from './components/Login';
import { WarehouseItem, InventoryTransaction, BorrowRecord } from './types/warehouse';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { InboundOutboundForm } from './components/InboundOutboundForm';
import { BorrowForm } from './components/BorrowForm';
import { ItemForm } from './components/ItemForm';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ScanLine, Package, Download } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<any[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [modalType, setModalType] = useState<'inbound' | 'outbound' | 'borrow' | 'qr' | 'add' | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const itemsUnsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseItem));
      setItems(itemsData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'items'));

    const txQuery = query(collection(db, 'transactions'), orderBy('timestamp', 'desc'));
    const txUnsubscribe = onSnapshot(txQuery, (snapshot) => {
      const txData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          time: data.timestamp ? format(data.timestamp.toDate(), 'HH:mm') : '...',
          date: data.timestamp ? format(data.timestamp.toDate(), 'dd MMM yyyy') : '...'
        };
      });
      setTransactions(txData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'transactions'));

    const borrowUnsubscribe = onSnapshot(collection(db, 'borrowRecords'), (snapshot) => {
      const borrowData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBorrowRecords(borrowData);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'borrowRecords'));

    return () => {
      itemsUnsubscribe();
      txUnsubscribe();
      borrowUnsubscribe();
    };
  }, [user]);

  // Auto-seed if empty (optional, but requested by user)
  useEffect(() => {
    if (user && items.length === 0 && !loading) {
      seedInitialData();
    }
  }, [user, items.length, loading]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Logged in successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to login");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
    } catch (error) {
      console.error(error);
    }
  };

  const handleTransaction = async (data: any) => {
    if (!user) return;
    try {
      if (modalType === 'add') {
        await addDoc(collection(db, 'items'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("Item added successfully");
        setModalType(null);
        return;
      }

      const item = items.find(i => i.id === data.itemId);
      if (!item) throw new Error("Item not found");

      const newQuantity = data.type === 'inbound' 
        ? item.quantity + data.quantity 
        : item.quantity - data.quantity;

      if (newQuantity < 0) throw new Error("Insufficient stock");

      // Update Item
      await updateDoc(doc(db, 'items', item.id), {
        quantity: newQuantity
      });

      // Add Transaction
      await addDoc(collection(db, 'transactions'), {
        itemId: item.id,
        itemName: item.name,
        type: data.type,
        quantity: data.quantity,
        userId: user.uid,
        userName: user.displayName,
        timestamp: serverTimestamp(),
        notes: data.notes
      });

      toast.success(`Stock ${data.type} successful`);
      setModalType(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    }
  };

  const handleBorrow = async (data: any) => {
    if (!user) return;
    try {
      const item = items.find(i => i.id === data.itemId);
      if (!item) throw new Error("Item not found");
      if (item.quantity < 1) throw new Error("Item out of stock");

      // Update Item Quantity
      await updateDoc(doc(db, 'items', item.id), {
        quantity: item.quantity - 1
      });

      // Add Borrow Record
      await addDoc(collection(db, 'borrowRecords'), {
        itemId: item.id,
        itemName: item.name,
        userId: user.uid,
        userName: user.displayName,
        borrowDate: serverTimestamp(),
        dueDate: data.dueDate ? Timestamp.fromDate(data.dueDate) : null,
        status: 'borrowed',
        notes: data.notes
      });

      // Add Transaction for tracking
      await addDoc(collection(db, 'transactions'), {
        itemId: item.id,
        itemName: item.name,
        type: 'outbound',
        quantity: 1,
        userId: user.uid,
        userName: user.displayName,
        timestamp: serverTimestamp(),
        notes: `Borrowed: ${data.notes || ''}`
      });

      toast.success("Item borrowed successfully");
      setModalType(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Borrowing failed");
    }
  };

  const handleScanSuccess = (sku: string) => {
    const item = items.find(i => i.sku === sku || i.qrCode === sku);
    if (item) {
      setSelectedItem(item);
      setModalType('inbound'); // Default to inbound or show options
      toast.info(`Item found: ${item.name}`);
    } else {
      toast.error(`No item found with SKU/QR: ${sku}`);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Exported ${filename} successfully`);
  };

  const seedInitialData = async () => {
    if (!user) return;
    try {
      const sampleItems = [
        { name: 'Drill Pipe 5" Range 2', sku: 'DP5R2-001', category: 'Drilling', quantity: 50, location: 'A-01', description: 'Standard drill pipe for oil & gas', qrCode: 'DP5R2-001' },
        { name: 'Gate Valve 2-1/16" 5K', sku: 'GV2116-002', category: 'Valves', quantity: 12, location: 'B-04', description: 'High pressure gate valve', qrCode: 'GV2116-002' },
        { name: 'Safety Harness Double Lanyard', sku: 'SHDL-003', category: 'PPE', quantity: 25, location: 'C-10', description: 'Fall protection equipment', qrCode: 'SHDL-003' },
        { name: 'Centrifugal Pump Repair Kit', sku: 'CPRK-004', category: 'Machinery', quantity: 8, location: 'D-02', description: 'Maintenance kit for pumps', qrCode: 'CPRK-004' },
        { name: 'Lubricant Shell Gadus S2', sku: 'LSGS2-005', category: 'Consumables', quantity: 100, location: 'E-05', description: 'Industrial grade grease', qrCode: 'LSGS2-005' },
      ];

      for (const item of sampleItems) {
        // Check if SKU already exists to avoid duplicates
        const existing = items.find(i => i.sku === item.sku);
        if (!existing) {
          await addDoc(collection(db, 'items'), item);
        }
      }
      toast.success("Sample data imported successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to import sample data");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-elnusa-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} loading={false} />;
  }

  const stats = {
    totalItems: items.length,
    lowStock: items.filter(i => i.quantity <= 5).length,
    borrowedItems: borrowRecords.filter(r => r.status === 'borrowed').length,
    recentTransactions: transactions.slice(0, 5),
    lowStockItems: items.filter(i => i.quantity <= 5).slice(0, 5)
  };

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          stats={stats} 
          onSeedData={seedInitialData} 
          onExportHistory={() => exportToCSV(transactions, 'Transaction_History')}
        />
      )}
      
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-elnusa-blue">Warehouse Inventory</h2>
            <Button 
              className="bg-elnusa-blue hover:bg-elnusa-blue/90 gap-2"
              onClick={() => setModalType('add')}
            >
              <Package size={18} />
              Add New Item
            </Button>
          </div>
          <InventoryList 
            items={items} 
            onItemClick={(item) => {
              setSelectedItem(item);
              setModalType('inbound');
            }} 
            onShowQR={(item) => {
              setSelectedItem(item);
              setModalType('qr');
            }}
            onExport={() => exportToCSV(items, 'Inventory_Gudang_BSD')}
          />
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="space-y-6 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-elnusa-blue">Scan Item QR/Barcode</h2>
          <p className="text-muted-foreground">Arahkan kamera ke Barcode barang atau masukkan SKU secara manual di bawah.</p>
          
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
            <Scanner onScanSuccess={handleScanSuccess} />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Atau Masukkan Manual</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Input 
                id="manual-sku" 
                placeholder="Masukkan SKU (Contoh: DP5R2-001)" 
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScanSuccess((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('manual-sku') as HTMLInputElement;
                  handleScanSuccess(input.value);
                  input.value = '';
                }}
                className="bg-elnusa-blue"
              >
                Cek
              </Button>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg text-sm text-left space-y-3">
            <h3 className="font-bold flex items-center gap-2">
              <ScanLine size={16} className="text-elnusa-blue" />
              Cara Pakai:
            </h3>
            <ol className="list-decimal list-inside space-y-2 opacity-80">
              <li><strong>Pake Kamera:</strong> Arahkan kotak kamera ke Barcode/QR Code di label barang.</li>
              <li><strong>Manual:</strong> Kalau kamera susah fokus, ketik aja kode SKU-nya di kotak atas terus klik "Cek".</li>
              <li><strong>Hasil:</strong> Kalau kodenya bener, nanti muncul menu buat nambah stok, kurangin stok, atau pinjem barang itu.</li>
            </ol>
            <div className="pt-2 border-t border-black/5">
              <p className="font-medium text-xs mb-1">SKU Contoh buat ngetes:</p>
              <div className="flex flex-wrap gap-1">
                {['DP5R2-001', 'GV2116-002', 'SHDL-003'].map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-elnusa-blue/10" onClick={() => handleScanSuccess(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'borrow' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-elnusa-blue">Active Borrowings</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {borrowRecords.filter(r => r.status === 'borrowed').map(record => (
              <div key={record.id} className="p-4 rounded-lg border bg-card shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold">{record.itemName}</h3>
                  <Badge>Borrowed</Badge>
                </div>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Staff:</strong> {record.userName}</p>
                  <p><strong>Date:</strong> {record.borrowDate ? format(record.borrowDate.toDate(), 'dd MMM yyyy') : '...'}</p>
                  {record.dueDate && (
                    <p className="text-destructive font-medium">
                      <strong>Due:</strong> {format(record.dueDate.toDate(), 'dd MMM yyyy')}
                    </p>
                  )}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-2"
                  onClick={async () => {
                    try {
                      const item = items.find(i => i.id === record.itemId);
                      if (item) {
                        await updateDoc(doc(db, 'items', item.id), {
                          quantity: item.quantity + 1
                        });
                      }
                      await updateDoc(doc(db, 'borrowRecords', record.id), {
                        status: 'returned',
                        returnDate: serverTimestamp()
                      });
                      await addDoc(collection(db, 'transactions'), {
                        itemId: record.itemId,
                        itemName: record.itemName,
                        type: 'inbound',
                        quantity: 1,
                        userId: user.uid,
                        userName: user.displayName,
                        timestamp: serverTimestamp(),
                        notes: `Returned: ${record.notes || ''}`
                      });
                      toast.success("Item returned successfully");
                    } catch (e) {
                      toast.error("Failed to return item");
                    }
                  }}
                >
                  Mark as Returned
                </Button>
              </div>
            ))}
            {borrowRecords.filter(r => r.status === 'borrowed').length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                No active borrowings.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-elnusa-blue">Transaction History</h2>
            <Button variant="outline" className="gap-2" onClick={() => exportToCSV(transactions, 'Transaction_History')}>
              <Download size={16} />
              Export CSV
            </Button>
          </div>
          <div className="rounded-md border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-left">Staff</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-t">
                    <td className="px-4 py-3">{tx.date} <span className="text-xs opacity-50">{tx.time}</span></td>
                    <td className="px-4 py-3 font-medium">{tx.itemName}</td>
                    <td className="px-4 py-3">
                      <Badge variant={tx.type === 'inbound' ? 'outline' : 'secondary'}>
                        {tx.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-bold">{tx.quantity}</td>
                    <td className="px-4 py-3">{tx.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <Dialog open={!!modalType} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {modalType === 'add' && (
            <ItemForm 
              onSubmit={handleTransaction} 
              onCancel={() => setModalType(null)} 
            />
          )}

          {selectedItem && modalType === 'inbound' && (
            <InboundOutboundForm 
              item={selectedItem} 
              type="inbound" 
              onSubmit={handleTransaction} 
              onCancel={() => setModalType(null)} 
            />
          )}
          {selectedItem && modalType === 'outbound' && (
            <InboundOutboundForm 
              item={selectedItem} 
              type="outbound" 
              onSubmit={handleTransaction} 
              onCancel={() => setModalType(null)} 
            />
          )}
          {selectedItem && modalType === 'borrow' && (
            <BorrowForm 
              item={selectedItem} 
              onSubmit={handleBorrow} 
              onCancel={() => setModalType(null)} 
            />
          )}
          {/* Quick toggle for modal type */}
          {selectedItem && (
            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button 
                variant={modalType === 'inbound' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setModalType('inbound')}
              >
                In
              </Button>
              <Button 
                variant={modalType === 'outbound' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setModalType('outbound')}
              >
                Out
              </Button>
              <Button 
                variant={modalType === 'borrow' ? 'default' : 'outline'} 
                size="sm" 
                className="flex-1"
                onClick={() => setModalType('borrow')}
              >
                Borrow
              </Button>
            </div>
          )}
          {selectedItem && modalType === 'qr' && (
            <div className="space-y-6 text-center py-4">
              <DialogHeader>
                <DialogTitle>QR Code: {selectedItem.name}</DialogTitle>
                <DialogDescription>
                  Scan kode ini untuk akses cepat ke item ini.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-4 rounded-xl border-4 border-elnusa-blue shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedItem.sku}`} 
                    alt="QR Code"
                    className="w-48 h-48"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="text-sm font-mono bg-muted px-3 py-1 rounded">
                  SKU: {selectedItem.sku}
                </div>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button 
                  className="bg-elnusa-blue w-full sm:w-auto"
                  onClick={() => {
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Print QR Code - ${selectedItem.name}</title>
                            <style>
                              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                              img { width: 300px; height: 300px; }
                              h1 { margin-top: 20px; }
                              p { font-family: monospace; font-size: 1.5rem; }
                            </style>
                          </head>
                          <body>
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${selectedItem.sku}" />
                            <h1>${selectedItem.name}</h1>
                            <p>SKU: ${selectedItem.sku}</p>
                            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                          </body>
                        </html>
                      `);
                      printWindow.document.close();
                    }
                  }}
                >
                  Cetak QR Code
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Toaster position="top-center" />
    </Layout>
  );
}
