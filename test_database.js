import { createClient } from '@supabase/supabase-js';

// Lê URL e ANON KEY do ambiente, com fallback para projeto de desenvolvimento
const defaultUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabaseUrl = process.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || defaultAnonKey;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAndCreateTables() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // A tabela "audios" foi descontinuada; testaremos apenas tabelas ativas
    console.log('ℹ️ Testes focados em tabelas ativas: site_config, clients, services');
    
    // Testar outras tabelas mencionadas no types.ts
    console.log('🔍 Testando tabela site_config...');
    const { data: configData, error: configError } = await supabase
      .from('site_config')
      .select('*')
      .limit(3);
      
    if (configError) {
      console.error('❌ Erro na tabela site_config:', configError.message);
    } else {
      console.log('✅ Tabela site_config funcionando!', configData);
    }
    
    console.log('🔍 Testando tabela clients...');
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*')
      .limit(3);
      
    if (clientsError) {
      console.error('❌ Erro na tabela clients:', clientsError.message);
    } else {
      console.log('✅ Tabela clients funcionando!', clientsData);
    }
    
    console.log('🎉 Teste de conectividade concluído!');
    
  } catch (err) {
    console.error('💥 Erro geral:', err.message);
  }
}

testAndCreateTables();
    console.log('🔍 Testando tabela services...');
    const { data: servicesData, error: servicesError } = await supabase
      .from('services')
      .select('*')
      .limit(3);
    
    if (servicesError) {
      console.error('❌ Erro na tabela services:', servicesError.message);
      console.log('💡 Dica: execute supabase/sql/fix-services-rls.sql e supabase/sql/add-service-tags.sql se necessário.');
    } else {
      console.log('✅ Tabela services funcionando!', servicesData);
    }