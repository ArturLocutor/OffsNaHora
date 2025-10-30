const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...\n');

    // Testar cada tabela
    const tables = ['audios', 'site_config', 'site_texts', 'clients', 'google_drive_sessions'];
    
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

    // Testar inserção de dados
    console.log('📝 Testando inserção de dados...\n');
    
    try {
      // Testar inserção na tabela audios
      const { data: audioData, error: audioError } = await supabase
        .from('audios')
        .insert({
          title: 'Teste de Áudio',
          description: 'Áudio de teste inserido via script',
          file_path: '/audios/teste.mp3',
          file_url: '/audios/teste.mp3',
          order_position: 999
        })
        .select();
      
      if (audioError) {
        console.log('❌ Erro ao inserir áudio:', audioError.message);
      } else {
        console.log('✅ Áudio inserido com sucesso:', audioData[0].id);
        
        // Remover o áudio de teste
        await supabase.from('audios').delete().eq('id', audioData[0].id);
        console.log('🗑️ Áudio de teste removido');
      }
    } catch (err) {
      console.log('❌ Erro no teste de inserção:', err.message);
    }

    console.log('\n🎉 Teste de conexão concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testDatabaseConnection();