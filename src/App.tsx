import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
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
import { 
  WarehouseItem, 
  InventoryTransaction, 
  BorrowRecord, 
  AuditSession, 
  AuditRecord,
  Supplier
} from './types/warehouse';
import { cn } from '@/lib/utils';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { InboundOutboundForm } from './components/InboundOutboundForm';
import { BorrowForm } from './components/BorrowForm';
import { ItemForm } from './components/ItemForm';
import { LocationMap } from './components/LocationMap';
import { AuditModule } from './components/AuditModule';
import { UserManagement } from './components/UserManagement';
import { SupplierManagement } from './components/SupplierManagement';
import { getInventoryInsights } from './services/geminiService';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ScanLine, Package, Download, UserCircle, Clock, AlertTriangle, Search, FileText, AlertCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';

const ADMIN_EMAIL = 'rrajadinadam@gmail.com';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const isAdmin = user?.email === ADMIN_EMAIL;
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<any[]>([]);
  
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalType, setModalType] = useState<'inbound' | 'outbound' | 'borrow' | 'qr' | 'add' | 'edit' | 'delete' | null>(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyType, setHistoryType] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [inventoryView, setInventoryView] = useState<'list' | 'map'>('list');
  const [borrowView, setBorrowView] = useState<'active' | 'history'>('active');
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [activeAuditSession, setActiveAuditSession] = useState<AuditSession | null>(null);
  const [auditRecords, setAuditRecords] = useState<AuditRecord[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Settings Listener
  useEffect(() => {
    if (!user) return;
    const settingsUnsubscribe = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setIsMaintenance(doc.data().isMaintenance || false);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'settings/global'));
    return () => settingsUnsubscribe();
  }, [user]);

  // Users Listener
  useEffect(() => {
    if (!user || !isAdmin) return;
    const q = query(collection(db, 'users'), orderBy('name', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsub();
  }, [user, isAdmin]);

  const handleToggleMaintenance = async () => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'settings', 'global'), {
        isMaintenance: !isMaintenance
      });
      toast.success(`Maintenance mode ${!isMaintenance ? 'enabled' : 'disabled'}`);
    } catch (error) {
      // If doc doesn't exist, create it
      try {
        await addDoc(collection(db, 'settings'), { isMaintenance: !isMaintenance });
      } catch (e) {
        handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
      }
    }
  };

  // Maintenance Listener
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(doc(db, 'settings', 'maintenance'), (snapshot) => {
      if (snapshot.exists()) {
        setIsMaintenance(snapshot.data().active);
      }
    }, (error) => {
      // Silently fail for maintenance listener to avoid interrupting presentation
      console.warn("Maintenance listener error:", error);
    });
    return () => unsub();
  }, [user]);

  const toggleMaintenance = async () => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(db, 'settings', 'maintenance'), {
        active: !isMaintenance,
        updatedBy: user?.email,
        updatedAt: serverTimestamp()
      });
      toast.success(`Maintenance mode ${!isMaintenance ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update maintenance mode");
    }
  };

  const checkMaintenance = () => {
    if (isMaintenance && !isAdmin) {
      toast.error("System is under maintenance. Operations are restricted.");
      return true;
    }
    return false;
  };

  // Auth Listener
  useEffect(() => {
    // Handle redirect result
    getRedirectResult(auth).catch((error) => {
      console.error("Redirect Login Error:", error);
      if (error.code === 'auth/unauthorized-domain') {
        toast.error("Domain belum terdaftar di Firebase");
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Ensure user document exists
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', u.uid), {
              name: u.displayName || 'User',
              email: u.email,
              role: u.email === 'rrajadinadam@gmail.com' ? 'admin' : 'staff',
              photoUrl: u.photoURL || ''
            });
          }
        } catch (error) {
          console.error("Error ensuring user document:", error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    const itemsUnsubscribe = onSnapshot(collection(db, 'items'), (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WarehouseItem));
      console.log("Loaded items:", itemsData.length);
      setItems(itemsData);
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.LIST, 'items');
    });

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
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    const borrowUnsubscribe = onSnapshot(collection(db, 'borrowRecords'), (snapshot) => {
      const borrowData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBorrowRecords(borrowData);
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.LIST, 'borrowRecords');
    });

    const suppliersUnsubscribe = onSnapshot(collection(db, 'suppliers'), (snapshot) => {
      const suppliersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Supplier));
      setSuppliers(suppliersData);
    }, (error) => {
      if (auth.currentUser) {
        handleFirestoreError(error, OperationType.LIST, 'suppliers');
      }
    });

    const auditSessionQuery = query(collection(db, 'auditSessions'), where('status', '==', 'ongoing'));
    let recordsUnsubscribe: (() => void) | null = null;

    const auditSessionUnsubscribe = onSnapshot(auditSessionQuery, (snapshot) => {
      if (recordsUnsubscribe) {
        recordsUnsubscribe();
        recordsUnsubscribe = null;
      }

      if (!snapshot.empty) {
        const session = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as AuditSession;
        setActiveAuditSession(session);
        
        // Listen to records for this session
        recordsUnsubscribe = onSnapshot(collection(db, `auditSessions/${session.id}/records`), (recSnapshot) => {
          const recordsData = recSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditRecord));
          setAuditRecords(recordsData);
        }, (error) => {
          if (auth.currentUser) handleFirestoreError(error, OperationType.LIST, `auditSessions/${session.id}/records`);
        });
      } else {
        setActiveAuditSession(null);
        setAuditRecords([]);
      }
    }, (error) => {
      if (auth.currentUser) handleFirestoreError(error, OperationType.LIST, 'auditSessions');
    });

    return () => {
      itemsUnsubscribe();
      txUnsubscribe();
      borrowUnsubscribe();
      suppliersUnsubscribe();
      auditSessionUnsubscribe();
      if (recordsUnsubscribe) recordsUnsubscribe();
    };
  }, [user]);

  // Auto-seed if empty (optional, but requested by user)
  useEffect(() => {
    if (user && items.length === 0 && !loading) {
      seedInitialData();
    }
  }, [user, items.length, loading]);

  // Low Stock Alerts
  useEffect(() => {
    const lowStockItems = items.filter(i => i.quantity <= 5 && i.quantity > 0);
    if (lowStockItems.length > 0 && !loading) {
      toast.warning(`Critical Stock Alert: ${lowStockItems.length} spareparts are running low!`, {
        description: "Check the dashboard for details.",
        duration: 5000,
      });
    }
  }, [items.length, loading]);

  const handleLogin = async () => {
    try {
      // Check if mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
        toast.success("Logged in successfully");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      
      if (error.code === 'auth/unauthorized-domain') {
        toast.error("Domain belum terdaftar di Firebase", {
          description: "Silakan tambahkan domain ini ke 'Authorized Domains' di Firebase Console.",
          duration: 10000
        });
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup diblokir oleh browser", {
          description: "Silakan izinkan popup untuk website ini atau coba gunakan browser lain.",
          duration: 10000
        });
      } else {
        toast.error("Gagal login: " + (error.message || "Unknown error"));
      }
    }
  };

  const handleBatchPrint = () => {
    const itemsToPrint = items.filter(i => selectedItems.includes(i.id));
    if (itemsToPrint.length === 0) {
      toast.error("Pilih barang terlebih dahulu untuk mencetak label.");
      return;
    }

    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Batch Print QR Labels - Elnusa BSD</title>
              <style>
                body { font-family: sans-serif; padding: 20px; }
                .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; }
                .label { border: 1px solid #eee; padding: 15px; display: flex; flex-direction: column; align-items: center; text-align: center; page-break-inside: avoid; }
                img { width: 120px; height: 120px; margin-bottom: 10px; }
                .name { font-size: 10px; font-weight: bold; text-transform: uppercase; margin-bottom: 5px; }
                .sku { font-family: monospace; font-size: 12px; color: #004a99; font-weight: bold; }
                @media print {
                  .grid { grid-template-columns: repeat(3, 1fr); }
                }
              </style>
            </head>
            <body>
              <div class="grid">
                ${itemsToPrint.map(item => `
                  <div class="label">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(item.sku)}" />
                    <div class="name">${item.name}</div>
                    <div class="sku">${item.sku}</div>
                  </div>
                `).join('')}
              </div>
              <script>
                window.onload = () => {
                  setTimeout(() => {
                    window.print();
                    window.onafterprint = () => window.close();
                  }, 1000);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        toast.error("Popup diblokir! Silakan izinkan popup untuk mencetak label.");
      }
    } catch (e) {
      toast.error("Pencetakan tidak didukung di browser ini.");
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

  const overdueBorrows = borrowRecords.filter(r => 
    r.status === 'borrowed' && 
    r.dueDate && 
    r.dueDate.toDate() < new Date()
  );

  const handleTransaction = async (data: any) => {
    if (!user || checkMaintenance()) return;
    try {
      if (modalType === 'add') {
        if (!isAdmin) throw new Error("Unauthorized: Only Admin can add items");
        await addDoc(collection(db, 'items'), {
          ...data,
          createdAt: serverTimestamp()
        });
        toast.success("Sparepart added successfully");
        setModalType(null);
        return;
      }

      if (modalType === 'edit' && selectedItem) {
        if (!isAdmin) throw new Error("Unauthorized: Only Admin can edit items");
        await updateDoc(doc(db, 'items', selectedItem.id), {
          ...data,
          updatedAt: serverTimestamp()
        });
        toast.success("Sparepart updated successfully");
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
        notes: data.notes,
        evidenceUrl: data.evidenceUrl || null
      });

      toast.success(`Stock ${data.type} successful`);
      setModalType(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Transaction failed");
    }
  };

  const handleBorrow = async (data: any) => {
    if (!user || checkMaintenance()) return;
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

      toast.success("Sparepart borrowed successfully");
      setModalType(null);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Borrowing failed");
    }
  };

  const handleReturn = async (record: BorrowRecord) => {
    if (!user || checkMaintenance()) return;
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
      toast.success("Sparepart returned successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `borrowRecords/${record.id}`);
    }
  };
  const handleScan = React.useCallback((sku: string) => {
    if (!sku) return;
    
    const trimmedSku = sku.trim();
    console.log("Scanned SKU:", trimmedSku);
    
    const item = items.find(i => {
      const itemSku = i.sku?.toLowerCase();
      const itemQr = i.qrCode?.toLowerCase();
      const scanned = trimmedSku.toLowerCase();
      
      return (itemSku === scanned) || 
             (itemQr === scanned) ||
             (scanned.includes(itemSku) && itemSku.length > 3) || // If SKU is inside a URL
             (itemSku.includes(scanned) && scanned.length > 3);   // If partial scan
    });

    if (item) {
      setSelectedItem(item);
      setModalType('edit');
      toast.success(`Found sparepart: ${item.name}`);
      setActiveTab('inventory');
    } else {
      console.warn(`Item with SKU "${trimmedSku}" not found in`, items.map(i => i.sku));
      toast.error(`Sparepart with SKU ${trimmedSku} not found`);
    }
  }, [items]);

  const handleUpdateRole = async (userId: string, role: string) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role });
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success("User access removed");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const handleAddSupplier = async (data: any) => {
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'suppliers'), {
        ...data,
        createdAt: serverTimestamp()
      });
      toast.success("Supplier added successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'suppliers');
    }
  };

  const handleUpdateSupplier = async (id: string, data: any) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'suppliers', id), data);
      toast.success("Supplier updated successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `suppliers/${id}`);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'suppliers', id));
      toast.success("Supplier deleted successfully");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `suppliers/${id}`);
    }
  };

  const handleStartAudit = async () => {
    if (!user || checkMaintenance() || !isAdmin) return;
    try {
      await addDoc(collection(db, 'auditSessions'), {
        startDate: serverTimestamp(),
        status: 'ongoing',
        createdBy: user.displayName || user.email,
        totalItems: items.length,
        verifiedItems: 0
      });
      toast.success("Sesi audit dimulai!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'auditSessions');
    }
  };

  const handleCompleteAudit = async (sessionId: string) => {
    if (!user || checkMaintenance() || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'auditSessions', sessionId), {
        status: 'completed',
        endDate: serverTimestamp()
      });
      toast.success("Sesi audit diselesaikan!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `auditSessions/${sessionId}`);
    }
  };

  const handleVerifyItem = async (data: { itemId: string; physicalQty: number }) => {
    if (!user || checkMaintenance() || !activeAuditSession) return;
    const item = items.find(i => i.id === data.itemId);
    if (!item) return;

    try {
      const variance = data.physicalQty - item.quantity;
      await addDoc(collection(db, `auditSessions/${activeAuditSession.id}/records`), {
        sessionId: activeAuditSession.id,
        itemId: data.itemId,
        sku: item.sku,
        itemName: item.name,
        systemQty: item.quantity,
        physicalQty: data.physicalQty,
        variance: variance,
        verifiedBy: user.displayName || user.email,
        timestamp: serverTimestamp()
      });

      // Update session progress
      await updateDoc(doc(db, 'auditSessions', activeAuditSession.id), {
        verifiedItems: auditRecords.length + 1
      });

      toast.success(`Terverifikasi: ${item.name}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `auditSessions/${activeAuditSession.id}/records`);
    }
  };

  const exportAuditToPDF = (session: AuditSession, records: AuditRecord[]) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(0, 84, 166);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('STOCK OPNAME REPORT', 15, 20);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Session ID: ${session.id.slice(0, 8)}`, 15, 30);
    doc.text(`Date: ${format(new Date(), 'dd MMM yyyy')}`, 150, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Auditor: ${session.createdBy}`, 15, 50);
    doc.text(`Status: ${session.status.toUpperCase()}`, 15, 57);
    doc.text(`Progress: ${session.verifiedItems}/${session.totalItems} items`, 150, 50);

    const tableData = records.map(r => [
      r.sku || '-',
      r.itemName || 'Unknown',
      r.systemQty,
      r.physicalQty,
      r.variance > 0 ? `+${r.variance}` : r.variance,
      r.variance === 0 ? 'MATCH' : 'DISCREPANCY'
    ]);

    autoTable(doc, {
      startY: 65,
      head: [['SKU', 'ITEM NAME', 'SYS QTY', 'PHYS QTY', 'VAR', 'STATUS']],
      body: tableData,
      headStyles: { fillColor: [0, 84, 166] },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const val = parseInt(data.cell.text[0]);
          if (val < 0) data.cell.styles.textColor = [239, 68, 68];
          if (val > 0) data.cell.styles.textColor = [34, 197, 94];
        }
      }
    });

    doc.save(`Audit_Report_${session.id.slice(0, 8)}.pdf`);
    toast.success("Audit PDF generated");
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

  const exportToPDF = (data: any[], title: string) => {
    if (data.length === 0) {
      toast.error("No data to export");
      return;
    }

    const doc = new jsPDF();
    
    // Add Logo/Header
    doc.setFillColor(0, 84, 166); // Elnusa Blue
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('ELNUSA SPAREPART SYSTEM', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('BSD Sparepart Operations - Official Report', 15, 30);
    doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 150, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(title, 15, 55);

    const tableData = data.map(item => {
      if (title.includes('Transaction')) {
        return [
          item.type.toUpperCase(),
          item.itemName,
          item.quantity,
          item.userName,
          `${item.date} ${item.time}`,
          item.notes || '-'
        ];
      } else {
        return [
          item.sku,
          item.name,
          item.category,
          item.quantity,
          item.location
        ];
      }
    });

    const headers = title.includes('Transaction') 
      ? [['TYPE', 'ITEM', 'QTY', 'STAFF', 'DATE', 'NOTES']]
      : [['SKU', 'NAME', 'CATEGORY', 'QTY', 'LOCATION']];

    autoTable(doc, {
      startY: 65,
      head: headers,
      body: tableData,
      headStyles: { fillColor: [0, 84, 166] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 65 }
    });

    doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success("PDF Report generated successfully");
  };

  const generateQRBatch = async (itemsToPrint: WarehouseItem[]) => {
    if (itemsToPrint.length === 0) {
      toast.error("No items to print");
      return;
    }

    const doc = new jsPDF();
    const labelWidth = 60;
    const labelHeight = 40;
    const margin = 10;
    const cols = 3;
    const rows = 6;
    let currentItem = 0;

    toast.loading("Generating QR Labels...", { id: 'qr-gen' });

    try {
      while (currentItem < itemsToPrint.length) {
        if (currentItem > 0 && currentItem % (cols * rows) === 0) {
          doc.addPage();
        }

        const pageItemIndex = currentItem % (cols * rows);
        const col = pageItemIndex % cols;
        const row = Math.floor(pageItemIndex / cols);

        const x = margin + col * (labelWidth + 5);
        const y = margin + row * (labelHeight + 5);

        const item = itemsToPrint[currentItem];
        
        // Draw Label Border
        doc.setDrawColor(200, 200, 200);
        doc.rect(x, y, labelWidth, labelHeight);

        // Generate QR Code
        const qrDataUrl = await QRCode.toDataURL(item.sku, { margin: 1 });
        doc.addImage(qrDataUrl, 'PNG', x + 2, y + 2, 20, 20);

        // Item Info
        doc.setTextColor(0, 84, 166);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'bold');
        doc.text('ELNUSA', x + 25, y + 8);
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.text(item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name, x + 25, y + 15);
        
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(`SKU: ${item.sku}`, x + 25, y + 22);
        doc.text(`LOC: ${item.location}`, x + 25, y + 28);
        doc.text(`CAT: ${item.category}`, x + 25, y + 34);

        currentItem++;
      }

      doc.save(`QR_Labels_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success("QR Labels generated successfully", { id: 'qr-gen' });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR labels", { id: 'qr-gen' });
    }
  };

  const handleFetchInsights = async () => {
    setIsGeneratingInsights(true);
    toast.loading("Gemini is analyzing your inventory...", { id: 'ai-insight' });
    try {
      const insights = await getInventoryInsights(items, transactions.slice(0, 20));
      setAiInsights(insights);
      toast.success("AI Insights generated!", { id: 'ai-insight' });
    } catch (error) {
      toast.error("Failed to get AI insights", { id: 'ai-insight' });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleDeleteItem = async (item: WarehouseItem) => {
    if (!user || checkMaintenance()) return;
    if (!isAdmin) {
      toast.error("Unauthorized: Only Admin can delete items");
      return;
    }
    setSelectedItem(item);
    setModalType('delete');
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteDoc(doc(db, 'items', selectedItem.id));
      toast.success("Sparepart deleted successfully");
      setModalType(null);
      setSelectedItem(null);
    } catch (e) {
      toast.error("Failed to delete item");
    }
  };
  const seedInitialData = async () => {
    if (!user) return;
    try {
      const sampleItems = [
        { name: 'Drill Pipe 5" Range 2', sku: 'DP5R2-001', category: 'Drilling', quantity: 50, location: 'A-01', description: 'Standard drill pipe for oil & gas', qrCode: 'DP5R2-001', imageUrl: 'https://picsum.photos/seed/drill/200/200' },
        { name: 'Gate Valve 2-1/16" 5K', sku: 'GV2116-002', category: 'Valves', quantity: 12, location: 'B-04', description: 'High pressure gate valve', qrCode: 'GV2116-002', imageUrl: 'https://picsum.photos/seed/valve/200/200' },
        { name: 'Safety Harness Double Lanyard', sku: 'SHDL-003', category: 'PPE', quantity: 25, location: 'C-10', description: 'Fall protection equipment', qrCode: 'SHDL-003', imageUrl: 'https://picsum.photos/seed/safety/200/200' },
        { name: 'Centrifugal Pump Repair Kit', sku: 'CPRK-004', category: 'Machinery', quantity: 8, location: 'D-02', description: 'Maintenance kit for pumps', qrCode: 'CPRK-004', imageUrl: 'https://picsum.photos/seed/pump/200/200' },
        { name: 'Lubricant Shell Gadus S2', sku: 'LSGS2-005', category: 'Consumables', quantity: 100, location: 'E-05', description: 'Industrial grade grease', qrCode: 'LSGS2-005', imageUrl: 'https://picsum.photos/seed/oil/200/200' },
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

  const getChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return format(d, 'dd MMM');
    });

    return last7Days.map(dateStr => {
      const dayTxs = transactions.filter(tx => tx.date.includes(dateStr));
      return {
        date: dateStr,
        inbound: dayTxs.filter(tx => tx.type === 'inbound').reduce((sum, tx) => sum + tx.quantity, 0),
        outbound: dayTxs.filter(tx => tx.type === 'outbound').reduce((sum, tx) => sum + tx.quantity, 0),
      };
    });
  };

  const stats = {
    totalItems: items.length,
    lowStock: items.filter(i => i.quantity <= 5).length,
    borrowedItems: borrowRecords.filter(r => r.status === 'borrowed').length,
    overdueItems: overdueBorrows.length,
    recentTransactions: transactions.slice(0, 5),
    lowStockItems: items.filter(i => i.quantity <= 5).slice(0, 5),
    chartData: getChartData(),
    categoryData: Object.entries(
      items.reduce((acc: any, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }))
  };

  const filteredHistory = transactions.filter(tx => {
    const matchesSearch = tx.itemName.toLowerCase().includes(historySearch.toLowerCase()) || 
                         tx.userName.toLowerCase().includes(historySearch.toLowerCase());
    const matchesType = historyType === 'all' || tx.type === historyType;
    return matchesSearch && matchesType;
  });

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      user={user} 
      isAdmin={isAdmin}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          stats={stats} 
          onSeedData={seedInitialData} 
          onExportHistory={() => exportToCSV(transactions, 'Transaction_History')}
          onExportPDF={() => exportToPDF(transactions, 'Transaction History Report')}
          isMaintenance={isMaintenance}
          onToggleMaintenance={toggleMaintenance}
          isAdmin={isAdmin}
          aiInsights={aiInsights}
          onGetInsights={handleFetchInsights}
          isGeneratingInsights={isGeneratingInsights}
          onNavigate={setActiveTab}
        />
      )}
      
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-elnusa-blue">Sparepart Inventory</h2>
              <div className="flex gap-2">
                <Button 
                  variant={inventoryView === 'list' ? 'default' : 'outline'} 
                  size="sm" 
                  className={cn("h-7 text-[10px] font-bold uppercase tracking-widest", inventoryView === 'list' ? "bg-elnusa-blue" : "")}
                  onClick={() => setInventoryView('list')}
                >
                  List View
                </Button>
                <Button 
                  variant={inventoryView === 'map' ? 'default' : 'outline'} 
                  size="sm" 
                  className={cn("h-7 text-[10px] font-bold uppercase tracking-widest", inventoryView === 'map' ? "bg-elnusa-blue" : "")}
                  onClick={() => setInventoryView('map')}
                >
                  Map View
                </Button>
              </div>
            </div>
            {isAdmin && (
              <Button 
                className="bg-elnusa-blue hover:bg-elnusa-blue/90 gap-2"
                onClick={() => setModalType('add')}
              >
                <Package size={18} />
                Add New Item
              </Button>
            )}
          </div>
          
          {inventoryView === 'list' ? (
            <InventoryList 
              items={items} 
              isAdmin={isAdmin}
              selectedItems={selectedItems}
              onToggleSelect={(id) => setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
              onSelectAll={setSelectedItems}
              onItemClick={(item) => {
                setSelectedItem(item);
                setModalType('inbound');
              }} 
              onShowQR={(item) => {
                setSelectedItem(item);
                setModalType('qr');
              }}
              onEdit={(item) => {
                setSelectedItem(item);
                setModalType('edit');
              }}
              onDelete={handleDeleteItem}
              onExport={() => exportToCSV(items, 'Inventory_Gudang_BSD')}
              onPrintLabels={handleBatchPrint}
            />
          ) : (
            <LocationMap items={items} />
          )}
        </div>
      )}

      {activeTab === 'scan' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Scanner onScan={handleScan} isScanning={activeTab === 'scan'} />
          
          <div className="bg-card p-6 rounded-xl border shadow-sm space-y-6">
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
                placeholder="Masukkan SKU (e.g. ELN-DRL-001)" 
                className="h-11 font-bold"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleScan((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <Button 
                onClick={() => {
                  const input = document.getElementById('manual-sku') as HTMLInputElement;
                  handleScan(input.value);
                  input.value = '';
                }}
                className="bg-elnusa-blue h-11 px-8 font-bold"
              >
                Cari
              </Button>
            </div>

            <div className="pt-2">
              <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-3">Quick Shortcuts</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {['ELN-DRL-001', 'ELN-VLV-002', 'ELN-PPE-003'].map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer hover:bg-elnusa-blue/10 font-bold py-1 px-3" onClick={() => handleScan(s)}>
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <AuditModule 
          items={items}
          activeSession={activeAuditSession}
          auditRecords={auditRecords}
          onStartAudit={handleStartAudit}
          onCompleteAudit={handleCompleteAudit}
          onVerifyItem={handleVerifyItem}
          onExportAudit={exportAuditToPDF}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === 'borrow' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-elnusa-blue">Borrowing Management</h2>
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <Button 
                variant={borrowView === 'active' ? 'default' : 'ghost'} 
                size="sm" 
                className={cn("h-8 text-[10px] font-bold uppercase tracking-widest", borrowView === 'active' ? "bg-elnusa-blue" : "")}
                onClick={() => setBorrowView('active')}
              >
                Active
              </Button>
              <Button 
                variant={borrowView === 'history' ? 'default' : 'ghost'} 
                size="sm" 
                className={cn("h-8 text-[10px] font-bold uppercase tracking-widest", borrowView === 'history' ? "bg-elnusa-blue" : "")}
                onClick={() => setBorrowView('history')}
              >
                History
              </Button>
            </div>
          </div>

          {borrowView === 'active' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {borrowRecords.filter(r => r.status === 'borrowed').length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No active borrowings.
                </div>
              ) : (
                borrowRecords.filter(r => r.status === 'borrowed').map(record => {
                  const isOverdue = record.dueDate && record.dueDate.toDate() < new Date();
                  return (
                    <div key={record.id} className={cn(
                      "p-4 rounded-lg border bg-card shadow-sm space-y-3 transition-all",
                      isOverdue ? "border-destructive/50 bg-destructive/5" : ""
                    )}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h3 className="font-bold">{record.itemName}</h3>
                          <p className="text-[10px] uppercase font-bold text-muted-foreground">ID: {record.id.slice(0,8)}</p>
                        </div>
                        <Badge variant={isOverdue ? "destructive" : "default"}>
                          {isOverdue ? "Overdue" : "Borrowed"}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-2 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <UserCircle size={14} className="text-elnusa-blue" />
                          <p><strong>Staff:</strong> {record.userName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={14} />
                          <p><strong>Date:</strong> {record.borrowDate ? format(record.borrowDate.toDate(), 'dd MMM yyyy') : '...'}</p>
                        </div>
                        {record.dueDate && (
                          <div className={cn(
                            "flex items-center gap-2 p-2 rounded bg-muted/50",
                            isOverdue ? "text-destructive bg-destructive/10" : ""
                          )}>
                            <AlertTriangle size={14} />
                            <p className="font-medium text-xs">
                              <strong>Due:</strong> {format(record.dueDate.toDate(), 'dd MMM yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant={isOverdue ? "destructive" : "outline"}
                        className="w-full mt-2 font-bold"
                        onClick={() => handleReturn(record)}
                      >
                        Mark as Returned
                      </Button>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Item</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Staff</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Borrowed</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Returned</TableHead>
                    <TableHead className="font-bold uppercase text-[10px] tracking-widest">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowRecords.filter(r => r.status === 'returned').length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        No return history.
                      </TableCell>
                    </TableRow>
                  ) : (
                    borrowRecords.filter(r => r.status === 'returned').map((record) => (
                      <TableRow key={record.id} className="hover:bg-muted/30 transition-colors font-mono">
                        <TableCell className="font-bold text-xs">{record.itemName}</TableCell>
                        <TableCell className="text-[10px] font-bold opacity-70 uppercase">{record.userName}</TableCell>
                        <TableCell className="text-[10px] opacity-50">
                          {record.borrowDate ? format(record.borrowDate.toDate(), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell className="text-[10px] opacity-50">
                          {record.returnDate ? format(record.returnDate.toDate(), 'dd MMM yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[9px] uppercase font-black bg-green-50 text-green-600 border-green-200">
                            Returned
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-2xl font-bold text-elnusa-blue">Transaction History</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2 font-bold" onClick={() => exportToCSV(transactions, 'Transaction_History')}>
                <Download size={16} />
                CSV
              </Button>
              <Button variant="outline" className="gap-2 font-bold border-red-200 text-red-600 hover:bg-red-50" onClick={() => exportToPDF(transactions, 'Transaction History Report')}>
                <FileText size={16} />
                PDF Report
              </Button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input 
                placeholder="Cari item atau staff..." 
                className="pl-10 h-11 font-bold"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={historyType === 'all' ? 'default' : 'outline'} 
                className={cn("h-11 px-6 font-bold", historyType === 'all' ? "bg-elnusa-blue" : "")}
                onClick={() => setHistoryType('all')}
              >
                All
              </Button>
              <Button 
                variant={historyType === 'inbound' ? 'default' : 'outline'} 
                className={cn("h-11 px-6 font-bold", historyType === 'inbound' ? "bg-green-600" : "")}
                onClick={() => setHistoryType('inbound')}
              >
                In
              </Button>
              <Button 
                variant={historyType === 'outbound' ? 'default' : 'outline'} 
                className={cn("h-11 px-6 font-bold", historyType === 'outbound' ? "bg-red-600" : "")}
                onClick={() => setHistoryType('outbound')}
              >
                Out
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Log ID</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Type</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Item Name</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Qty</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Staff</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Date & Time</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Notes</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-right">Evidence</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHistory.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-muted/30 transition-colors font-mono">
                      <TableCell className="text-[10px] font-mono opacity-30">{tx.id.slice(0, 8)}</TableCell>
                      <TableCell>
                        <Badge variant={tx.type === 'inbound' ? 'default' : 'destructive'} className={cn(
                          "text-[9px] uppercase font-black tracking-tighter",
                          tx.type === 'inbound' ? "bg-green-600" : "bg-red-600"
                        )}>
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-xs tracking-tight">{tx.itemName}</TableCell>
                      <TableCell className="font-black text-elnusa-blue text-xs">{tx.quantity}</TableCell>
                      <TableCell className="text-[10px] font-bold opacity-70 uppercase">{tx.userName}</TableCell>
                      <TableCell className="text-[10px] opacity-50">
                        {tx.date} <span className="opacity-30">|</span> {tx.time}
                      </TableCell>
                      <TableCell className="text-[10px] italic opacity-60 max-w-[200px] truncate">
                        {tx.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.evidenceUrl ? (
                          <Dialog>
                            <DialogTrigger render={
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-elnusa-blue hover:bg-elnusa-blue/10">
                                <FileText size={16} />
                              </Button>
                            } />
                            <DialogContent className="max-w-md rounded-3xl border-none shadow-2xl">
                              <DialogHeader>
                                <DialogTitle className="text-sm uppercase font-black text-elnusa-blue">Bukti Transaksi</DialogTitle>
                                <DialogDescription className="text-[10px] uppercase font-bold">
                                  {tx.itemName} - {tx.type} oleh {tx.userName}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4 rounded-2xl overflow-hidden border-4 border-elnusa-blue/5 shadow-inner">
                                <img src={tx.evidenceUrl} alt="Evidence" className="w-full h-auto" />
                              </div>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic opacity-30">None</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {activeTab === 'users' && isAdmin && (
        <UserManagement 
          users={users}
          onUpdateRole={handleUpdateRole}
          onDeleteUser={handleDeleteUser}
        />
      )}

      {activeTab === 'suppliers' && (
        <SupplierManagement 
          suppliers={suppliers}
          onAddSupplier={handleAddSupplier}
          onUpdateSupplier={handleUpdateSupplier}
          onDeleteSupplier={handleDeleteSupplier}
          isAdmin={isAdmin}
        />
      )}

      {/* Modals */}
      <Dialog open={!!modalType} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[425px]">
          {modalType === 'add' && (
            <ItemForm 
              suppliers={suppliers}
              onSubmit={handleTransaction} 
              onCancel={() => setModalType(null)} 
            />
          )}

          {modalType === 'edit' && selectedItem && (
            <ItemForm 
              initialData={selectedItem}
              suppliers={suppliers}
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
          {selectedItem && modalType === 'delete' && (
            <div className="space-y-6 py-4">
              <DialogHeader>
                <DialogTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle size={20} />
                  Konfirmasi Hapus
                </DialogTitle>
                <DialogDescription>
                  Apakah Anda yakin ingin menghapus sparepart <strong>{selectedItem.name}</strong>? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setModalType(null)} className="flex-1">Batal</Button>
                <Button variant="destructive" onClick={confirmDelete} className="flex-1">Hapus Sekarang</Button>
              </DialogFooter>
            </div>
          )}

          {/* Quick toggle for modal type */}
          {selectedItem && modalType !== 'qr' && modalType !== 'delete' && (
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
                  Scan kode ini untuk akses cepat ke sparepart ini.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-4 rounded-xl border-4 border-elnusa-blue shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(selectedItem.sku)}`} 
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
                    try {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`
                          <html>
                            <head>
                              <title>Print QR Code - ${selectedItem.name}</title>
                              <style>
                                body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; }
                                img { width: 300px; height: 300px; }
                                h1 { margin-top: 20px; text-transform: uppercase; letter-spacing: 2px; }
                                p { font-family: monospace; font-size: 1.5rem; font-weight: bold; color: #004a99; }
                              </style>
                            </head>
                            <body>
                              <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(selectedItem.sku)}" />
                              <h1>${selectedItem.name}</h1>
                              <p>SKU: ${selectedItem.sku}</p>
                              <script>
                                window.onload = () => {
                                  setTimeout(() => {
                                    window.print();
                                    window.onafterprint = () => window.close();
                                  }, 500);
                                };
                              </script>
                            </body>
                          </html>
                        `);
                        printWindow.document.close();
                      } else {
                        toast.error("Popup diblokir! Silakan izinkan popup untuk mencetak label.");
                      }
                    } catch (e) {
                      toast.error("Pencetakan tidak didukung di browser ini.");
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
