import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy Gemini client initialization to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.error('Failed to init Gemini Client:', e);
      return null;
    }
  }
  return aiClient;
}

// Curated initial news database
const initialArticles = [
  {
    id: 'art-1',
    title: 'Google DeepMind Unveils Gemini 3.5: Next-Gen Autonomous Reasoning Engine',
    summary: 'The new architecture introduces native multimodal tool chaining and real-time reflection loops, outperforming human experts in complex engineering benchmarks.',
    content: 'In a landmark keynote today, researchers at Google DeepMind revealed the Gemini 3.5 series. The model introduces massive upgrades in real-time latency, native speech synthesis, and a[...]',
    author: 'Elena Rostova',
    sourceName: 'TechCrunch 24',
    publishedAt: '10 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    category: 'AI',
    url: 'https://flashnews24.io/articles/gemini-3-5-unveiled',
    readTimeMinutes: 4,
    isBreaking: true,
    sentiment: 'Urgent'
  },
  {
    id: 'art-2',
    title: 'Global Markets Rally as Green Energy Adoption Hits Tipping Point in Europe',
    summary: 'Solar and wind energy output officially surpassed fossil fuels across EU grids during Q2, triggering massive institutional investments in clean tech.',
    content: 'Stock markets across Europe and North America surged today following data from the International Energy Agency showing that renewable sources provided over 52% of total electricity g[...]',
    author: 'Marcus Vance',
    sourceName: 'Bloomberg News',
    publishedAt: '32 mins ago',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&auto=format&fit=crop&q=80',
    category: 'Business',
    url: 'https://flashnews24.io/articles/green-energy-tipping-point',
    readTimeMinutes: 5,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-3',
    title: 'James Webb Telescope Spots Earliest Water-Rich Atmosphere on Exoplanet K2-18c',
    summary: 'Spectroscopic analysis reveals clear signatures of water vapor and carbon-bearing molecules in the habitable zone of a nearby red dwarf star.',
    content: 'Astronomers using the James Webb Space Telescope have detected definitive signatures of water vapor, methane, and carbon dioxide in the atmosphere of exoplanet K2-18c, located 120 li[...]',
    author: 'Dr. Aris Thorne',
    sourceName: 'Scientific American',
    publishedAt: '1 hour ago',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80',
    category: 'Science',
    url: 'https://flashnews24.io/articles/jwst-water-atmosphere',
    readTimeMinutes: 6,
    isBreaking: false,
    sentiment: 'Analytical'
  },
  {
    id: 'art-4',
    title: 'Android 16 Developer Preview Brings Real-time Spatial Audio & Satellite SOS',
    summary: 'Google releases the first beta build featuring Jetpack Compose 1.8 optimizations, dynamic material color synthesis, and satellite emergency messaging.',
    content: 'The Android development ecosystem is buzzing following the release of the Android 16 Developer Preview. Highlights include native spatial audio rendering with dynamic head tracking, [...]',
    author: 'Sarah Jenkins',
    sourceName: 'Android Central',
    publishedAt: '2 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=800&auto=format&fit=crop&q=80',
    category: 'Tech',
    url: 'https://flashnews24.io/articles/android-16-preview',
    readTimeMinutes: 3,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-5',
    title: 'Championship Thriller: Underdog FC Tokyo Secures Last-Minute Victory in Extra Time',
    summary: 'A dramatic 94th-minute volley seals a historic 3-2 comeback against the reigning champions in front of a sold-out stadium of 65,000 fans.',
    content: 'In one of the most memorable matches of the decade, FC Tokyo overturned a 2-0 halftime deficit to defeat the league champions 3-2. Teenager Kenji Sato scored the winner in the 94th m[...]',
    author: 'David Beckham Jr.',
    sourceName: 'ESPN Global',
    publishedAt: '3 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    category: 'Sports',
    url: 'https://flashnews24.io/articles/fc-tokyo-thriller',
    readTimeMinutes: 4,
    isBreaking: false,
    sentiment: 'Positive'
  },
  {
    id: 'art-6',
    title: 'Next-Gen Quantum Chip Achieves 99.9% Error-Correction Gate Fidelity',
    summary: 'Physicists demonstrate fault-tolerant topological qubits operating at room temperature, paving the way for commercial quantum supercomputers by 2028.',
    content: 'A consortium of quantum researchers has announced a major breakthrough in qubit stability. By utilizing topological braiding in diamond nitrogen-vacancy centers, the team achieved a[...]',
    author: 'Prof. Chen Wei',
    sourceName: 'Nature Technology',
    publishedAt: '5 hours ago',
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80',
    category: 'Tech',
    url: 'https://flashnews24.io/articles/quantum-chip-fidelity',
    readTimeMinutes: 5,
    isBreaking: false,
    sentiment: 'Analytical'
  }
];

