const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...\n');

    // Testar cada tabela
    const tables = ['site_config', 'site_texts', 'clients'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('*', { count: 'exact' })
          .limit(5);
        
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: ${count} registros encontrados`);
          if (data && data.length > 0) {
            console.log(`   Exemplo: ${JSON.stringify(data[0], null, 2)}`);
          }
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
      console.log(''); // Linha em branco
    }

    // Testar inserção/atualização básica nas tabelas ativas
    console.log('📝 Testando inserção/atualização de dados...\n');
    try {
      const { error: configError } = await supabase
        .from('site_config')
        .upsert([
          { config_key: 'site_title', config_value: 'Artur Sutto - Locutor Profissional' }
        ]);
      if (configError) {
        console.log('⚠️ Erro ao upsert site_config:', configError.message);
      } else {
        console.log('✅ Upsert em site_config OK');
      }

      const { error: textError } = await supabase
        .from('site_texts')
        .upsert([
          { section: 'hero_subtitle', content: 'Locutor Profissional', description: 'Subtítulo da página' }
        ]);
      if (textError) {
        console.log('⚠️ Erro ao upsert site_texts:', textError.message);
      } else {
        console.log('✅ Upsert em site_texts OK');
      }
    } catch (err) {
      console.log('❌ Erro nos testes de inserção/atualização:', err.message);
    }

    console.log('\n🎉 Teste de conexão concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDatabaseConnection();