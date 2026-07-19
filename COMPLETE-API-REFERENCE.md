// 🔥 COMPLETE API REFERENCE - ALL ENDPOINTS

// ============================================
// AUTHENTICATION APIs
// ============================================

// POST /api/auth/register
// Register new user
// Body: { email, password, name }
// Response: { user, token }

// POST /api/auth/login
// Login user
// Body: { email, password }
// Response: { user, token, session }

// POST /api/auth/logout
// Logout user
// Response: { success: true }

// GET /api/auth/session
// Get current session
// Response: { user, session }

// POST /api/auth/forgot-password
// Request password reset
// Body: { email }
// Response: { message: "Email sent" }

// POST /api/auth/reset-password
// Reset password with token
// Body: { token, password }
// Response: { success: true }

// ============================================
// USER APIs
// ============================================

// GET /api/users/profile
// Get current user profile
// Response: { id, email, name, avatar, credits, plan }

// PATCH /api/users/profile
// Update user profile
// Body: { name, avatar, bio }
// Response: { user }

// GET /api/users/settings
// Get user settings
// Response: { theme, language, notifications, privacy }

// PATCH /api/users/settings
// Update settings
// Body: { theme, language, notifications, privacy }
// Response: { settings }

// DELETE /api/users/account
// Delete user account
// Response: { success: true }

// GET /api/users/credits
// Get user credits
// Response: { credits, plan, usage }

// ============================================
// CHAT APIs
// ============================================

// GET /api/chats
// List all chats
// Query: ?limit=10&offset=0&sort=latest
// Response: { chats: [], total: 0 }

// POST /api/chats
// Create new chat
// Body: { title, model, agentId? }
// Response: { chat }

// GET /api/chats/[id]
// Get specific chat
// Response: { chat }

// PATCH /api/chats/[id]
// Update chat (title, archived)
// Body: { title, archived }
// Response: { chat }

// DELETE /api/chats/[id]
// Delete chat
// Response: { success: true }

// POST /api/chats/[id]/archive
// Archive chat
// Response: { chat }

// POST /api/chats/[id]/pin
// Pin/unpin chat
// Response: { chat }

// POST /api/chats/[id]/export
// Export chat as JSON/PDF
// Query: ?format=json|pdf
// Response: { file_url }

// GET /api/chats/[id]/messages
// Get chat messages
// Query: ?limit=50&offset=0
// Response: { messages: [], total: 0 }

// POST /api/chats/[id]/messages
// Send message
// Body: { content, role, model, agentId? }
// Response: { message }

// POST /api/chats/[id]/messages/stream
// Stream message (SSE)
// Body: { content, model, agentId? }
// Response: StreamEvent[]

// DELETE /api/chats/[id]/messages/[messageId]
// Delete message
// Response: { success: true }

// PATCH /api/chats/[id]/messages/[messageId]
// Edit message
// Body: { content }
// Response: { message }

// POST /api/chats/[id]/messages/[messageId]/regenerate
// Regenerate AI response
// Response: { message }

// ============================================
// AGENT / SPECIALIST APIs
// ============================================

// GET /api/agents
// List all agents
// Query: ?category=doctor|lawyer&limit=10
// Response: { agents: [] }

// POST /api/agents
// Create custom agent
// Body: { name, description, systemPrompt, icon, color }
// Response: { agent }

// GET /api/agents/[id]
// Get agent details
// Response: { agent }

// PATCH /api/agents/[id]
// Update agent
// Body: { name, description, systemPrompt, color }
// Response: { agent }

// DELETE /api/agents/[id]
// Delete custom agent
// Response: { success: true }

// POST /api/agents/[id]/favorite
// Add agent to favorites
// Response: { success: true }

// DELETE /api/agents/[id]/favorite
// Remove from favorites
// Response: { success: true }

// GET /api/agents/favorites
// Get favorite agents
// Response: { agents: [] }

// ============================================
// IMAGE GENERATION APIs
// ============================================

