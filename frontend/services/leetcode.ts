export type LCStats = {
  total: number;
  easy: number;
  medium: number;
  hard: number;
  ranking: number;
};

const QUERY = `query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    profile { ranking }
    submitStats {
      acSubmissionNum { difficulty count }
    }
  }
}`;

export async function fetchLCStats(username: string): Promise<LCStats | null> {
  try {
    const res = await fetch('https://leetcode.com/graphql', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'Referer': 'https://leetcode.com' },
      body:    JSON.stringify({ query: QUERY, variables: { username } }),
    });
    const json = await res.json();
    const user = json.data?.matchedUser;
    if (!user) return null;
    const nums: { difficulty: string; count: number }[] = user.submitStats?.acSubmissionNum ?? [];
    return {
      total:   nums.find(n => n.difficulty === 'All')?.count    ?? 0,
      easy:    nums.find(n => n.difficulty === 'Easy')?.count   ?? 0,
      medium:  nums.find(n => n.difficulty === 'Medium')?.count ?? 0,
      hard:    nums.find(n => n.difficulty === 'Hard')?.count   ?? 0,
      ranking: user.profile?.ranking ?? 0,
    };
  } catch {
    return null;
  }
}
