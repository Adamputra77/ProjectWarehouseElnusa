import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  loading: boolean;
}

export function Login({ onLogin, loading }: LoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-elnusa-blue">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-elnusa-blue rounded-full flex items-center justify-center">
            <div className="w-10 h-10 bg-elnusa-yellow rounded-full flex items-center justify-center font-bold text-elnusa-blue text-xl">
              E
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-elnusa-blue">ELNUSA TBK</CardTitle>
            <CardDescription className="text-lg font-medium">Warehouse Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center text-sm text-muted-foreground">
            Please sign in with your corporate Google account to access the BSD Warehouse system.
          </div>
          <Button 
            className="w-full h-12 text-lg gap-3 bg-elnusa-blue hover:bg-elnusa-blue/90" 
            onClick={onLogin}
            disabled={loading}
          >
            <LogIn size={20} />
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </Button>
          <div className="text-center text-xs text-muted-foreground opacity-60">
            &copy; {new Date().getFullYear()} Elnusa Tbk. All rights reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