// POST /api/images
// Generate image with DALL-E
// Body: { prompt, size: "1024x1024", quantity: 1 }
// Response: { images: [], saved: 1 }

// POST /api/images/analyze
// Analyze image
// Body: { imageUrl, question? }
// Response: { analysis, confidence }

// GET /api/images
// Get user's generated images
// Query: ?limit=50&offset=0
// Response: { images: [], total: 0 }

// GET /api/images/[id]
// Get image details
// Response: { image }

// DELETE /api/images/[id]
// Delete image
// Response: { success: true }

// POST /api/images/[id]/download
// Download image
// Response: file blob

// ============================================
// DOCUMENT / PDF APIs
// ============================================

// POST /api/documents/pdf
// Upload PDF
// Form: { file: File }
// Response: { document }

// GET /api/documents/pdf
// List PDF documents
// Query: ?limit=50&offset=0
// Response: { documents: [], total: 0 }

// GET /api/documents/pdf/[id]
// Get PDF details
// Response: { document }

// POST /api/documents/pdf/[id]/chat
// Chat with PDF
// Body: { question }
// Response: { answer, documentName }

// GET /api/documents/pdf/[id]/summarize
// Summarize PDF
// Response: { summary, documentName, length }

// POST /api/documents/pdf/[id]/extract
// Extract text from PDF
// Response: { content, pages, size }

// DELETE /api/documents/pdf/[id]
// Delete PDF
// Response: { success: true }

// POST /api/documents/pdf/[id]/share
// Share PDF document
// Body: { email, permissions: "view|edit|comment" }
// Response: { link, shareId }

// ============================================
// VOICE APIs
// ============================================

// POST /api/voice/transcribe
// Convert speech to text
// Form: { file: Audio }
// Response: { transcript, duration, language }

// POST /api/voice/synthesize
// Convert text to speech
// Body: { text, voice: "nova"|"echo"|"alloy" }
// Response: { audioPath, fileName, voice }

// GET /api/voice/voices
// Get available voices
// Response: { voices: [] }

// POST /api/voice/command
// Process voice command
// Form: { file: Audio }
// Response: { transcript, command: { type, action } }

// GET /api/voice
// Get user's voice files
// Query: ?limit=50
// Response: { files: [] }

// DELETE /api/voice/[id]
// Delete voice file
// Response: { success: true }

// ============================================
// OCR APIs
// ============================================

// POST /api/ocr/extract
// Extract text from image
// Form: { file: Image }
// Response: { extractedText, confidence, language }

// POST /api/ocr/digitize
// Digitize multi-page document
// Body: { imagePaths: [], documentName }
// Response: { documentId, pageCount, text }

// POST /api/ocr/recognize
// Recognize text with analysis
// Body: { imageUrl }
// Response: { analysis: { text, layout, orientation, confidence } }

// GET /api/ocr
// Get user's OCR documents
// Query: ?limit=50
// Response: { documents: [] }

// GET /api/ocr/[id]
// Get OCR document
// Response: { document }

// POST /api/ocr/[id]/extract-data
// Extract structured data from OCR
// Response: { extractedData: {} }

// DELETE /api/ocr/[id]
// Delete OCR document
// Response: { success: true }

// ============================================
// DOCUMENT MANAGER APIs
// ============================================

// GET /api/documents
// List all documents (any type)
// Query: ?type=pdf|image|ocr|audio&limit=50
// Response: { documents: [], total: 0 }

// POST /api/documents/[id]/delete
// Delete any document
// Response: { success: true }

// POST /api/documents/[id]/move
// Move document to folder
// Body: { folderId }
// Response: { document }

// POST /api/documents/[id]/star
// Star/unstar document
// Response: { document }

// GET /api/documents/search
// Search documents
// Query: ?q=text&type=pdf
// Response: { results: [] }

// POST /api/documents/folders
// Create folder
// Body: { name }
// Response: { folder }

// GET /api/documents/folders
// Get folders
// Response: { folders: [] }

// DELETE /api/documents/folders/[id]
// Delete folder
// Response: { success: true }

