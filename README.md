# 🐜 Ant Colony Defense 🐜

A strategic tower defense game featuring intelligent ant swarms using real Ant Colony Optimization (ACO) algorithms. Command your towers to defend your picnic from waves of smart ants that use pheromone trails to find the best paths!

## 🎮 Play Now

[Play Ant Colony Defense](https://ant-colony-defense.franzai.com)

## ✨ Features

- **Real Colony AI**: Ants use actual Ant Colony Optimization algorithms with pheromone trails
- **Strategic Gameplay**: Create mazes and chokepoints to maximize tower effectiveness
- **Hexagonal Grid**: Unique hex-based layout for more strategic depth
- **Multiple Tower Types**:
  - 🦣 **Anteater**: Slows ants with sticky tongue attacks
  - 💨 **Pesticide**: Area of effect damage to groups
  - 🍯 **Sugar Trap**: Lures ants and damages them over time
  - 🔥 **Fire Tower**: High damage with burning effects
- **Different Ant Types**:
  - 🟫 **Worker Ants**: Basic units with moderate health
  - 🔴 **Soldier Ants**: Heavily armored tank units
  - 🟡 **Scout Ants**: Fast but fragile speedsters
  - 🟣 **Queen Ants**: Boss units with massive health pools
- **Progressive Difficulty**: 10 challenging levels with increasing complexity
- **Mobile Responsive**: Fully playable on phones, tablets, and desktops
- **Save System**: Automatic progress saving with localStorage

## 🎯 How to Play

1. **Build Phase**: Place towers strategically on the hexagonal grid
2. **Wave Phase**: Ants spawn and follow pheromone trails to your picnic
3. **Defend**: Towers automatically attack ants in range
4. **Earn Resources**: Defeated ants drop resources for more towers
5. **Survive**: Protect your picnic through all waves to win!

### Strategy Tips

- Create maze-like paths to maximize tower coverage
- Use Sugar Traps to control ant movement patterns
- Combine slow towers (Anteater) with high-damage towers (Fire)
- Watch the pheromone trails to predict ant paths
- Save Fire Towers for tough enemies like Queens

## 🛠️ Technical Features

- **TypeScript**: Fully typed with strict mode enabled
- **React 19**: Latest React with modern hooks and patterns
- **Vite**: Lightning-fast build tooling
- **Ant Colony Optimization**: Real ACO algorithm implementation
- **Canvas Rendering**: Smooth 60fps gameplay
- **Zero Dependencies**: Minimal bundle size for fast loading
- **PWA Ready**: Installable as a Progressive Web App

## 🚀 Development

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/franzenzenhofer/ant-colony-defense.git
cd ant-colony-defense

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run test         # Run Playwright E2E tests
```

### Project Structure

```
ant-colony-defense/
├── src/
│   ├── algorithms/      # ACO pathfinding implementation
│   ├── components/      # React components
│   ├── core/           # Game constants and configurations
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── tests/              # Playwright E2E tests
├── public/             # Static assets
└── dist/               # Production build
```

## 🏗️ Architecture

### Ant Colony Optimization

The game uses a real ACO algorithm where ants:
1. Deposit pheromones along their paths
2. Prefer paths with stronger pheromone trails
3. Balance exploration with exploitation
4. Adapt to tower placements dynamically

### State Management

- **useReducer**: For complex game state
- **Context-free**: No prop drilling, clean component hierarchy
- **Immutable Updates**: Predictable state changes

### Performance Optimizations

- **Canvas Rendering**: Hardware-accelerated graphics
- **Memoization**: Expensive calculations cached
- **Lazy Loading**: Code splitting for faster initial load
- **Web Workers**: (Planned) Offload pathfinding calculations

## 🧪 Testing

The project includes comprehensive Playwright E2E tests:

```bash
# Install Playwright browsers
npx playwright install

# Run all tests
npm run test

# Run tests with UI
npx playwright test --ui
```

## 📦 Deployment

The game is optimized for static hosting:

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name=ant-colony-defense
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic tower defense games
- Ant Colony Optimization algorithm by Marco Dorigo
- Built with React, TypeScript, and lots of 🐜

## 🐛 Known Issues

- Sound effects not yet implemented
- Leaderboard system planned for future release
- Multiplayer mode under consideration

---

Made with 🐜 by [Franz AI](https://franzai.com)