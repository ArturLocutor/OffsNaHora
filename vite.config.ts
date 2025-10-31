import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import type { ViteDevServer } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

// Plugin noob-friendly: expõe /api/audio-files em dev e gera audios.json no build
function audioDevAndBuildPlugin() {
  const allowedExts = new Set([".mp3", ".wav", ".ogg", ".m4a", ".aac"]);
  const audiosDir = path.resolve(__dirname, "public", "audios");

  function listFiles() {
    if (!fs.existsSync(audiosDir)) return [];

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
            const fileNameRaw = relativePath ? path.join(relativePath, item) : item;
            const fileName = fileNameRaw.replace(/\\/g, '/');
            const webPath = `/audios/${fileName}`;
            files.push({
              name: fileName,
              path: webPath,
              size: stat.size
            });
          }
        }
      }
      
      return files;
    };

    return readAudioFilesRecursively(audiosDir);
  }

  return {
    name: "audio-dev-and-manifest",
    configureServer(server: ViteDevServer) {
      // API de listagem nativa no dev (sem servidor integrado)
      server.middlewares.use("/api/audio-files", (req: IncomingMessage, res: ServerResponse) => {
        try {
          const files = listFiles();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ files }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: "Erro ao listar arquivos" }));
        }
      });
      // Manifesto estático para fallback no cliente
      server.middlewares.use("/audios.json", (req: IncomingMessage, res: ServerResponse) => {
        try {
          const files = listFiles();
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ files }));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: "Erro ao gerar manifesto" }));
        }
      });
    },
    writeBundle() {
      // Gerar manifesto no build
      try {
        const files = listFiles();
        const distDir = path.resolve(__dirname, "dist");
        if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
        fs.writeFileSync(path.join(distDir, "audios.json"), JSON.stringify({ files }, null, 2));
      } catch (e) {
        console.warn("[audio] Falha ao escrever audios.json:", e);
      }
    },
  } as any;
}

export default defineConfig({
  plugins: [react(), audioDevAndBuildPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    // Em dev, servimos /api/audio-files via plugin; não precisamos proxy.
    proxy: process.env.INTEGRATED_SERVER === '1' ? {} : {},
  },
});
