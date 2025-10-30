
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

interface TextContent {
  id: string;
  section: string;
  content: string;
  description: string;
}

const TextManagement = () => {
  const [texts, setTexts] = useState<TextContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      toast.warning('Supabase não configurado. Textos serão indisponíveis aqui.');
      return;
    }
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const { data, error } = await supabase
        .from('site_texts')
        .select('*')
        .order('section');

      if (error) throw error;

      setTexts(data || []);
    } catch (error) {
      console.error('Erro ao carregar textos:', error);
      toast.error('Erro ao carregar textos do site');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (updatedText: TextContent) => {
    try {
      const { error } = await supabase
        .from('site_texts')
        .update({ 
          content: updatedText.content, 
          description: updatedText.description 
        })
        .eq('id', updatedText.id);

      if (error) throw error;

      setTexts(texts.map(text => text.id === updatedText.id ? updatedText : text));
      toast.success('Texto atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar texto:', error);
      toast.error('Erro ao salvar texto');
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Editar Textos do Site</h2>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Supabase não configurado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no `.env.local` para habilitar a edição de textos.
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
        <span className="ml-2">Carregando textos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <FileText className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Editar Textos do Site</h2>
      </div>

      <div className="grid gap-6">
        {texts.map((text) => (
          <Card key={text.id}>
            <CardHeader>
              <CardTitle className="text-lg">{text.description}</CardTitle>
              <p className="text-sm text-muted-foreground">Seção: {text.section}</p>
            </CardHeader>
            <CardContent>
              <TextEditForm text={text} onSave={handleSave} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TextEditForm = ({ text, onSave }: {
  text: TextContent;
  onSave: (text: TextContent) => void;
}) => {
  const [editedText, setEditedText] = useState(text);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave(editedText);
    setSaving(false);
  };

  const isLongText = text.content.length > 100;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor={`content-${text.id}`}>Conteúdo</Label>
        {isLongText ? (
          <Textarea
            id={`content-${text.id}`}
            value={editedText.content}
            onChange={(e) => setEditedText({ ...editedText, content: e.target.value })}
            rows={4}
            className="resize-none"
          />
        ) : (
          <Input
            id={`content-${text.id}`}
            value={editedText.content}
            onChange={(e) => setEditedText({ ...editedText, content: e.target.value })}
          />
        )}
      </div>
      <div>
        <Label htmlFor={`description-${text.id}`}>Descrição</Label>
        <Input
          id={`description-${text.id}`}
          value={editedText.description}
          onChange={(e) => setEditedText({ ...editedText, description: e.target.value })}
        />
      </div>
      <Button type="submit" className="w-full md:w-auto" disabled={saving}>
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saving ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </form>
  );
};

export default TextManagement;
