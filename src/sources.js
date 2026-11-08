// News sources for each topic. Every source is a public RSS feed.
// To add a source, add { name, url } to a topic's list.
export const TOPICS = {
  cars: {
    label: 'Cars',
    emoji: '🚗',
    blurb: 'New models, reviews and EV news',
    sources: [
      { name: 'Motor1', url: 'https://www.motor1.com/rss/news/all/' },
      { name: 'Car and Driver', url: 'https://www.caranddriver.com/rss/all.xml/' },
      { name: 'Electrek', url: 'https://electrek.co/feed/' },
      { name: 'Jalopnik', url: 'https://jalopnik.com/rss' },
    ],
  },
  politics: {
    label: 'Politics',
    emoji: '🏛️',
    blurb: 'Elections, policy and government',
    sources: [
      { name: 'NPR', url: 'https://feeds.npr.org/1014/rss.xml' },
      { name: 'Politico', url: 'https://rss.politico.com/politics-news.xml' },
      { name: 'The Hill', url: 'https://thehill.com/homenews/feed/' },
      { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/politics/rss.xml' },
    ],
  },
  stocks: {
    label: 'Stocks',
    emoji: '📈',
    blurb: 'Markets, earnings and the economy',
    sources: [
      { name: 'CNBC', url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html' },
      { name: 'MarketWatch', url: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
      { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex' },
    ],
  },
};

export const TOPIC_KEYS = Object.keys(TOPICS);
