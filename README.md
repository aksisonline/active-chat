# 🚀 Active Chat

**Where privacy meets conversation. Secure, Anonymous, Serverless messaging for your peace of mind.**

Active Chat is a super simple messaging platform that prioritizes your privacy above all else. Unlike traditional chat applications, we don't store your messages on any server - everything happens in real-time through secure broadcasts that disappear the moment you close your browser. It's simple, secure, and surprisingly fun.

## ✨ Key Features

### 🔒 **Zero-Storage Security**
- **No Message Storage**: Your conversations never touch a database - messages are broadcast live and vanish when you leave
- **Serverless Architecture**: Our realtime server only forwards messages between users, never saving them
- **Anonymous Messaging**: Chat without creating an account or revealing personal information
- **Private Room Access**: Rooms are protected by secret keys that you control
- **Instant Deletion**: Close your browser and your messages are gone forever

### 💬 **Real-time Communication**
- **Instant Message Delivery**: Messages appear immediately through secure realtime broadcasting via PartyKit
- **Live User Presence**: See who's currently online in your room
- **Interactive Messaging**: Experience the magic of truly live conversations
- **Mobile Responsive**: Secure chatting on any device, anywhere

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager
- Google OAuth credentials
- PartyKit account (for deploying realtime server)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aksisonline/active-chat.git
   cd active-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy the example environment file and update with your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your credentials:
   ```env
   # better-auth
   BETTER_AUTH_SECRET=your-secret-key-here   # openssl rand -hex 32
   BETTER_AUTH_URL=http://localhost:3000

   # Google OAuth
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret

   # PartyKit
   NEXT_PUBLIC_PARTYKIT_HOST=localhost:1999

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Start the PartyKit dev server** (in a separate terminal)
   ```bash
   npm run dev:party
   ```

5. **Start the Next.js development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Tech Stack

### Frontend
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives

### Backend & Services
- **[better-auth](https://www.better-auth.com/)** - Authentication (Google OAuth + anonymous sessions)
- **[PartyKit](https://www.partykit.io/)** - Realtime broadcasting (live message delivery, no storage)
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Edge deployment via OpenNext

### Development Tools
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[PostCSS](https://postcss.org/)** - CSS processing

## 📱 Usage

### Anonymous Chat
1. Visit the application
2. Choose "Join Anonymously"
3. Enter your display name and a room secret
4. Start chatting immediately

### Authenticated Chat
1. Click "Sign in with Google"
2. Authorize the application
3. Create or join rooms
4. Enjoy persistent identity across sessions

### Creating Private Rooms
- Enter any secret phrase to create a new room
- Share the secret with others to let them join
- Room secrets are case-sensitive

## 🎨 Gradient Avatars

Active Chat features a unique dynamic gradient avatar system that generates beautiful, deterministic profile pictures without storing any images. 

**Key Features:**
- 🎯 **Deterministic**: Same user ID always generates the same gradient
- 🚀 **Zero Storage**: No need to store avatar images  
- 🎨 **Beautiful**: Multiple gradient variants (linear, radial, diagonal)
- ⚡ **Fast**: SVG-based generation with minimal overhead

For detailed documentation, see [Gradient Avatars Guide](docs/GRADIENT_AVATARS.md).

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `BETTER_AUTH_SECRET` | Secret for better-auth session signing | Yes |
| `BETTER_AUTH_URL` | Base URL of your deployment | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `NEXT_PUBLIC_PARTYKIT_HOST` | PartyKit server host | Yes |
| `NEXT_PUBLIC_APP_URL` | Public app URL (used by auth client) | Yes |

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create an OAuth 2.0 Client ID
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI (and your production URL)
4. Copy the Client ID and Secret into your `.env.local`

### PartyKit Setup
1. Sign up at [partykit.io](https://www.partykit.io/)
2. Run `npm run dev:party` locally to test realtime features
3. Deploy the realtime server: `npm run deploy:party`
4. Update `NEXT_PUBLIC_PARTYKIT_HOST` to your deployed PartyKit host

## 🚢 Deployment

### Deploy on Cloudflare Workers (Recommended)
1. Install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/): `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Create a KV namespace: `wrangler kv:namespace create NEXT_CACHE_WORKERS_KV`
4. Update `wrangler.toml` with your KV namespace ID
5. Build and deploy:
   ```bash
   npm run build:cloudflare
   npm run deploy:cloudflare
   ```
