import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SYSTEM_INSTRUCTION =
  "You are the NEXUS AI Hardware Intelligence Engine. Given a user's CPU, GPU, RAM, target game, and resolution, estimate real-world performance based on modern benchmark data. Return only valid JSON adhering strictly to the provided response schema.";

const HARDWARE_INTELLIGENCE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    cpu: {
      type: Type.STRING,
      description: 'Normalized CPU model name.',
    },
    gpu: {
      type: Type.STRING,
      description: 'Normalized GPU model name and VRAM capacity.',
    },
    ram: {
      type: Type.STRING,
      description: 'Normalized system memory configuration.',
    },
    game: {
      type: Type.STRING,
      description: 'Target game title.',
    },
    resolution: {
      type: Type.STRING,
      description: 'Target rendering resolution (e.g., 1080p, 1440p, 4K).',
    },
    avgFps: {
      type: Type.INTEGER,
      description: 'Estimated real-world average frames per second (FPS).',
    },
    onePercentLowFps: {
      type: Type.INTEGER,
      description: 'Estimated 1% low FPS representing frame-pacing stability.',
    },
    frameTimeMs: {
      type: Type.NUMBER,
      description: 'Estimated average frame time in milliseconds (1000 / avgFps).',
    },
    vramUsageGb: {
      type: Type.NUMBER,
      description: 'Estimated dedicated VRAM usage in gigabytes at the target resolution.',
    },
    systemPowerWatts: {
      type: Type.INTEGER,
      description: 'Estimated typical gaming system power draw in Watts.',
    },
    recommendedPreset: {
      type: Type.STRING,
      description: 'Recommended graphics quality preset (e.g., Low, Medium, High, Ultra, RT Overdrive).',
    },
    recommendedUpscaler: {
      type: Type.STRING,
      description: 'Recommended upscaling configuration (e.g., Native TAA, DLSS Quality, FSR Balanced, XeSS Quality).',
    },
    bottleneckComponent: {
      type: Type.STRING,
      description: 'Primary limiting component (e.g., GPU Bound, CPU Bound, VRAM Capacity Bound, Balanced Rig).',
    },
    playabilityTier: {
      type: Type.STRING,
      description: 'Playability classification (e.g., Esports 240Hz+, Competitive 120Hz+, Smooth 60+ FPS, Playable 40-59 FPS, Below Minimum).',
    },
    technicalVerdict: {
      type: Type.STRING,
      description: 'Concise 2-sentence hardware lab analysis explaining frame pacing, architectural strengths, and expected gameplay fluidity.',
    },
    optimizationTips: {
      type: Type.ARRAY,
      items: {
        type: Type.STRING,
      },
      description: 'Three concrete in-game or hardware tuning recommendations to maximize 1% low FPS and visual clarity.',
    },
  },
  required: [
    'cpu',
    'gpu',
    'ram',
    'game',
    'resolution',
    'avgFps',
    'onePercentLowFps',
    'frameTimeMs',
    'vramUsageGb',
    'systemPowerWatts',
    'recommendedPreset',
    'recommendedUpscaler',
    'bottleneckComponent',
    'playabilityTier',
    'technicalVerdict',
    'optimizationTips',
  ],
};

function getGenAIClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const handleHardwareIntelligence = async (req: express.Request, res: express.Response) => {
    try {
      const { cpu, gpu, ram, game, resolution } = req.body ?? {};

      if (!cpu || !gpu || !ram || !game || !resolution) {
        res.status(400).json({
          error: 'Missing required fields: cpu, gpu, ram, game, and resolution are required.',
        });
        return;
      }

      if (!process.env.GEMINI_API_KEY) {
        res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server. Please check Settings > Secrets.',
        });
        return;
      }

      const ai = getGenAIClient();
      const prompt = `Estimate real-world gaming performance for the following hardware configuration and workload:
- CPU: ${String(cpu).trim()}
- GPU: ${String(gpu).trim()}
- RAM: ${String(ram).trim()}
- Target Game: ${String(game).trim()}
- Target Resolution: ${String(resolution).trim()}

Base your estimate on modern hardware benchmark telemetry, VRAM constraints, memory bandwidth, and CPU frame-time scaling.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: HARDWARE_INTELLIGENCE_SCHEMA,
        },
      });

      const jsonStr = (response.text ?? '{}').trim();
      const parsed = JSON.parse(jsonStr);
      res.status(200).json(parsed);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate hardware intelligence estimate.';
      console.error('[NEXUS AI Hardware Intelligence Engine Error]:', message);
      res.status(500).json({ error: message });
    }
  };

  app.post('/api/hardware-intelligence', handleHardwareIntelligence);
  app.post('/gaming/api/hardware-intelligence', handleHardwareIntelligence);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Support both root `/` in AI Studio preview and `/gaming/` base path
    app.use((req, _res, next) => {
      if (req.url === '/' || req.url.startsWith('/?')) {
        req.url = '/gaming/' + req.url.slice(1);
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use('/gaming', express.static(distPath));
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS AI Hardware Intelligence Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
