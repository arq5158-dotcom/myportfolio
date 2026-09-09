import fs from 'fs';
import path from 'path';
import os from 'os';
import { PortfolioContent, SectionVisibility } from '@/types';
import { projects, experiences, education, certifications } from './data';

const DATA_DIR = path.join(process.cwd(), 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'portfolio-content.json');
const CONFIG_FILE = path.join(DATA_DIR, 'admin-config.json');

/** All sections visible by default; missing flags in saved JSON fall back to true. */
export const defaultSectionVisibility: SectionVisibility = {
  impactMetrics: true,
  projects: true,
  journey: true,
  certifications: true,
  contact: true,
  footer: true,
};

export function getSectionVisibility(content?: PortfolioContent | null): SectionVisibility {
  return {
    ...defaultSectionVisibility,
    ...(content?.sectionVisibility ?? {}),
  };
}

export const defaultPortfolioContent: PortfolioContent = {
  sectionVisibility: defaultSectionVisibility,
  hero: {
    name: 'Abdul Rehman Qureshi',
    title: 'AI Engineer | AI Automation & LLM Systems',
    tagline: 'Architecting Autonomous AI Agents, Agentic Workflows & Multilingual LLM Systems',
    bio: 'AI Engineer who builds automation that takes manual work out of business processes. Designed and delivered a fully automated multilingual email agent for an electrical distributor in the GCC, carrying customer enquiries from first contact through to a priced quotation and a live payment link with no human in the loop. Also experienced in retrieval-augmented generation and applied deep learning.',
    status: '',
    location: 'Lahore, Pakistan',
    aboutTitle: 'ABOUT',
    aboutSubtitle: 'AI Systems Engineering',
    aboutText: 'Building autonomous systems that solve real operational bottlenecks. Specializing in multi-agent workflows, multilingual document intelligence, and production-grade LLM architectures.',
    aboutScopeTag: 'RESEARCH_SCOPE #909090',
    neuralPatternsTitle: 'NEURAL PATTERNS',
    neuralPatternsYear: '2024',
    cogVisionTitle: 'COG_VISION',
    cogVisionYear: '2023',
    cogVisionSubtitle: 'micro-data',
    specialtiesTags: [
      'AI Agents',
      'Agentic Workflows',
      'Workflow Automation',
      'n8n',
      'Retrieval-Augmented Generation (RAG)',
      'Multilingual AI',
      'FastAPI',
      'LangChain',
      'Docker',
      'PyTorch',
      'TensorFlow',
    ],
    awardsTitle: 'RECOGNITION',
    awardsSubtitle: 'Industry & Academic',
    awardItem: 'Artificial Intelligence Innofest 2024 Selection',
    awardBadge: 'Innofest',
    socialLinks: {
      github: 'https://github.com/crazy-scientistt',
      linkedin: 'https://linkedin.com/in/abdulrehman-qureshi',
      email: 'arq5020@gmail.com',
      twitter: 'https://x.com/crazy_scientist',
      phone: '+92 315 4233431',
      phone2: '',
    },
    impactMetrics: [
      {
        id: 'metric-1',
        value: '100%',
        label: 'Autonomous Quoting',
        description: 'Zero human-in-the-loop quoting pipeline from email to paid order.',
      },
      {
        id: 'metric-2',
        value: '85.9%',
        label: 'Detection Accuracy',
        description: 'XceptionNet deepfake classifier across 53,400-frame benchmark.',
      },
      {
        id: 'metric-3',
        value: '100+',
        label: 'Languages Supported',
        description: 'Arabic & multilingual document intelligence with native RTL.',
      },
      {
        id: 'metric-4',
        value: '3.65',
        label: 'Cumulative GPA',
        description: 'Dean\'s List for Academic Excellence, Bahria University.',
      },
    ],
  },
  projects: projects,
  experiences: experiences.map((exp, index) => ({
    id: `exp-${index + 1}`,
    ...exp,
  })),
  education: education.map((edu, index) => ({
    id: `edu-${index + 1}`,
    ...edu,
  })),
  certifications: certifications.map((cert, index) => ({
    id: `cert-${index + 1}`,
    ...cert,
  })),
};

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {}
}

let inMemoryContent: PortfolioContent | null = null;