6. Set your environment variables via the Cloudflare dashboard or `wrangler secret put`

### Deploy PartyKit Realtime Server
```bash
npm run deploy:party
```
After deployment, update `NEXT_PUBLIC_PARTYKIT_HOST` to your PartyKit host URL (e.g. `active-chat.YOUR_USERNAME.partykit.dev`).

### Alternative Deployments
- **Vercel**: Compatible with standard Next.js deployment (use `npm run build` and `npm run start`)
- **Netlify**: Compatible with Next.js on Netlify adapter
- **Railway**: Full-stack deployment with Node.js runtime

## 📂 Project Structure

```
active-chat/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page with team info
│   ├── api/auth/          # better-auth API route handler
│   ├── auth/              # OAuth callback redirect
│   ├── chat/              # Chat room pages (PartyKit realtime)
│   ├── login/             # Login and anonymous access
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components (Radix + Tailwind)
│   ├── shortcuts.tsx      # Quick access shortcuts
│   └── ThemeSwitcher.tsx  # Dark/light mode toggle
├── docs/                  # Documentation
├── lib/                   # Utility functions and configurations
│   ├── auth.ts            # better-auth server configuration
│   ├── auth-client.ts     # better-auth React client
│   ├── avatar-generator.ts # Gradient avatar generation
│   └── utils.ts           # Common utilities
├── party/                 # PartyKit realtime server
│   └── index.ts          # Chat broadcast server
├── public/                # Static assets
├── open-next.config.ts    # OpenNext/Cloudflare configuration
├── partykit.json          # PartyKit deployment configuration
└── wrangler.toml          # Cloudflare Workers configuration
```

## 🎯 Core Components

### Chat System
- **Zero-storage messaging** with PartyKit realtime broadcasting
- **Room-based architecture** with secret-based access control
- **Live user presence** and interactive communication features  
- **Ephemeral conversations** - messages exist only while you're connected

### Authentication (better-auth)
- **Dual-mode system**: Anonymous (localStorage) and Google OAuth
- **Session management** with secure HTTP-only cookies
- **Seamless switching** between modes

### Avatar System
- **Deterministic generation** based on user identifiers
- **Multiple gradient variants** for visual variety
- **Fallback system** for missing profile pictures
- **High performance** SVG-based rendering

## 🔌 API Integration

### PartyKit Real-time Messaging
```typescript
// Client-side connection (partysocket)
import PartySocket from 'partysocket'

const socket = new PartySocket({
  host: process.env.NEXT_PUBLIC_PARTYKIT_HOST,
  room: roomSecret,
})

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'message') {
    setMessages(prev => [...prev, data.payload])
  }
})

// Send a message
socket.send(JSON.stringify({ type: 'message', payload: message }))
```

### Gradient Avatar Usage
```typescript
import { GradientAvatar } from '@/components/gradient-avatar'

<GradientAvatar
  identifier={user.id}
  displayName={user.name}
  size={64}
  variant="diagonal"
/>
```

## 🧪 Development

### Scripts
```bash
npm run dev            # Start Next.js development server
npm run dev:party      # Start PartyKit development server
npm run build          # Build Next.js for production (Vercel/Node)
npm run build:cloudflare  # Build for Cloudflare Workers
npm run deploy:cloudflare # Deploy to Cloudflare Workers
npm run deploy:party   # Deploy PartyKit server
npm run start          # Start production server (Node)
npm run lint           # Run ESLint
```

### Code Quality
- **TypeScript strict mode** for type safety
- **ESLint configuration** for code consistency
- **Component architecture** with separation of concerns
- **Responsive design** with mobile-first approach

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Areas for Contribution
- 🐛 Bug fixes and improvements
- ✨ New features and enhancements
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🔧 Performance optimizations
- 🧪 Testing infrastructure

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

### Core Contributors
- **[Karthikeya Somayajula](https://github.com/RetardRento)** - Frontend Architect
- **[S. Abhiram Kanna](https://github.com/aksisonline)** - Backend Innovator

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [better-auth](https://www.better-auth.com/) for modern, flexible authentication
- [PartyKit](https://www.partykit.io/) for real-time multiplayer infrastructure
- [Cloudflare Workers](https://workers.cloudflare.com/) for edge deployment
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- The open-source community for inspiration and tools

---

**Built with ❤️ by the Active Chat team**

*Ready to start chatting? [Get started now](https://active-chat.vercel.app) and experience secure, anonymous messaging! 🚀*

