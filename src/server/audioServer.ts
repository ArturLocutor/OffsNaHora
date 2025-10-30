import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

export const createAudioServer = (port: number = 3001) => {
  const app = express();
  
  // Padronizar pasta de áudios e migrar se necessário
  const audiosDir = path.join(process.cwd(), 'public', 'audios');
  const audioDirSingular = path.join(process.cwd(), 'public', 'audio');
  if (!fs.existsSync(audiosDir)) fs.mkdirSync(audiosDir, { recursive: true });
  if (fs.existsSync(audioDirSingular)) {
    const allowed = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
    let migrated = 0;
    let skipped = 0;
    for (const file of fs.readdirSync(audioDirSingular)) {
      const ext = path.extname(file).toLowerCase();
      if (!allowed.has(ext)) continue;
      const src = path.join(audioDirSingular, file);
      const dest = path.join(audiosDir, file);
      if (fs.existsSync(dest)) { skipped++; continue; }
      try { fs.renameSync(src, dest); migrated++; } catch { skipped++; }
    }
    try { fs.rmdirSync(audioDirSingular); } catch {}
    console.log(`[Padronização] Migração concluída: ${migrated} movidos, ${skipped} ignorados. Use apenas public/audios.`);
  }

  // Configurar CORS
  app.use(cors());
  app.use(express.json());

  // Configurar multer para upload de arquivos
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(process.cwd(), 'public', 'audios');
      
      // Criar diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Otimizar nome do arquivo para facilitar identificação
      const timestamp = Date.now();
      const originalName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extensão
      const cleanName = originalName
        .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .toLowerCase()
        .substring(0, 30); // Limita a 30 caracteres
      
      const ext = path.extname(file.originalname);
      const finalName = `${cleanName}-${timestamp}${ext}`;
      cb(null, finalName);
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    },
    fileFilter: function (req, file, cb) {
      // Validar tipos de arquivo
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/aac'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    }
  });

  // Rota para importar arquivo do Google Drive (download para public/audios)
  app.post('/api/import-drive-file', async (req, res) => {
    try {
      const { url } = req.body || {};
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ success: false, error: 'Parâmetro "url" é obrigatório' });
      }

      // Extrair ID do Drive de formatos comuns
      const idMatch = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]{10,})/);
      const id = idMatch ? idMatch[1] : null;
      if (!id) {
        return res.status(400).json({ success: false, error: 'Não foi possível extrair o ID do Drive desse link' });
      }

      const downloadUrl = `https://docs.google.com/uc?export=download&id=${id}`;
      const response = await fetch(downloadUrl as any);
      if (!response.ok) {
        return res.status(502).json({ success: false, error: `Falha ao baixar do Drive: ${response.status} ${response.statusText}` });
      }

      // Nome do arquivo via header
      const cd = response.headers.get('content-disposition') || '';
      const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
      const originalNameRaw = (nameMatch && (nameMatch[1] || nameMatch[2])) || `${id}.mp3`;
      const originalName = decodeURIComponent(originalNameRaw);
      const ext = path.extname(originalName) || '.mp3';

      const baseName = originalName.replace(/\.[^/.]+$/, '')
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
        .substring(0, 30);
      const finalName = `${baseName}-${Date.now()}${ext}`;

      const uploadDir = path.join(process.cwd(), 'public', 'audios');
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const finalPath = path.join(uploadDir, finalName);
      fs.writeFileSync(finalPath, buffer);

      return res.json({ success: true, fileName: finalName, originalName, path: `/audios/${finalName}` });
    } catch (error) {
      console.error('Erro ao importar arquivo do Drive:', error);
      return res.status(500).json({ success: false, error: 'Erro interno ao importar arquivo do Drive' });
    }
  });

  // Rota para upload de arquivo
  app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          error: 'Nenhum arquivo foi enviado' 
        });
      }

      res.json({
        success: true,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        path: `/audios/${req.file.filename}`
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro interno do servidor' 
      });
    }
  });

  // Rota para listar arquivos de áudio
  app.get('/api/audio-files', (req, res) => {
    try {
      const audioDir = audiosDir;

      // Função recursiva para ler arquivos em subpastas
      const readAudioFilesRecursively = (dir: string, relativePath: string = ''): any[] => {
        const files: any[] = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            // Se é uma pasta, ler recursivamente
            const subFiles = readAudioFilesRecursively(fullPath, path.join(relativePath, item));
            files.push(...subFiles);
          } else if (stat.isFile()) {
            // Se é um arquivo, verificar se é de áudio
            const ext = path.extname(item).toLowerCase();
            if (['.mp3', '.wav', '.ogg', '.m4a', '.aac'].includes(ext)) {
              const fileName = relativePath ? path.join(relativePath, item) : item;
              files.push({
                name: fileName,
                path: `/audios/${fileName}`,
                size: stat.size
              });
            }
          }
        }
        
        return files;
      };

      const files = readAudioFilesRecursively(audioDir);
      res.json({ files });
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Erro ao listar arquivos' 
      });
    }
  });

  // Rota para deletar arquivo
  app.delete('/api/audio-files/:filename', (req, res) => {
    try {
      const filename = req.params.filename;
      const filePath = path.join(audiosDir, filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Arquivo deletado com sucesso' });
      } else {
        res.status(404).json({ success: false, error: 'Arquivo não encontrado' });
      }
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error);
      res.status(500).json({ success: false, error: 'Erro ao deletar arquivo' });
    }
  });

  // Servir arquivos estáticos apenas de public/audios
  app.use('/audios', express.static(audiosDir));

  return app;
};

export const startAudioServer = (port: number = 3001) => {
  const app = createAudioServer(port);
  
  app.listen(port, () => {
    console.log(`🚀 Servidor de upload integrado rodando na porta ${port}`);
    console.log(`📁 Pasta de upload: ${path.join(process.cwd(), 'public', 'audios')}`);
  });

  return app;
};