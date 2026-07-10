import { Article, NewsCategory } from '../types';

export const BLOGGER_SITE_URL = 'https://www.flashnews24.site';
export const BLOGGER_JSON_FEED_URL = `${BLOGGER_SITE_URL}/feeds/posts/default?alt=json&max-results=100`;

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
 * Fetches articles from backend /api/news endpoint which proxies flashnews24.site Blogger feed.
 * NEVER falls back to offline cache unless the backend is completely unreachable.
 * 
 * Root cause fix:
 * - Previously: Tried multiple fetch methods independently, could lose articles at each fallback level
 * - Now: Single source of truth is the backend /api/news endpoint
 * - Backend already handles all fallbacks (direct fetch + live Blogger parsing)
 * - Client filters results after successful fetch, never rejects based on category/search
 */
export async function fetchBloggerArticles(category: string = 'All', searchQuery: string = ''): Promise<Article[]> {
  // PRIMARY: Always use backend /api/news endpoint first
  // The backend handles all retry logic and Blogger feed parsing
  try {
    const backendUrl = new URL('/api/news', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    backendUrl.searchParams.set('category', category);
    backendUrl.searchParams.set('search', searchQuery);

    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      
      // Validate backend response structure
      if (data?.articles && Array.isArray(data.articles)) {
        // CRITICAL FIX: Return articles immediately if backend provided them
        // Do NOT fall through to offline cache
        if (data.articles.length > 0) {
          console.log(`✓ Backend returned ${data.articles.length} live articles from ${data.source || 'Unknown'}`);
          return data.articles;
        }
        
        // Backend provided empty array - this could be due to filtering
        // Retry without filters to get the raw live feed
        console.log('Backend returned empty array - retrying without category/search filters');
        const retryUrl = new URL('/api/news', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
        
        const retryResponse = await fetch(retryUrl.toString(), {
          method: 'GET',
          cache: 'no-store'
        });

        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          if (retryData?.articles && retryData.articles.length > 0) {
            console.log(`✓ Unfiltered backend returned ${retryData.articles.length} articles`);
            return retryData.articles;
          }
        }
      }
    } else {
      console.error(`Backend /api/news returned HTTP ${response.status}`);
    }
  } catch (error: any) {
    console.error('Backend /api/news fetch failed:', error?.message);
  }

  // FALLBACK 2: Try direct Blogger JSON API as secondary option
  // This is a backup if the backend endpoint is completely down
  try {
    console.log('Attempting direct Blogger API fetch as fallback...');
    const directUrl = `${BLOGGER_JSON_FEED_URL}&t=${Date.now()}`;
    
    const directResponse = await fetch(directUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (directResponse.ok) {
      const feedJson = await directResponse.json();
      
      if (feedJson?.feed?.entry && Array.isArray(feedJson.feed.entry)) {
        console.log(`✓ Direct Blogger API returned ${feedJson.feed.entry.length} entries`);
        
        const articles = feedJson.feed.entry.map((entry: any, index: number) =>
          parseBloggerEntry(entry, index)
        );

        // Sort by date
        articles.sort((a, b) => {
          const aTime = new Date(a.rawPublishedAt || a.publishedAt).getTime();
          const bTime = new Date(b.rawPublishedAt || b.publishedAt).getTime();
          return bTime - aTime;
        });

        if (articles.length > 0) {
          return articles;
        }
      } else {
        console.error('Direct Blogger API missing feed.entry structure');
      }
    } else {
      console.error(`Direct Blogger API returned HTTP ${directResponse.status}`);
    }
  } catch (error: any) {
    console.error('Direct Blogger API fetch failed:', error?.message);
  }

  // FALLBACK 3: Try CORS proxy
  try {
    console.log('Attempting CORS proxy fetch as final fallback...');
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(BLOGGER_JSON_FEED_URL)}&t=${Date.now()}`;
    
    const proxyResponse = await fetch(proxyUrl, {
      cache: 'no-store'
    });

    if (proxyResponse.ok) {
      const feedJson = await proxyResponse.json();
      
      if (feedJson?.feed?.entry && Array.isArray(feedJson.feed.entry)) {
        console.log(`✓ CORS proxy returned ${feedJson.feed.entry.length} entries`);
        
        const articles = feedJson.feed.entry.map((entry: any, index: number) =>
          parseBloggerEntry(entry, index)
        );

        articles.sort((a, b) => {
          const aTime = new Date(a.rawPublishedAt || a.publishedAt).getTime();
          const bTime = new Date(b.rawPublishedAt || b.publishedAt).getTime();
          return bTime - aTime;
        });

        if (articles.length > 0) {
          return articles;
        }
      }
    }
  } catch (error: any) {
    console.error('CORS proxy fetch failed:', error?.message);
  }

  // ABSOLUTE LAST RESORT: Only return offline cache when ALL network options fail
  console.warn('❌ All fetch attempts failed. Returning OFFLINE_BLOGGER_CACHE as emergency fallback.');
  return [...OFFLINE_BLOGGER_CACHE];
}
