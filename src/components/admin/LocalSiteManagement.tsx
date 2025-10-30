import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Save, Settings, FileText, Users, BarChart3, Globe, Mail, Phone, Instagram, Image, Link, Award, Star, Music, Building } from 'lucide-react';
import { toast } from 'sonner';
import { useLocalSiteData } from '@/hooks/useLocalSiteData';
import { Client, Statistic } from '@/data/siteData';

const LocalSiteManagement = () => {
  const { texts, configs, clients, statistics, updateTexts, updateConfigs, updateClients, updateStatistics } = useLocalSiteData();
  const [editingTexts, setEditingTexts] = useState(texts);
  const [editingConfigs, setEditingConfigs] = useState(configs);
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [statisticDialogOpen, setStatisticDialogOpen] = useState(false);
  const [editingStatistic, setEditingStatistic] = useState<Statistic | null>(null);
  const [showConfigSaveFeedback, setShowConfigSaveFeedback] = useState(false);
  const [configSaveSuccess, setConfigSaveSuccess] = useState(false);

  const handleSaveTexts = async () => {
    try {
      await updateTexts(editingTexts);
      toast.success('Textos atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar textos:', error);
      toast.error('Erro ao salvar textos');
    }
  };

  const handleSaveConfigs = async () => {
    try {
      await updateConfigs(editingConfigs);
      // Mostrar feedback de sucesso
      setConfigSaveSuccess(true);
      setShowConfigSaveFeedback(true);
      setTimeout(() => setShowConfigSaveFeedback(false), 3000);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      // Mostrar feedback de erro
      setConfigSaveSuccess(false);
      setShowConfigSaveFeedback(true);
      setTimeout(() => setShowConfigSaveFeedback(false), 3000);
      toast.error('Erro ao salvar configurações');
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setClientDialogOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setClientDialogOpen(true);
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const updatedClients = clients.filter(client => client.id !== clientId);
      await updateClients(updatedClients);
      toast.success('Cliente removido com sucesso!');
    } catch (error) {
      console.error('Erro ao remover cliente:', error);
      toast.error('Erro ao remover cliente');
    }
  };

  const handleSaveClient = async (clientData: Partial<Client>) => {
    try {
      if (editingClient) {
        // Editando cliente existente
        const updatedClients = clients.map(client =>
          client.id === editingClient.id
            ? { ...client, ...clientData }
            : client
        );
        await updateClients(updatedClients);
        toast.success('Cliente atualizado com sucesso!');
      } else {
        // Adicionando novo cliente
        const newClient: Client = {
          id: Date.now().toString(),
          name: clientData.name || '',
          quote: clientData.quote || '',
          order_position: clients.length + 1
        };
        await updateClients([...clients, newClient]);
        toast.success('Cliente adicionado com sucesso!');
      }

      setClientDialogOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      toast.error('Erro ao salvar cliente');
    }
  };

  const handleAddStatistic = () => {
    setEditingStatistic(null);
    setStatisticDialogOpen(true);
  };

  const handleEditStatistic = (statistic: Statistic) => {
    setEditingStatistic(statistic);
    setStatisticDialogOpen(true);
  };

  const handleDeleteStatistic = (statisticId: string) => {
    const updatedStatistics = statistics.filter(statistic => statistic.id !== statisticId);
    updateStatistics(updatedStatistics);
    toast.success('Estatística removida com sucesso!');
  };

  const handleSaveStatistic = (statisticData: Partial<Statistic>) => {
    if (editingStatistic) {
      // Editando estatística existente
      const updatedStatistics = statistics.map(statistic =>
        statistic.id === editingStatistic.id
          ? { ...statistic, ...statisticData }
          : statistic
      );
      updateStatistics(updatedStatistics);
      toast.success('Estatística atualizada com sucesso!');
    } else {
      // Adicionando nova estatística
      const newStatistic: Statistic = {
        id: Date.now().toString(),
        title: statisticData.title || '',
        value: statisticData.value || 0,
        suffix: statisticData.suffix || '+ de',
        description: statisticData.description || '',
        color: statisticData.color || 'blue'
      };
      updateStatistics([...statistics, newStatistic]);
      toast.success('Estatística adicionada com sucesso!');
    }

    setStatisticDialogOpen(false);
    setEditingStatistic(null);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Settings className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gerenciar Site
          </h2>
        </div>
        <p className="text-gray-600 text-lg">
          Configure textos, configurações, estatísticas e depoimentos do seu site
        </p>
      </div>

      <Tabs defaultValue="texts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl border border-gray-200">
          <TabsTrigger value="texts" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            <FileText className="w-4 h-4" />
            Textos
          </TabsTrigger>
          <TabsTrigger value="configs" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-blue-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="statistics" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <BarChart3 className="w-4 h-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white">
            <Users className="w-4 h-4" />
            Depoimentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="texts" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex justify-between items-center text-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <span>Textos do Site</span>
                </div>
                <Button onClick={handleSaveTexts} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Textos
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="portfolio-title" className="text-gray-700 font-medium flex items-center gap-2">
                    <Music className="w-4 h-4 text-blue-500" />
                    Título do Portfólio
                  </Label>
                  <Input
                    id="portfolio-title"
                    value={editingTexts['portfolio-title'] || ''}
                    onChange={(e) => setEditingTexts(prev => ({ ...prev, 'portfolio-title': e.target.value }))}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="about-title" className="text-gray-700 font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-500" />
                    Título da Seção Sobre
                  </Label>
                  <Input
                    id="about-title"
                    value={editingTexts['about-title'] || ''}
                    onChange={(e) => setEditingTexts(prev => ({ ...prev, 'about-title': e.target.value }))}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="about-content" className="text-gray-700 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-500" />
                  Texto Sobre o Locutor
                </Label>
                <Textarea
                  id="about-content"
                  value={editingTexts['about-content'] || ''}
                  onChange={(e) => setEditingTexts(prev => ({ ...prev, 'about-content': e.target.value }))}
                  rows={5}
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="services-title" className="text-gray-700 font-medium flex items-center gap-2">
                    <Settings className="w-4 h-4 text-orange-500" />
                    Título dos Serviços
                  </Label>
                  <Input
                    id="services-title"
                    value={editingTexts['services-title'] || ''}
                    onChange={(e) => setEditingTexts(prev => ({ ...prev, 'services-title': e.target.value }))}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="cta-title" className="text-gray-700 font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" />
                    Título da Chamada de Ação
                  </Label>
                  <Input
                    id="cta-title"
                    value={editingTexts['cta-title'] || ''}
                    onChange={(e) => setEditingTexts(prev => ({ ...prev, 'cta-title': e.target.value }))}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="cta-subtitle" className="text-gray-700 font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  Subtítulo da Chamada de Ação
                </Label>
                <Input
                  id="cta-subtitle"
                  value={editingTexts['cta-subtitle'] || ''}
                  onChange={(e) => setEditingTexts(prev => ({ ...prev, 'cta-subtitle': e.target.value }))}
                  className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configs" className="space-y-6">
          <Card className="bg-white border border-gray-200 shadow-lg">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="flex justify-between items-center text-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <span>Configurações do Site</span>
                </div>
                <Button onClick={handleSaveConfigs} className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-700 font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Email de Contato
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingConfigs.email || ''}
                    onChange={(e) => setEditingConfigs(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                    placeholder="seu@email.com"
                  />
                  <p className="text-xs text-gray-500">
                    Este email será exibido no rodapé do site
                  </p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="instagram" className="text-gray-700 font-medium flex items-center gap-2">
                    <Instagram className="w-4 h-4 text-pink-500" />
                    URL do Instagram
                  </Label>
                  <Input
                    id="instagram"
                    value={editingConfigs.instagram_url || ''}
                    onChange={(e) => setEditingConfigs(prev => ({ ...prev, instagram_url: e.target.value }))}
                    placeholder="https://instagram.com/seuusuario"
                    className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                  <p className="text-xs text-gray-500">
                    Link do Instagram que aparecerá no rodapé do site
                  </p>
                </div>
              </div>

              {/* Feedback de salvamento */}
              {showConfigSaveFeedback && (
                <div className={`p-4 rounded-lg border ${
                  configSaveSuccess 
                    ? 'bg-green-50 border-green-200 text-green-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {configSaveSuccess ? (
                      <>
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                        <span className="font-medium">Configurações salvas com sucesso!</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✗</span>
                        </div>
                        <span className="font-medium">Erro ao salvar configurações</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Estatísticas do Site</h3>
            </div>
            <Dialog open={statisticDialogOpen} onOpenChange={setStatisticDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddStatistic} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Estatística
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">
                    {editingStatistic ? 'Editar Estatística' : 'Adicionar Nova Estatística'}
                  </DialogTitle>
                </DialogHeader>
                <StatisticForm
                  statistic={editingStatistic}
                  onSave={handleSaveStatistic}
                  onCancel={() => {
                    setStatisticDialogOpen(false);
                    setEditingStatistic(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {statistics.length === 0 ? (
              <Card className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-gray-600 text-lg">Nenhuma estatística cadastrada ainda.</p>
                  <p className="text-gray-500 text-sm mt-2">Adicione estatísticas para mostrar no seu site</p>
                </CardContent>
              </Card>
            ) : (
              statistics.map((statistic) => (
                <Card key={statistic.id} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-gradient-to-br from-${statistic.color}-500 to-${statistic.color}-600 rounded-lg flex items-center justify-center`}>
                          <BarChart3 className="w-4 h-4 text-white" />
                        </div>
                        <span>{statistic.title}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditStatistic(statistic)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteStatistic(statistic.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-gray-600">Valor</Label>
                        <p className="text-2xl font-bold text-blue-600">{statistic.suffix} {statistic.value}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <Label className="text-sm font-medium text-gray-600">Descrição</Label>
                        <p className="text-sm text-gray-700">{statistic.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 bg-gray-50 rounded-lg p-4">
                      <Label className="text-sm font-medium text-gray-600">Cor</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <div className={`w-6 h-6 rounded-full bg-${statistic.color}-500`}></div>
                        <span className="text-sm text-gray-600 capitalize">{statistic.color}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Depoimentos de Clientes</h3>
            </div>
            <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleAddClient} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-800">
                    {editingClient ? 'Editar Cliente' : 'Adicionar Novo Cliente'}
                  </DialogTitle>
                </DialogHeader>
                <ClientForm
                  client={editingClient}
                  onSave={handleSaveClient}
                  onCancel={() => {
                    setClientDialogOpen(false);
                    setEditingClient(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {clients.length === 0 ? (
              <Card className="bg-white border border-gray-200 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-orange-500" />
                  </div>
                  <p className="text-gray-600 text-lg">Nenhuma depoimento cadastrado ainda.</p>
                  <p className="text-gray-500 text-sm mt-2">Adicione depoimentos de clientes satisfeitos</p>
                </CardContent>
              </Card>
            ) : (
              clients.map((client) => (
                <Card key={client.id} className="bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center text-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span>{client.name}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClient(client)}
                          className="border-gray-300 text-gray-600 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClient(client.id)}
                          className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex text-yellow-400 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="italic text-gray-700 text-sm leading-relaxed">
                          "{client.quote}"
                        </blockquote>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ClientFormProps {
  client: Client | null;
  onSave: (data: Partial<Client>) => void;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSave, onCancel }) => {
  const [name, setName] = useState(client?.name || '');
  const [quote, setQuote] = useState(client?.quote || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !quote.trim()) {
      toast.error('Nome e depoimento são obrigatórios');
      return;
    }

    onSave({ name, quote });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="client-name" className="text-gray-700 font-medium flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-400" />
          Nome do Cliente *
        </Label>
        <Input
          id="client-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do cliente"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/20"
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="client-quote" className="text-gray-700 font-medium flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          Depoimento *
        </Label>
        <Textarea
          id="client-quote"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Digite o depoimento do cliente"
          rows={4}
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-orange-400 focus:ring-orange-400/20"
          required
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold">
          {client ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

interface StatisticFormProps {
  statistic: Statistic | null;
  onSave: (data: Partial<Statistic>) => void;
  onCancel: () => void;
}

const StatisticForm: React.FC<StatisticFormProps> = ({ statistic, onSave, onCancel }) => {
  const [title, setTitle] = useState(statistic?.title || '');
  const [value, setValue] = useState(statistic?.value?.toString() || '');
  const [suffix, setSuffix] = useState(statistic?.suffix || '+ de');
  const [description, setDescription] = useState(statistic?.description || '');
  const [color, setColor] = useState(statistic?.color || 'blue');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !value.trim() || !description.trim()) {
      toast.error('Título, valor e descrição são obrigatórios');
      return;
    }

    onSave({ 
      title, 
      value: parseInt(value), 
      suffix, 
      description, 
      color 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <Label htmlFor="statistic-title" className="text-gray-700 font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-400" />
          Título da Estatística *
        </Label>
        <Input
          id="statistic-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Áudios Gravados"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="statistic-value" className="text-gray-700 font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-green-400" />
            Valor *
          </Label>
          <Input
            id="statistic-value"
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="44"
            className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
            required
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="statistic-suffix" className="text-gray-700 font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Sufixo
          </Label>
          <Input
            id="statistic-suffix"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="+ de"
            className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="statistic-description" className="text-gray-700 font-medium flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-pink-400" />
          Descrição *
        </Label>
        <Input
          id="statistic-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Áudios Gravados"
          className="bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-purple-400 focus:ring-purple-400/20"
          required
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="statistic-color" className="text-gray-700 font-medium flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"></div>
          Cor
        </Label>
        <select
          id="statistic-color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:border-purple-400 focus:ring-purple-400/20 focus:outline-none"
        >
          <option value="blue" className="text-gray-800">🔵 Azul</option>
          <option value="green" className="text-gray-800">🟢 Verde</option>
          <option value="purple" className="text-gray-800">🟣 Roxo</option>
          <option value="orange" className="text-gray-800">🟠 Laranja</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium">
          Cancelar
        </Button>
        <Button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold">
          {statistic ? 'Atualizar' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
};

export default LocalSiteManagement;