import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Loader2, LayoutList, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

 type Service = Tables<'services'>;
 
 
 interface ServiceFormProps {
   service?: Service | null;
   onSave: (serviceData: Partial<Service>) => void;
   onCancel: () => void;
 }
 
 // Lista de cores disponíveis e gerador de cor aleatória
 const AVAILABLE_COLORS = ['blue', 'purple', 'green', 'orange', 'red', 'indigo', 'teal', 'pink', 'yellow', 'cyan', 'slate', 'violet', 'emerald'];
 const getRandomColorName = () => AVAILABLE_COLORS[Math.floor(Math.random() * AVAILABLE_COLORS.length)];
 // Também lista de classes Tailwind explícitas para o pontinho da lista
 const AVAILABLE_BG_CLASSES = [
   'bg-blue-600','bg-purple-600','bg-green-600','bg-orange-600','bg-red-600','bg-indigo-600','bg-teal-600','bg-pink-600','bg-yellow-500','bg-cyan-600','bg-slate-600','bg-violet-600','bg-emerald-600'
 ];
 const COLOR_TO_BG: Record<string, string> = {
   blue: 'bg-blue-600',
   purple: 'bg-purple-600',
   green: 'bg-green-600',
   orange: 'bg-orange-600',
   red: 'bg-red-600',
   indigo: 'bg-indigo-600',
   teal: 'bg-teal-600',
   pink: 'bg-pink-600',
   yellow: 'bg-yellow-500',
   cyan: 'bg-cyan-600',
   slate: 'bg-slate-600',
   violet: 'bg-violet-600',
   emerald: 'bg-emerald-600',
 };
 const getBgClassFromColor = (color?: string | null) => COLOR_TO_BG[color || ''] || 'bg-slate-600';
