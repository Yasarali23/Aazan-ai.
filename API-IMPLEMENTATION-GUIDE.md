# 🔥 COMPLETE API SETUP GUIDE

## ✅ ALL APIs Ready for Implementation

Total: **50+ API Endpoints**

---

## 📋 API CATEGORIES

1. **Auth** (5 endpoints)
2. **Users** (5 endpoints)
3. **Chats** (8 endpoints)
4. **Agents** (7 endpoints)
5. **Images** (5 endpoints)
6. **Documents/PDF** (7 endpoints)
7. **Voice** (6 endpoints)
8. **OCR** (6 endpoints)
9. **Search** (3 endpoints)
10. **Workspace** (7 endpoints)
11. **Memory** (4 endpoints)
12. **Analytics** (4 endpoints)
13. **Billing** (5 endpoints)
14. **Admin** (4 endpoints)
15. **Health** (2 endpoints)
16. **Webhooks** (4 endpoints)

---

## 🚀 IMPLEMENTATION GUIDE

### Step 1: Database Updates

Add to `prisma/schema.prisma`:

```prisma
// Memory model
model Memory {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  content String  @db.Text
  type    String  // "note", "preference", "context"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

// Workspace model
model Workspace {
  id          String  @id @default(cuid())
  name        String
  description String?
  workspaceUsers WorkspaceUser[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model WorkspaceUser {
  id          String  @id @default(cuid())
  userId      String
  user        User    @relation("WorkspaceUser", fields: [userId], references: [id], onDelete: Cascade)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  role        String  // "admin", "editor", "viewer"
  
  @@unique([userId, workspaceId])
}

// Webhook model
model Webhook {
  id      String  @id @default(cuid())
  userId  String
  user    User    @relation("Webhook", fields: [userId], references: [id], onDelete: Cascade)
  url     String
  events  Json
  secret  String
  active  Boolean @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([userId])
}

// Add to User model:
// memories    Memory[]
// workspaces  WorkspaceUser[] @relation("WorkspaceUser")
// webhooks    Webhook[] @relation("Webhook")
```

Push database:
```bash
npx prisma db push
```

---

### Step 2: Create API Route Files

Create these folders and files:

```bash
# User APIs
mkdir -p app/api/users/{profile,settings,credits}
touch app/api/users/profile/route.ts
touch app/api/users/settings/route.ts
touch app/api/users/credits/route.ts

# Search APIs
mkdir -p app/api/search
touch app/api/search/route.ts

# Document APIs
mkdir -p app/api/documents/{folders,[id]/{move,star}}
touch app/api/documents/folders/route.ts
touch app/api/documents/[id]/move/route.ts
touch app/api/documents/[id]/star/route.ts

# Memory APIs
mkdir -p app/api/memory/{[id],clear}
touch app/api/memory/route.ts
touch app/api/memory/[id]/route.ts
touch app/api/memory/clear/route.ts

# Analytics APIs
mkdir -p app/api/analytics/{usage,agents,models,credits}
touch app/api/analytics/usage/route.ts
touch app/api/analytics/agents/route.ts
touch app/api/analytics/credits/route.ts

# Workspace APIs
mkdir -p app/api/workspaces/{[id]/{members},favorites}
touch app/api/workspaces/route.ts
touch app/api/workspaces/[id]/route.ts
touch app/api/workspaces/[id]/members/route.ts

# Billing APIs
mkdir -p app/api/billing/{plans,subscription,invoices,cancel}
touch app/api/billing/plans/route.ts
touch app/api/billing/subscription/route.ts
touch app/api/billing/invoices/route.ts

# Admin APIs
mkdir -p app/api/admin/{users,analytics,logs}
touch app/api/admin/users/route.ts
touch app/api/admin/analytics/route.ts
touch app/api/admin/logs/route.ts

# Health APIs
mkdir -p app/api/health
touch app/api/health/route.ts
touch app/api/status/route.ts

# Webhook APIs
mkdir -p app/api/webhooks/{register,[id]/{test,delete}}
touch app/api/webhooks/route.ts
touch app/api/webhooks/register/route.ts

# Enhanced Chat APIs
mkdir -p app/api/chats/{[id]/{archive,pin,export,messages}}/route.ts
touch app/api/chats/[id]/archive/route.ts
touch app/api/chats/[id]/pin/route.ts
touch app/api/chats/[id]/export/route.ts
touch app/api/chats/[id]/messages/[messageId]/regenerate/route.ts

# Agent APIs
mkdir -p app/api/agents/{[id]/{favorite},favorites}
touch app/api/agents/[id]/favorite/route.ts
touch app/api/agents/favorites/route.ts

# Document Share APIs
mkdir -p app/api/documents/pdf/[id]/share
touch app/api/documents/pdf/[id]/share/route.ts
```