export function getPortfolioContent(): PortfolioContent {
  if (inMemoryContent) {
    return inMemoryContent;
  }

  ensureDataDir();
  try {
    const tmpContentFile = path.join(os.tmpdir(), 'portfolio-content.json');
    let useTmp = false;

    if (fs.existsSync(tmpContentFile)) {
      if (!fs.existsSync(CONTENT_FILE)) {
        useTmp = true;
      } else {
        const tmpTime = fs.statSync(tmpContentFile).mtimeMs;
        const fileTime = fs.statSync(CONTENT_FILE).mtimeMs;
        if (tmpTime > fileTime) {
          useTmp = true;
        }
      }
    }

    if (useTmp) {
      const rawData = fs.readFileSync(tmpContentFile, 'utf-8');
      const parsed = JSON.parse(rawData);
      const contentFromTmp: PortfolioContent = {
        ...defaultPortfolioContent,
        ...parsed,
        hero: { ...defaultPortfolioContent.hero, ...parsed.hero },
        sectionVisibility: getSectionVisibility(parsed),
      };
      inMemoryContent = contentFromTmp;
      return contentFromTmp;
    }

    if (fs.existsSync(CONTENT_FILE)) {
      const rawData = fs.readFileSync(CONTENT_FILE, 'utf-8');
      const parsed = JSON.parse(rawData);
      const contentFromFile: PortfolioContent = {
        ...defaultPortfolioContent,
        ...parsed,
        hero: { ...defaultPortfolioContent.hero, ...parsed.hero },
        sectionVisibility: getSectionVisibility(parsed),
      };
      inMemoryContent = contentFromFile;
      return contentFromFile;
    }
  } catch (error) {
    console.error('Error reading portfolio content from file, using defaults:', error);
  }

  return defaultPortfolioContent;
}

export function savePortfolioContent(content: PortfolioContent): boolean {
  inMemoryContent = content;
  let savedOnDisk = false;

  ensureDataDir();
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf-8');
    savedOnDisk = true;
  } catch (error) {
    console.warn('Could not write to data/portfolio-content.json (filesystem may be read-only):', error);
  }

  // In serverless environments (like Vercel Lambda), /tmp is the only writable directory
  try {
    const tmpContentFile = path.join(os.tmpdir(), 'portfolio-content.json');
    fs.writeFileSync(tmpContentFile, JSON.stringify(content, null, 2), 'utf-8');
    savedOnDisk = true;
  } catch (error) {
    console.warn('Could not write to temp directory fallback:', error);
  }

  // Always succeed because memory state and/or /tmp has been updated
  return true;
}

interface AdminConfig {
  passwordHash: string;
}

const DEFAULT_PASSWORD = 'admin123';
let inMemoryPassword: string | null = null;

export function getAdminPassword(): string {
  if (inMemoryPassword) return inMemoryPassword;
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD.trim();

  ensureDataDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
      if (data && data.password) {
        inMemoryPassword = String(data.password).trim();
        return inMemoryPassword;
      }
    }
  } catch (e) {
    console.error('Error reading admin config:', e);
  }

  // Try checking temp folder fallback (useful for serverless environments)
  try {
    const tmpConfig = path.join(os.tmpdir(), 'portfolio-admin-config.json');
    if (fs.existsSync(tmpConfig)) {
      const data = JSON.parse(fs.readFileSync(tmpConfig, 'utf-8'));
      if (data && data.password) {
        inMemoryPassword = String(data.password).trim();
        return inMemoryPassword;
      }
    }
  } catch (e) {}

  // initialize default password if possible
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ password: DEFAULT_PASSWORD }, null, 2), 'utf-8');
  } catch (e) {}

  return DEFAULT_PASSWORD;
}

export function setAdminPassword(newPassword: string): boolean {
  const cleaned = newPassword.trim();
  inMemoryPassword = cleaned;
  let savedLocally = false;

  ensureDataDir();
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify({ password: cleaned }, null, 2), 'utf-8');
    savedLocally = true;
  } catch (error) {
    console.warn('Could not write to data/admin-config.json (filesystem may be read-only):', error);
  }

  try {
    const tmpConfig = path.join(os.tmpdir(), 'portfolio-admin-config.json');
    fs.writeFileSync(tmpConfig, JSON.stringify({ password: cleaned }, null, 2), 'utf-8');
    savedLocally = true;
  } catch (error) {}

  return true;
}

export function verifyAdminPassword(password: string): boolean {
  const currentPassword = getAdminPassword().trim();
  const candidate = (password || '').trim();
  return currentPassword === candidate;
}
