// ===============================================================
// FILE: /server.js | VERSION: 1.1 (ESM)
// Generic development server for the subproject.
// ===============================================================

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// The port is read from the PORT environment variable.
// This is typically set by the server.bat script.
// If the variable is not found, it defaults to 8081.
const PORT = process.env.PORT || 8081; 

// Replicate __dirname functionality in ES modules.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the root of this subproject.
const projectRoot = __dirname;
app.use(express.static(projectRoot));

console.log(`Serving static files from: ${projectRoot}`);

app.listen(PORT, () => {
    console.log(`✅ Development server for gallery-component-v2 is running.`);
    console.log(`   Open your test files at: http://localhost:${PORT}`);
    console.log(`   Example: http://localhost:${PORT}/test-modal.html`);
});
