# 🚀 QUICK START GUIDE - All Fixes Applied

## ⚡ 5 Steps to Get AAZAN AI Running

---

## STEP 1: Create Next.js Project
```bash
npx create-next-app@latest aazan-ai \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --no-src-dir \
  --import-alias '@/*'

cd aazan-ai
```

---

## STEP 2: Install Dependencies (CORRECT LIST)
```bash
npm install \
  next-auth@5 \
  @auth/prisma-adapter \
  @prisma/client \
  prisma \
  axios \
  zod \
  lucide-react \
  clsx \
  tailwind-merge \
  class-variance-authority \
  next-themes \
  framer-motion \
  openai \
  anthropic \
  stripe \
  jsonwebtoken \
  bcryptjs \
  dotenv \
  pino \
  pino-pretty

# DO NOT install these:
# - react-markdown ❌
# - remark-gfm ❌
# - react-syntax-highlighter ❌
```

---

## STEP 3: Copy Files (Organized List)

### Create Folders
```bash
mkdir -p lib services hooks components prisma styles app/api/chats app/api/agents app/chat/\[id\] app/agents
```

### Copy in This Order:

#### A. Root Config Files
```bash
# Copy from outputs:
cp package.json .
cp tsconfig.json .
cp tailwind.config.ts .
cp next.config.js .
cp .env.example .env.local
cp Dockerfile .
cp docker-compose.yml .
```

#### B. Auth Files (Create Manually)
Create `auth.ts` and `auth.config.ts` at root (see templates in outputs)

#### C. Prisma Setup
```bash
# Create prisma/schema.prisma (from outputs)
mkdir -p prisma
cp prisma/schema.prisma prisma/
```

#### D. Library Files (FIXED VERSIONS!)
```bash
# CRITICAL: Use FIXED versions!
cp FIX-lib-utils.ts lib/utils.ts
cp FIX-lib-agent-templates.ts lib/agent-templates.ts

# Other lib files
cp lib/api-response.ts lib/
cp lib/prisma.ts lib/
```

#### E. Services
```bash
cp services/chat-service.ts services/
cp services/streaming-service.ts services/
cp services/agent-service.ts services/
```

#### F. Components (FIXED VERSION!)
```bash
# CRITICAL: Use FIXED message component!
cp FIX-components-message.tsx components/message.tsx

# Other components
cp components/chat-input-v2.tsx components/
cp components/chat-interface-v2.tsx components/
cp components/chat-input.tsx components/
cp components/chat-interface.tsx components/
cp components/sidebar.tsx components/
cp components/agent-selector.tsx components/
cp components/agent-badge.tsx components/
cp components/theme-provider.tsx components/
```

#### G. Hooks
```bash
cp hooks/useChat.ts hooks/
cp hooks/useChat-v2.ts hooks/
```

#### H. Pages
```bash
cp app/layout.tsx app/
cp app/chat/layout.tsx app/chat/
cp app/chat/page.tsx app/chat/
cp app/chat/\[id\]/page.tsx app/chat/\[id\]/
cp app/agents/page.tsx app/agents/
```

#### I. API Routes
```bash
# Chats API
cp app/api/chats/route.ts app/api/chats/
cp app/api/chats/\[id\]/route.ts app/api/chats/\[id\]/
cp app/api/chats/\[id\]/messages/route.ts app/api/chats/\[id\]/messages/
cp app/api/chats/\[id\]/messages/stream/route.ts app/api/chats/\[id\]/messages/stream/
cp app/api/chats/\[id\]/messages/agent/route.ts app/api/chats/\[id\]/messages/agent/

# Agents API
cp app/api/agents/route.ts app/api/agents/
cp app/api/agents/\[id\]/route.ts app/api/agents/\[id\]/
```

#### J. Styles
```bash
cp styles/globals.css styles/
```

---

## STEP 4: Setup Environment

### Edit `.env.local`
```env
# Database
DATABASE_URL=postgresql://aazan:aazan-dev-password@localhost:5432/aazan_ai_dev
SHADOW_DATABASE_URL=postgresql://aazan:aazan-dev-password@localhost:5432/aazan_ai_dev_shadow

# Redis
REDIS_URL=redis://localhost:6379

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-must-be-32-chars-long!

# GitHub OAuth (get from github.com/settings/developers)
GITHUB_ID=your_github_id_here
GITHUB_SECRET=your_github_secret_here

# Google OAuth (get from google cloud console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI APIs (REQUIRED)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GOOGLE_AI_API_KEY=your-google-ai-key

# Stripe (optional for now)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

---

## STEP 5: Initialize & Run

### Start Database
```bash
docker-compose up -d
```

### Initialize Prisma
```bash
npx prisma db push
npx prisma generate
```

### Run Development Server
```bash
npm run dev
```

### Visit the App
```
http://localhost:3000
```

---

## ✅ VERIFICATION CHECKLIST

After running, verify:

- [ ] App loads at `http://localhost:3000`
- [ ] No console errors
- [ ] Can go to `/chat`
- [ ] Can create new chat
- [ ] Can select models
- [ ] Can go to `/agents`
- [ ] No import errors
- [ ] Streaming works
- [ ] Messages save

---

## 🐛 TROUBLESHOOTING

### Problem: "Cannot find module react-markdown"
**Solution:**
```bash
# This was already removed during install
# Just verify message.tsx uses FIX version
ls -la components/message.tsx
```

### Problem: Database connection fails
**Solution:**
```bash
# Check Docker is running
docker ps
# Or restart containers
docker-compose down
docker-compose up -d
```

### Problem: "NEXTAUTH_SECRET is not set"
**Solution:**
Add to `.env.local`:
```env
NEXTAUTH_SECRET=your-secret-key-min-32-chars-long-use-openssl-rand
```

### Problem: Build errors
**Solution:**
```bash
rm -rf .next
npm run build
```

---

## 🎯 KEY POINTS

✅ **Use FIXED versions of:**
- `components/message.tsx` (FIX version)
- `lib/utils.ts` (FIX version)
- `lib/agent-templates.ts` (FIX version)

✅ **Don't install:**
- react-markdown
- remark-gfm
- react-syntax-highlighter

✅ **Do install:**
- All dependencies from Step 2

✅ **Files are organized** in proper folder structure

---

## 🚀 You're Done!

AAZAN AI is now running with all errors fixed!

**Features Working:**
✅ Full-stack AI platform
✅ Real-time chat streaming
✅ 10 AI specialists
✅ Database persistence
✅ Authentication
✅ Dark mode
✅ Mobile responsive

---

**Next:** Customize specialists, add payment, deploy! 🎉
