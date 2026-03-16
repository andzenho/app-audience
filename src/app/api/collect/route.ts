import { NextRequest, NextResponse } from "next/server";
import { searchYouTubeVideos, getYouTubeComments, getYouTubeTranscript } from "@/lib/youtube";
import { searchTikTokVideos, getTikTokComments } from "@/lib/tiktok";
import { searchInstagramByHashtag } from "@/lib/instagram";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const inputs = await req.json();
    const ytKey = process.env.YOUTUBE_API_KEY || "";
    const rapidKey = process.env.RAPIDAPI_KEY || "";

    const searchQuery = `${inputs.product} ${inputs.niche}`.trim();
    const hashtagQuery = inputs.niche.replace(/\s+/g, "").toLowerCase();

    // Run all data collection in parallel
    const [youtubeVideos, tiktokVideos, instagramPosts] = await Promise.all([
      searchYouTubeVideos(searchQuery, ytKey).catch(() => []),
      searchTikTokVideos(searchQuery, rapidKey).catch(() => []),
      searchInstagramByHashtag(hashtagQuery, rapidKey).catch(() => []),
    ]);

    // Sort YouTube by views and get transcripts + comments for top videos
    const sortedVideos = youtubeVideos.sort((a, b) => b.viewCount - a.viewCount);
    const topVideoIds = sortedVideos.slice(0, 3).map((v) => v.videoId);

    const [transcripts, comments, tiktokComments] = await Promise.all([
      // Get transcripts for top 3 videos
      Promise.all(topVideoIds.map((id) => getYouTubeTranscript(id).catch(() => ""))),
      // Get comments for top 3 videos
      Promise.all(
        topVideoIds.map((id) => getYouTubeComments(id, ytKey).catch(() => []))
      ),
      // Get TikTok comments for top 3 videos
      Promise.all(
        tiktokVideos
          .slice(0, 3)
          .map((v) => getTikTokComments(v.id, rapidKey).catch(() => []))
      ),
    ]);

    const allComments = [
      ...comments.flat(),
      ...tiktokComments.flat(),
    ];

    const allTranscripts = transcripts.filter(Boolean);

    return NextResponse.json({
      youtube: sortedVideos,
      tiktok: tiktokVideos,
      instagram: instagramPosts,
      transcripts: allTranscripts,
      comments: allComments,
      webSearch: [], // Will be handled by Claude's web_search tool
    });
  } catch (error) {
    console.error("Collection error:", error);
    return NextResponse.json(
      { error: "Data collection failed", youtube: [], tiktok: [], instagram: [], transcripts: [], comments: [], webSearch: [] },
      { status: 200 } // Return 200 with empty data so analysis can continue
    );
  }
}