// ============================================
// MEMORY / CONTEXT APIs
// ============================================

// GET /api/memory
// Get user memory
// Response: { memories: [] }

// POST /api/memory
// Add to memory
// Body: { content, type: "note|preference|context" }
// Response: { memory }

// PATCH /api/memory/[id]
// Update memory
// Body: { content }
// Response: { memory }

// DELETE /api/memory/[id]
// Delete memory
// Response: { success: true }

// POST /api/memory/clear
// Clear all memory
// Response: { success: true }

// ============================================
// WORKSPACE APIs
// ============================================

// POST /api/workspaces
// Create workspace
// Body: { name, description }
// Response: { workspace }

// GET /api/workspaces
// Get user workspaces
// Response: { workspaces: [] }

// GET /api/workspaces/[id]
// Get workspace details
// Response: { workspace }

// PATCH /api/workspaces/[id]
// Update workspace
// Body: { name, description }
// Response: { workspace }

// DELETE /api/workspaces/[id]
// Delete workspace
// Response: { success: true }

// POST /api/workspaces/[id]/members
// Add member to workspace
// Body: { email, role: "admin|editor|viewer" }
// Response: { member }

// DELETE /api/workspaces/[id]/members/[userId]
// Remove member
// Response: { success: true }

// ============================================
// SEARCH APIs
// ============================================

// GET /api/search
// Global search
// Query: ?q=query&type=chats|documents|agents
// Response: { results: [] }

// GET /api/search/chats
// Search chats
// Query: ?q=text
// Response: { chats: [] }

// GET /api/search/documents
// Search documents
// Query: ?q=text
// Response: { documents: [] }

// ============================================
// ANALYTICS APIs
// ============================================

// GET /api/analytics/usage
// Get usage stats
// Query: ?period=day|week|month
// Response: { messages, images, documents, voice }

// GET /api/analytics/agents
// Get agent usage stats
// Response: { agentStats: [] }

// GET /api/analytics/models
// Get model usage
// Response: { modelStats: [] }

// GET /api/analytics/credits
// Get credits usage
// Response: { used, remaining, plan }

// ============================================
// BILLING / STRIPE APIs
// ============================================

// GET /api/billing/plans
// Get available plans
// Response: { plans: [] }

// POST /api/billing/subscribe
// Subscribe to plan
// Body: { planId, paymentMethodId }
// Response: { subscription }

// GET /api/billing/subscription
// Get current subscription
// Response: { subscription }

// POST /api/billing/cancel
// Cancel subscription
// Response: { success: true }

// GET /api/billing/invoices
// Get invoices
// Response: { invoices: [] }

// ============================================
// ADMIN APIs
// ============================================

// GET /api/admin/users
// List all users (admin only)
// Query: ?limit=50&offset=0
// Response: { users: [], total: 0 }

// GET /api/admin/users/[id]
// Get user details
// Response: { user }

// PATCH /api/admin/users/[id]
// Update user
// Body: { plan, credits, status }
// Response: { user }

// DELETE /api/admin/users/[id]
// Delete user account
// Response: { success: true }

// GET /api/admin/analytics
// Get platform analytics
// Response: { users, messages, documents, revenue }

// GET /api/admin/logs
// Get activity logs
// Query: ?limit=100
// Response: { logs: [] }

// ============================================
// HEALTH / STATUS APIs
// ============================================

// GET /api/health
// Check API health
// Response: { status: "ok", uptime, db: "connected" }

// GET /api/status
// Get system status
// Response: { status: { api, db, redis, ai_service } }

// ============================================
// WEBHOOK APIs
// ============================================

// POST /api/webhooks/register
// Register webhook
// Body: { url, events: [], secret }
// Response: { webhook }

// GET /api/webhooks
// Get webhooks
// Response: { webhooks: [] }

// DELETE /api/webhooks/[id]
// Delete webhook
// Response: { success: true }

// POST /api/webhooks/test
// Test webhook
// Body: { webhookId }
// Response: { success: true }
