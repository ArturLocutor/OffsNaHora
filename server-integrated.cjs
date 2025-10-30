const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createServer: createViteServer } = require('vite');

const app = express();
const PORT = process.env.PORT || 8080;
// Indicar ao Vite que estamos rodando em modo servidor integrado
process.env.INTEGRATED_SERVER = '1';

// Segurança básica
app.use(helmet({
  contentSecurityPolicy: false, // desabilita CSP no modo dev (Vite HMR)
  crossOriginEmbedderPolicy: false,
  hsts: false,
}));

// Configurar CORS restrito ao mesmo origin
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Parser JSON
app.use(express.json());

// Middleware de autenticação simples para rotas administrativas
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;
const requireAdmin = (req, res, next) => {
  const token = req.headers['x-admin-token'];
  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return res.status(401).json({ success: false, error: 'Acesso não autorizado' });
  }
  next();
};
// Rate limiting para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'audios');
    
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
      cb(new Error('Tipo de arquivo não suportado. Use MP3, WAV, OGG, M4A ou AAC.'), false);
    }
  }
});

// Rota para upload de arquivo
app.post('/api/upload-audio', requireAdmin, upload.single('audio'), (req, res) => {
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

// Rota para importar arquivo do Google Drive (download para public/audios)
app.post('/api/import-drive-file', requireAdmin, async (req, res) => {
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
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return res.status(502).json({ success: false, error: `Falha ao baixar do Drive: ${response.status} ${response.statusText}` });
    }

    // Tentar obter nome do arquivo do header
    const cd = response.headers.get('content-disposition') || '';
    const nameMatch = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i);
    const originalNameRaw = (nameMatch && (nameMatch[1] || nameMatch[2])) || `${id}.mp3`;
    const originalName = decodeURIComponent(originalNameRaw);
    let ext = path.extname(originalName) || '.mp3';
    const allowedExts = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
    if (!allowedExts.has(ext.toLowerCase())) {
      ext = '.mp3'; // força extensão segura
    }

    // Normalizar nome
    const baseName = originalName.replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .substring(0, 30);
    const finalName = `${baseName}-${Date.now()}${ext}`;

    // Garantir diretório
    const uploadDir = path.join(__dirname, 'public', 'audios');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // Gravar arquivo
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limitar tamanho (50MB)
    const MAX_SIZE = 50 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(413).json({ success: false, error: 'Arquivo excede o tamanho máximo permitido (50MB)' });
    }
    const finalPath = path.join(uploadDir, finalName);
    fs.writeFileSync(finalPath, buffer);

    return res.json({ success: true, fileName: finalName, originalName, path: `/audios/${finalName}` });
  } catch (error) {
    console.error('Erro ao importar arquivo do Drive:', error);
    return res.status(500).json({ success: false, error: 'Erro interno ao importar arquivo do Drive' });
  }
});

