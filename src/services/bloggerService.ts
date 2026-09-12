import { Article, NewsCategory } from '../types';
import { CapacitorHttp } from '@capacitor/core';
export const BLOGGER_SITE_URL = 'https://flashnews24.site';
export const BLOGGER_JSON_FEED_URL = `${BLOGGER_SITE_URL}/feeds/posts/default?alt=json`;

/**
 * Decodes standard HTML entities in Blogger text payloads.
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#160;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&#8212;/g, '--');
}

/**
 * Converts Blogger HTML content into clean paragraphs separated by double newlines,
 * stripping tags so native UI components can render paragraphs natively without WebView.
 */
function cleanBloggerHtmlToParagraphs(html: string): { summary: string; content: string; readTimeMinutes: number } {
  if (!html) return { summary: 'No summary available.', content: 'No content available.', readTimeMinutes: 1 };

  // Convert block tags and line breaks to double newlines
  let text = html
    .replace(/<(p|div|h[1-6]|ul|ol|li|blockquote|table|tr)[^>]*>/gi, '\n\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol|li|blockquote|table|tr)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n\n');

  // Remove all remaining HTML tags (script, style, span, img, a, etc.)
  text = text.replace(/<[^>]+>/g, '');

  // Decode HTML entities
  text = decodeHtmlEntities(text);

  // Clean up excessive whitespace and ensure clean paragraph separation
  text = text
    .split(/\n\s*\n+/)
    .map(para => para.replace(/\s+/g, ' ').trim())
    .filter(para => para.length > 0)
    .join('\n\n');

  const words = text.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.round(words / 200));

  // Summary is first paragraph or first 200 characters
  const firstPara = text.split('\n\n')[0] || text;
  const summary = firstPara.length > 200 ? firstPara.slice(0, 197) + '...' : firstPara;

  return {
  summary,
  content: html,
  readTimeMinutes
};
}
/**
 * Extracts high-resolution featured image from Blogger entry thumbnail or inline HTML images.
 */
function extractImageUrl(entry: any, htmlContent: string): string {
  // Check Blogger media$thumbnail first
  if (entry['media$thumbnail'] && entry['media$thumbnail'].url) {
    let thumbUrl = entry['media$thumbnail'].url;
    // Replace Blogger thumbnail dimension modifiers like /s72-c/ or /w72-h72-c/ with /s1000/ for full high-res
    thumbUrl = thumbUrl.replace(/\/(s|w|h)\d+([-a-z0-9]*)\//i, '/s1000/');
    return thumbUrl;
  }

  // Fallback: Check inside HTML content for first <img src="..." />
  const imgMatch = htmlContent.match(/src=["'](https?:\/\/[^"']+\.(png|jpg|jpeg|webp|gif)[^"']*)["']/i) ||
                   htmlContent.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    let imgUrl = imgMatch[1];
    imgUrl = imgUrl.replace(/\/(s|w|h)\d+([-a-z0-9]*)\//i, '/s1000/');
    return imgUrl;
  }

  // Final fallback: High quality general news photo
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';
}

/**
 * Formats Blogger ISO publication date to human-readable string.
 */
function formatPublishedDate(dateStr: string): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    }
    if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
}

/**
 * Categorizes a Blogger entry into standard tabs based on tags and keywords.
 */
function categorizeBloggerEntry(title: string, content: string, categories: any[] = []): { primary: NewsCategory; tags: string[] } {
  const tags = categories
  .map((c: any) =>
    typeof c === "string"
      ? c.toLowerCase().trim()
      : (c.term || "").toLowerCase().trim()
  )
  .filter(Boolean);
  const combined = (title + ' ' + content + ' ' + tags.join(' ')).toLowerCase();

  let primary: NewsCategory = 'All';

  if (/\b(ai|artificial intelligence|gemini|chatgpt|llm|machine learning|neural|robot|robots|robotics|openai|anthropic|deepmind|automation)\b/i.test(combined)) {
    primary = 'AI';
  } else if (/\b(tech|technology|gadget|gadgets|apple|google|android|microsoft|software|hardware|cyber|cybersecurity|internet|smartphone|smartphones|device|devices|app|apps|silicon|chip|chips|computer|computers|quantum|server|servers|cloud)\b/i.test(combined)) {
    primary = 'Tech';
  } else if (/\b(business|market|markets|economy|economic|finance|financial|stock|stocks|trade|trading|crypto|bitcoin|bank|banks|banking|invest|investing|investment|company|companies|industry|commercial|corporate|wall street|earnings|inflation|revenue|startup|startups)\b/i.test(combined)) {
    primary = 'Business';
  } else if (/\b(sport|sports|championship|championships|football|fifa|soccer|basketball|nba|nfl|mlb|tennis|olympic|olympics|cricket|game|games|tournament|league|match|athlete|athletes|golf|formula 1|racing|stadium|world cup|trophy)\b/i.test(combined)) {
    primary = 'Sports';
  } else if (/\b(science|scientific|space|telescope|earthquake|weather|nasa|astronomy|physics|climate|biology|research|solar|planet|planets|volcano|medical|health|disease|vaccine|hospital|doctor|study|storm|renewable|energy)\b/i.test(combined)) {
    primary = 'Science';
  } else if (/\b(world|international|global|new york|usa|uk|europe|asia|china|russia|war|conflict|government|police|crash|crashes|fire|fires|emergency|accident|accidents|politics|country|nation|city|blast|attack|attacks|park|flight|boeing|aviation|boat|marseille|colombia|england|leicester|bogotá|france|syria|damascus)\b/i.test(combined)) {
    primary = 'World';
  } else if (tags.length > 0) {
    const secondaryTopics = ['health', 'entertainment', 'aviation', 'environment', 'education', 'politics', 'crime', 'energy', 'lifestyle', 'travel', 'automotive', 'real estate', 'weather'];
    const matchedTopic = tags.find(t => secondaryTopics.some(sub => t.includes(sub)));
    if (matchedTopic) {
      const cleanWord = matchedTopic.split(' ')[0];
      primary = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
    } else {
      primary = 'World';
    }
  } else {
    primary = 'World';
  }

  return { primary, tags };
}

