const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  try {
    console.log('🚀 Criando tabelas no Supabase...');

    // Fazer login como admin
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log('⚠️ Erro no login:', loginError.message);
      console.log('🔄 Tentando criar usuário admin...');
      
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@admin.com',
        password: 'admin123'
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário admin:', signUpError.message);
      } else {
        console.log('✅ Usuário admin criado com sucesso');
      }
    } else {
      console.log('✅ Login realizado com sucesso');
    }

    // Criar tabela de áudios usando RPC (Remote Procedure Call)
    const createAudiosTableSQL = `
      CREATE TABLE IF NOT EXISTS public.audios (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          drive_id VARCHAR(255),
          drive_url TEXT,
          file_path VARCHAR(500),
          file_url TEXT,
          order_position INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('📋 Executando SQL para criar tabela audios...');
    
    // Usar rpc para executar SQL
    const { data: rpcResult, error: rpcError } = await supabase.rpc('exec_sql', {
      sql: createAudiosTableSQL
    });

    if (rpcError) {
      console.log('⚠️ RPC não disponível, tentando método alternativo...');
      
      // Tentar inserir um registro de teste para verificar se a tabela existe
      const { data: testData, error: testError } = await supabase
        .from('audios')
        .select('*')
        .limit(1);

      if (testError) {
        console.error('❌ Tabela audios não existe e não foi possível criar:', testError.message);
        console.log('');
        console.log('🔧 SOLUÇÃO MANUAL:');
        console.log('1. Acesse o painel do Supabase: https://supabase.com/dashboard');
        console.log('2. Vá para SQL Editor');
        console.log('3. Execute o seguinte SQL:');
        console.log('');
        console.log(createAudiosTableSQL);
        console.log('');
        return;
      } else {
        console.log('✅ Tabela audios já existe!');
      }
    } else {
      console.log('✅ Tabela audios criada com sucesso!');
    }

    console.log('🎉 Processo concluído!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar o script
createTables();