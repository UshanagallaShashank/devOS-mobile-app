import { supabase } from './supabase';

// ── Streak ────────────────────────────────────────────────────

export async function fetchStreak(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('streaks')
    .select('current_count')
    .eq('user_id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.current_count ?? 0;
}

// ── Tasks ─────────────────────────────────────────────────────

export type Task = {
  id: string;
  label: string;
  tag: string;
  done: boolean;
  start_time?: string | null;
  end_time?: string | null;
};

export async function fetchTodayTasks(userId: string): Promise<Task[]> {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('tasks')
    .select('id, label, tag, done, start_time, end_time')
    .eq('user_id', userId)
    .eq('task_date', today)
    .order('start_time', { nullsFirst: true })
    .order('created_at');
  if (error) throw error;
  return (data as Task[]) ?? [];
}

export async function toggleTask(taskId: string, done: boolean): Promise<void> {
  const { error } = await supabase.from('tasks').update({ done }).eq('id', taskId);
  if (error) throw error;
}

export async function updateTask(taskId: string, label: string, tag: string, start_time?: string, end_time?: string): Promise<void> {
  const { error } = await supabase.from('tasks').update({
    label, tag,
    start_time: start_time || null,
    end_time: end_time || null,
  }).eq('id', taskId);
  if (error) throw error;
}

export async function deleteTask(taskId: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', taskId);
  if (error) throw error;
}

type NewTask = { label: string; tag: string; start_time?: string | null; end_time?: string | null };

export async function addTask(userId: string, label: string, tag: string, start_time?: string, end_time?: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('tasks').insert({
    user_id: userId, label, tag, done: false, task_date: today,
    start_time: start_time || null, end_time: end_time || null,
  });
  if (error) throw error;
}

export async function replaceOpenTasks(userId: string, tasks: NewTask[]): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { error: deleteError } = await supabase
    .from('tasks').delete()
    .eq('user_id', userId).eq('task_date', today).eq('done', false);
  if (deleteError) throw deleteError;
  const { error: insertError } = await supabase.from('tasks').insert(
    tasks.map(t => ({ user_id: userId, label: t.label, tag: t.tag, done: false, task_date: today, start_time: t.start_time ?? null, end_time: t.end_time ?? null }))
  );
  if (insertError) throw insertError;
}

export async function addTasks(userId: string, tasks: NewTask[]): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('tasks').insert(
    tasks.map(t => ({ user_id: userId, label: t.label, tag: t.tag, done: false, task_date: today, start_time: t.start_time ?? null, end_time: t.end_time ?? null }))
  );
  if (error) throw error;
}

// ── Profile ───────────────────────────────────────────────────

export type Profile = {
  user_id: string;
  full_name?: string;
  bio?: string;
  primary_stack?: string[];
  career_goal?: string;
  github_url?: string;
  linkedin_url?: string;
  leetcode_username?: string;
  leetcode_solved?: number;
  resume_url?: string;
  resume_analysis?: ResumeAnalysis | null;
  resume_data?: ResumeData | null;
  experience_years?: number;
  onboarded?: boolean;
};

export type ResumeData = {
  summary: string;
  skills: string;
  experience: string;
  projects: string;
  education: string;
};

export type ResumeAnalysis = {
  score: number;
  ats_score: number;
  impact_score: number;
  clarity_score: number;
  name: string;
  current_role: string;
  years_exp: number;
  top_skills: string[];
  suggestions: { severity: string; text: string }[];
  summary: string;
};

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error && error.code !== 'PGRST116') throw error;
  return data as Profile | null;
}

export async function upsertProfile(userId: string, data: Partial<Profile>): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...data }, { onConflict: 'user_id' });
  if (error) throw error;
}

// ── LeetCode Category Progress ────────────────────────────────

export type LCProgress = { category: string; solved: number; total: number };

export async function fetchLCProgress(userId: string): Promise<LCProgress[]> {
  const { data, error } = await supabase
    .from('leetcode_progress')
    .select('category, solved, total')
    .eq('user_id', userId);
  if (error) throw error;
  return (data as LCProgress[]) ?? [];
}

export async function upsertLCProgress(userId: string, category: string, solved: number, total: number): Promise<void> {
  const { error } = await supabase
    .from('leetcode_progress')
    .upsert({ user_id: userId, category, solved, total }, { onConflict: 'user_id,category' });
  if (error) throw error;
}