---

### Step 3: Copy API Implementation

Copy from `COMPLETE-API-ROUTES.ts` into respective files.

Each route file needs:
```typescript
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.id) return Response.json({ error: "Unauthorized" }, { status: 401 });
  
  // ... implementation
  return Response.json({ ... });
}
```

---

### Step 4: Test Each API

Test categories:

#### Auth Tests
```bash
curl -X GET http://localhost:3000/api/auth/session

curl -X POST http://localhost:3000/api/users/profile \
  -H "Content-Type: application/json" \
  -d '{"name":"John"}'
```

#### Chat Tests
```bash
curl -X GET http://localhost:3000/api/chats

curl -X POST http://localhost:3000/api/chats \
  -H "Content-Type: application/json" \
  -d '{"title":"New Chat","model":"claude"}'
```

#### Search Tests
```bash
curl "http://localhost:3000/api/search?q=test&type=chats"
```

#### Analytics Tests
```bash
curl "http://localhost:3000/api/analytics/usage?period=month"
```

---

## 📊 API CHECKLIST

### Auth APIs (5)
- [ ] `/api/auth/register` - POST
- [ ] `/api/auth/login` - POST
- [ ] `/api/auth/logout` - POST
- [ ] `/api/auth/session` - GET
- [ ] `/api/auth/forgot-password` - POST

### User APIs (5)
- [ ] `/api/users/profile` - GET, PATCH
- [ ] `/api/users/settings` - GET, PATCH
- [ ] `/api/users/credits` - GET
- [ ] `/api/users/account` - DELETE
- [ ] `/api/users/[id]/delete` - DELETE (admin)

### Chat APIs (8)
- [ ] `/api/chats` - GET, POST
- [ ] `/api/chats/[id]` - GET, PATCH, DELETE
- [ ] `/api/chats/[id]/archive` - POST
- [ ] `/api/chats/[id]/pin` - POST
- [ ] `/api/chats/[id]/export` - POST
- [ ] `/api/chats/[id]/messages` - GET, POST
- [ ] `/api/chats/[id]/messages/stream` - POST (SSE)
- [ ] `/api/chats/[id]/messages/[messageId]/regenerate` - POST

### Agent APIs (7)
- [ ] `/api/agents` - GET, POST
- [ ] `/api/agents/[id]` - GET, PATCH, DELETE
- [ ] `/api/agents/[id]/favorite` - POST, DELETE
- [ ] `/api/agents/favorites` - GET
- [ ] `/api/agents/categories` - GET
- [ ] `/api/agents/custom` - POST (create custom)
- [ ] `/api/agents/search` - GET

### Image APIs (5)
- [ ] `/api/images` - GET, POST (generate)
- [ ] `/api/images/analyze` - POST
- [ ] `/api/images/[id]` - GET, DELETE
- [ ] `/api/images/[id]/download` - POST
- [ ] `/api/images/history` - GET

### Document APIs (7)
- [ ] `/api/documents/pdf` - GET, POST (upload)
- [ ] `/api/documents/pdf/[id]` - GET, DELETE
- [ ] `/api/documents/pdf/[id]/chat` - POST
- [ ] `/api/documents/pdf/[id]/summarize` - GET
- [ ] `/api/documents/pdf/[id]/extract` - POST
- [ ] `/api/documents/pdf/[id]/share` - POST
- [ ] `/api/documents/search` - GET

### Voice APIs (6)
- [ ] `/api/voice/transcribe` - POST
- [ ] `/api/voice/synthesize` - POST
- [ ] `/api/voice/command` - POST
- [ ] `/api/voice/voices` - GET
- [ ] `/api/voice` - GET (list)
- [ ] `/api/voice/[id]` - DELETE

