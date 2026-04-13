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
          <div className="mx-auto w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl rotate-3 hover:rotate-0 transition-transform duration-500 overflow-hidden p-2">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="48" fill="#004a99" />
              <path d="M70 50 C70 35 60 25 45 25 C30 25 20 35 20 50 C20 65 30 75 45 75 C55 75 65 70 70 60 L55 60 C52 65 48 67 45 67 C38 67 32 62 32 50 C32 38 38 33 45 33 C50 33 55 36 57 42 L25 42 L25 50 Z" fill="white" />
              <circle cx="75" cy="25" r="8" fill="#ffcc00" />
            </svg>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-black text-elnusa-blue tracking-tighter">ELNUSA TBK</CardTitle>
            <CardDescription className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">Sparepart Management</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-8 pb-10 px-8">
          <div className="text-center text-sm text-muted-foreground font-medium leading-relaxed">
            Selamat datang di Sistem Manajemen Sparepart BSD. Silakan login menggunakan akun Google korporat Anda.
          </div>
          <Button 
            className="w-full h-14 text-lg font-black uppercase tracking-widest gap-3 bg-elnusa-blue hover:bg-elnusa-blue/90 shadow-lg hover:shadow-elnusa-blue/20 transition-all rounded-2xl" 
            onClick={onLogin}
            disabled={loading}
          >
            <LogIn size={22} />
            {loading ? 'Authenticating...' : 'Login System'}
          </Button>
          <div className="text-[10px] text-center text-muted-foreground italic px-4">
            Tips: Jika tombol login tidak merespon di HP, pastikan browser Anda tidak memblokir popup atau coba buka di Google Chrome.
          </div>
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
