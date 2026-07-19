# Phase 2 Integration Guide

## 📋 Quick Setup (15 minutes)

### Step 1: Install Dependencies
```bash
npm install react-markdown remark-gfm react-syntax-highlighter @types/react-syntax-highlighter
```

### Step 2: Copy Files

Copy these 12 files from Phase 2 outputs to your project:

**Hooks:**
```
useChat.ts → hooks/useChat.ts
```

**Components:**
```
components-message.tsx → components/message.tsx
components-chat-input.tsx → components/chat-input.tsx
components-chat-interface.tsx → components/chat-interface.tsx
components-sidebar.tsx → components/sidebar.tsx
```

**Utilities:**
```
lib-utils.ts → lib/utils.ts
```

**Services:**
```
services-streaming-service.ts → services/streaming-service.ts
```

**Pages & API:**
```
app-chat-layout.tsx → app/chat/layout.tsx
app-chat-page.tsx → app/chat/page.tsx
app-chat-[id]-page.tsx → app/chat/[id]/page.tsx
api-chats-[id]-messages-stream.ts → app/api/chats/[id]/messages/stream/route.ts
```

### Step 3: Project Structure
```
your-project/
├── app/
│   ├── chat/
│   │   ├── layout.tsx          ← NEW
│   │   ├── page.tsx            ← NEW
│   │   └── [id]/
│   │       └── page.tsx        ← NEW
│   ├── api/
│   │   └── chats/
│   │       └── [id]/
│   │           ├── messages/
│   │           │   └── route.ts (existing)
│   │           │   └── stream/
│   │           │       └── route.ts    ← NEW
│   ├── layout.tsx              (update if needed)
│   └── page.tsx
├── components/
│   ├── message.tsx             ← NEW
│   ├── chat-input.tsx          ← NEW
│   ├── chat-interface.tsx      ← NEW
│   ├── sidebar.tsx             ← NEW
│   └── theme-provider.tsx
├── hooks/
│   └── useChat.ts              ← NEW
├── lib/
│   ├── utils.ts                ← NEW
│   ├── api-response.ts
│   └── prisma.ts
├── services/
│   ├── streaming-service.ts    ← NEW
│   └── chat-service.ts
└── ... (other files)
```

### Step 4: Update Imports
Check that imports match your project structure:

```typescript
// In components/chat-input.tsx
import { cn } from "@/lib/utils";

// In components/message.tsx
import { cn } from "@/lib/utils";

// In components/chat-interface.tsx
import { useChat } from "@/hooks/useChat";

// In app/chat/layout.tsx
import { Sidebar } from "@/components/sidebar";
```

### Step 5: Start Dev Server
```bash
npm run dev
```

### Step 6: Test
1. Open `http://localhost:3000/chat`
2. Click "Start New Chat"
3. Type a message
4. Select Claude Sonnet
5. Hit Enter
6. See streaming response!

---

## 🔍 Verification Checklist

- [ ] All 12 files copied
- [ ] Dependencies installed (`npm install`)
- [ ] File paths correct in your project
- [ ] Imports updated to match your paths
- [ ] Database running (`docker-compose up`)
- [ ] Environment variables set (`.env.local`)
- [ ] Dev server running (`npm run dev`)

---

## 🐛 Troubleshooting

### "Module not found: @/hooks/useChat"
**Solution:** Check that useChat.ts is in `hooks/` directory

### "Cannot find module 'react-markdown'"
**Solution:** Run `npm install react-markdown remark-gfm react-syntax-highlighter`

### Messages not loading
**Solution:** Check browser console for errors, verify database connection

### Streaming not working
**Solution:** 
1. Check API keys in `.env.local`
2. Verify ANTHROPIC_API_KEY and OPENAI_API_KEY are set
3. Check server logs for API errors

### Sidebar not showing
**Solution:** Clear browser cache, restart dev server

### TypeScript errors
**Solution:** Run `npm run type-check` to see all errors

---

## 🎯 What to Test

### Chat Creation
```
1. Click "Start New Chat"
2. Should redirect to /chat/[new-id]
3. Chat should appear in sidebar
```

### Message Sending
```
1. Type message in input
2. Click send or press Enter
3. Message should appear as "user"
4. AI response should stream
5. Message should be saved
```

### Model Selection
```
1. Click model selector
2. Choose different model
3. Send message
4. Should use selected model
```

### Chat Management
```
1. Delete chat - removes from sidebar
2. Pin chat - updates UI
3. Load previous chats - appears in list
```

---

## 🚀 Production Checklist

Before deploying:
- [ ] API keys configured
- [ ] Database migrated
- [ ] Auth working
- [ ] Streaming tested
- [ ] All models working
- [ ] Mobile responsive
- [ ] Dark mode tested
- [ ] Error handling verified
- [ ] Performance optimized

---

## 📞 Common Issues & Fixes

### Issue: Messages disappear on refresh
**Fix:** Ensure database is connected and migrations are applied
```bash
npx prisma db push
```

### Issue: Model selector not working
**Fix:** Check that MODELS array in components/chat-input.tsx matches available models

### Issue: Streaming timeout
**Fix:** Increase timeout in next.config.js or handle longer requests

### Issue: Sidebar cuts off on mobile
**Fix:** Sidebar has mobile toggle - check z-index conflicts

---

## 🎨 Customization

### Change Colors:
Edit `globals.css` CSS variables:
```css
--primary: 217 92% 51%;      /* Change this */
--secondary: 125 82% 51%;
--accent: 186 100% 50%;
```

### Change Models:
Edit `MODELS` array in `components/chat-input.tsx`:
```typescript
const MODELS = [
  { id: "your-model", name: "Your Model", provider: "Your Provider" },
  // ... more models
];
```

### Change UI Styling:
Use Tailwind classes - all components use `cn()` utility

---

## 📚 Further Reading

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React Markdown](https://github.com/remarkjs/react-markdown)
- [Anthropic API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)

---

## ✅ Success Criteria

If you can:
1. ✅ Create new chat
2. ✅ Send message to Claude
3. ✅ See streaming response
4. ✅ View in sidebar
5. ✅ Delete chat

**Then Phase 2 is working perfectly!**

---

**Next Phase:** Phase 3 - AI Specialists (Doctor, Lawyer, Crypto, etc.)

Questions? Check PHASE_2_SUMMARY.md for detailed information.
