import type { Task, LearnTrack, DSACategory, Job, Idea, NewsItem } from '../types';

export const MOCK_TASKS: Task[] = [
  { id: '1', label: 'Solve 1 LeetCode Medium', tag: 'DSA', done: true },
  { id: '2', label: 'Read: RAG architecture deep dive', tag: 'Learn', done: false },
  { id: '3', label: 'Apply to 2 jobs from matches', tag: 'Jobs', done: false },
  { id: '4', label: 'Review AI news brief', tag: 'News', done: false },
];

export const LEARN_TRACKS: LearnTrack[] = [
  { id: '1', title: 'LLM Engineering', topics: 24, weeks: 8, level: 'Intermediate', icon: 'hardware-chip', color: '#6366F1' },
  { id: '2', title: 'System Design', topics: 18, weeks: 6, level: 'Intermediate', icon: 'git-network', color: '#8B5CF6' },
  { id: '3', title: 'DSA Fundamentals', topics: 32, weeks: 10, level: 'Beginner', icon: 'code-slash', color: '#10B981' },
  { id: '4', title: 'Cloud & DevOps', topics: 20, weeks: 7, level: 'Advanced', icon: 'cloud', color: '#F59E0B' },
];

export const DSA_CATEGORIES: DSACategory[] = [
  { id: '1', name: 'Dynamic Programming', solved: 8, total: 30, difficulty: 'Hard' },
  { id: '2', name: 'Trees & Graphs', solved: 14, total: 25, difficulty: 'Medium' },
  { id: '3', name: 'Sliding Window', solved: 6, total: 15, difficulty: 'Medium' },
  { id: '4', name: 'Arrays & Hashing', solved: 22, total: 30, difficulty: 'Easy' },
];

export const MOCK_JOBS: Job[] = [
  { id: '1', role: 'Junior AI Engineer', company: 'Runway ML', location: 'Remote', salary: '$110k–$140k', match: 92, tags: ['Python', 'LLMs', 'Remote'] },
  { id: '2', role: 'Software Engineer I', company: 'Vercel', location: 'San Francisco', salary: '$120k–$155k', match: 85, tags: ['TypeScript', 'React', 'Node'] },
  { id: '3', role: 'Backend Engineer', company: 'Linear', location: 'Remote', salary: '$105k–$135k', match: 78, tags: ['Go', 'PostgreSQL', 'Remote'] },
];

export const MOCK_IDEAS: Idea[] = [
  { id: '1', title: 'AI Code Review Bot', description: 'GitHub Action that uses Claude to review PRs, flag bugs, and suggest improvements automatically.', stack: ['Python', 'FastAPI', 'Claude API', 'GitHub Actions'], difficulty: 'Intermediate', duration: '2–3 weeks', impact: 'High' },
  { id: '2', title: 'DSA Progress Tracker', description: 'Web app that tracks LeetCode progress, identifies weak patterns, and generates targeted practice plans.', stack: ['React', 'Supabase', 'Gemini API'], difficulty: 'Beginner', duration: '1–2 weeks', impact: 'Medium' },
  { id: '3', title: 'RAG Study Assistant', description: 'Upload your study notes and ask questions — uses vector search + LLM to surface relevant content.', stack: ['Next.js', 'pgvector', 'LangChain', 'OpenAI'], difficulty: 'Advanced', duration: '3–4 weeks', impact: 'High' },
];

export const MOCK_NEWS: NewsItem[] = [
  { id: '1', title: 'Google releases Gemini 2.5 Ultra with 2M context window', source: 'The Verge', category: 'LLMs', time: '2h ago', readTime: '3 min' },
  { id: '2', title: 'OpenAI ships o3-mini with improved reasoning on AIME benchmarks', source: 'OpenAI Blog', category: 'LLMs', time: '4h ago', readTime: '4 min' },
  { id: '3', title: 'Cursor raises $100M Series B — AI code editor reaches 1M users', source: 'TechCrunch', category: 'Tools', time: '6h ago', readTime: '2 min' },
  { id: '4', title: 'New paper: LLMs can now generate 10x longer coherent text with structured memory', source: 'arXiv', category: 'Research', time: '8h ago', readTime: '5 min' },
];
