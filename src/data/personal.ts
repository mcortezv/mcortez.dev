import type { TechItem, Project, Achievement } from '@/types'

export const personal = {
  name: 'Manuel Cortez',
  role: 'Head of AI',
  tagline: 'Building Scalable Web Apps & AI Solutions',
  description:
    'Diseño e implemento agentes de IA, workflows automatizados, RAG con manejo de contexto y embeddings, y evaluaciones de modelos que impactan directamente en la experiencia de usuario, eficiencia operativa y ventas en productos B2B.',
  location: 'Ciudad Obregón, Sonora, México',
  email: {
    personal: 'mdjesuscv@gmail.com',
    work: 'manuel@hyperlabs.vc',
  },
  links: {
    github: 'https://github.com/mcortezv',
    repo: 'https://github.com/mcortezv/mcortez.dev',
    linkedin: 'https://www.linkedin.com/in/mcortezv/',
  },
  currentRole: {
    title: 'Head of AI',
    company: 'HyperLabs',
    url: 'https://www.hyperdigital.mx/',
    period: 'ene. 2026 – actualidad',
    type: 'Jornada parcial · Remoto',
    description:
      'Trabajo en el diseño e implementación de agentes de IA, RAG pipelines, y soluciones de AI que impactan la experiencia de usuario y las métricas de ventas en productos B2B.',
  },
  education: {
    school: 'Instituto Tecnológico de Sonora',
    degree: 'Ingeniería en Software',
    period: 'jul. 2024 – dic. 2028',
    status: 'En curso',
    progress: 57,
    subjects: ['Arquitectura de Software', 'Diseño de Software', 'Análisis de Algoritmos', 'Estructura de Datos'],
  },
}

export const techStack: TechItem[] = [
  { name: 'Python', category: 'Language', level: 'core', description: 'ML pipelines, AI backends, scripting' },
  { name: 'TypeScript', category: 'Language', level: 'core', description: 'Full-stack type-safe development' },
  { name: 'React', category: 'Framework', level: 'core', description: 'SPAs, dashboards, component systems' },
  { name: 'LangChain', category: 'AI/ML', level: 'core', description: 'LLM orchestration, RAG, agents' },
  { name: 'LangSmith', category: 'AI/ML', level: 'core', description: 'LLM evaluation & observability' },
  { name: 'Mastra', category: 'AI/ML', level: 'core', description: 'TypeScript AI agent framework' },
  { name: 'Supabase', category: 'Database', level: 'core', description: 'PostgreSQL, auth, realtime, vectors' },
  { name: 'PostgreSQL', category: 'Database', level: 'proficient', description: 'Relational data, vectors, SQL' },
  { name: 'Vercel', category: 'Infrastructure', level: 'core', description: 'Edge deployments, CI/CD' },
  { name: 'Railway', category: 'Infrastructure', level: 'proficient', description: 'Backend deployments, containers' },
  { name: 'LM Studio', category: 'Infrastructure', level: 'proficient', description: 'Local LLM serving, OpenAI-compatible API' },
  { name: 'Scikit-Learn', category: 'AI/ML', level: 'proficient', description: 'Regression, RF, PCA, evaluation' },
  { name: 'Claude Code', category: 'Tool', level: 'core', description: 'Agentic dev loop, subagents, skills' },
  { name: 'Git', category: 'Tool', level: 'core', description: 'Version control, branching strategies' },
  { name: 'OpenSpec', category: 'Tool', level: 'proficient', description: 'Spec-driven change proposals' },
  { name: 'GitHub', category: 'Tool', level: 'core', description: 'Code review, Actions, collaboration' },
  { name: 'Tailwind CSS', category: 'Framework', level: 'core', description: 'Design tokens, responsive systems' },
  { name: 'Astro', category: 'Framework', level: 'proficient', description: 'Content sites, islands architecture' },
  { name: 'Java', category: 'Language', level: 'familiar', description: 'OOP foundations, academic projects' },
  { name: 'SQL', category: 'Database', level: 'proficient', description: 'Complex queries, optimization' },
]

export const projects: Project[] = [
  {
    name: 'Hyperflow',
    description:
      'AI-powered operating system for modern business workflows. Automation, agent orchestration, and intelligent process management at scale.',
    url: 'https://www.hyperflowos.com/',
    tags: ['AI Agents', 'Automation', 'Workflows'],
    status: 'live',
    highlight: 'Core contributor',
  },
  {
    name: 'TeamUp',
    description:
      'Team collaboration platform for Mexican businesses with AI-driven insights and productivity tools.',
    url: 'https://www.teamup.mx/',
    tags: ['B2B', 'SaaS', 'Collaboration'],
    status: 'live',
  },
  {
    name: 'ProductLink',
    description:
      'Digital product catalog and commerce solution for SMBs. Streamlined product management and customer experience.',
    url: 'https://www.productlink.mx/',
    tags: ['E-commerce', 'B2B', 'Catalog'],
    status: 'live',
  },
  {
    name: 'Nvem',
    description:
      'Modern platform built with a cutting-edge TypeScript stack, showcasing scalable architecture patterns.',
    url: 'https://nvem.vercel.app/',
    tags: ['TypeScript', 'Vercel', 'Modern Stack'],
    status: 'live',
  },
]

export const achievements: Achievement[] = [
  {
    title: 'NVIDIA Inception Program',
    issuer: 'NVIDIA',
    date: 'mar. 2026',
    description:
      'Hyperflow selected for NVIDIA\'s program supporting AI startups with cutting-edge technology and resources.',
    type: 'program',
  },
  {
    title: 'Acelerando México con Inteligencia Artificial',
    issuer: 'Intel',
    date: 'ene. 2024',
    description:
      'Recognition in Intel\'s competition for an AI system for advanced reverse osmosis systems.',
    type: 'award',
  },
]
