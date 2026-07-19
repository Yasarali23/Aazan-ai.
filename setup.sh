#!/bin/bash

# 🚀 AAZAN AI - Auto Setup Script
# Ye script download ke baad chalaao

echo "🚀 AAZAN AI - Setting up project..."

# Create main directory
mkdir -p aazan-ai
cd aazan-ai

echo "📁 Creating folder structure..."

# Create all directories
mkdir -p app/api/chats/[id]/messages/stream
mkdir -p app/api/chats/[id]/messages/agent
mkdir -p app/api/agents/[id]
mkdir -p app/chat/[id]
mkdir -p app/agents
mkdir -p components
mkdir -p hooks
mkdir -p lib
mkdir -p services
mkdir -p prisma
mkdir -p styles
mkdir -p public
mkdir -p docs

echo "✅ Folders created!"

# Copy root files
echo "📋 Copying configuration files..."
# Note: These commands assume files are in current directory
# Replace with actual file locations

# App files
echo "📄 Copying app files..."
echo "Note: Copy files from outputs to correct locations"

# Create .env.example
cat > .env.example << 'EOF'
# Database
DATABASE_URL=postgresql://aazan:aazan-dev-password@localhost:5432/aazan_ai_dev
SHADOW_DATABASE_URL=postgresql://aazan:aazan-dev-password@localhost:5432/aazan_ai_dev_shadow

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long

# OAuth
GITHUB_ID=your_github_id
GITHUB_SECRET=your_github_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# AI APIs
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
EOF

echo "✅ .env.example created!"

# Create tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
EOF

echo "✅ tsconfig.json created!"

# Create next.config.js
cat > next.config.js << 'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
    ],
  },
};

module.exports = nextConfig;
EOF

echo "✅ next.config.js created!"

# Create tailwind.config.ts
cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
    },
  },
  plugins: [],
};

export default config;
EOF

echo "✅ tailwind.config.ts created!"

# Create package.json
cat > package.json << 'EOF'
{
  "name": "aazan-ai",
  "version": "3.0.0",
  "description": "The Intelligent AI Super Assistant for Everyone",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "next-auth": "^5.0.0",
    "@auth/prisma-adapter": "^1.0.0",
    "@prisma/client": "^5.7.0",
    "prisma": "^5.7.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0",
    "zustand": "^4.4.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "class-variance-authority": "^0.7.0",
    "next-themes": "^0.2.1",
    "framer-motion": "^10.16.0",
    "openai": "^4.26.0",
    "anthropic": "^0.20.0",
    "stripe": "^14.10.0",
    "jsonwebtoken": "^9.1.0",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "pino": "^8.17.0",
    "pino-pretty": "^10.3.0"
  }
}
EOF

echo "✅ package.json created!"

# Create README
cat > README.md << 'EOF'
# AAZAN AI - The Intelligent AI Super Assistant

## 🚀 Quick Start

1. Install dependencies:
```bash
npm install
```

2. Setup environment:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. Start database:
```bash
docker-compose up -d
```

4. Initialize database:
```bash
npx prisma db push
```

5. Run development server:
```bash
npm run dev
```

6. Open http://localhost:3000

## 📚 Documentation

- Read: `docs/QUICK_START_FIXED.md` - Start here!
- Read: `docs/COMPLETE_SETUP_GUIDE.md` - Full setup guide
- Read: `docs/ALL_3_PHASES_FIXED_FILES.md` - Critical files info

## ✨ Features

- ✅ Real-time AI Chat
- ✅ 10 AI Specialists
- ✅ Multiple AI Models
- ✅ Database Persistence
- ✅ User Authentication
- ✅ Dark Mode Support

## 📞 Need Help?

Check docs folder for guides and troubleshooting.
EOF

echo "✅ README.md created!"

echo ""
echo "════════════════════════════════════════"
echo "✅ SETUP COMPLETE!"
echo "════════════════════════════════════════"
echo ""
echo "📋 Next steps:"
echo "1. Copy all files from outputs to corresponding folders"
echo "2. Create .env.local with your API keys"
echo "3. Run: npm install"
echo "4. Run: docker-compose up -d"
echo "5. Run: npx prisma db push"
echo "6. Run: npm run dev"
echo ""
echo "📚 Start by reading: docs/QUICK_START_FIXED.md"
echo ""
