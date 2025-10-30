/**
 * Utilitário para extrair ID do Google Drive a partir de diferentes formatos de URL
 */

/**
 * Extrai o ID do Google Drive a partir de uma URL
 * Suporta formatos:
 * - https://drive.google.com/file/d/{ID}/view
 * - https://drive.google.com/open?id={ID}
 * - https://docs.google.com/document/d/{ID}/edit
 * - https://drive.google.com/drive/folders/{ID}
 * 
 * @param url URL do Google Drive
 * @returns ID do arquivo ou null se não for possível extrair
 */
export const extractDriveId = (url: string): string | null => {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Padrão para links do tipo https://drive.google.com/file/d/{ID}/view
    const fileIdMatch = url.match(/\/file\/d\/([^/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return fileIdMatch[1];
    }
    
    // Padrão para links do tipo https://drive.google.com/open?id={ID}
    const openIdMatch = url.match(/[?&]id=([^&]+)/);
    if (openIdMatch && openIdMatch[1]) {
      return openIdMatch[1];
    }
    
    // Padrão para links do tipo https://docs.google.com/document/d/{ID}/edit
    const docsMatch = url.match(/\/document\/d\/([^/]+)/);
    if (docsMatch && docsMatch[1]) {
      return docsMatch[1];
    }
    
    // Padrão para links do tipo https://drive.google.com/drive/folders/{ID}
    const folderMatch = url.match(/\/folders\/([^/]+)/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair ID do Google Drive:', error);
    return null;
  }
};

/**
 * Verifica se uma URL é um link válido do Google Drive
 * 
 * @param url URL para verificar
 * @returns true se for um link válido do Google Drive
 */
export const isValidDriveUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Verifica se a URL contém domínios do Google Drive
  const isDriveUrl = url.includes('drive.google.com') || url.includes('docs.google.com');
  
  // Verifica se conseguimos extrair um ID
  const hasId = !!extractDriveId(url);
  
  return isDriveUrl && hasId;
};

/**
 * Extrai o ID de uma pasta do Google Drive a partir de uma URL
 * Suporta formatos:
 * - https://drive.google.com/drive/folders/{ID}
 * - https://drive.google.com/drive/u/0/folders/{ID}
 * 
 * @param url URL da pasta do Google Drive
 * @returns ID da pasta ou null se não for possível extrair
 */
export const extractFolderId = (url: string): string | null => {
  try {
    if (!url || typeof url !== 'string') {
      return null;
    }

    // Padrão para links de pasta do tipo https://drive.google.com/drive/folders/{ID}
    const folderMatch = url.match(/\/folders\/([^/?]+)/);
    if (folderMatch && folderMatch[1]) {
      return folderMatch[1];
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao extrair ID da pasta do Google Drive:', error);
    return null;
  }
};

/**
 * Verifica se uma URL é um link válido de pasta do Google Drive
 * 
 * @param url URL para verificar
 * @returns true se for um link válido de pasta do Google Drive
 */
export const isValidDriveFolderUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Verifica se a URL contém o padrão de pasta
  const isFolderUrl = url.includes('drive.google.com') && url.includes('/folders/');
  
  // Verifica se conseguimos extrair um ID de pasta
  const hasId = !!extractFolderId(url);
  
  return isFolderUrl && hasId;
};

/**
 * Interface para representar um arquivo do Google Drive
 */
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  size?: string;
}

/**
 * Lista todos os arquivos de áudio de uma pasta do Google Drive
 * Usa a implementação real da Google Drive API
 * 
 * @param folderId ID da pasta do Google Drive
 * @returns Promise com array de arquivos de áudio
 */
export const listAudioFilesFromFolder = async (folderId: string): Promise<DriveFile[]> => {
  try {
    // Importa dinamicamente a função da Google Drive API
    const { listAudioFilesFromFolder: apiListFiles } = await import('./googleDriveApi');
    
    // Usa a implementação real da API
    return await apiListFiles(folderId);
    
  } catch (error) {
    console.error('Erro ao listar arquivos de áudio da pasta:', error);
    
    // Se falhar com a API, tenta uma implementação alternativa usando URLs públicas
    // Esta é uma implementação de fallback que pode funcionar com pastas públicas
    try {
      return await listAudioFilesFromPublicFolder(folderId);
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError);
      throw new Error('Falha ao listar arquivos da pasta do Google Drive. Verifique se a pasta está compartilhada publicamente.');
    }
  }
};

/**
 * Implementação alternativa para pastas públicas do Google Drive
 * Usa a API pública sem autenticação OAuth
 */
