# Sistema de Áudio Integrado - Setup Completo

## 🎯 Problema Resolvido

**Antes:** Era necessário executar `npm run dev:full` para que os áudios funcionassem, exigindo que uma máquina estivesse sempre ligada executando o comando.

**Agora:** Os áudios funcionam nativamente no backend do site, sem necessidade de comandos separados.

## 🚀 Como Usar

### Opção 1: Servidor Integrado (Recomendado)

```bash
# Iniciar servidor integrado (frontend + API de áudio)
node server-integrated.cjs
```

Isso irá:
- ✅ Iniciar o servidor Vite na porta 8080
- ✅ Iniciar a API de áudio integrada na mesma porta
- ✅ Servir os arquivos de áudio estaticamente
- ✅ Funcionar sem necessidade de comandos separados

### Opção 2: Comando Bun (Alternativo)

```bash
# Se você tem Bun instalado
bun run dev:server
```

### Opção 3: Comando Legacy (Não Recomendado)

```bash
# Comando antigo que ainda funciona
npm run dev:full
```

## 🎵 Funcionalidades Disponíveis

### Upload de Áudio
- ✅ Suporte para MP3, WAV, OGG, M4A, AAC
- ✅ Limite de 50MB por arquivo
- ✅ Nomes únicos automáticos
- ✅ Validação de tipos de arquivo

### API Endpoints
- `POST /api/upload-audio` - Upload de arquivo
- `GET /api/audio-files` - Listar arquivos
- `DELETE /api/audio-files/:filename` - Deletar arquivo
- `GET /audios/:filename` - Servir arquivo

### Interface Web
- ✅ Upload via interface web
- ✅ Listagem de arquivos disponíveis
- ✅ Exclusão de arquivos
- ✅ Organização por ordem

## 📁 Estrutura de Arquivos

```
├── server-integrated.cjs          # Servidor integrado (PRINCIPAL)
├── server.cjs                     # Servidor separado (legado)
├── src/
│   ├── server/
│   │   ├── audioServer.ts         # Servidor de áudio
│   │   ├── integratedServer.ts    # Servidor integrado
│   │   └── startIntegratedServer.ts
│   └── utils/
│       ├── audioUpload.ts         # Utilitário de upload
│       ├── publicAudioManager.ts  # Gerenciador de arquivos
│       └── audioSync.ts          # Sincronização
└── public/
    └── audios/                   # Pasta de arquivos de áudio
```

## 🔧 Configuração

### Variáveis de Ambiente (Opcional)
```bash
PORT=8080                 # Porta do servidor
UPLOAD_DIR=./public/audios # Pasta de upload
MAX_FILE_SIZE=52428800    # Tamanho máximo (50MB)
```

## 🚀 Deploy

### Vercel/Netlify
O sistema integrado funciona automaticamente em plataformas como Vercel e Netlify.

### Servidor Próprio
1. Build do projeto: `npm run build`
2. Servir arquivos estáticos
3. Configurar proxy para `/api` e `/audios`

## 🐛 Troubleshooting

### Erro: "Arquivo não encontrado"
- Verifique se a pasta `public/audios/` existe
- Confirme se o arquivo foi enviado corretamente

### Erro: "Tipo de arquivo não suportado"
- Use apenas MP3, WAV, OGG, M4A ou AAC
- Verifique se o arquivo não está corrompido

### Erro: "Arquivo muito grande"
- Reduza o tamanho do arquivo (máximo 50MB)
- Ou aumente o limite no servidor

## 📝 Vantagens do Sistema Integrado

1. **Simplicidade:** Um único comando para iniciar tudo
2. **Confiabilidade:** Não depende de múltiplos processos
3. **Produção:** Funciona automaticamente em deploy
4. **Manutenção:** Menos arquivos para gerenciar
5. **Performance:** Menos overhead de rede

## 🔄 Migração

### De: Sistema Antigo
```bash
npm run dev:full  # Requeria dois processos
```

### Para: Sistema Novo
```bash
node server-integrated.cjs  # Um único processo
```

## ✅ Status Final

- ✅ **Servidor integrado funcionando**
- ✅ **Upload de áudio nativo**
- ✅ **API de áudio integrada**
- ✅ **Frontend + Backend unificados**
- ✅ **Compatível com deploy automático**
- ✅ **Não requer máquina sempre ligada**

## 🎉 Resultado

Agora você pode:
1. Executar `node server-integrated.cjs`
2. Acessar http://localhost:8080
3. Usar todos os recursos de áudio normalmente
4. Fazer deploy sem configurações especiais

**Os áudios funcionam nativamente no backend do site!** 🎵 