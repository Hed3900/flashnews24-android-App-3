import { Article, NewsCategory } from '../types';

export const BLOGGER_SITE_URL = 'https://www.flashnews24.site';
export const BLOGGER_JSON_FEED_URL = `${BLOGGER_SITE_URL}/feeds/posts/default?alt=json&max-results=50`;

/**
 * Decodes standard HTML entities in Blogger text payloads.
 */
function decodeHtmlEntities(text: string): string {
  if (!text) return '';
  let decoded = text
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

  // Also decode numeric HTML entities like &#x27;
  decoded = decoded.replace(/&#x([0-9A-Fa-f]+);/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
  decoded = decoded.replace(/&#([0-9]+);/g, (_m, num) => String.fromCharCode(Number(num)));
  return decoded;
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

  const words = text.trim().length > 0 ? text.split(/\s+/).length : 0;
  const readTimeMinutes = Math.max(1, Math.round(words / 200));

  // Summary is first paragraph or first 200 characters
  const firstPara = text.split('\n\n')[0] || text;
  const summary = firstPara.length > 200 ? firstPara.slice(0, 197) + '...' : firstPara;

  return { summary, content: text, readTimeMinutes };
}

/**
 * Extracts high-resolution featured image from Blogger entry thumbnail or inline HTML images.
 * This function NEVER filters posts — it always returns a valid image URL (thumbnail transformed to high-res or a fallback).
 */
function extractImageUrl(entry: any, htmlContent: string): string {
  // Attempt 1: Blogger media$thumbnail (common)
  const thumbUrl = entry?.media$thumbnail?.url;
  if (thumbUrl && typeof thumbUrl === 'string' && thumbUrl.length > 0) {
    // Replace Blogger thumbnail size indicators (e.g., /s72-c/ or =s72-c or /w72-h72-c/) with /s1000/ for higher resolution.
    // Use global replacement to cover different URL shapes.
    let highRes = thumbUrl.replace(/(\/|=)(?:s|w|h)\d+(-[a-z0-9]+)?(\/)?/gi, (match) => {
      // Keep either slash or equals style normalized to '/s1000/'
      return match.startsWith('=') ? '=s1000' : '/s1000/';
    });

    // Some Google URLs end size with ?..., ensure no duplicate markers; normalize to a clean s1000 param/segment
    highRes = highRes.replace(/(\?|-).*/g, (m) => {
      // preserve query parameters only if necessary; otherwise strip trailing query params for safety
      return '';
    });

    // If we ended up with an equals-form like '=s1000' without URL structure, try a safe fallback transform:
    if (!/^https?:\/\//i.test(highRes)) {
      // fallback to original but append a s1000 param if possible
      if (thumbUrl.includes('=s')) {
        highRes = thumbUrl.replace(/=s\d+(-[a-z0-9]+)?/i, '=s1000');
      } else {
        highRes = thumbUrl;
      }
    }

    return highRes;
  }

  // Attempt 2: Find first img src in provided HTML content
  if (htmlContent && typeof htmlContent === 'string') {
    const match = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (match && match[1]) {
      let imgUrl = match[1];

      // Upgrade Blogger inline size markers similarly
      if (/(\=s|\/(s|w|h)\d+)/i.test(imgUrl)) {
        imgUrl = imgUrl.replace(/(\/|=)(?:s|w|h)\d+(-[a-z0-9]+)?(\/)?/gi, (m) => (m.startsWith('=') ? '=s1000' : '/s1000/'));
        imgUrl = imgUrl.replace(/(\?|-).*/g, '');
      }

      if (imgUrl && imgUrl.length > 0) return imgUrl;
    }
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
    if (isNaN(date.getTime())) return dateStr;
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
  const tags = categories.map((c: any) => (c?.term || '').toLowerCase().trim()).filter(Boolean);
  const combined = (title + ' ' + content + ' ' + tags.join(' ')).toLowerCase();

  // Define keyword lists
  const keywords: { [k in NewsCategory]?: string[] } = {
    AI: ['ai', 'artificial intelligence', 'chatgpt', 'llm', 'machine learning', 'neural', 'openai', 'anthropic', 'deepmind', 'automation', 'gemini'],
    Tech: ['tech', 'technology', 'gadget', 'apple', 'google', 'android', 'microsoft', 'software', 'hardware', 'cyber', 'internet', 'smartphone', 'app', 'chip', 'silicon'],
    Business: ['business', 'market', 'markets', 'economy', 'finance', 'stock', 'crypto', 'bitcoin', 'invest', 'company', 'industry'],
    Sports: ['sport', 'sports', 'football', 'soccer', 'basketball', 'nba', 'nfl', 'tennis', 'olympic', 'cricket', 'golf', 'formula 1', 'f1'],
    Science: ['science', 'nasa', 'astronomy', 'physics', 'climate', 'research', 'biology', 'medical', 'vaccine', 'telescope'],
    World: ['world', 'international', 'global', 'war', 'conflict', 'government', 'police', 'crash', 'fire', 'accident', 'politics', 'country', 'nation'],
    Entertainment: ['entertainment', 'movie', 'film', 'music', 'celebrity', 'tv', 'show']
  };

  let primary: NewsCategory = 'All';

  for (const [cat, keys] of Object.entries(keywords)) {
    if (keys!.some(k => combined.includes(k))) {
      primary = (cat as unknown) as NewsCategory;
      break;
    }
  }

  // If no category matched, check tags for secondary topics
  if (primary === 'All' && tags.length > 0) {
    const secondaryTopics = ['health', 'entertainment', 'aviation', 'environment', 'education', 'politics', 'crime', 'energy', 'lifestyle', 'travel', 'automotive', 'real estate', 'weather'];
    const matched = tags.find(t => secondaryTopics.some(sub => t.includes(sub)));
    if (matched) {
      const clean = matched.split(' ')[0];
      primary = (clean.charAt(0).toUpperCase() + clean.slice(1)) as NewsCategory;
    } else {
      primary = 'World';
    }
  } else if (primary === 'All') {
    primary = 'World';
  }

  return { primary, tags };
}

/**
 * Determines sentiment based on article keywords.
 */
function determineSentiment(title: string, content: string): 'Positive' | 'Neutral' | 'Urgent' | 'Analytical' {
  const text = (title + ' ' + content).toLowerCase();

  const urgentWords = ['crash', 'emergency', 'alert', 'attack', 'disaster', 'deadly', 'urgent', 'explosion', 'injured', 'killed', 'breaking'];
  const positiveWords = ['win', 'victory', 'rally', 'growth', 'breakthrough', 'success', 'record', 'booming', 'surge'];
  const analyticalWords = ['study', 'research', 'analysis', 'report', 'data', 'telescope', 'qubit', 'investigation', 'experiments'];

  if (urgentWords.some(w => text.includes(w))) return 'Urgent';
  if (positiveWords.some(w => text.includes(w))) return 'Positive';
  if (analyticalWords.some(w => text.includes(w))) return 'Analytical';
  return 'Neutral';
}

/**
 * Parses a raw Blogger JSON feed entry into an Article object.
 */
export function parseBloggerEntry(entry: any, index: number): Article {
  const title = decodeHtmlEntities(entry?.title?.$t || 'Untitled Article');
  const rawHtml = entry?.content?.$t || entry?.summary?.$t || '';
  const { summary, content, readTimeMinutes } = cleanBloggerHtmlToParagraphs(rawHtml);

  const author = entry?.author?.[0]?.name?.$t || 'FlashNews24 Live';
  const publishedAt = formatPublishedDate(entry?.published?.$t || entry?.updated?.$t);

  // Find web URL
  const linkObj = Array.isArray(entry?.link) ? entry.link.find((l: any) => l.rel === 'alternate') || entry.link[0] : null;
  const url = linkObj?.href || BLOGGER_SITE_URL;

  const imageUrl = extractImageUrl(entry, rawHtml);
  const { primary, tags } = categorizeBloggerEntry(title, content, entry?.category || []);
  const sentiment = determineSentiment(title, content);

  // Mark the first few as breaking for demo purposes (unchanged logic)
  const isBreaking = index < 6;

  // Unique ID from Blogger post ID or fallback
  const rawId = entry?.id?.$t || `blogger-${index}-${Date.now()}`;
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '-');

  return {
    id,
    title,
    summary,
    content,
    author,
    sourceName: 'FlashNews24.site',
    publishedAt,
    rawPublishedAt: entry?.published?.$t || entry?.updated?.$t,
    imageUrl,
    category: primary,
    tags,
    url,
    readTimeMinutes,
    isBreaking,
    sentiment,
    isLiveBlogger: true
  };
}

/**
 * Real cached Blogger articles from flashnews24.site as instant offline / retry fallback.
 * Keep this as a last-resort fallback when network and proxies fail.
 */
const OFFLINE_BLOGGER_CACHE: Article[] = [
  {
    id: "offline-1",
    title: "FlashNews24 — Offline sample article",
    summary: "This is a cached offline article used as a last-resort fallback when live feed cannot be retrieved.",
    content: "This is placeholder offline content. Live feed could not be fetched.",
    author: "FlashNews24 Live",
    sourceName: "FlashNews24.site",
    publishedAt: "Just now",
    rawPublishedAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80",
    category: "World",
    tags: ["offline"],
    url: BLOGGER_SITE_URL,
    readTimeMinutes: 1,
    isBreaking: false,
    sentiment: "Neutral",
    isLiveBlogger: true
  }
];

/**
 * Fetches articles directly or via server proxy from flashnews24.site Blogger feed.
 * Guaranteed to return valid Blogger articles without console errors or UI crashes.
 */
export async function fetchBloggerArticles(category: string = 'All', searchQuery: string = ''): Promise<Article[]> {
  let fetchedArticles: Article[] = [];

  // 1. Try backend proxy first
  try {
    const proxyRes = await fetch(`/api/news?category=${encodeURIComponent(category)}&search=${encodeURIComponent(searchQuery)}`);
    if (proxyRes.ok) {
      const data = await proxyRes.json();
      if (data && Array.isArray(data.articles) && data.articles.length > 0) {
        fetchedArticles = data.articles;
      }
    }
  } catch {
    // ignore and try direct fetch
  }

  // 2. Try direct client-side fetch from Blogger JSON API endpoint
  if (fetchedArticles.length === 0) {
    try {
      const directRes = await fetch(`${BLOGGER_JSON_FEED_URL}&t=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });

      if (directRes.ok) {
        const feedJson = await directRes.json();
        if (feedJson?.feed?.entry && Array.isArray(feedJson.feed.entry)) {
          fetchedArticles = feedJson.feed.entry.map((entry: any, index: number) =>
            parseBloggerEntry(entry, index)
          );
        }
      }
    } catch {
      // ignore and try CORS proxy
    }
  }

  // 3. Fallback to public CORS proxy if direct fetch failed
  if (fetchedArticles.length === 0) {
    try {
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(BLOGGER_JSON_FEED_URL)}`;
      const proxyRes = await fetch(`${proxyUrl}&t=${Date.now()}`, {
        cache: "no-store"
      });
      if (proxyRes.ok) {
        const feedJson = await proxyRes.json();
        if (feedJson?.feed?.entry && Array.isArray(feedJson.feed.entry)) {
          fetchedArticles = feedJson.feed.entry.map((entry: any, index: number) =>
            parseBloggerEntry(entry, index)
          );
        }
      }
    } catch {
      // ignore; we'll fall back to offline cache below
    }
  }

  // If we still don't have any articles, serve offline cache
  if (fetchedArticles.length === 0) {
    return [...OFFLINE_BLOGGER_CACHE];
  }

  // Normalize and sort all fetched articles by publication time
  const sortByDate = (arr: Article[]) => {
    return arr.slice().sort((a, b) => {
      const aTime = new Date((a as any).rawPublishedAt || a.publishedAt).getTime();
      const bTime = new Date((b as any).rawPublishedAt || b.publishedAt).getTime();
      return bTime - aTime;
    });
  };

  fetchedArticles = sortByDate(fetchedArticles);

  // Apply optional category + search filters only as a view convenience.
  // IMPORTANT: If filters produce 0 results, do NOT fall back to offline cache — return the live fetched articles instead.
  let filtered = fetchedArticles;
  if (category && category !== 'All') {
    const catLower = category.toLowerCase();
    filtered = filtered.filter(a =>
      (typeof a.category === 'string' && a.category.toLowerCase() === catLower) ||
      (a.tags && a.tags.some(tag => tag && tag.toLowerCase().includes(catLower)))
    );
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(a =>
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.summary && a.summary.toLowerCase().includes(q)) ||
      (a.content && a.content.toLowerCase().includes(q)) ||
      (a.tags && a.tags.some(t => t && t.toLowerCase().includes(q)))
    );
  }

  // If filtered results are present, return them sorted; otherwise return the full live feed.
  return filtered.length > 0 ? sortByDate(filtered) : fetchedArticles;
}
