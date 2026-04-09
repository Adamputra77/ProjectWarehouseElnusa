import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertTriangle,
  ArrowLeftRight,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  stats: {
    totalItems: number;
    lowStock: number;
    borrowedItems: number;
    recentTransactions: any[];
    lowStockItems: any[];
  };
  onSeedData?: () => void;
  onExportHistory?: () => void;
}

export function Dashboard({ stats, onSeedData, onExportHistory }: DashboardProps) {
  return (
    <div className="space-y-6">
      {stats.totalItems === 0 && (
        <div className="bg-elnusa-blue/10 border border-elnusa-blue/20 p-4 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-elnusa-blue" />
            <div>
              <p className="font-bold text-elnusa-blue">Inventory Kosong</p>
              <p className="text-sm text-elnusa-blue/70">Mau gua isiin barang-barang contoh Elnusa buat ngetes?</p>
            </div>
          </div>
          <Button onClick={onSeedData} className="bg-elnusa-blue hover:bg-elnusa-blue/90">
            Isi Data Contoh
          </Button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
            <p className="text-xs text-muted-foreground">Unique SKUs in warehouse</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.lowStock}</div>
            <p className="text-xs text-muted-foreground">Items with quantity ≤ 5</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Currently Borrowed</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-elnusa-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.borrowedItems}</div>
            <p className="text-xs text-muted-foreground">Items out with staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTransactions.length}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={onExportHistory}>
              <Download size={14} />
              Export
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
              ) : (
                stats.recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'inbound' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {tx.type === 'inbound' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{tx.itemName}</p>
                        <p className="text-xs text-muted-foreground">{tx.userName} • {tx.time}</p>
                      </div>
                    </div>
                    <div className="text-sm font-bold">
                      {tx.type === 'inbound' ? '+' : '-'}{tx.quantity}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle size={18} />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Stok aman terkendali bro.</p>
              ) : (
                stats.lowStockItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Loc: {item.location}</p>
                    </div>
                    <Badge variant="destructive">{item.quantity} left</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
