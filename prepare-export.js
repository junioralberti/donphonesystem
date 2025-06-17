// prepare-export.js
const { execSync } = require('child_process');

console.log('🔧 Building Next.js...');
execSync('npx next build', { stdio: 'inherit' });

console.log('📦 Exportando arquivos estáticos...');
execSync('npx next export', { stdio: 'inherit' });

console.log('✅ Exportação concluída com sucesso!');