export const listAudioFilesFromPublicFolder = async (folderId: string): Promise<DriveFile[]> => {
  try {
    // Tenta usar a chave da API das variáveis de ambiente
    const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
    
    if (!apiKey || apiKey === 'SUA_API_KEY_AQUI') {
      throw new Error('Chave da API do Google Drive não configurada. Configure VITE_GOOGLE_DRIVE_API_KEY no arquivo .env.local');
    }
    
    // Suporte a Shared Drives (Drives compartilhados) e ordenação por nome
    const params = new URLSearchParams({
      q: `'${folderId}' in parents and trashed=false`,
      key: apiKey,
      fields: 'files(id,name,mimeType,size)',
      includeItemsFromAllDrives: 'true',
      supportsAllDrives: 'true',
      orderBy: 'name',
      pageSize: '1000'
    });

    const url = `https://www.googleapis.com/drive/v3/files?${params.toString()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 403) {
        // Tentar extrair mensagem detalhada da API
        let apiErrorMsg = 'Acesso negado.';
        try {
          const errData = await response.json();
          if (errData?.error?.message) apiErrorMsg = errData.error.message;
        } catch {}
        throw new Error(
          `${apiErrorMsg} Verifique se a pasta está compartilhada publicamente (Qualquer pessoa com o link, Visualizador). ` +
          `Se for um Shared Drive, garanta que a pasta e os itens estejam públicos. ` +
          `Confirme também se a Google Drive API está habilitada e se sua API key não possui restrições de HTTP referrer que bloqueiem localhost.`
        );
      }
      if (response.status === 404) {
        throw new Error('Pasta não encontrada. Verifique se o ID da pasta está correto.');
      }
      throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Erro da API do Google Drive: ${data.error.message}`);
    }
    
    const files = data.files || [];
    
    // Filtra apenas arquivos de áudio
    const audioFiles = files.filter((file: any) => {
      return isAudioMimeType(file.mimeType) || isAudioFile(file.name);
    });
    
    // Converte para o formato DriveFile
    return audioFiles.map((file: any): DriveFile => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType || 'application/octet-stream',
      webViewLink: `https://drive.google.com/file/d/${file.id}/view`,
      webContentLink: `https://drive.google.com/uc?id=${file.id}`,
      size: file.size || 'Desconhecido'
    }));
    
  } catch (error) {
    console.error('Erro na implementação de fallback:', error);
    throw error;
  }
};

/**
 * Filtra arquivos por tipo de áudio baseado no nome do arquivo
 * 
 * @param files Array de arquivos
 * @returns Array filtrado apenas com arquivos de áudio
 */
export const filterAudioFiles = (files: DriveFile[]): DriveFile[] => {
  const audioExtensions = [
    '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm',
    '.wma', '.au', '.snd', '.mid', '.midi', '.ra', '.rm',
    '.3gp', '.amr', '.opus', '.ape', '.wv'
  ];
  
  return files.filter(file => {
    const fileName = file.name.toLowerCase();
    return audioExtensions.some(ext => fileName.endsWith(ext));
  });
};

/**
 * Verifica se um arquivo é de áudio baseado no nome
 * 
 * @param fileName Nome do arquivo
 * @returns true se for um arquivo de áudio
 */
export const isAudioFile = (fileName: string): boolean => {
  const audioExtensions = [
    '.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac', '.webm',
    '.wma', '.au', '.snd', '.mid', '.midi', '.ra', '.rm',
    '.3gp', '.amr', '.opus', '.ape', '.wv'
  ];
  
  const lowerFileName = fileName.toLowerCase();
  return audioExtensions.some(ext => lowerFileName.endsWith(ext));
};

/**
 * Verifica se um tipo MIME é de áudio
 * 
 * @param mimeType Tipo MIME do arquivo
 * @returns true se for um tipo MIME de áudio
 */
export const isAudioMimeType = (mimeType: string): boolean => {
  const audioMimeTypes = [
    'audio/mpeg',      // MP3
    'audio/wav',       // WAV
    'audio/wave',      // WAV alternativo
    'audio/ogg',       // OGG
    'audio/mp4',       // M4A
    'audio/aac',       // AAC
    'audio/flac',      // FLAC
    'audio/webm',      // WebM Audio
    'audio/x-wav',     // WAV alternativo
    'audio/x-mpeg',    // MP3 alternativo
    'audio/x-m4a',     // M4A alternativo
    'audio/vnd.wav',   // WAV padrão
    'audio/basic',     // AU/SND
    'audio/midi',      // MIDI
    'audio/x-midi',    // MIDI alternativo
    'audio/x-ms-wma',  // WMA
    'audio/vnd.rn-realaudio', // RealAudio
    'audio/3gpp',      // 3GP
    'audio/amr'        // AMR
  ];
  
  return audioMimeTypes.includes(mimeType.toLowerCase());
};

/**
 * Obtém informações sobre um tipo de arquivo de áudio
 * 
 * @param fileName Nome do arquivo
 * @returns Objeto com informações sobre o tipo de áudio
 */
export const getAudioFileInfo = (fileName: string) => {
  const lowerFileName = fileName.toLowerCase();
  
  const audioTypes = {
    '.mp3': { name: 'MP3', description: 'MPEG Audio Layer 3', quality: 'Boa compressão' },
    '.wav': { name: 'WAV', description: 'Waveform Audio File', quality: 'Alta qualidade' },
    '.flac': { name: 'FLAC', description: 'Free Lossless Audio Codec', quality: 'Sem perda' },
    '.ogg': { name: 'OGG', description: 'Ogg Vorbis', quality: 'Boa compressão' },
    '.m4a': { name: 'M4A', description: 'MPEG-4 Audio', quality: 'Boa qualidade' },
    '.aac': { name: 'AAC', description: 'Advanced Audio Coding', quality: 'Boa compressão' },
    '.webm': { name: 'WebM', description: 'WebM Audio', quality: 'Web otimizado' },
    '.wma': { name: 'WMA', description: 'Windows Media Audio', quality: 'Compressão média' }
  };
  
  for (const [ext, info] of Object.entries(audioTypes)) {
    if (lowerFileName.endsWith(ext)) {
      return { extension: ext, ...info };
    }
  }
  
  return { extension: 'unknown', name: 'Desconhecido', description: 'Tipo não identificado', quality: 'N/A' };
};