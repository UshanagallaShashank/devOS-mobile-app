-- Migration 003: add LeetCode profile columns to user_profiles

alter table public.user_profiles
  add column if not exists leetcode_username text,
  add column if not exists leetcode_solved integer;
