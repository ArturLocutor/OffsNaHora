import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Music, BarChart3, Home, LayoutList, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalSiteData } from '@/hooks/useLocalSiteData';
import AudioManagement from '@/components/admin/AudioManagement';
import ServiceManagement from '@/components/admin/ServiceManagement'; // Importar o novo componente
import { useNoIndex } from '@/hooks/useNoIndex';
// AutoSyncDrive removido para modo localhost sem supabase

const Admin = () => {
  const { logout } = useAuth();
  const { audios, services } = useLocalSiteData();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso!');
  };

  const handleBackToSite = () => {
    window.location.href = '/';
  };

  const handleExportProject = () => {
    toast.info('Para exportar o projeto:', {
      description: (
        <div className="space-y-2 mt-2">
          <p>1. Conecte seu projeto ao GitHub clicando no botão GitHub no topo direito</p>
          <p>2. Clone o repositório em sua máquina</p>
          <p>3. Execute "npm run build" para gerar os arquivos de produção</p>
          <p>4. Faça upload da pasta "dist" para sua hospedagem</p>
        </div>
      ),
      duration: 10000,
    });
  };
  useNoIndex();
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header com gradiente vibrante */}
      <header className="bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-violet-600 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-200 to-violet-200 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-purple-200 text-sm">Gerencie seu conteúdo com estilo</p>
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
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-300/30 text-white hover:bg-red-500/30 hover:border-red-300/50 transition-all duration-300 backdrop-blur-sm"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats com design melhorado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm font-medium">Áudios carregados</div>
                    <div className="text-3xl font-bold">{audios.length || 0}</div>
                  </div>
                </div>
                <div className="text-6xl font-bold text-white/10">♪</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
            <CardContent className="py-6 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <LayoutList className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-blue-100 text-sm font-medium">Serviços carregados</div>
                    <div className="text-3xl font-bold">{services.length || 0}</div>
                  </div>
                </div>
                <div className="text-6xl font-bold text-white/10">≡</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs com design aprimorado */}
        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-1">
            <div className="bg-white rounded-t-lg">
              <Tabs defaultValue="audios" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-none border-b-0">
                  <TabsTrigger 
                    value="audios" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <Music className="h-4 w-4" />
                    Áudios
                  </TabsTrigger>
                  <TabsTrigger 
                    value="services" 
                    className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                  >
                    <LayoutList className="h-4 w-4" />
                    Serviços
                  </TabsTrigger>
                </TabsList>

                <div className="p-6 bg-gradient-to-br from-white to-gray-50">
                  <TabsContent value="audios" className="mt-0">
                    <AudioManagement />
                  </TabsContent>
                  <TabsContent value="services" className="mt-0">
                    <ServiceManagement />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Admin;