import { startIntegratedServer } from './integratedServer';

async function main() {
  try {
    await startIntegratedServer(8080);
  } catch (error) {
    console.error('Erro ao iniciar servidor integrado:', error);
    process.exit(1);
  }
}

main(); 