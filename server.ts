import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { executeCode } from './server/execution/sandboxRunner.ts';
import {
  spawnInteractiveSession,
  writeSessionInput,
  closeSessionStdin,
  subscribeToSession,
  killSession,
} from './server/execution/interactiveRunner.ts';
import { isDockerAvailable } from './server/execution/dockerEngine.ts';
import { autoBootstrapCompilers } from './server/execution/compilerInstaller.ts';
import { SUPPORTED_LANGUAGES, LANGUAGE_MAP } from './src/config/languages.ts';
import { SupportedLanguageId } from './src/types/index.ts';

// Process safety listeners for pipe or stream breaks
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'EPIPE' || err?.message?.includes('EPIPE')) {
    // Suppress broken pipe errors from child processes or sockets terminating early
    return;
  }
  console.error('Uncaught exception in server process:', err);
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Unhandled promise rejection:', reason);
});

async function startServer() {
  // Proactively ensure OpenJDK 17 and GCC/G++ are installed in the container
  autoBootstrapCompilers().catch((err) => {
    console.warn('Auto-bootstrap compilers error:', err);
  });

  const app = express();
  const PORT = 3000;

  // Permissive CORS for shared previews and external devices
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', async (req, res) => {
    const dockerOnline = await isDockerAvailable();
    res.json({
      status: 'healthy',
      app: 'CodeForge',
      version: '1.0.0',
      database: 'none (client IndexedDB)',
      apiKeysRequired: false,
      dockerAvailable: dockerOnline,
      executionLimits: {
        timeoutSeconds: parseInt(process.env.EXECUTION_TIMEOUT || '5000', 10) / 1000,
        memoryLimit: process.env.MEMORY_LIMIT || '128m',
        cpuLimit: process.env.CPU_LIMIT || '1.0',
        pidsLimit: 64,
        network: 'disabled'
      },
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/languages', (req, res) => {
    res.json({
      languages: SUPPORTED_LANGUAGES
    });
  });

  app.post('/api/run', async (req, res) => {
    try {
      const { language, code, input, files } = req.body;

      if (!language || typeof language !== 'string') {
        return res.status(400).json({
          status: 'system_error',
          output: '',
          error: 'Missing or invalid "language" parameter.',
          executionTime: 0,
          memoryUsageMB: 0,
          sandbox: 'local_runner'
        });
      }

      if (typeof code !== 'string') {
        return res.status(400).json({
          status: 'system_error',
          output: '',
          error: 'Missing or invalid "code" parameter.',
          executionTime: 0,
          memoryUsageMB: 0,
          sandbox: 'local_runner'
        });
      }

      if (!LANGUAGE_MAP.has(language as SupportedLanguageId)) {
        return res.status(400).json({
          status: 'system_error',
          output: '',
          error: `Unsupported language: "${language}". Please select one of the 10 supported languages.`,
          executionTime: 0,
          memoryUsageMB: 0,
          sandbox: 'local_runner'
        });
      }

      const result = await executeCode(
        language as SupportedLanguageId,
        code,
        typeof input === 'string' ? input : '',
        Array.isArray(files) ? files : undefined
      );

      return res.json(result);
    } catch (err: any) {
      console.error('Execution handler error:', err);
      return res.status(500).json({
        status: 'system_error',
        output: '',
        error: `Internal server execution error: ${err.message || 'Unknown error'}`,
        executionTime: 0,
        memoryUsageMB: 0,
        sandbox: 'local_runner'
      });
    }
  });

  // Interactive Terminal Endpoints (Live In-Terminal Execution)
  app.post('/api/terminal/spawn', async (req, res) => {
    try {
      const { language, code, input, mode, files } = req.body;
      if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required.' });
      }
      const executionMode = mode === 'batch' ? 'batch' : 'interactive';
      const result = await spawnInteractiveSession(
        language as SupportedLanguageId,
        code,
        typeof input === 'string' ? input : '',
        executionMode,
        Array.isArray(files) ? files : undefined
      );
      if (result.error) {
        return res.json({
          status: 'compilation_error',
          error: result.error,
          sessionId: result.sessionId,
        });
      }
      return res.json({
        status: 'running',
        sessionId: result.sessionId,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/terminal/:sessionId/stream', (req, res) => {
    const { sessionId } = req.params;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (res.flushHeaders) res.flushHeaders();

    // Immediate comment frame to force reverse proxies (Cloud Run/Nginx) to flush response headers
    res.write(': connected\n\n');

    // Heartbeat ping every 5 seconds to keep the SSE stream alive through reverse proxies
    const heartbeatTimer = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch (e) {
        clearInterval(heartbeatTimer);
      }
    }, 5000);

    const sub = subscribeToSession(sessionId, (event) => {
      try {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
        if (event.type === 'exit' || event.type === 'error') {
          clearInterval(heartbeatTimer);
          res.end();
        }
      } catch (e) {
        clearInterval(heartbeatTimer);
      }
    });

    if (!sub) {
      clearInterval(heartbeatTimer);
      res.write(`data: ${JSON.stringify({ type: 'error', data: 'Session not found or expired' })}\n\n`);
      return res.end();
    }

    // Flush any buffered events that arrived before client connected
    let hasExited = false;
    for (const event of sub.buffer) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
      if (event.type === 'exit' || event.type === 'error') {
        hasExited = true;
      }
    }
    if (hasExited) {
      clearInterval(heartbeatTimer);
      return res.end();
    }

    req.on('close', () => {
      clearInterval(heartbeatTimer);
      sub.unsubscribe();
    });
  });

  const handleStdinPost = (req: express.Request, res: express.Response) => {
    const { sessionId } = req.params;
    const { input } = req.body;
    if (typeof input !== 'string') {
      return res.status(400).json({ error: 'Invalid input' });
    }
    const success = writeSessionInput(sessionId, input);
    return res.json({ success });
  };

  app.post('/api/terminal/:sessionId/stdin', handleStdinPost);
  app.post('/api/terminal/:sessionId/input', handleStdinPost);

  app.post('/api/terminal/:sessionId/eof', (req, res) => {
    const { sessionId } = req.params;
    const success = closeSessionStdin(sessionId);
    return res.json({ success });
  });

  app.post('/api/terminal/:sessionId/kill', (req, res) => {
    const { sessionId } = req.params;
    killSession(sessionId);
    return res.json({ success: true });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 CodeForge server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
