import express from 'express';
import { createAudioServer } from './audioServer';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createIntegratedServer() {
  const app = express();
  
  // Criar servidor de áudio
  const audioApp = createAudioServer(3001);
  
  // Montar rotas de áudio no servidor principal
  app.use('/api', audioApp);
  
  // Servir arquivos estáticos de áudio
  app.use('/audios', express.static(path.join(process.cwd(), 'public', 'audios')));
  
  // Criar servidor Vite para desenvolvimento
  const vite = await createViteServer({
    root: path.resolve(__dirname, '../../'),
    server: {
      middlewareMode: true,
      hmr: {
        port: 24678
      }
    }
  });
  
  // Usar Vite como middleware
  app.use(vite.middlewares);
  
  return app;
}

export async function startIntegratedServer(port: number = 8080) {
  const app = await createIntegratedServer();
  
  app.listen(port, () => {
    console.log(`🚀 Servidor integrado rodando na porta ${port}`);
    console.log(`📱 Frontend: http://localhost:${port}`);
    console.log(`🎵 API de áudio: http://localhost:${port}/api`);
    console.log(`📁 Arquivos de áudio: http://localhost:${port}/audios`);
  });
  
  return app;
} 