# The Daily Brief

A newspaper-style news app for iPhone and iPad, built with Expo (React Native).

- On first launch, it asks what you want to read: **Cars**, **Politics**, **Stocks** (one or more).
- The home page shows a lead story and a feed of the latest articles from real news sources (RSS feeds).
- News refreshes on its own every 5 minutes, whenever you reopen the app, and when you pull down.
- Tap a story to read it in an in-app browser. Tap **Topics** to change what you see.

## Try it on your phone (no Mac needed)

**Option A: Expo Snack**
1. Go to https://snack.expo.dev and choose **Import git repository**, then paste this repo's URL
   (branch `claude/ios-app-development-taxhwz`). The repo must be public for Snack to import it.
2. Scan the QR code with your iPhone camera to open it in Expo Go.

**Option B: any computer with Node.js**
```bash
npm install
npx expo start --tunnel
```
Scan the QR code with your iPhone camera.

## Changing news sources

Edit `src/sources.js`. Each topic has a list of `{ name, url }` RSS feeds.

## Project layout

- `App.js` – saves your topic choice and switches between screens
- `src/screens/TopicPicker.js` – the "What do you want to read?" screen
- `src/screens/Home.js` – the newspaper front page, auto-refresh
- `src/components/ArticleCard.js` – lead story and article rows
- `src/rss.js` – downloads and reads the news feeds
