# Rork PWA - Build and Run Instructions

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run on web**
   ```bash
   npm run web
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8081`
   - The app will load as a PWA

## Available Scripts

- `npm run web` - Start web development server
- `npm run start` - Start Expo development server
- `npm run build:web` - Build production web bundle
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator

## PWA Features

### Installation
- **Desktop**: Look for install button in browser address bar
- **Mobile**: Use "Add to Home Screen" option
- **Standalone**: App opens without browser UI when launched from home screen

### Offline Support
- App shell loads instantly from cache
- Data persists offline using Firestore offline persistence
- Changes sync when connection is restored

### Responsive Design
- **Mobile**: Single column layout (360px+)
- **Tablet**: Two column layout (768px+)
- **Desktop**: Multi-column layout (1024px+)

## Development Notes

- Uses mock data by default (no Firebase setup required)
- Hot reload enabled for fast development
- TypeScript strict mode enabled
- ESLint and Prettier configured

## Production Deployment

### Firebase Hosting
```bash
npm run build:web
firebase deploy
```

### Vercel
```bash
npm run build:web
vercel --prod
```

### Netlify
```bash
npm run build:web
# Upload dist folder to Netlify
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Web build fails**
   ```bash
   rm -rf node_modules
   npm install
   npm run build:web
   ```

3. **PWA not installing**
   - Ensure HTTPS in production
   - Check manifest.json is accessible
   - Verify service worker is registered

### Performance Tips

- Use pagination for large lists
- Enable Firestore offline persistence
- Optimize images and assets
- Use React.memo for expensive components
