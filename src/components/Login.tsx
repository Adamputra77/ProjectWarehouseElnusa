import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  loading: boolean;
}

export function Login({ onLogin, loading }: LoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-elnusa-blue/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-elnusa-yellow/10 rounded-full blur-3xl"></div>

      <Card className="w-full max-w-md shadow-2xl border-none bg-white/80 backdrop-blur-md relative z-10 rounded-3xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-elnusa-blue via-elnusa-yellow to-elnusa-blue"></div>
        <CardHeader className="text-center space-y-6 pt-10">
          <div className="mx-auto w-24 h-24 bg-elnusa-blue rounded-[2rem] flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="w-16 h-16 bg-elnusa-yellow rounded-2xl flex items-center justify-center font-black text-elnusa-blue text-3xl shadow-inner">
              E
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-elnusa-blue tracking-tighter">ELNUSA TBK</CardTitle>
            <CardDescription className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Warehouse Management</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-10 px-8">
          <div className="text-center text-sm text-muted-foreground font-medium leading-relaxed">
            Selamat datang di Sistem Manajemen Gudang BSD. Silakan login menggunakan akun Google korporat Anda.
          </div>
          <Button 
            className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 bg-elnusa-blue hover:bg-elnusa-blue/90 shadow-lg hover:shadow-elnusa-blue/20 transition-all rounded-2xl" 
            onClick={onLogin}
            disabled={loading}
          >
            <LogIn size={22} />
            {loading ? 'Authenticating...' : 'Login System'}
          </Button>
          <div className="flex flex-col items-center gap-2">
            <div className="h-px w-12 bg-muted"></div>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-40">
              &copy; {new Date().getFullYear()} Elnusa Tbk BSD
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
