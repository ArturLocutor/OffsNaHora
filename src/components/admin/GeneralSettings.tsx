
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ConfigItem {
  id: string;
  config_key: string;
  config_value: string;
  description: string | null;
}

const GeneralSettings = () => {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('site_config')
        .select('*')
        .order('config_key');

      if (error) throw error;

      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (configKey: string, newValue: string) => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('site_config')
        .update({ config_value: newValue })
        .eq('config_key', configKey);

      if (error) throw error;

      setConfigs(configs.map(config => 
        config.config_key === configKey 
          ? { ...config, config_value: newValue }
          : config
      ));

      toast.success('Configuração salva com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando configurações...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configurações Gerais</h2>
      </div>

      <div className="grid gap-6">
        {configs.map((config) => (
          <Card key={config.id}>
            <CardHeader>
              <CardTitle className="text-lg capitalize">
                {config.config_key.replace(/_/g, ' ')}
              </CardTitle>
              {config.description && (
                <p className="text-sm text-muted-foreground">{config.description}</p>
              )}
            </CardHeader>
            <CardContent>
              <ConfigForm 
                config={config} 
                onSave={handleSave}
                saving={saving}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ConfigForm = ({ config, onSave, saving }: {
  config: ConfigItem;
  onSave: (key: string, value: string) => void;
  saving: boolean;
}) => {
  const [value, setValue] = useState(config.config_value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(config.config_key, value);
  };

  const isLongValue = config.config_value.length > 100;
  const isUrl = config.config_key.includes('url') || config.config_key.includes('link');

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor={config.config_key}>Valor</Label>
        {isLongValue ? (
          <Textarea
            id={config.config_key}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={3}
            className="resize-none"
          />
        ) : (
          <Input
            id={config.config_key}
            type={isUrl ? 'url' : 'text'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        )}
      </div>
      <Button type="submit" disabled={saving || value === config.config_value}>
        {saving ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        {saving ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  );
};

export default GeneralSettings;
