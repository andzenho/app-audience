import { YouTubeData } from "@/types/analysis";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

export async function searchYouTubeVideos(
  query: string,
  apiKey: string,
  maxResults: number = 8
): Promise<YouTubeData[]> {
  if (!apiKey) return [];

  try {
    // Search for videos
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("q", query);
    searchUrl.searchParams.set("order", "viewCount");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("maxResults", String(maxResults));
    searchUrl.searchParams.set("relevanceLanguage", "ru");
    searchUrl.searchParams.set("key", apiKey);

    const searchRes = await fetch(searchUrl.toString());
    if (!searchRes.ok) {
      console.error("YouTube search failed:", await searchRes.text());
      return [];
    }

    const searchData = await searchRes.json();
    const videoIds = searchData.items
      ?.map((item: { id: { videoId: string } }) => item.id.videoId)
      .filter(Boolean);

    if (!videoIds?.length) return [];

    // Get video statistics
    const statsUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
    statsUrl.searchParams.set("part", "snippet,statistics");
    statsUrl.searchParams.set("id", videoIds.join(","));
    statsUrl.searchParams.set("key", apiKey);

    const statsRes = await fetch(statsUrl.toString());
    if (!statsRes.ok) return [];

    const statsData = await statsRes.json();

    return statsData.items?.map(
      (item: {
        id: string;
        snippet: { title: string; description: string };
        statistics: { viewCount: string; likeCount: string; commentCount: string };
      }) => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        viewCount: parseInt(item.statistics.viewCount || "0"),
        likeCount: parseInt(item.statistics.likeCount || "0"),
        commentCount: parseInt(item.statistics.commentCount || "0"),
        url: `https://youtube.com/watch?v=${item.id}`,
      })
    ) || [];
  } catch (err) {
    console.error("YouTube API error:", err);
    return [];
  }
}

export async function getYouTubeComments(
  videoId: string,
  apiKey: string,
  maxResults: number = 100
): Promise<string[]> {
  if (!apiKey) return [];

  try {
    const comments: { text: string; likes: number }[] = [];
    let pageToken = "";

    while (comments.length < maxResults) {
      const url = new URL(`${YOUTUBE_API_BASE}/commentThreads`);
      url.searchParams.set("part", "snippet");
      url.searchParams.set("videoId", videoId);
      url.searchParams.set("order", "relevance");
      url.searchParams.set("maxResults", "100");
      url.searchParams.set("key", apiKey);
      if (pageToken) url.searchParams.set("pageToken", pageToken);

      const res = await fetch(url.toString());
      if (!res.ok) break;

      const data = await res.json();

      for (const item of data.items || []) {
        const snippet = item.snippet.topLevelComment.snippet;
        comments.push({
          text: snippet.textDisplay,
          likes: snippet.likeCount || 0,
        });
      }

      pageToken = data.nextPageToken;
      if (!pageToken) break;
    }

    // Sort by likes, return top 80
    return comments
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 80)
      .map((c) => `[${c.likes} likes] ${c.text}`);
  } catch (err) {
    console.error("YouTube comments error:", err);
    return [];
  }
}

export async function getYouTubeTranscript(videoId: string): Promise<string> {
  try {
    // Use youtube-transcript npm package
    const { YoutubeTranscript } = await import("youtube-transcript");
    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: "ru" });
    if (transcript && transcript.length > 0) {
      return transcript.map((t: { text: string }) => t.text).join(" ");
    }
    // Try English
    const transcriptEn = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    return transcriptEn.map((t: { text: string }) => t.text).join(" ");
  } catch {
    try {
      const { YoutubeTranscript } = await import("youtube-transcript");
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      return transcript.map((t: { text: string }) => t.text).join(" ");
    } catch {
      return "";
    }
  }
}
