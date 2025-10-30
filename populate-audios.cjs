const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuração do Supabase
const supabaseUrl = 'https://byeolalksmsutxrohvqa.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5ZW9sYWxrc21zdXR4cm9odnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4MDA0NTYsImV4cCI6MjA3NTM3NjQ1Nn0.2T58M9RitxFC2-lW6yWgF1KIwoM3CnzTot7XMCVHekA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function populateAudios() {
  try {
    console.log('🚀 Iniciando população da tabela de áudios...');

    // Fazer login como admin
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'admin@admin.com',
      password: 'admin123'
    });

    if (loginError) {
      console.log('⚠️ Erro no login, tentando criar usuário admin...');
      
      // Tentar criar usuário admin
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: 'admin@admin.com',
        password: 'admin123'
      });

      if (signUpError) {
        console.error('❌ Erro ao criar usuário admin:', signUpError.message);
        return;
      }

      console.log('✅ Usuário admin criado com sucesso');
    } else {
      console.log('✅ Login realizado com sucesso');
    }

    // Verificar se já existem áudios
    const { data: existingAudios, error: checkError } = await supabase
      .from('audios')
      .select('*');

    if (checkError) {
      console.error('❌ Erro ao verificar áudios existentes:', checkError.message);
      return;
    }

    if (existingAudios && existingAudios.length > 0) {
      console.log(`📄 Já existem ${existingAudios.length} áudios na tabela`);
      console.log('🔄 Limpando tabela para repovoar...');
      
      const { error: deleteError } = await supabase
        .from('audios')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('❌ Erro ao limpar tabela:', deleteError.message);
        return;
      }
    }

    // Ler arquivos da pasta public/audios
    const audiosPath = path.join(__dirname, 'public', 'audios');
    
    if (!fs.existsSync(audiosPath)) {
      console.error('❌ Pasta public/audios não encontrada');
      return;
    }

    const files = fs.readdirSync(audiosPath)
      .filter(file => file.endsWith('.mp3'))
      .sort();

    if (files.length === 0) {
      console.log('⚠️ Nenhum arquivo MP3 encontrado na pasta public/audios');
      return;
    }

    console.log(`🎵 Encontrados ${files.length} arquivos de áudio`);

    // Preparar dados para inserção
    const audioInserts = files.map((file, index) => {
      // Limpar o nome do arquivo
      const cleanTitle = file
        .replace(/\.mp3$/i, '') // Remove extensão
        .replace(/[-_]/g, ' ') // Substitui hífens e underscores por espaços
        .replace(/\s+/g, ' ') // Remove espaços extras
        .trim()
        .toUpperCase(); // Converte para maiúsculas

      return {
        title: cleanTitle,
        description: `Áudio importado automaticamente do sistema local`,
        drive_id: null,
        file_path: `/audios/${file}`,
        order_position: index + 1
      };
    });

    // Inserir áudios na tabela
    const { data: insertedAudios, error: insertError } = await supabase
      .from('audios')
      .insert(audioInserts)
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir áudios:', insertError.message);
      return;
    }

    console.log(`✅ ${insertedAudios.length} áudios inseridos com sucesso!`);
    
    // Mostrar alguns exemplos
    console.log('\n📋 Exemplos de áudios inseridos:');
    insertedAudios.slice(0, 5).forEach((audio, index) => {
      console.log(`${index + 1}. ${audio.title}`);
    });

    if (insertedAudios.length > 5) {
      console.log(`... e mais ${insertedAudios.length - 5} áudios`);
    }

    console.log('\n🎉 População da tabela concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar o script
populateAudios();