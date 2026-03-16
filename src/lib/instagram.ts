import { InstagramData } from "@/types/analysis";

export async function searchInstagramByHashtag(
  hashtag: string,
  rapidApiKey: string
): Promise<InstagramData[]> {
  if (!rapidApiKey) return [];

  try {
    const res = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/hashtag?hashtag=${encodeURIComponent(hashtag)}`,
      {
        headers: {
          "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.items || []).slice(0, 10).map(
      (item: {
        id: string;
        caption?: { text: string };
        like_count: number;
        comment_count: number;
        code: string;
      }) => ({
        id: item.id,
        caption: item.caption?.text || "",
        likeCount: item.like_count || 0,
        commentCount: item.comment_count || 0,
        url: `https://instagram.com/p/${item.code}`,
      })
    );
  } catch (err) {
    console.error("Instagram API error:", err);
    return [];
  }
}

export async function getInstagramComments(
  shortcode: string,
  rapidApiKey: string
): Promise<string[]> {
  if (!rapidApiKey) return [];

  try {
    const res = await fetch(
      `https://instagram-scraper-api2.p.rapidapi.com/v1/comments?code_or_id_or_url=${shortcode}`,
      {
        headers: {
          "x-rapidapi-host": "instagram-scraper-api2.p.rapidapi.com",
          "x-rapidapi-key": rapidApiKey,
        },
      }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return (data.data?.comments || []).map(
      (c: { text: string; like_count: number }) =>
        `[${c.like_count || 0} likes] ${c.text}`
    );
  } catch (err) {
    console.error("Instagram comments error:", err);
    return [];
  }
}