// Helper para resolver diretório de áudios (suporta public/audios e public/audio)
function ensureAudiosDir() {
  const dir = path.join(__dirname, 'public', 'audios');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function migrateSingularDirToAudios() {
  const audiosDir = ensureAudiosDir();
  const singularDir = path.join(__dirname, 'public', 'audio');
  if (!fs.existsSync(singularDir)) return;
  const allowed = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
  let migrated = 0;
  let skipped = 0;
  for (const file of fs.readdirSync(singularDir)) {
    const ext = path.extname(file).toLowerCase();
    if (!allowed.has(ext)) continue;
    const src = path.join(singularDir, file);
    const dest = path.join(audiosDir, file);
    if (fs.existsSync(dest)) { skipped++; continue; }
    try { fs.renameSync(src, dest); migrated++; } catch { skipped++; }
  }
  try { fs.rmdirSync(singularDir); } catch {}
  console.log(`[Padronização] Migração concluída: ${migrated} movidos, ${skipped} ignorados. Use apenas public/audios.`);
}

// Executa migração uma vez ao iniciar
migrateSingularDirToAudios();

// Rota para listar arquivos de áudio
app.get('/api/audio-files', (req, res) => {
  try {
    const audioDir = ensureAudiosDir();

    // Função recursiva para ler arquivos em subpastas
    const readAudioFilesRecursively = (dir, relativePath = '') => {
      const files = [];
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
app.delete('/api/audio-files/:filename', requireAdmin, (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename || typeof filename !== 'string') {
      return res.status(400).json({ success: false, error: 'Nome de arquivo inválido' });
    }

    // Validar nome do arquivo para evitar path traversal
    const isSafe = (
      filename === path.basename(filename) &&
      !filename.includes('..') &&
      !/[\\/]/.test(filename) &&
      /^[a-zA-Z0-9._-]+$/.test(filename)
    );
    const allowedExts = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac']);
    const hasAllowedExt = allowedExts.has(path.extname(filename).toLowerCase());
    if (!isSafe || !hasAllowedExt) {
      return res.status(400).json({ success: false, error: 'Nome de arquivo não permitido' });
    }

    const baseDir = ensureAudiosDir();
    const filePath = path.join(baseDir, filename);
    
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

// Rota para renomear locutor (pasta)
app.post('/api/rename-speaker', requireAdmin, (req, res) => {
  try {
    const { oldName, newName } = req.body;
    
    if (!oldName || !newName) {
      return res.status(400).json({ 
        success: false, 
        error: 'Parâmetros oldName e newName são obrigatórios' 
      });
    }

    // Validar caracteres especiais no nome
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      return res.status(400).json({ 
        success: false, 
        error: 'O nome não pode conter os caracteres: < > : " / \\ | ? *' 
      });
    }

    // Validar tamanho do nome
    if (newName.length > 50) {
      return res.status(400).json({ 
        success: false, 
        error: 'O nome do locutor deve ter no máximo 50 caracteres' 
      });
    }

    // Validar nomes reservados
    const reservedNames = ['Todos', 'todos', 'ALL', 'all', 'admin', 'Admin'];
    if (reservedNames.includes(newName)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Este nome é reservado e não pode ser usado' 
      });
    }

    const audioDir = ensureAudiosDir();
    const oldPath = path.join(audioDir, oldName);
    const newPath = path.join(audioDir, newName);

    // Verificar se a pasta antiga existe
    if (!fs.existsSync(oldPath)) {
      return res.status(404).json({ 
        success: false, 
        error: 'Pasta do locutor não encontrada' 
      });
    }

    // Verificar se a nova pasta já existe
    if (fs.existsSync(newPath)) {
      return res.status(409).json({ 
        success: false, 
        error: 'Já existe uma pasta com este nome' 
      });
    }

    // Renomear a pasta
    fs.renameSync(oldPath, newPath);

    res.json({
      success: true,
      message: `Locutor renomeado de "${oldName}" para "${newName}" com sucesso`
    });
  } catch (error) {
    console.error('Erro ao renomear locutor:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor ao renomear locutor' 
    });
  }
});

// Servir arquivos estáticos da pasta public (sem index e com cache)
app.use('/audios', express.static(ensureAudiosDir(), {
  index: false,
  etag: true,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'public, max-age=31536000');
  }
}));

// Função para iniciar o servidor Vite como middleware
async function startViteMiddleware() {
  try {
    const vite = await createViteServer({
      root: __dirname,
      server: {
        middlewareMode: true,
        hmr: {
          port: 24678
        }
      }
    });

    // Usar Vite como middleware
    app.use(vite.middlewares);

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor integrado rodando na porta ${PORT}`);
      console.log(`📱 Frontend: http://localhost:${PORT}`);
      console.log(`🎵 API de áudio: http://localhost:${PORT}/api`);
      console.log(`📁 Arquivos de áudio: http://localhost:${PORT}/audios`);
    });
  } catch (error) {
    console.error('Erro ao iniciar servidor Vite:', error);
    process.exit(1);
  }
}

// Iniciar servidor
startViteMiddleware();