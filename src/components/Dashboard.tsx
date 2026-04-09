import { 
  Package, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  AlertTriangle,
  ArrowLeftRight,
  Download,
  TrendingUp,
  History as HistoryIcon,
  FileText,
  Sparkles,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { cn } from '@/lib/utils';

interface DashboardProps {
  stats: {
    totalItems: number;
    lowStock: number;
    borrowedItems: number;
    recentTransactions: any[];
    lowStockItems: any[];
    chartData: any[];
    categoryData: any[];
  };
  onSeedData?: () => void;
  onExportHistory?: () => void;
  onExportPDF?: () => void;
  isMaintenance?: boolean;
  onToggleMaintenance?: () => void;
  isAdmin?: boolean;
  aiInsights?: any[];
  onGetInsights?: () => void;
  isGeneratingInsights?: boolean;
}

export function Dashboard({ 
  stats, 
  onSeedData, 
  onExportHistory, 
  onExportPDF,
  isMaintenance,
  onToggleMaintenance,
  isAdmin,
  aiInsights = [],
  onGetInsights,
  isGeneratingInsights
}: DashboardProps) {
  return (
    <div className="space-y-6">
      {isMaintenance && (
        <div className="bg-red-600 text-white p-4 rounded-xl flex items-center justify-between animate-pulse shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} />
            <div>
              <p className="font-black uppercase tracking-tighter">System Maintenance Active</p>
              <p className="text-xs opacity-80">Inventory operations may be limited. Contact Admin for details.</p>
            </div>
          </div>
          {isAdmin && (
            <Button variant="outline" size="sm" className="bg-white text-red-600 hover:bg-white/90 border-none font-bold" onClick={onToggleMaintenance}>
              Disable
            </Button>
          )}
        </div>
      )}

      <div className="bg-zinc-900 text-white p-3 rounded-xl flex items-center justify-between border border-white/10 shadow-2xl overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-elnusa-yellow animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-elnusa-yellow opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-elnusa-yellow"></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em]">System Broadcast: Warehouse BSD Operational - All systems nominal</p>
        </div>
        <div className="hidden md:block text-[10px] font-mono opacity-40">
          SECURE_NODE_04 // {new Date().toLocaleDateString()}
        </div>
      </div>

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
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Stats Row */}
        <Card className="md:col-span-3 bg-elnusa-blue text-white border-none shadow-xl overflow-hidden relative group">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Package size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Total Inventory</CardTitle>
            <Package className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">{stats.totalItems}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Registered SKUs</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "md:col-span-3 border-none shadow-xl overflow-hidden relative group",
          stats.lowStock > 0 ? "bg-red-600 text-white" : "bg-card"
        )}>
          <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <AlertTriangle size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em]",
              stats.lowStock > 0 ? "opacity-70" : "text-muted-foreground"
            )}>Critical Stock</CardTitle>
            <AlertTriangle className={cn("h-4 w-4", stats.lowStock > 0 ? "opacity-70" : "text-destructive")} />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">{stats.lowStock}</div>
            <p className={cn(
              "text-[10px] font-bold uppercase tracking-widest mt-1",
              stats.lowStock > 0 ? "opacity-50" : "text-muted-foreground"
            )}>Items below limit</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 bg-elnusa-yellow text-elnusa-blue border-none shadow-xl overflow-hidden relative group">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <ArrowLeftRight size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">Out on Field</CardTitle>
            <ArrowLeftRight className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black tracking-tighter">{stats.borrowedItems}</div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 mt-1">Currently Borrowed</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-3 border-none shadow-xl overflow-hidden relative group bg-zinc-900 text-white">
          <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Clock size={120} />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">System Status</CardTitle>
            <div className={cn(
              "h-2 w-2 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]",
              isMaintenance ? "bg-red-500 shadow-red-500/60" : "bg-green-500 shadow-green-500/60"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black tracking-tight uppercase">
              {isMaintenance ? 'Maintenance' : 'Operational'}
            </div>
            {isAdmin && (
              <button 
                onClick={onToggleMaintenance}
                className="text-[8px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity mt-2 underline"
              >
                Toggle Mode
              </button>
            )}
          </CardContent>
        </Card>

        {/* AI Insights - Large Bento Block */}
        <Card className="md:col-span-8 md:row-span-2 border-none shadow-xl overflow-hidden bg-gradient-to-br from-elnusa-blue to-[#004a88] text-white">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-elnusa-yellow rounded-lg">
                <BrainCircuit size={20} className="text-elnusa-blue" />
              </div>
              <div>
                <CardTitle className="text-base uppercase tracking-widest font-black">AI Smart Insights</CardTitle>
                <CardDescription className="text-[10px] text-white/50 uppercase font-bold">Powered by Gemini AI</CardDescription>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 bg-white/10 border-white/20 text-white hover:bg-white/20 font-bold gap-2"
              onClick={onGetInsights}
              disabled={isGeneratingInsights}
            >
              <Sparkles size={16} className={cn(isGeneratingInsights && "animate-spin")} />
              {isGeneratingInsights ? "Analyzing..." : "Generate"}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {aiInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles size={40} className="text-elnusa-yellow/20 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">No insights generated yet</p>
                <p className="text-[10px] opacity-40 mt-1">Click the button above to analyze your inventory data</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {aiInsights.map((insight, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors relative overflow-hidden group">
                    <div className={cn(
                      "absolute left-0 top-0 bottom-0 w-1",
                      insight.priority === 'high' ? "bg-red-500" : insight.priority === 'medium' ? "bg-elnusa-yellow" : "bg-green-500"
                    )} />
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-[8px] font-black uppercase bg-white/10 border-none text-white">
                        {insight.category}
                      </Badge>
                      <div className={cn(
                        "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                        insight.priority === 'high' ? "bg-red-500/20 text-red-400" : insight.priority === 'medium' ? "bg-elnusa-yellow/20 text-elnusa-yellow" : "bg-green-500/20 text-green-400"
                      )}>
                        {insight.priority}
                      </div>
                    </div>
                    <h4 className="font-black text-sm uppercase tracking-tight mb-1 group-hover:text-elnusa-yellow transition-colors">{insight.title}</h4>
                    <p className="text-[11px] text-white/70 leading-relaxed italic">{insight.description}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution - Medium Bento Block */}
        <Card className="md:col-span-4 border-none shadow-xl bg-card">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
              <Package size={18} className="text-elnusa-blue" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#005DAA', '#F9C300', '#22C55E', '#EF4444', '#8B5CF6'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Trends Chart - Wide Bento Block */}
        <Card className="md:col-span-7 border-none shadow-xl bg-card">
          <CardHeader className="pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm uppercase font-black tracking-widest flex items-center gap-2">
              <TrendingUp size={18} className="text-elnusa-blue" />
              Trends
            </CardTitle>
            <div className="flex gap-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-elnusa-blue" />
                <span className="text-[8px] font-bold uppercase opacity-50">In</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-elnusa-yellow" />
                <span className="text-[8px] font-bold uppercase opacity-50">Out</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[250px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005DAA" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#005DAA" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="inbound" stroke="#005DAA" strokeWidth={2} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="outbound" stroke="#F9C300" strokeWidth={2} fillOpacity={0} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activity - Vertical Bento Block */}
        <Card className="md:col-span-5 md:row-span-2 border-none shadow-xl overflow-hidden flex flex-col">
          <CardHeader className="bg-zinc-900 text-white py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <HistoryIcon size={18} className="text-elnusa-yellow" />
                <CardTitle className="text-sm uppercase tracking-widest font-black">Activity</CardTitle>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white" onClick={onExportHistory}>
                  <Download size={12} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-white/50 hover:text-white" onClick={onExportPDF}>
                  <FileText size={12} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto max-h-[500px]">
            <div className="divide-y divide-zinc-100">
              {stats.recentTransactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Clock size={32} className="opacity-20 mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">No activity</p>
                </div>
              ) : (
                stats.recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center shadow-inner",
                        tx.type === 'inbound' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {tx.type === 'inbound' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      </div>
                      <div>
                        <p className="font-black text-[11px] uppercase tracking-tight truncate max-w-[120px]">{tx.itemName}</p>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase">
                          {tx.userName} • {tx.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-[11px] font-black",
                        tx.type === 'inbound' ? "text-green-600" : "text-red-600"
                      )}>
                        {tx.type === 'inbound' ? '+' : '-'}{tx.quantity}
                      </div>
                      <p className="text-[8px] uppercase opacity-40 font-bold">{tx.type}</p>
                    </div>
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