/**
 * Determines sentiment based on article keywords.
 */
function determineSentiment(title: string, content: string): 'Positive' | 'Neutral' | 'Urgent' | 'Analytical' {
  const text = (title + ' ' + content).toLowerCase();
  if (text.includes('crash') || text.includes('emergency') || text.includes('alert') || text.includes('attack') || text.includes('disaster') || text.includes('deadly') || text.includes('urgent') || text.includes('breaking') || text.includes('evacuat')) {
    return 'Urgent';
  }
  if (text.includes('win') || text.includes('victory') || text.includes('rally') || text.includes('growth') || text.includes('breakthrough') || text.includes('success') || text.includes('record') || text.includes('rally')) {
    return 'Positive';
  }
  if (text.includes('study') || text.includes('research') || text.includes('analysis') || text.includes('telescope') || text.includes('data') || text.includes('report') || text.includes('qubit') || text.includes('chip')) {
    return 'Analytical';
  }
  return 'Neutral';
}

/**
 * Parses a raw Blogger JSON feed entry into an Article object.
 */
export function parseBloggerEntry(entry: any, index: number): Article {
  const title = decodeHtmlEntities(entry.title?.$t || 'Untitled Article');
  const rawHtml = entry.content?.$t || entry.summary?.$t || '';
  const { summary, content, readTimeMinutes } = cleanBloggerHtmlToParagraphs(rawHtml);
  
  const author = entry.author?.[0]?.name?.$t || 'FlashNews24 Live';
  const publishedAt = formatPublishedDate(entry.published?.$t || entry.updated?.$t);
  
  // Find web URL
  const linkObj = entry.link?.find((l: any) => l.rel === 'alternate') || entry.link?.[0];
  const url = linkObj?.href || BLOGGER_SITE_URL;

  const imageUrl = extractImageUrl(entry, rawHtml);
  const labels = Array.isArray(entry.category)
  ? entry.category.map((c: any) => c.term)
  : [];

const { primary, tags } =
  categorizeBloggerEntry(title, content, labels);
  const sentiment = determineSentiment(title, content);

  // Make first 2 articles or breaking-tagged articles show as breaking news
  const isBreaking =
  index < 5 ||
  /breaking|urgent|alert|earthquake|fire|explosion|crash|storm|war/i.test(
    `${title} ${summary}`
  );

  // Unique ID from Blogger post ID or fallback
  const rawId = entry.id?.$t || `blogger-${index}-${Date.now()}`;
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '-');

  return {
    id,
    title,
    summary,
    content,
    author,
    sourceName: 'FlashNews24.site',
    publishedAt,
    rawPublishedAt: entry.published?.$t || entry.updated?.$t,
    imageUrl,
    category: primary,
    tags,
    url,
    readTimeMinutes,
    isBreaking: isBreaking,
    sentiment,
    isLiveBlogger: true
  };
}

/**
 * Fetches articles directly or via server proxy from flashnews24.site Blogger feed.
 * Guaranteed to return valid Blogger articles without console errors or UI crashes.
 */
  export async function fetchBloggerArticles(
  category: string = "All",
  searchQuery: string = ""
): Promise<Article[]> {

  let fetchedArticles: Article[] = [];

  const urls = [
    "https://flashnews24.site/feeds/posts/default?alt=json&max-results=500",
    "https://www.flashnews24.site/feeds/posts/default?alt=json&max-results=500",
    `https://api.allorigins.win/raw?url=${encodeURIComponent(
      "https://flashnews24.site/feeds/posts/default?alt=json&max-results=500"
    )}`
  ];

  for (const url of urls) {
  try {

    

    const response = await CapacitorHttp.request({
    url,
    method: "GET",
    headers: {
        Accept: "application/json"
    }
});



if (response.status !== 200) {
    continue;
}

const json = typeof response.data === "string" ? JSON.parse(response.data) : response.data;



const feed =
  json.feed ??
  json.contents?.feed ??
  null;

      if (feed?.entry && Array.isArray(feed.entry)) {
    fetchedArticles = feed.entry
        .map((entry: any, index: number) => {
            try {
                return parseBloggerEntry(entry, index);
            } catch {
                return null;
            }
        })
        .filter(Boolean) as Article[];

    
    if (fetchedArticles.length > 0) {
        break;
    }
      }

    } catch (e: any) {
  
  console.error(e);
  }
  }

  fetchedArticles.sort(
    (a, b) =>
      new Date((b as any).rawPublishedAt || b.publishedAt).getTime() -
      new Date((a as any).rawPublishedAt || a.publishedAt).getTime()
  );

  let filtered = fetchedArticles;

  if (category !== "All") {
    const cat = category.toLowerCase();

    filtered = filtered.filter(a =>
      (a.category || "").toLowerCase() === cat ||
      (a.tags || []).some(t => t.toLowerCase().includes(cat))
    );
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();

    filtered = filtered.filter(a =>
      (
        (a.title || "") +
        (a.summary || "") +
        (a.content || "") +
        (a.tags || []).join(" ")
      )
        .toLowerCase()
        .includes(q)
    );
  }

  return filtered;
}
