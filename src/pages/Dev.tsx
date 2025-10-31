import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ShieldAlert, BarChart3 } from 'lucide-react';
import AdminDebugPanel from '@/components/admin/AdminDebugPanel';
import { useNoIndex } from '@/hooks/useNoIndex';

const Dev: React.FC = () => {
  useNoIndex();

  const handleBackToSite = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-white shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                <ShieldAlert className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  Painel de Debug Privado
                </h1>
                <p className="text-emerald-200 text-sm">Acesso restrito ao administrador principal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleBackToSite}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <Home className="h-4 w-4" />
                Voltar ao Site
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-lime-600 p-1">
            <div className="bg-white rounded-t-lg">
              <div className="flex items-center gap-2 p-4 border-b">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-lg">Status do Ambiente e Banco</CardTitle>
              </div>
              <CardContent className="p-6">
                <AdminDebugPanel />
              </CardContent>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Dev;