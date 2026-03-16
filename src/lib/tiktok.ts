import { TikTokData } from "@/types/analysis";

export async function searchTikTokVideos(
  query: string,
  rapidApiKey: string
): Promise<TikTokData[]> {
  if (!rapidApiKey) return [];

  try {
    const res = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=${encodeURIComponent(query)}&count=10&sort_type=1`,
      {
        headers: {
          "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.videos || []).map(
      (v: {
        aweme_id: string;
        desc: string;
        statistics: { play_count: number; digg_count: number; comment_count: number };
        share_url: string;
      }) => ({
        id: v.aweme_id,
        desc: v.desc || "",
        playCount: v.statistics?.play_count || 0,
        diggCount: v.statistics?.digg_count || 0,
        commentCount: v.statistics?.comment_count || 0,
        url: v.share_url || "",
      })
    );
  } catch (err) {
    console.error("TikTok API error:", err);
    return [];
  }
}

export async function getTikTokComments(
  videoId: string,
  rapidApiKey: string
): Promise<string[]> {
  if (!rapidApiKey) return [];

  try {
    const res = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/comment/list?aweme_id=${videoId}&count=50`,
      {
        headers: {
          "x-rapidapi-host": "tiktok-scraper7.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.comments || []).map(
      (c: { text: string; digg_count: number }) =>
        `[${c.digg_count || 0} likes] ${c.text}`
    );
  } catch (err) {
    console.error("TikTok comments error:", err);
    return [];
  }
}
