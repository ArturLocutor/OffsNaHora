const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Configuração do Supabase
const supabaseUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  try {
    console.log('🚀 Configurando banco de dados completo...');

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

    // Ler o arquivo SQL completo
    const sqlContent = fs.readFileSync('create_tables.sql', 'utf8');
    
    // Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`📋 Executando ${commands.length} comandos SQL...`);

    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.trim()) {
        try {
          console.log(`⏳ Executando comando ${i + 1}/${commands.length}...`);
          
          // Usar rpc para executar SQL
          const { data, error } = await supabase.rpc('exec_sql', { sql: command });
          
          if (error) {
            console.log(`⚠️ Erro no comando ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Comando ${i + 1} executado com sucesso`);
          }
        } catch (err) {
          console.log(`⚠️ Erro no comando ${i + 1}:`, err.message);
        }
      }
    }

    // Testar se as tabelas foram criadas
    console.log('\n🔍 Testando tabelas criadas...');
    
    const tables = ['audios', 'site_config', 'site_texts', 'clients', 'google_drive_sessions'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Tabela ${table}: ${error.message}`);
        } else {
          console.log(`✅ Tabela ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Tabela ${table}: ${err.message}`);
      }
    }

    // Inserir dados iniciais se as tabelas existirem
    console.log('\n📝 Inserindo dados iniciais...');
    
    try {
      // Inserir configurações do site
      const { error: configError } = await supabase
        .from('site_config')
        .upsert([
          { config_key: 'site_title', config_value: 'Artur Sutto - Locutor Profissional', description: 'Título do site' },
          { config_key: 'contact_email', config_value: 'contato@artursutto.com', description: 'Email de contato' },
          { config_key: 'whatsapp_number', config_value: '+5511999999999', description: 'Número do WhatsApp' }
        ]);
      
      if (configError) {
        console.log('⚠️ Erro ao inserir configurações:', configError.message);
      } else {
        console.log('✅ Configurações inseridas com sucesso');
      }

      // Inserir textos do site
      const { error: textsError } = await supabase
        .from('site_texts')
        .upsert([
          { section: 'hero_subtitle', content: 'Locutor Profissional', description: 'Subtítulo da página' },
          { section: 'about_content', content: 'Locutor profissional com experiência em rádio e publicidade.', description: 'Texto sobre o locutor' }
        ]);
      
      if (textsError) {
        console.log('⚠️ Erro ao inserir textos:', textsError.message);
      } else {
        console.log('✅ Textos inseridos com sucesso');
      }

      // Inserir áudios de exemplo
      const audioFiles = [
        'audio1.mp3', 'audio2.mp3', 'audio3.mp3', 'audio4.mp3', 'audio5.mp3',
        'audio6.mp3', 'audio7.mp3', 'audio8.mp3', 'audio9.mp3', 'audio10.mp3'
      ];

      const audioData = audioFiles.map((filename, index) => ({
        title: `Áudio ${index + 1}`,
        description: `Descrição do ${filename}`,
        file_path: `/audios/${filename}`,
        file_url: `/audios/${filename}`,
        order_position: index + 1
      }));

      const { error: audiosError } = await supabase
        .from('audios')
        .upsert(audioData);
      
      if (audiosError) {
        console.log('⚠️ Erro ao inserir áudios:', audiosError.message);
      } else {
        console.log('✅ Áudios inseridos com sucesso');
      }

    } catch (err) {
      console.log('⚠️ Erro ao inserir dados iniciais:', err.message);
    }

    console.log('\n🎉 Configuração do banco de dados concluída!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

setupDatabase();