# 🚀 Active Chat

**Where privacy meets conversation. Secure, Anonymous, Serverless messaging for your peace of mind.**

Active Chat is a modern, privacy-focused real-time messaging application that allows users to create and join private chat rooms without compromising their personal information. Built with cutting-edge web technologies, it offers both anonymous and authenticated messaging experiences.

## ✨ Key Features

### 🔒 **Privacy First**
- **Anonymous Messaging**: Chat without creating an account
- **No Data Persistence**: Messages are not stored permanently
- **Private Room Secrets**: Access rooms only with the secret key
- **Optional Authentication**: Sign in with Google for persistent identity

### 💬 **Real-time Communication**
- **Instant Messaging**: Real-time message delivery using Supabase
- **Typing Indicators**: See when others are typing
- **User Presence**: Know who's currently online in the room
- **Mobile Responsive**: Optimized for all device sizes

### 🎨 **Modern UI/UX**
- **Dynamic Gradient Avatars**: Unique, colorful profile icons generated deterministically
- **Dark/Light Theme**: Seamless theme switching
- **Smooth Animations**: Built with Framer Motion for delightful interactions
- **Accessible Design**: WCAG compliant interface

### 🛠 **Developer Friendly**
- **TypeScript**: Fully typed for better development experience
- **Component Library**: Built with Radix UI and Tailwind CSS
- **Modern Architecture**: Next.js 15 with App Router
- **Performance Optimized**: Turbopack for fast development

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/aksisonline/active-chat.git
   cd active-chat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Copy the example environment file and update with your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open your browser**
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
- **[Supabase](https://supabase.com/)** - Backend-as-a-Service
  - Real-time subscriptions
  - Authentication (Google OAuth)
  - Database (PostgreSQL)
- **[Vercel](https://vercel.com/)** - Deployment platform

### Development Tools
- **[Turbopack](https://turbo.build/pack)** - Fast bundler for development
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[PostCSS](https://postcss.org/)** - CSS processing

## 📱 Usage

### Anonymous Chat
1. Visit the application
2. Choose "Chat as Guest"
3. Enter your display name
4. Create or join a room with a secret
5. Start chatting immediately

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

## 📸 Screenshots

### Welcome Screen
![Active Chat Welcome Screen](https://github.com/user-attachments/assets/9dc6a5d9-dadb-42ce-8093-b93698bf174b)
*Clean, modern interface with dark/light theme support*

### Key Features Demo
- **🔐 Anonymous Access**: Chat without creating an account
- **🎨 Dynamic Avatars**: Unique gradient avatars for every user
- **🌓 Theme Support**: Seamless dark/light mode switching
- **📱 Mobile Ready**: Responsive design for all devices

## 🔧 Configuration

### Environment Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |

### Supabase Setup
1. Create a new Supabase project
2. Enable Google OAuth in Authentication settings
3. Set up real-time subscriptions for chat functionality
4. Configure your domain in the OAuth settings

## 🚢 Deployment

### Deploy on Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/aksisonline/active-chat)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Alternative Deployments
- **Netlify**: Compatible with static export
- **Railway**: Full-stack deployment
- **DigitalOcean**: App Platform deployment
- **Self-hosted**: Any Node.js hosting provider

## 📂 Project Structure

```
active-chat/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page with team info
│   ├── auth/              # Authentication callbacks
│   ├── chat/              # Chat room pages
│   ├── login/             # Login and anonymous access
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
│   ├── ui/                # Base UI components (Radix + Tailwind)
│   ├── shortcuts.tsx      # Quick access shortcuts
│   └── ThemeSwitcher.tsx  # Dark/light mode toggle
├── docs/                  # Documentation
├── lib/                   # Utility functions and configurations
│   ├── avatar-generator.ts # Gradient avatar generation
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Common utilities
├── public/                # Static assets
└── styles/                # Global styles
```

## 🎯 Core Components

### Chat System
- **Real-time messaging** with Supabase subscriptions
- **Room-based architecture** with secret-based access
- **User presence tracking** and typing indicators
- **Message persistence** during session (not stored permanently)

### Authentication
- **Dual-mode system**: Anonymous and Google OAuth
- **Session management** with localStorage for anonymous users
- **Seamless switching** between modes

### Avatar System
- **Deterministic generation** based on user identifiers
- **Multiple gradient variants** for visual variety
- **Fallback system** for missing profile pictures
- **High performance** SVG-based rendering

## 🔌 API Integration

### Supabase Integration
```typescript
// Real-time message subscription
const channel = supabase
  .channel(`chat:${roomSecret}`)
  .on('broadcast', { event: 'message' }, (payload) => {
    setMessages(prev => [...prev, payload.message])
  })
  .subscribe()
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
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
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

### Development Guidelines
- Follow TypeScript best practices
- Write descriptive commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure responsive design compatibility

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
- **[Karthikeya Somayajula](https://github.com/aksisonline)** - Frontend Architect
- **[S. Abhiram Kanna](https://github.com/aksisonline)** - Backend Innovator

### Want to Join?
We're always looking for passionate developers to join our team! Check out our [About page](/about) for more information.

## 🔗 Links

- **[Live Demo](https://active-chat.vercel.app)** - Try the application
- **[Documentation](docs/)** - Detailed guides and API docs
- **[Issues](https://github.com/aksisonline/active-chat/issues)** - Report bugs or request features
- **[Discussions](https://github.com/aksisonline/active-chat/discussions)** - Community discussions

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for backend services
- [Vercel](https://vercel.com/) for seamless deployment
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- The open-source community for inspiration and tools

---

**Built with ❤️ by the Active Chat team**

*Ready to start chatting? [Get started now](https://active-chat.vercel.app) and experience secure, anonymous messaging! 🚀*
