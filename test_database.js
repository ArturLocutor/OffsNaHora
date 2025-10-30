import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://byeolalksmsutxrohvqa.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA'
);

async function testAndCreateTables() {
  try {
    console.log('🔍 Testando conexão com Supabase...');
    
    // Primeiro, vamos tentar inserir um registro de teste na tabela audios
    console.log('📝 Tentando inserir dados de teste na tabela audios...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('audios')
      .insert([{
        title: 'Teste Google Drive Audio',
        description: 'Áudio de teste via Google Drive',
        drive_id: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        drive_url: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
        order_position: 1
      }])
      .select();
      
    if (insertError) {
      console.error('❌ Erro ao inserir dados:', insertError.message);
      console.log('🔧 A tabela pode não existir. Vamos tentar outras operações...');
    } else {
      console.log('✅ Dados inseridos com sucesso!', insertData);
    }
    
    // Testar leitura da tabela
    console.log('📖 Tentando ler dados da tabela audios...');
    const { data: readData, error: readError } = await supabase
      .from('audios')
      .select('*')
      .limit(5);
      
    if (readError) {
      console.error('❌ Erro ao ler dados:', readError.message);
    } else {
      console.log('✅ Dados lidos com sucesso!');
      console.log('📊 Registros encontrados:', readData.length);
      console.log('📋 Dados:', readData);
    }
    
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