const BLOGGER_FEED_URL = 'https://www.flashnews24.site/feeds/posts/default?alt=json&max-results=500&start-index=1';

function decodeBloggerEntities(text: string): string {
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

function cleanBloggerHtml(html: string): { summary: string; content: string; readTimeMinutes: number } {
  if (!html) return { summary: 'No summary available.', content: 'No content available.', readTimeMinutes: 1 };
  let text = html
    .replace(/<(p|div|h[1-6]|ul|ol|li|blockquote|table|tr)[^>]*>/gi, '\n\n')
    .replace(/<\/(p|div|h[1-6]|ul|ol|li|blockquote|table|tr)>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n\n');
  text = text.replace(/<[^>]+>/g, '');
  text = decodeBloggerEntities(text);
  text = text
    .split(/\n\s*\n+/)
    .map(para => para.replace(/\s+/g, ' ').trim())
    .filter(para => para.length > 0)
    .join('\n\n');

  const words = text.split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.round(words / 200));
  const firstPara = text.split('\n\n')[0] || text;
  const summary = firstPara.length > 200 ? firstPara.slice(0, 197) + '...' : firstPara;
  return { summary, content: text, readTimeMinutes };
}

function extractBloggerImage(entry: any, html: string): string {
  if (entry['media$thumbnail'] && entry['media$thumbnail'].url) {
    return entry['media$thumbnail'].url.replace(/\/(s|w|h)\d+([-a-z0-9]*)\//i, '/s1000/');
  }
  const imgMatch = html.match(/src=["'](https?:\/\/[^"']+\.(png|jpg|jpeg|webp|gif)[^"']*)["']/i) ||
                   html.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1].replace(/\/(s|w|h)\d+([-a-z0-9]*)\//i, '/s1000/');
  }
  return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';
}

function formatBloggerDate(dateStr: string): string {
  if (!dateStr) return 'Just now';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' +
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch { return dateStr; }
}

function categorizeBlogger(title: string, content: string, categories: any[] = []): { primary: string; tags: string[] } {
  const tags = categories.map((c: any) => (c.term || '').toLowerCase().trim()).filter(Boolean);
  const combined = (title + ' ' + content + ' ' + tags.join(' ')).toLowerCase();
  let primary = 'All';

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
  } else if (/\b(world|international|global|new york|usa|uk|europe|asia|china|russia|war|conflict|government|police|crash|crashes|fire|fires|emergency|accident|accidents|politics|country|nation|city|cities)\b/i.test(combined)) {
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

function parseBloggerEntryServer(entry: any, index: number): any {
  const title = decodeBloggerEntities(entry.title?.$t || 'Untitled Article');
  const rawHtml = entry.content?.$t || entry.summary?.$t || '';
  const { summary, content, readTimeMinutes } = cleanBloggerHtml(rawHtml);
  const author = entry.author?.[0]?.name?.$t || 'FlashNews24 Live';

  const rawPublishedAt = entry.published?.$t || entry.updated?.$t;
  const publishedAt = formatBloggerDate(rawPublishedAt);

  const linkObj = entry.link?.find((l: any) => l.rel === 'alternate') || entry.link?.[0];
  const url = linkObj?.href || 'https://www.flashnews24.site';
  const imageUrl = extractBloggerImage(entry, rawHtml);
  const { primary, tags } = categorizeBlogger(title, content, entry.category);
  const textLower = (title + ' ' + content).toLowerCase();
  let sentiment = 'Neutral';
  if (textLower.includes('crash') || textLower.includes('emergency') || textLower.includes('alert') || textLower.includes('attack') || textLower.includes('disaster') || textLower.includes('deadly')) sentiment = 'Urgent';
  else if (textLower.includes('win') || textLower.includes('victory') || textLower.includes('rally') || textLower.includes('growth') || textLower.includes('success')) sentiment = 'Positive';
  else if (textLower.includes('study') || textLower.includes('research') || textLower.includes('analysis') || textLower.includes('report')) sentiment = 'Analytical';

  const isBreaking = index < 2 || tags.some((t: string) => t.includes('breaking') || t.includes('flash') || t.includes('urgent'));
  const rawId = entry.id?.$t || `blogger-${index}-${Date.now()}`;
  const id = rawId.replace(/[^a-zA-Z0-9-_]/g, '-');

  return {
    id,
    title,
    summary,
    content,
    author,
    sourceName: 'FlashNews24.site',
    rawPublishedAt,
    publishedAt,
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

// API: Get articles from live flashnews24.site Blogger feed
app.get('/api/news', async (req, res) => {
  const { category, search } = req.query;
  let articles: any[] = [];
  let sourceType = 'UNKNOWN';
  let error: string | null = null;

  try {
    console.log(`\n📡 [/api/news] Fetching Blogger feed from: ${BLOGGER_FEED_URL}`);

    const fetchOptions = {
      method: 'GET',
      headers: {
        'User-Agent': 'FlashNews24-Android-Client/1.0',
        'Accept': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    };

    const bloggerRes = await fetch(BLOGGER_FEED_URL, fetchOptions);
    console.log(`📡 [/api/news] Blogger response status: ${bloggerRes.status} ${bloggerRes.statusText}`);
    console.log(`📡 [/api/news] Response content-type: ${bloggerRes.headers.get('content-type')}`);

    if (!bloggerRes.ok) {
      throw new Error(`HTTP ${bloggerRes.status}: ${bloggerRes.statusText}`);
    }

    const rawText = await bloggerRes.text();
    console.log(`📡 [/api/news] Response body length: ${rawText.length} bytes`);

    if (rawText.length === 0) {
      throw new Error('Response body is empty');
    }

    let data;
    try {
      data = JSON.parse(rawText);
      console.log(`✓ JSON parsed successfully`);
    } catch (parseErr: any) {
      throw new Error(`JSON parse error: ${parseErr.message}. First 200 chars: ${rawText.substring(0, 200)}`);
    }

    // Validate feed structure
    if (!data.feed) {
      throw new Error('Response missing "feed" property');
    }

    if (!data.feed.entry) {
      throw new Error('Response missing "feed.entry" property');
    }

    if (!Array.isArray(data.feed.entry)) {
      throw new Error(`"feed.entry" is not an array, got: ${typeof data.feed.entry}`);
    }

    const entryCount = data.feed.entry.length;
    console.log(`✓ Found ${entryCount} entries in feed.entry`);
console.log("SERVER FEED =", entryCount);
    if (entryCount === 0) {
      throw new Error('feed.entry array is empty - no posts available');
    }

    // Parse entries
    try {
      articles = data.feed.entry.map((e: any, idx: number) =>
        parseBloggerEntryServer(e, idx)
      );
      console.log(`✓ Successfully parsed ${articles.length} articles`);
    } catch (parseErr: any) {
      throw new Error(`Error parsing entries: ${parseErr.message}`);
    }

    // Sort by publication date
    articles.sort((a, b) => {
      const aTime = new Date(a.rawPublishedAt || a.publishedAt).getTime();
      const bTime = new Date(b.rawPublishedAt || b.publishedAt).getTime();
      return bTime - aTime;
    });

    console.log(`✓ Blogger articles sorted by date`);
    console.log(`✓ Latest article: "${articles[0]?.title}"`);
    sourceType = 'BLOGGER_LIVE';

  } catch (err: any) {
    error = err.message || String(err);
    console.error(`❌ [/api/news] Blogger fetch FAILED: ${error}`);
    console.error(`❌ Stack: ${err.stack?.substring(0, 300)}`);
    sourceType = 'FALLBACK';
  }

  // FALLBACK: Only use initialArticles if Blogger fetch completely failed
  if (articles.length === 0) {
    console.warn(`⚠️  [/api/news] Using fallback initialArticles (${initialArticles.length} articles)`);
    articles = [...initialArticles];
  }
console.log("SERVER ARTICLES =", articles.length);
  // Apply filters (only filter after we have articles)
  let filtered = articles;
  if (category && category !== 'All') {
    const catStr = (category as string).toLowerCase();
    const beforeFilter = filtered.length;
    filtered = filtered.filter((a: any) =>
      (typeof a.category === 'string' && a.category.toLowerCase() === catStr) ||
      (a.tags && a.tags.some((tag: string) => tag.includes(catStr)))
    );
    console.log(`📋 [/api/news] Filtered by category "${category}": ${beforeFilter} → ${filtered.length}`);
  }

  if (search) {
    const q = (search as string).toLowerCase();
    const beforeFilter = filtered.length;
    filtered = filtered.filter((a: any) =>
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.content.toLowerCase().includes(q) ||
      (a.tags && a.tags.some((t: string) => t.includes(q)))
    );
    console.log(`🔍 [/api/news] Filtered by search "${search}": ${beforeFilter} → ${filtered.length}`);
  }
console.log("SERVER FILTERED =", filtered.length);
  // Return response
  const response = {
    status: articles.length > 0 ? 'ok' : 'error',
    source: sourceType,
    error: error || null,
    totalFetched: articles.length,
    totalReturned: filtered.length,
    
    articles: filtered,
    timestamp: new Date().toISOString()
  };

  console.log(`✓ [/api/news] Response: ${response.totalReturned} articles, source=${response.source}\n`);

  res.json(response);
});

// API: Generate Live AI Breaking News
app.post('/api/news/ai-breaking', async (req, res) => {
  const ai = getAiClient();
  const { topic = 'Technology & AI' } = req.body;

  if (!ai) {
    // Fallback if no API key
    const fallbackArticle = {
      id: `art-${Date.now()}`,
      title: `BREAKING: Major Advancement in ${topic} Announced Today`,
      summary: `Industry executives confirm groundbreaking developments in ${topic}, expecting widespread global adoption within months.`,
      content: `In a surprise announcement earlier today, leading researchers and engineers unveiled next-generation capabilities in ${topic}. The new standards promise 10x performance gains and enhanced compatibility across all major platforms worldwide.`,
      author: 'Gemini News Dispatcher',
      sourceName: 'FlashNews24 Live Feed',
      publishedAt: 'Just now',
      imageUrl: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&auto=format&fit=crop&q=80',
      category: 'Tech',
      url: `https://flashnews24.io/articles/live-${Date.now()}`,
      readTimeMinutes: 3,
      isBreaking: true,
      sentiment: 'Urgent'
    };
    return res.json({ article: fallbackArticle, simulated: true });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a realistic, high-quality, exciting breaking news article about "${topic}". Return strictly valid JSON matching the schema.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Catchy news headline' },
            summary: { type: Type.STRING, description: '2 sentence summary' },
            content: { type: Type.STRING, description: 'Full article body with 3 detailed paragraphs' },
            author: { type: Type.STRING, description: 'Journalist name' },
            sourceName: { type: Type.STRING, description: 'News publisher name like TechDaily or Global Times' },
            category: { type: Type.STRING, description: 'One of: Tech, AI, Business, World, Science, Sports' },
            readTimeMinutes: { type: Type.INTEGER, description: 'Estimated read time in minutes (2 to 7)' },
            sentiment: { type: Type.STRING, description: 'One of: Positive, Urgent, Analytical, Neutral' },
            imageUrl: { type: Type.STRING, description: 'An unsplash photo URL keyword like https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80' }
          },
          required: ['title', 'summary', 'content', 'author', 'sourceName', 'category', 'readTimeMinutes', 'sentiment', 'imageUrl']
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    data.id = `art-ai-${Date.now()}`;
    data.publishedAt = 'Just now';
    data.isBreaking = true;
    data.url = `https://flashnews24.io/articles/${data.id}`;

    res.json({ article: data, simulated: false });
  } catch (err: any) {
    console.error('Gemini news generation error:', err);
    res.status(500).json({ error: 'Failed to generate news via Gemini' });
  }
});

// API: AI Summarize article
app.post('/api/news/summarize', async (req, res) => {
  const ai = getAiClient();
  const { title, content } = req.body;

  if (!ai) {
    return res.json({
      summaryPoints: [
        `Key focus on ${title.slice(0, 40)}...`,
        'Significant industry impact and rapid technical adoption across international markets.',
        'Experts advise monitoring regulatory frameworks and upcoming Q3 deployment milestones.'
      ],
      sentimentScore: '92% Positive / Optimistic',
      simulated: true
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Analyze the following news article:\nTitle: ${title}\nContent: ${content}\n\nProvide 3 crisp bullet points summarizing the core takeaways, and a brief sentiment analysis.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 3 insightful summary bullet points'
            },
            sentimentScore: { type: Type.STRING, description: 'e.g. "88% Positive / Bullish" or "Urgent Alert"' }
          },
          required: ['summaryPoints', 'sentimentScore']
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (err: any) {
    console.error('Gemini summarize error:', err);
    res.status(500).json({ error: 'Failed to generate summary' });
  }
});

// API: Generate FCM push alert headline
app.post('/api/fcm/generate-alert', async (req, res) => {
  const ai = getAiClient();
  const { topic = 'Breaking Tech Update' } = req.body;

  if (!ai) {
    return res.json({
      title: '🚨 FLASH BREAKING: Apple & Google Announce Open Satellite Protocol',
      body: 'Universal satellite messaging standard to deploy across all iOS and Android devices next month without extra subscription costs.',
      priority: 'HIGH'
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Create an urgent, exciting breaking news push notification alert for an Android news app about "${topic}".`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Short alert title starting with an emoji like 🚨 or ⚡' },
            body: { type: Type.STRING, description: 'One compelling sentence summarizing the news' },
            priority: { type: Type.STRING, description: 'HIGH or NORMAL' }
          },
          required: ['title', 'body', 'priority']
        }
      }
    });

    const data = JSON.parse(response.text.trim());
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate alert' });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FlashNews24 Server running on http://localhost:${PORT}`);
  });
}

startServer();