// Gradientes (mesma paleta usada no site público)
const COLOR_TO_GRADIENT: Record<string, string> = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-400 to-orange-500',
  teal: 'from-teal-500 to-teal-600',
  cyan: 'from-cyan-500 to-cyan-600',
  indigo: 'from-indigo-500 to-indigo-600',
  violet: 'from-violet-500 to-violet-600',
  pink: 'from-pink-500 to-rose-600',
  slate: 'from-slate-500 to-slate-600',
  emerald: 'from-emerald-500 to-emerald-600',
};
const getGradientClassFromColor = (color?: string | null) => COLOR_TO_GRADIENT[color || ''] || 'from-slate-500 to-slate-600';
 // Gerador de ordem aleatória evitando 1 e 2 (reservados para badges)
 const getRandomOrderPosition = () => Math.floor(Math.random() * 997) + 3; // 3..999
 
 const ServiceForm: React.FC<ServiceFormProps> = ({ service, onSave, onCancel }) => {
   const [title, setTitle] = useState(service?.title || '');
   const [isBestSeller, setIsBestSeller] = useState(service?.is_best_seller || false);
   const [isRecommended, setIsRecommended] = useState(service?.is_recommended || false);
 
   const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!title.trim()) {
       toast.error('Título é obrigatório.');
       return;
     }
     onSave({ 
       title,
       is_best_seller: isBestSeller,
       is_recommended: isRecommended
     });
   };
 
   return (
     <form onSubmit={handleSubmit} className="space-y-4">
       <div>
         <Label htmlFor="title">Título</Label>
         <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
       </div>
       
       <div className="space-y-3">
         <Label className="text-sm font-medium">Tags do Serviço</Label>
         <div className="flex flex-col space-y-2">
           <div className="flex items-center space-x-2">
             <input
               type="checkbox"
               id="bestSeller"
               checked={isBestSeller}
               onChange={(e) => setIsBestSeller(e.target.checked)}
               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
             />
             <Label htmlFor="bestSeller" className="text-sm cursor-pointer">
               🏆 Mais Vendido
             </Label>
           </div>
           <div className="flex items-center space-x-2">
             <input
               type="checkbox"
               id="recommended"
               checked={isRecommended}
               onChange={(e) => setIsRecommended(e.target.checked)}
               className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
             />
             <Label htmlFor="recommended" className="text-sm cursor-pointer">
               ⭐ Recomendado
             </Label>
           </div>
         </div>
       </div>
       
       <div className="flex justify-end space-x-2">
         <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
         <Button type="submit">Salvar</Button>
       </div>
     </form>
   );
 };
 
 const ServiceManagement: React.FC = () => {
   const [services, setServices] = useState<Service[]>([]);
   const [loading, setLoading] = useState(true);
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingService, setEditingService] = useState<Service | null>(null);
   const [saving, setSaving] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
 
   const fetchServices = async (showToast: boolean = false) => {
     try {
       const { data, error } = await supabase
         .from('services')
         .select('*')
         .order('order_position');
 
       if (error) throw error;
       const list = (data || []) as Service[];
       setServices(list);
       if (showToast) {
         toast.success(`${list.length} serviços carregados`);
       }
     } catch (error) {
       console.error('Erro ao carregar serviços:', error);
       toast.error('Erro ao carregar serviços.');
     } finally {
       setLoading(false);
     }
   };
 
   useEffect(() => {
     if (isSupabaseConfigured) {
       fetchServices(true);
     } else {
       setLoading(false);
     }
   }, []);
 
   const handleSaveService = async (serviceData: Partial<Service>) => {
     try {
       setSaving(true);
       if (editingService) {
         const { data, error } = await supabase
           .from('services')
           .update({ 
             title: serviceData.title,
             is_best_seller: serviceData.is_best_seller || false,
             is_recommended: serviceData.is_recommended || false
           })
           .eq('id', editingService.id)
           .select()
           .single();
         if (error) throw error;
         if (!data) {
           toast.error('Nenhuma linha atualizada no Supabase.');
           return;
         }
         setServices(prev => prev.map(s => s.id === data.id ? data as Service : s));
         await fetchServices();
         toast.success('Serviço atualizado com sucesso!');
       } else {
         // Criar novo serviço com título e tags
         const { data, error } = await supabase
           .from('services')
           .insert({ 
             title: serviceData.title || '',
             is_best_seller: serviceData.is_best_seller || false,
             is_recommended: serviceData.is_recommended || false
           })
           .select()
           .single();
         if (error) throw error;
         if (!data) {
           toast.error('Nenhuma linha inserida no Supabase.');
           return;
         }
         setServices(prev => [...prev, data as Service]);
         await fetchServices();
         toast.success('Serviço adicionado com sucesso!');
       }
       setDialogOpen(false);
       setEditingService(null);
     } catch (error: any) {
       console.error('Erro ao salvar serviço:', error);
       toast.error(`Erro ao salvar serviço: ${error?.message || String(error)}`);
     } finally {
       setSaving(false);
     }
   };
 
   const handleDeleteService = async (id: string) => {
     try {
       const { error } = await supabase
         .from('services')
         .delete()
         .eq('id', id);
       if (error) throw error;
       toast.success('Serviço removido com sucesso!');
-      setServices(prev => prev.filter(s => s.id !== id));
-      setServices(prev => prev.filter(s => s.id !== id));
+      setServices(prev => prev.filter(s => s.id !== id));
+      await fetchServices(false);
     } catch (error) {
       console.error('Erro ao remover serviço:', error);
       toast.error('Erro ao remover serviço.');
     }
   };
 
   const handleEditClick = (service: Service) => {
     setEditingService(service);
     setDialogOpen(true);
   };
 
   const handleAddClick = () => {
     setEditingService(null);
     setDialogOpen(true);
   };
  // --- Drag and Drop helpers ---
  const reorderList = (list: Service[], fromId: string, toId: string) => {
    const from = list.findIndex(s => s.id === fromId);
    const to = list.findIndex(s => s.id === toId);
    if (from === -1 || to === -1 || from === to) return list;
    const copy = [...list];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    return copy;
  };

  const persistOrder = async (list: Service[]) => {
    try {
      const updates = list.map((s, idx) =>
        supabase.from('services').update({ order_position: idx + 1 }).eq('id', s.id)
      );
      const results = await Promise.all(updates);
      const failed = results.find(r => (r as any).error);
      if (failed) throw (failed as any).error;
      toast.success('Ordem atualizada!');
    } catch (e: any) {
      console.error('Erro ao persistir ordem:', e);
      toast.error('Falha ao salvar nova ordem.');
    } finally {
      fetchServices();
    }
  };

  const onDragStart = (id: string) => {
    setDraggingId(id);
  };
  const onDragOver = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === overId) return;
    setServices(prev => reorderList(prev, draggingId, overId));
  };
  const onDrop = async (overId: string) => {
    if (!draggingId) return;
    const ordered = reorderList(services, draggingId, overId);
    setDraggingId(null);
    setServices(ordered);
    await persistOrder(ordered);
  };
 
   if (!isSupabaseConfigured) {
     return (
       <div className="space-y-6">
         <div className="flex items-center gap-2 mb-6">
           <LayoutList className="h-6 w-6" />
           <h2 className="text-2xl font-bold">Gerenciar Serviços</h2>
         </div>
         <Card>
           <CardHeader>
             <CardTitle className="text-lg">Supabase não configurado</CardTitle>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground">
               Configure `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local` para habilitar o gerenciamento de serviços.
             </p>
           </CardContent>
         </Card>
       </div>
     );
   }
 
   if (loading) {
     return (
       <div className="flex items-center justify-center py-8">
         <Loader2 className="h-8 w-8 animate-spin" />
         <span className="ml-2">Carregando serviços...</span>
       </div>
     );
   }
 
   return (
     <Card className="border border-blue-100 shadow-sm">
       <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 space-y-1">
         <CardTitle className="flex items-center gap-2 text-blue-900">
           <LayoutList className="h-5 w-5" />
           Gerenciamento de Serviços
         </CardTitle>
         <p className="text-sm text-muted-foreground">
           Adicione, edite ou remova os serviços oferecidos no seu site.
         </p>
       </CardHeader>
       <CardContent className="space-y-6 pt-6">
         <div className="flex justify-end">
           <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
             <DialogTrigger asChild>
               <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
                 <Plus className="mr-2 h-4 w-4" />
                 Adicionar Serviço
               </Button>
             </DialogTrigger>
             <DialogContent className="bg-white border-blue-200 sm:max-w-md">
               <DialogHeader>
                 <DialogTitle>{editingService ? 'Editar Serviço' : 'Adicionar Serviço'}</DialogTitle>
               </DialogHeader>
               <ServiceForm
                 service={editingService}
                 onSave={handleSaveService}
                 onCancel={() => setDialogOpen(false)}
               />
             </DialogContent>
           </Dialog>
         </div>
 
         <div className="space-y-4">
           {services.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               <LayoutList className="h-12 w-12 mx-auto mb-4 opacity-50" />
               <p>Nenhum serviço cadastrado ainda.</p>
               <p className="text-sm mt-2">Clique em "Adicionar Serviço" para começar.</p>
             </div>
           ) : (
            services.map((service) => (
              <Card
                key={service.id}
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${draggingId === service.id ? 'opacity-70' : ''}`}
                draggable
                onDragStart={() => onDragStart(service.id)}
                onDragOver={(e) => onDragOver(e, service.id)}
                onDrop={() => onDrop(service.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-gray-400 w-6 text-right">{service.order_position ?? '-'}</span>
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${getGradientClassFromColor(service.color)}`}></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{service.title}</p>
                      {service.is_best_seller && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          🏆 Mais Vendido
                        </span>
                      )}
                      {service.is_recommended && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          ⭐ Recomendado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(service)} disabled={saving}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteService(service.id)} disabled={saving}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
           )}
         </div>
       </CardContent>
     </Card>
   );
 };
 
 export default ServiceManagement;