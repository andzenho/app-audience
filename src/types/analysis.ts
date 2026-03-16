export interface UserInputs {
  product: string;
  priceSegment: string;
  existingClients: string;
  excludedClients: string;
  niche: string;
  reviews: string;
}

export interface CollectedData {
  youtube: YouTubeData[];
  tiktok: TikTokData[];
  instagram: InstagramData[];
  webSearch: string[];
  transcripts: string[];
  comments: string[];
}

export interface YouTubeData {
  videoId: string;
  title: string;
  description: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  url: string;
}

export interface TikTokData {
  id: string;
  desc: string;
  playCount: number;
  diggCount: number;
  commentCount: number;
  url: string;
}

export interface InstagramData {
  id: string;
  caption: string;
  likeCount: number;
  commentCount: number;
  url: string;
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  productName: string;
  inputs: UserInputs;
  data: {
    product_summary: string;
    avatar: Avatar;
    awareness_level: AwarenessLevel;
    pains: Pains;
    desires: Desire[];
    triggers: Triggers;
    objections: Objection[];
    competitive_context: CompetitiveContext;
    voice_of_customer: VoiceOfCustomer;
    viral_content_analysis: ViralContent[];
    real_quotes: RealQuote[];
    segments: Segment[];
    hooks: Hook[];
    content_topics: ContentTopic[];
    offer_angles: OfferAngle[];
    key_insights: KeyInsight[];
    action_plan: ActionItem[];
  };
}

export interface Avatar {
  name: string;
  age: number;
  gender: string;
  location: string;
  family: string;
  income_personal: string;
  income_family: string;
  job: string;
  education: string;
  values: string[];
  fears: string[];
  dreams: string[];
  belief_about_self: string;
  belief_about_money: string;
  belief_about_niche: string;
  day_in_life: string;
}

export interface AwarenessLevel {
  level: number;
  label: string;
  description: string;
  how_to_sell: string;
}

export interface SurfacePain {
  pain: string;
  what_they_say: string;
  where_they_say: string;
}

export interface DeepPain {
  pain: string;
  underlying_fear: string;
  self_esteem_impact: string;
}

export interface RootPain {
  pain: string;
  maslow_need: string;
  real_desire: string;
}

export interface Pains {
  surface: SurfacePain[];
  deep: DeepPain[];
  root: RootPain[];
}

export interface Desire {
  desire: string;
  emotional_core: string;
  how_they_describe_it: string;
}

export interface ExternalTrigger {
  trigger: string;
  example: string;
  when: string;
}

export interface InternalTrigger {
  trigger: string;
  emotion: string;
  moment: string;
}

export interface Triggers {
  external: ExternalTrigger[];
  internal: InternalTrigger[];
}

export interface Objection {
  category: string;
  objection: string;
  real_fear_behind: string;
  answer: string;
}

export interface CompetitiveContext {
  already_tried: string[];
  who_they_follow: string[];
  direct_competitors: string[];
  indirect_competitors: string[];
  do_nothing_scenario: string;
}

export interface VoiceOfCustomer {
  how_describe_problem: string[];
  how_describe_desired_result: string[];
  vocabulary: string[];
  forbidden_words: string[];
}

export interface ViralContent {
  platform: string;
  title: string;
  url: string;
  views: number;
  why_viral: string;
  hook: string;
  main_pain_addressed: string;
  top_comments_themes: string[];
  insight_for_you: string;
}

export interface RealQuote {
  text: string;
  source: string;
  likes: number;
  why_important: string;
}

export interface Segment {
  name: string;
  size: string;
  description: string;
  main_pain: string;
  main_trigger: string;
  best_offer_angle: string;
}

export interface Hook {
  hook: string;
  pain_used: string;
  format: string;
}

export interface ContentTopic {
  topic: string;
  format: string;
  pain_addressed: string;
}

export interface OfferAngle {
  angle: string;
  segment: string;
  emotion: string;
}

export interface KeyInsight {
  insight: string;
  source: string;
  how_to_use: string;
}

export interface ActionItem {
  priority: number;
  action: string;
  reason: string;
}

export interface SavedAnalysis {
  id: string;
  createdAt: string;
  productName: string;
}
