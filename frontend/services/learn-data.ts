export type DailyConcept = {
  id: string;
  category: 'System Design' | 'GCP' | 'Core AI' | 'Agentic AI' | 'Modern AI' | 'DSA Pattern';
  title: string;
  tagline: string;
  icon: string;
  color: string;
};

export const CAT_META: Record<DailyConcept['category'], { color: string; icon: string }> = {
  'System Design': { color: '#6366F1', icon: 'git-branch-outline' },
  'GCP':           { color: '#10B981', icon: 'cloud-outline' },
  'Core AI':       { color: '#8B5CF6', icon: 'hardware-chip-outline' },
  'Agentic AI':    { color: '#EC4899', icon: 'sparkles-outline' },
  'Modern AI':     { color: '#F59E0B', icon: 'flash-outline' },
  'DSA Pattern':   { color: '#06B6D4', icon: 'code-slash-outline' },
};

export const DAILY_CONCEPTS: DailyConcept[] = [
  // System Design
  { id: 'sd-01', category: 'System Design', title: 'Load Balancing',        tagline: 'Distribute traffic intelligently across servers',     icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-02', category: 'System Design', title: 'Consistent Hashing',    tagline: 'Minimize key remapping when cluster nodes change',   icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-03', category: 'System Design', title: 'Rate Limiting',         tagline: 'Control request flow to prevent abuse & overload',   icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-04', category: 'System Design', title: 'CAP Theorem',           tagline: 'Why distributed systems can\'t have it all',         icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-05', category: 'System Design', title: 'CQRS Pattern',          tagline: 'Separate reads and writes for massive scale',        icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-06', category: 'System Design', title: 'Circuit Breaker',       tagline: 'Stop cascading failures in microservices',           icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-07', category: 'System Design', title: 'Event Sourcing',        tagline: 'Store state as a sequence of events, not snapshots', icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-08', category: 'System Design', title: 'API Gateway',           tagline: 'Single entry point for all client requests',         icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-09', category: 'System Design', title: 'Database Sharding',     tagline: 'Split one big DB into smaller horizontal slices',    icon: 'git-branch-outline',    color: '#6366F1' },
  { id: 'sd-10', category: 'System Design', title: 'Saga Pattern',          tagline: 'Manage distributed transactions without 2PC locks',  icon: 'git-branch-outline',    color: '#6366F1' },

  // GCP
  { id: 'gcp-01', category: 'GCP', title: 'Cloud Run',         tagline: 'Deploy containers serverlessly — zero infra to manage', icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-02', category: 'GCP', title: 'BigQuery',          tagline: 'Run SQL on petabytes in seconds — serverless analytics', icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-03', category: 'GCP', title: 'Vertex AI',         tagline: 'Google\'s unified ML platform — train, tune, deploy',  icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-04', category: 'GCP', title: 'Pub/Sub',           tagline: 'Async messaging at global scale — decouple services',  icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-05', category: 'GCP', title: 'Cloud Functions',   tagline: 'Run code in response to events without a server',      icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-06', category: 'GCP', title: 'Cloud Spanner',     tagline: 'Globally distributed relational DB with ACID + scale', icon: 'cloud-outline', color: '#10B981' },

  // Core AI
  { id: 'ai-01', category: 'Core AI', title: 'Attention Mechanism',   tagline: 'How models weigh which tokens to focus on',          icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-02', category: 'Core AI', title: 'Backpropagation',       tagline: 'The engine that teaches neural networks to learn',   icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-03', category: 'Core AI', title: 'Embeddings',            tagline: 'Turning words into numbers that capture meaning',    icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-04', category: 'Core AI', title: 'Gradient Descent',      tagline: 'Walking downhill on the loss landscape',            icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-05', category: 'Core AI', title: 'Transformer Architecture', tagline: 'The building block behind every modern LLM',     icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-06', category: 'Core AI', title: 'Loss Functions',        tagline: 'How models measure their own mistakes',             icon: 'hardware-chip-outline', color: '#8B5CF6' },

  // Agentic AI
  { id: 'ag-01', category: 'Agentic AI', title: 'ReAct Pattern',     tagline: 'Reason → Act → Observe loop in AI agents',          icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-02', category: 'Agentic AI', title: 'Tool Use in LLMs',  tagline: 'How agents call real APIs to get things done',       icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-03', category: 'Agentic AI', title: 'Agent Memory',      tagline: 'Short-term, long-term, episodic memory in agents',   icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-04', category: 'Agentic AI', title: 'Multi-Agent Systems', tagline: 'Orchestrating multiple AI agents to collaborate',  icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-05', category: 'Agentic AI', title: 'LangGraph',         tagline: 'Build stateful, cyclical agent workflows as graphs', icon: 'sparkles-outline', color: '#EC4899' },

  // Modern AI
  { id: 'mai-01', category: 'Modern AI', title: 'RAG Pipeline',       tagline: 'Ground LLMs in real-time external knowledge',        icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-02', category: 'Modern AI', title: 'LoRA Fine-tuning',   tagline: 'Tune a model with 0.1% of the parameters',          icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-03', category: 'Modern AI', title: 'Prompt Engineering', tagline: 'The art of getting consistent, quality LLM output',  icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-04', category: 'Modern AI', title: 'Vector Databases',   tagline: 'Fast semantic search over billions of embeddings',   icon: 'flash-outline', color: '#F59E0B' },

  // DSA Pattern
  { id: 'dsa-01', category: 'DSA Pattern', title: 'Sliding Window',      tagline: 'Turn O(n²) nested loops into O(n) with one pass',       icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-02', category: 'DSA Pattern', title: 'Two Pointers',        tagline: 'Move from both ends to find pairs in O(n)',              icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-03', category: 'DSA Pattern', title: 'Backtracking',        tagline: 'Explore all paths, undo bad choices and retry',          icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-04', category: 'DSA Pattern', title: 'Dynamic Programming', tagline: 'Cache subproblems so you never solve them twice',        icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-05', category: 'DSA Pattern', title: 'Binary Search',       tagline: 'Halve your search space on every step',                 icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-06', category: 'DSA Pattern', title: 'BFS & DFS',           tagline: 'Traverse trees and graphs layer by layer or deep',      icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-07', category: 'DSA Pattern', title: 'Heap / Priority Queue', tagline: 'Always pop the min or max in O(log n)',              icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-08', category: 'DSA Pattern', title: 'Monotonic Stack',     tagline: 'Keep a stack in sorted order to find next greater',     icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-09', category: 'DSA Pattern', title: 'Union Find',          tagline: 'Track connected components in near O(1)',               icon: 'code-slash-outline', color: '#06B6D4' },
  { id: 'dsa-10', category: 'DSA Pattern', title: 'Trie',                tagline: 'Prefix tree for lightning-fast string lookups',         icon: 'code-slash-outline', color: '#06B6D4' },

  // System Design (extra)
  { id: 'sd-11', category: 'System Design', title: 'WebSockets',         tagline: 'Full-duplex real-time communication over a single TCP', icon: 'git-branch-outline', color: '#6366F1' },
  { id: 'sd-12', category: 'System Design', title: 'CDN',                tagline: 'Serve assets from the edge closest to the user',        icon: 'git-branch-outline', color: '#6366F1' },
  { id: 'sd-13', category: 'System Design', title: 'Message Queues',     tagline: 'Decouple producers and consumers with async buffers',   icon: 'git-branch-outline', color: '#6366F1' },
  { id: 'sd-14', category: 'System Design', title: 'Distributed Locks',  tagline: 'Coordinate access across nodes without race conditions', icon: 'git-branch-outline', color: '#6366F1' },
  { id: 'sd-15', category: 'System Design', title: 'Bloom Filters',      tagline: 'Probabilistic set membership in constant space',        icon: 'git-branch-outline', color: '#6366F1' },

  // GCP (extra)
  { id: 'gcp-07', category: 'GCP', title: 'Cloud Storage',     tagline: 'Object storage for any scale — images, backups, data',  icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-08', category: 'GCP', title: 'Cloud Armor',       tagline: 'DDoS protection and WAF for your Google Cloud apps',    icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-09', category: 'GCP', title: 'Dataflow',          tagline: 'Unified stream and batch data processing at scale',     icon: 'cloud-outline', color: '#10B981' },
  { id: 'gcp-10', category: 'GCP', title: 'Firebase Realtime', tagline: 'Sync data across clients in milliseconds with NoSQL',   icon: 'cloud-outline', color: '#10B981' },

  // Core AI (extra)
  { id: 'ai-07', category: 'Core AI', title: 'Tokenization',       tagline: 'How text is split into chunks a model can process',  icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-08', category: 'Core AI', title: 'Context Window',     tagline: 'How much text a model can see and reason over',      icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-09', category: 'Core AI', title: 'Temperature & Top-p', tagline: 'Control randomness and creativity in LLM outputs',  icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-10', category: 'Core AI', title: 'RLHF',              tagline: 'Training models to align with human preferences',     icon: 'hardware-chip-outline', color: '#8B5CF6' },
  { id: 'ai-11', category: 'Core AI', title: 'Mixture of Experts', tagline: 'Route each token to specialist sub-networks',        icon: 'hardware-chip-outline', color: '#8B5CF6' },

  // Agentic AI (extra)
  { id: 'ag-06', category: 'Agentic AI', title: 'Prompt Chaining',    tagline: 'Break complex tasks into sequential LLM calls',    icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-07', category: 'Agentic AI', title: 'Guardrails',         tagline: 'Keep agents within safe, intended boundaries',     icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-08', category: 'Agentic AI', title: 'Human-in-the-Loop',  tagline: 'When and how agents should ask for approval',      icon: 'sparkles-outline', color: '#EC4899' },
  { id: 'ag-09', category: 'Agentic AI', title: 'MCP Protocol',       tagline: 'Standard interface for AI tools and context',      icon: 'sparkles-outline', color: '#EC4899' },

  // Modern AI (extra)
  { id: 'mai-05', category: 'Modern AI', title: 'Multimodal Models',   tagline: 'One model that sees, reads, and listens',          icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-06', category: 'Modern AI', title: 'Structured Outputs',  tagline: 'Force LLMs to return valid JSON every time',       icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-07', category: 'Modern AI', title: 'Semantic Caching',    tagline: 'Cache LLM responses by meaning, not exact string', icon: 'flash-outline', color: '#F59E0B' },
  { id: 'mai-08', category: 'Modern AI', title: 'AI Observability',    tagline: 'Trace, evaluate and debug your AI pipelines',      icon: 'flash-outline', color: '#F59E0B' },
];

export function getTodaysConcept(): DailyConcept {
  const dayIndex = Math.floor(Date.now() / 86400000) % DAILY_CONCEPTS.length;
  return DAILY_CONCEPTS[dayIndex];
}

export function getThisWeekConcepts(): DailyConcept[] {
  const today = Math.floor(Date.now() / 86400000);
  return Array.from({ length: 7 }, (_, i) =>
    DAILY_CONCEPTS[(today - 6 + i) % DAILY_CONCEPTS.length]
  );
}
