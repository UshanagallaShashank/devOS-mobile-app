export type Task = {
  id: string;
  label: string;
  tag: string;
  done: boolean;
};

export type LearnTrack = {
  id: string;
  title: string;
  topics: number;
  weeks: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  icon: string;
  color: string;
};

export type DSACategory = {
  id: string;
  name: string;
  solved: number;
  total: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
};

export type Job = {
  id: string;
  role: string;
  company: string;
  location: string;
  salary: string;
  match: number;
  tags: string[];
};

export type Idea = {
  id: string;
  title: string;
  description: string;
  stack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  impact: 'Low' | 'Medium' | 'High';
};

export type NewsItem = {
  id: string;
  title: string;
  source: string;
  category: string;
  time: string;
  readTime: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};
