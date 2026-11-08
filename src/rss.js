import { TOPICS } from './sources';

// A small RSS/Atom reader, so the app needs no extra parsing library.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…', mdash: '—', ndash: '–', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };

function decode(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : m;
    }
    return ENTITIES[code.toLowerCase()] ?? m;
  });
}

function unwrapCdata(text) {
  return text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
}

function stripHtml(html) {
  return decode(html.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? unwrapCdata(m[1]).trim() : '';
}

function attr(block, tagName, attrName, filter) {
  const re = new RegExp(`<${tagName}\\b[^>]*>`, 'gi');
  for (const t of block.match(re) || []) {
    if (filter && !filter(t)) continue;
    const m = t.match(new RegExp(`\\b${attrName}=["']([^"']+)["']`, 'i'));
    if (m) return decode(m[1]);
  }
  return '';
}

function findImage(block, html) {
  return (
    attr(block, 'media:content', 'url', (t) => !/medium=["'](video|audio)/i.test(t)) ||
    attr(block, 'media:thumbnail', 'url') ||
    attr(block, 'enclosure', 'url', (t) => /type=["']image/i.test(t)) ||
    attr(html, 'img', 'src') ||
    ''
  );
}

export function parseFeed(xml, sourceName, topic) {
  const blocks = xml.match(/<item\b[\s\S]*?<\/item>/gi) || xml.match(/<entry\b[\s\S]*?<\/entry>/gi) || [];
  return blocks
    .map((block) => {
      const html = tag(block, 'content:encoded') || tag(block, 'description') || tag(block, 'summary') || tag(block, 'content');
      const link = stripHtml(tag(block, 'link')) || attr(block, 'link', 'href', (t) => !/rel=["'](?!alternate)/i.test(t));
      const dateText = tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated') || tag(block, 'dc:date');
      const date = dateText ? new Date(dateText) : null;
      const summary = stripHtml(html);
      let image = findImage(block, unwrapCdata(html));
      if (image.startsWith('//')) image = 'https:' + image;
      return {
        id: link || `${sourceName}-${tag(block, 'title')}`,
        title: stripHtml(tag(block, 'title')),
        link,
        summary: summary.length > 220 ? summary.slice(0, 217).trimEnd() + '…' : summary,
        image: image.startsWith('http') ? image : null,
        date: date && !isNaN(date) ? date.getTime() : 0,
        source: sourceName,
        topic,
      };
    })
    .filter((a) => a.title && a.link);
}

async function fetchSource(source, topic) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: { Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseFeed(await res.text(), source.name, topic);
  } finally {
    clearTimeout(timer);
  }
}

// Loads every source for the given topics, newest first, without duplicates.
// One broken source doesn't stop the others; it only fails if all of them fail.
export async function fetchNews(topicKeys) {
  const jobs = topicKeys.flatMap((topic) => TOPICS[topic].sources.map((s) => fetchSource(s, topic)));
  const results = await Promise.allSettled(jobs);
  const ok = results.filter((r) => r.status === 'fulfilled');
  if (jobs.length && !ok.length) throw new Error('Could not reach any news source. Check your connection.');

  const seen = new Set();
  return ok
    .flatMap((r) => r.value)
    .filter((a) => (seen.has(a.id) ? false : seen.add(a.id)))
    .sort((a, b) => b.date - a.date);
}

export function timeAgo(ms) {
  if (!ms) return '';
  const mins = Math.max(0, Math.round((Date.now() - ms) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
