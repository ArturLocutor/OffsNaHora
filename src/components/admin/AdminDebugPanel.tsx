import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';

type TableStatus = {
  name: string;
  ok: boolean;
  error?: string;
};

const mask = (value?: string | boolean | number | null) => {
  if (value === undefined || value === null) return '—';
  const str = String(value);
  if (str.length <= 6) return '••••••';
  return `${str.slice(0, 6)}••••••`;
};

const AdminDebugPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<TableStatus[]>([]);

  const viteEnv = useMemo(() => {
    // Captura apenas as variáveis de ambiente expostas pelo Vite
    const env = import.meta.env as Record<string, unknown>;
    const entries = Object.entries(env)
      .filter(([key]) => key.startsWith('VITE_') || key === 'MODE' || key === 'DEV' || key === 'PROD')
      .map(([key, val]) => ({ key, val }));
    return entries;
  }, []);

  useEffect(() => {
    const runChecks = async () => {
      try {
        if (!isSupabaseConfigured) {
          setStatuses([
            { name: 'services', ok: false, error: 'Supabase não configurado' },
            { name: 'clients', ok: false, error: 'Supabase não configurado' },
            { name: 'site_config', ok: false, error: 'Supabase não configurado' },
          ]);
          setLoading(false);
          return;
        }

        const tables = ['services', 'clients', 'site_config'] as const;
        const results: TableStatus[] = [];
        for (const t of tables) {
          try {
            const { error } = await supabase
              .from(t)
              .select('*')
              .limit(1);
            results.push({ name: t, ok: !error, error: error?.message });
          } catch (err: any) {
            results.push({ name: t, ok: false, error: err?.message || 'Erro desconhecido' });
          }
        }
        setStatuses(results);
      } finally {
        setLoading(false);
      }
    };
    runChecks();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ambiente de Build (Vite)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {viteEnv.map(({ key, val }) => (
              <div key={key} className="flex items-center justify-between border rounded-md px-3 py-2">
                <span className="text-sm font-mono text-muted-foreground">{key}</span>
                <span className="text-sm font-mono">{mask(val as any)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Badge variant={isSupabaseConfigured ? 'default' : 'secondary'}>
              Supabase: {isSupabaseConfigured ? 'Configurado' : 'Não configurado'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verificação de Tabelas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-sm">Executando testes...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {statuses.map((s) => (
                <div key={s.name} className="flex items-center justify-between border rounded-md px-3 py-2">
                  <span className="text-sm font-medium">{s.name}</span>
                  {s.ok ? (
                    <Badge variant="default">OK</Badge>
                  ) : (
                    <Badge variant="destructive">{s.error || 'Erro'}</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDebugPanel;