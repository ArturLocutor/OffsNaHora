/**
 * Google Drive API Integration for Frontend
 * Implementa autenticação OAuth2 e listagem de arquivos de pasta
 */

import { DriveFile } from './driveUtils';

// Configurações da API do Google Drive
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

// Variáveis globais para controle da API
let gapi: any;
let tokenClient: any;
let isGapiLoaded = false;
let isGisLoaded = false;

/**
 * Interface para configuração da API
 */
export interface GoogleDriveConfig {
  clientId: string;
  apiKey: string;
}

/**
 * Carrega as bibliotecas necessárias do Google
 */
export const loadGoogleLibraries = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Carrega a biblioteca GAPI
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      gapi = (window as any).gapi;
      isGapiLoaded = true;
      checkIfReady();
    };
    gapiScript.onerror = () => reject(new Error('Falha ao carregar GAPI'));
    document.head.appendChild(gapiScript);

    // Carrega a biblioteca GIS (Google Identity Services)
    const gisScript = document.createElement('script');
    gisScript.src = 'https://accounts.google.com/gsi/client';
    gisScript.onload = () => {
      isGisLoaded = true;
      checkIfReady();
    };
    gisScript.onerror = () => reject(new Error('Falha ao carregar GIS'));
    document.head.appendChild(gisScript);

    function checkIfReady() {
      if (isGapiLoaded && isGisLoaded) {
        resolve();
      }
    }
  });
};

/**
 * Inicializa a API do Google Drive
 */
export const initializeGoogleDriveApi = async (config: GoogleDriveConfig): Promise<void> => {
  try {
    await loadGoogleLibraries();
    
    // Inicializa GAPI
    await gapi.load('client', async () => {
      await gapi.client.init({
        apiKey: config.apiKey,
        discoveryDocs: [DISCOVERY_DOC],
      });
    });

    // Inicializa o cliente de token
    tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: SCOPES,
      callback: '', // será definido durante a autorização
    });

    console.log('Google Drive API inicializada com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar Google Drive API:', error);
    throw error;
  }
};

/**
 * Solicita autorização do usuário
 */
export const requestAuthorization = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    tokenClient.callback = async (resp: any) => {
      if (resp.error !== undefined) {
        reject(new Error(resp.error));
        return;
      }
      resolve(resp.access_token);
    };

    if (gapi.client.getToken() === null) {
      // Solicita consentimento para obter token de acesso
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      // Pula o diálogo de consentimento se já tiver token
      tokenClient.requestAccessToken({ prompt: '' });
    }
  });
};

/**
 * Revoga a autorização
 */
export const revokeAuthorization = (): void => {
  const token = gapi.client.getToken();
  if (token !== null) {
    (window as any).google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
  }
};

/**
 * Lista todos os arquivos de áudio de uma pasta do Google Drive
 */
export const listAudioFilesFromFolder = async (folderId: string): Promise<DriveFile[]> => {
  try {
    // Verifica se há token de acesso
    if (!gapi.client.getToken()) {
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }

    // Tipos MIME de arquivos de áudio suportados
    const audioMimeTypes = [
      'audio/mpeg',      // MP3
      'audio/wav',       // WAV
      'audio/ogg',       // OGG
      'audio/mp4',       // M4A
      'audio/aac',       // AAC
      'audio/flac',      // FLAC
      'audio/webm'       // WebM Audio
    ];

    // Constrói a query para buscar arquivos de áudio na pasta
    const mimeTypeQuery = audioMimeTypes.map(type => `mimeType='${type}'`).join(' or ');
    const query = `'${folderId}' in parents and (${mimeTypeQuery}) and trashed=false`;

    // Faz a requisição para a API
    const response = await gapi.client.drive.files.list({
      q: query,
      fields: 'files(id,name,mimeType,webViewLink,webContentLink,size)',
      pageSize: 1000,
      orderBy: 'name'
    });

    const files = response.result.files || [];
    
    // Converte para o formato DriveFile
    return files.map((file: any): DriveFile => ({
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      webViewLink: file.webViewLink,
      webContentLink: file.webContentLink,
      size: file.size
    }));

  } catch (error) {
    console.error('Erro ao listar arquivos de áudio da pasta:', error);
    throw new Error('Falha ao listar arquivos da pasta do Google Drive');
  }
};

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = (): boolean => {
  return gapi && gapi.client.getToken() !== null;
};

/**
 * Obtém informações da pasta
 */
export const getFolderInfo = async (folderId: string): Promise<{ name: string; id: string }> => {
  try {
    if (!gapi.client.getToken()) {
      throw new Error('Usuário não autenticado. Faça login primeiro.');
    }

    const response = await gapi.client.drive.files.get({
      fileId: folderId,
      fields: 'id,name'
    });

    return {
      id: response.result.id,
      name: response.result.name
    };
  } catch (error) {
    console.error('Erro ao obter informações da pasta:', error);
    throw new Error('Falha ao obter informações da pasta');
  }
};

/**
 * Configuração padrão (deve ser substituída pelas suas credenciais)
 */
export const DEFAULT_CONFIG: GoogleDriveConfig = {
  clientId: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || 'SEU_CLIENT_ID_AQUI',
  apiKey: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || 'SUA_API_KEY_AQUI'
};

/**
 * Status da inicialização
 */
export const getInitializationStatus = () => ({
  gapiLoaded: isGapiLoaded,
  gisLoaded: isGisLoaded,
  initialized: isGapiLoaded && isGisLoaded
});