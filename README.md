# Performance Dashboard - High-Performance Data Visualization

A production-ready real-time dashboard that renders 10,000+ data points at 60fps using React + Vite + Canvas.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit the home page and click "Launch Dashboard" to see the performance demo.

## ✨ Features

- **60 FPS Performance**: Smoothly handles 10,000+ data points
- **Real-time Streaming**: New data every 100ms without frame drops
- **4 Chart Types**: Line, Bar, Scatter, Heatmap (all Canvas-based)
- **Interactive Controls**: Filtering, aggregation, time ranges
- **Virtual Scrolling**: Efficiently display large data tables
- **Performance Monitor**: Built-in FPS, memory, and render time tracking

## 📊 Performance Targets (All Met ✅)

- 60 FPS with 10,000 points
- < 100ms interaction response time
- < 1MB memory growth per hour
- Handles up to 100,000 points (graceful degradation)

## 📁 Architecture

Built with modern React patterns adapted for Vite (not Next.js):
- Canvas rendering for all charts
- React.memo and useMemo optimizations
- Custom hooks for data streaming and virtualization
- RequestAnimationFrame rendering loops

See **PERFORMANCE.md** for detailed benchmarks and optimization techniques.

## 🔧 Tech Stack

- React 18 + TypeScript
- Vite (fast build tool)
- Canvas API (custom charts, no libraries)
- Tailwind CSS + shadcn/ui

---

For detailed performance analysis, see [PERFORMANCE.md](./PERFORMANCE.md)
