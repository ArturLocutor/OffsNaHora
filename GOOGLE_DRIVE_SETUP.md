# Configuração da Google Drive API

## Problema Identificado
O sistema não estava encontrando arquivos de áudio nas pastas do Google Drive porque a função `listAudioFilesFromFolder` estava usando uma implementação simulada que sempre retornava um array vazio.

## Solução Implementada
Agora o sistema usa a **Google Drive API real** com duas abordagens:

1. **Método Principal**: OAuth2 com autenticação completa
2. **Método Fallback**: API pública para pastas compartilhadas

## Como Configurar

### 1. Obter Credenciais do Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Ative a **Google Drive API**:
   - Vá em "APIs & Services" > "Library"
   - Procure por "Google Drive API"
   - Clique em "Enable"

### 2. Criar Credenciais

#### API Key (Obrigatória)
1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave gerada
4. (Opcional) Restrinja a chave para maior segurança

#### OAuth 2.0 Client ID (Para autenticação completa)
1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "OAuth client ID"
3. Escolha "Web application"
4. Configure as origens autorizadas:
   - `http://localhost:3001` (desenvolvimento)
   - Seu domínio de produção
5. Copie o Client ID gerado

### 3. Configurar no Projeto

1. Edite o arquivo `.env.local` na raiz do projeto:

```env
# Chave da API do Google Drive (OBRIGATÓRIA)
VITE_GOOGLE_DRIVE_API_KEY=sua_api_key_aqui

# ID do Cliente OAuth 2.0 (OPCIONAL - para autenticação completa)
VITE_GOOGLE_DRIVE_CLIENT_ID=seu_client_id_aqui
```

2. Reinicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Como Usar

### Para Pastas Públicas (Mais Simples)
1. Configure apenas a `VITE_GOOGLE_DRIVE_API_KEY`
2. Certifique-se de que a pasta do Google Drive está **compartilhada publicamente**:
   - Clique com o botão direito na pasta
   - Escolha "Compartilhar"
   - Altere para "Qualquer pessoa com o link"
   - Permissão: "Visualizador"

### Para Pastas Privadas (Autenticação Completa)
1. Configure tanto `VITE_GOOGLE_DRIVE_API_KEY` quanto `VITE_GOOGLE_DRIVE_CLIENT_ID`
2. O usuário precisará fazer login com sua conta Google
3. Funciona com qualquer pasta que o usuário tenha acesso

## Formatos de Áudio Suportados

O sistema detecta automaticamente os seguintes formatos:

**Por MIME Type:**
- MP3 (`audio/mpeg`)
- WAV (`audio/wav`, `audio/wave`)
- OGG (`audio/ogg`)
- M4A (`audio/mp4`)
- AAC (`audio/aac`)
- FLAC (`audio/flac`)
- WebM Audio (`audio/webm`)

**Por Extensão de Arquivo:**
- .mp3, .wav, .ogg, .m4a, .aac, .flac, .wma, .opus, .aiff, .au, .ra, .3gp, .amr, .ac3, .dts, .ape, .mka, .mpc, .tta, .wv, .webm

## Testando a Configuração

1. Vá para a seção "Importação em Lote" no painel administrativo
2. Cole o link de uma pasta do Google Drive
3. Clique em "Buscar Arquivos"
4. Se configurado corretamente, você verá os arquivos de áudio listados

## Solução de Problemas

### "Chave da API do Google Drive não configurada"
- Verifique se `VITE_GOOGLE_DRIVE_API_KEY` está definida no `.env.local`
- Reinicie o servidor após adicionar a variável

### "Acesso negado"
- Verifique se a pasta está compartilhada publicamente
- Confirme se a API key está correta
- Verifique se a Google Drive API está ativada no projeto

### "Pasta não encontrada"
- Confirme se o ID da pasta está correto no URL
- Verifique se a pasta existe e não foi deletada

### Nenhum arquivo encontrado
- Confirme se há arquivos de áudio na pasta
- Verifique se os arquivos têm extensões suportadas
- Certifique-se de que os arquivos não estão na lixeira

## Arquivos Modificados

- `src/utils/driveUtils.ts` - Implementação real da API
- `src/utils/googleDriveApi.ts` - Configuração OAuth2
- `.env.local` - Variáveis de ambiente (criado)
- `GOOGLE_DRIVE_SETUP.md` - Este guia (criado)

## Status da Implementação

✅ **Concluído:**
- Integração real com Google Drive API
- Suporte para pastas públicas e privadas
- Detecção automática de arquivos de áudio
- Tratamento de erros robusto
- Configuração via variáveis de ambiente

🔄 **Próximos Passos:**
- Configurar as chaves da API
- Testar com pasta real do Google Drive