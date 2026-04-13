export type UserRole = 'admin' | 'staff';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  photoUrl?: string;
}

export interface WarehouseItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  location: string;
  description?: string;
  imageUrl?: string;
  qrCode?: string;
}

export type TransactionType = 'inbound' | 'outbound';

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName?: string;
  type: TransactionType;
  quantity: number;
  userId: string;
  userName?: string;
  timestamp: any; // Firestore Timestamp
  notes?: string;
  evidenceUrl?: string;
}

export type BorrowStatus = 'borrowed' | 'returned';

export interface BorrowRecord {
  id: string;
  itemId: string;
  itemName: string;
  userId: string;
  userName: string;
  borrowDate: any; // Firestore Timestamp
  dueDate?: any; // Firestore Timestamp
  returnDate?: any; // Firestore Timestamp
  status: BorrowStatus;
  notes?: string;
}

export type AuditStatus = 'ongoing' | 'completed';

export interface AuditSession {
  id: string;
  title?: string;
  startDate: any;
  endDate?: any;
  status: AuditStatus;
  createdBy: string;
  totalItems: number;
  verifiedItems: number;
}

export interface AuditRecord {
  id: string;
  sessionId: string;
  itemId: string;
  sku?: string;
  itemName?: string;
  systemQty: number;
  physicalQty: number;
  variance: number;
  verifiedBy: string;
  timestamp: any;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  category?: string;
  notes?: string;
  createdAt: any;
}
