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
  type: TransactionType;
  quantity: number;
  userId: string;
  timestamp: any; // Firestore Timestamp
  notes?: string;
}

export type BorrowStatus = 'borrowed' | 'returned';

export interface BorrowRecord {
  id: string;
  itemId: string;
  userId: string;
  borrowDate: any; // Firestore Timestamp
  dueDate?: any; // Firestore Timestamp
  returnDate?: any; // Firestore Timestamp
  status: BorrowStatus;
  notes?: string;
}
