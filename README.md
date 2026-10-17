# Productivity & Finance

A cross-platform application project for organizing tasks, notes, income, and expenses.

**Engineering focus:** shared web/mobile interfaces, typed application structure, Firebase integration, and data portability.

[Project portfolio](https://github.com/sumanth2525/MainAll) · [Package and scripts](package.json)

> Development project. The feature list below describes intended and documented capabilities; production readiness and cross-platform behavior require validation.

A comprehensive personal productivity and finance management app built with Expo SDK 51, React Native, TypeScript, and Firebase. Features a responsive web PWA with offline capabilities.

## Features

### 📱 Cross-Platform
- **Mobile**: Native iOS and Android apps
- **Web**: Progressive Web App (PWA) with app-like experience
- **Offline**: Works offline with data synchronization

### 🎯 Productivity Features
- **Task Management**: Create, organize, and track tasks with priorities and due dates
- **Notes**: Rich note-taking with categories, colors, and tags
- **Dashboard**: Comprehensive overview with charts and statistics

### 💰 Finance Features
- **Transaction Tracking**: Income and expense management
- **Categories**: Organized transaction categorization
- **Recurring Transactions**: Automated recurring income/expenses
- **Charts & Analytics**: Visual insights into spending patterns
- **CSV Import/Export**: Data portability

### 🌐 PWA Features
- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Full offline functionality with sync
- **Responsive Design**: Optimized for all screen sizes
- **Service Workers**: Background sync and caching

## Tech Stack

- **Framework**: Expo SDK 53 + React Native 0.74
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Data Fetching**: TanStack Query with IndexedDB persistence
- **Backend**: Firebase (Auth, Firestore)
- **Charts**: Victory (universal charts)
- **Icons**: Lucide React Native + Expo Vector Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Firebase project (optional, uses mock data by default)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/sumanth2525/srapwa.git
   cd srapwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase (optional)**
   ```bash
   # Create a .env file with your Firebase config
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Start the development server**
   ```bash
   npm run web    # For web development
   npm run start  # For mobile development
   ```

## Run on Web

The app runs as a Progressive Web App (PWA) with the following features:

### Development
```bash
npm run web
```
Opens the app in your browser at `http://localhost:8081`

### Production Build
```bash
npm run build:web
```
Creates a static build in the `dist` folder ready for deployment.

### PWA Features
- **Installable**: Click the install button in your browser or "Add to Home Screen" on mobile
- **Offline**: Works without internet connection
- **App-like**: Standalone display without browser UI
- **Responsive**: Adapts to desktop, tablet, and mobile screens

## PWA Features

### Installation
- **Desktop**: Install button appears in browser address bar
- **Mobile**: "Add to Home Screen" option in browser menu
- **Standalone**: Opens without browser UI when launched from home screen

### Offline Capabilities
- **App Shell**: Core UI loads instantly from cache
- **Data Persistence**: Firestore offline persistence enabled
- **Background Sync**: Queued changes sync when online
- **Service Workers**: Automatic caching and background updates

### Performance
- **Fast Loading**: Static assets cached for instant loading
- **Efficient Queries**: Paginated Firestore queries with composite indexes
- **Optimized Bundle**: Metro bundler with tree shaking

## Deploy

### Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Build and deploy
npm run build:web
firebase deploy
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
npm run build:web
vercel --prod
```

### Netlify
```bash
# Build the project
npm run build:web

# Drag and drop the dist folder to Netlify
# Or connect your Git repository for automatic deployments
```

## Project Structure

```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Dashboard
│   │   ├── todos.tsx      # Tasks screen
│   │   ├── notes.tsx      # Notes screen
│   │   └── transactions.tsx # Finance screen
│   ├── add-*.tsx          # Add screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
│   ├── Chart.tsx          # Universal chart component
│   └── ResponsiveContainer.tsx
├── hooks/                 # Custom hooks
│   └── useFirebaseStore.tsx # Zustand store
├── services/              # Business logic
│   ├── firebaseService.ts # Firebase operations
│   ├── csvImport.ts       # CSV import functionality
│   └── csvExport.ts       # CSV export functionality
├── config/                # Configuration
│   └── firebase.ts        # Firebase setup
├── types/                  # TypeScript definitions
├── constants/             # App constants
├── mocks/                 # Mock data
└── public/                # Static assets
    ├── service-worker.js  # PWA service worker
    ├── manifest.webmanifest # PWA manifest
    └── firebase-messaging-sw.js
```

## Key Features Implementation

### Universal Charts
The `Chart.tsx` component uses Victory library to render identical charts on both native and web platforms.

### Responsive Design
- **Mobile**: Single column layout optimized for touch
- **Tablet**: Two-column grid layout
- **Desktop**: Multi-column grid with hover effects

### Offline-First Architecture
- **Firestore Offline**: Automatic offline persistence
- **TanStack Query**: Client-side caching with IndexedDB persistence
- **Service Workers**: App shell caching and background sync

### Data Management
- **Pagination**: All list queries are paginated for performance
- **Composite Indexes**: Optimized Firestore queries
- **Batch Operations**: Efficient bulk operations for CSV import

## Keyboard Shortcuts (Web)

- `N` - Add new task
- `Ctrl/Cmd + N` - Add new note
- `Ctrl/Cmd + T` - Add new transaction
- `Ctrl/Cmd + K` - Focus search
- `Esc` - Close modals

## Recurring Transactions

### Web Implementation
Recurring transactions are processed client-side using a scheduler that runs:
- On app load
- Daily at midnight
- When manually triggered

### Production (Cloud Functions)
For production, implement Cloud Functions for server-side processing:

```javascript
// functions/src/recurringTransactions.js
exports.processRecurringTransactions = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight
  .onRun(async (context) => {
    // Process recurring transactions
    // Use templateId + periodKey for idempotency
  });
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or reproducible problems, create an issue in this repository.