### OCR APIs (6)
- [ ] `/api/ocr/extract` - POST
- [ ] `/api/ocr/digitize` - POST
- [ ] `/api/ocr/recognize` - POST
- [ ] `/api/ocr` - GET (list)
- [ ] `/api/ocr/[id]` - GET, DELETE
- [ ] `/api/ocr/[id]/extract-data` - POST

### Search APIs (3)
- [ ] `/api/search` - GET (global)
- [ ] `/api/search/chats` - GET
- [ ] `/api/search/documents` - GET

### Workspace APIs (7)
- [ ] `/api/workspaces` - GET, POST
- [ ] `/api/workspaces/[id]` - GET, PATCH, DELETE
- [ ] `/api/workspaces/[id]/members` - GET, POST
- [ ] `/api/workspaces/[id]/members/[userId]` - DELETE
- [ ] `/api/workspaces/[id]/chats` - GET (workspace chats)
- [ ] `/api/workspaces/[id]/invite` - POST
- [ ] `/api/workspaces/[id]/settings` - PATCH

### Memory APIs (4)
- [ ] `/api/memory` - GET, POST
- [ ] `/api/memory/[id]` - PATCH, DELETE
- [ ] `/api/memory/search` - GET
- [ ] `/api/memory/clear` - POST

### Analytics APIs (4)
- [ ] `/api/analytics/usage` - GET
- [ ] `/api/analytics/agents` - GET
- [ ] `/api/analytics/models` - GET
- [ ] `/api/analytics/credits` - GET

### Billing APIs (5)
- [ ] `/api/billing/plans` - GET
- [ ] `/api/billing/subscribe` - POST
- [ ] `/api/billing/subscription` - GET
- [ ] `/api/billing/cancel` - POST
- [ ] `/api/billing/invoices` - GET

### Admin APIs (4)
- [ ] `/api/admin/users` - GET
- [ ] `/api/admin/users/[id]` - GET, PATCH, DELETE
- [ ] `/api/admin/analytics` - GET
- [ ] `/api/admin/logs` - GET

### Health APIs (2)
- [ ] `/api/health` - GET
- [ ] `/api/status` - GET

### Webhook APIs (4)
- [ ] `/api/webhooks` - GET, POST
- [ ] `/api/webhooks/register` - POST
- [ ] `/api/webhooks/[id]` - DELETE
- [ ] `/api/webhooks/[id]/test` - POST

---

## 🔒 SECURITY NOTES

All APIs should:
- ✅ Check authentication via NextAuth
- ✅ Verify user ownership
- ✅ Rate limit endpoints
- ✅ Validate input with Zod
- ✅ Log sensitive actions
- ✅ Use HTTPS in production
- ✅ Return proper error codes
- ✅ Handle errors gracefully

---

## 📚 EXAMPLE IMPLEMENTATION

```typescript
// Template for all APIs

import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/api-response";
import { z } from "zod";

// Validation schema
const requestSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      throw new ApiError(401, "Unauthorized");
    }

    // Implementation
    const data = await prisma.someModel.findMany({
      where: { userId: session.user.id },
    });

    return Response.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return Response.json(
      { error: error instanceof ApiError ? error.message : "Internal error" },
      { status: error instanceof ApiError ? error.statusCode : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) throw new ApiError(401, "Unauthorized");

    const body = await req.json();
    const validated = requestSchema.parse(body);

    const data = await prisma.someModel.create({
      data: {
        userId: session.user.id,
        ...validated,
      },
    });

    return Response.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ errors: error.errors }, { status: 400 });
    }
    return Response.json(
      { error: error instanceof ApiError ? error.message : "Internal error" },
      { status: error instanceof ApiError ? error.statusCode : 500 }
    );
  }
}
```

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:
- [ ] All APIs tested locally
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] Rate limiting configured
- [ ] Error handling complete
- [ ] Logging implemented
- [ ] Security headers added
- [ ] CORS configured
- [ ] API documentation written
- [ ] Tests passing

---

## 📖 DOCUMENTATION

Auto-generate OpenAPI docs:

```bash
npm install swagger-jsdoc swagger-ui-express

# Add to app/api/docs/route.ts
```

---

**All 50+ APIs ready for implementation!** 🚀

Follow this guide step-by-step and you'll have a complete, production-ready API. ✨
