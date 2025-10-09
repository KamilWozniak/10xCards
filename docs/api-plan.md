# REST API Plan - 10xCards

## 1. Resources

### Core Resources
- **flashcards** - Maps to `flashcards` table
- **generations** - Maps to `generations` table
- **generation-error-logs** - Maps to `generation_error_logs` table
- **users** - Maps to `users` table (managed by Supabase Auth)

## 2. Endpoints


### 2.2 Flashcard Endpoints

#### GET /api/flashcards
Retrieve all flashcards for the authenticated user.


**Query Parameters:**
- `page` (optional, default: 1) - Page number for pagination
- `limit` (optional, default: 50) - Items per page (max: 100)
- `source` (optional) - Filter by source: `ai-full`, `ai-edited`, `manual`
- `generation_id` (optional) - Filter by generation ID
- `sort` (optional, default: `created_at_desc`) - Sort options: `created_at_asc`, `created_at_desc`, `updated_at_asc`, `updated_at_desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "id": 1,
        "front": "What is TypeScript?",
        "back": "TypeScript is a strongly typed programming language that builds on JavaScript",
        "source": "ai-full",
        "generation_id": 5,
        "created_at": "2025-10-09T10:00:00Z",
        "updated_at": "2025-10-09T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 250,
      "items_per_page": 50
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Server error

---

#### GET /api/flashcards/:id
Retrieve a specific flashcard by ID.

**URL Parameters:**
- `id` - Flashcard ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "front": "What is TypeScript?",
    "back": "TypeScript is a strongly typed programming language that builds on JavaScript",
    "source": "ai-full",
    "generation_id": 5,
    "created_at": "2025-10-09T10:00:00Z",
    "updated_at": "2025-10-09T10:00:00Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Flashcard does not belong to user
- `404 Not Found` - Flashcard not found
- `500 Internal Server Error` - Server error

---

#### POST /api/flashcards
Create one or more flashcards manually or from AI generation.

**Request Body:**
```json
{
  "flashcards": [
    {
      "front": "What is Nuxt 3?",
      "back": "Nuxt 3 is a Vue.js framework for building web applications",
      "source": "manual",
      "generation_id": null
    },
    {
      "front": "What is TypeScript?",
      "back": "TypeScript is a strongly typed programming language that builds on JavaScript",
      "source": "ai-full",
      "generation_id": 15
    },
    {
      "front": "What is Composition API?",
      "back": "Composition API is a set of APIs for authoring Vue components",
      "source": "ai-edited",
      "generation_id": 15
    }
  ]
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "flashcards": [
      {
        "id": 42,
        "front": "What is Nuxt 3?",
        "back": "Nuxt 3 is a Vue.js framework for building web applications",
        "source": "manual",
        "generation_id": null,
        "created_at": "2025-10-09T10:00:00Z",
        "updated_at": "2025-10-09T10:00:00Z"
      },
      {
        "id": 43,
        "front": "What is TypeScript?",
        "back": "TypeScript is a strongly typed programming language that builds on JavaScript",
        "source": "ai-full",
        "generation_id": 15,
        "created_at": "2025-10-09T10:00:00Z",
        "updated_at": "2025-10-09T10:00:00Z"
      },
      {
        "id": 44,
        "front": "What is Composition API?",
        "back": "Composition API is a set of APIs for authoring Vue components",
        "source": "ai-edited",
        "generation_id": 15,
        "created_at": "2025-10-09T10:00:00Z",
        "updated_at": "2025-10-09T10:00:00Z"
      }
    ],
    "created_count": 3
  }
}
```

**Business Logic:**
- Accepts array of flashcards in `flashcards` field
- Each flashcard requires: `front`, `back`, `source` (required fields)
- Each flashcard has optional `generation_id` field
- `source` must be one of: `ai-full`, `ai-edited`, `manual`
- If `source` is `manual`, `generation_id` should be `null`
- If `source` is `ai-full` or `ai-edited` and `generation_id` is provided, it must reference an existing generation owned by the user
- All flashcards are created in a single database transaction
- Minimum 1 flashcard, maximum 50 flashcards per request

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid data (front > 200 chars, back > 500 chars, missing required fields, invalid source value, empty array, or more than 50 flashcards)
- `403 Forbidden` - Generation ID does not belong to user
- `404 Not Found` - Generation ID not found
- `500 Internal Server Error` - Server error

---

#### PUT /api/flashcards/:id
Update an existing flashcard.

**URL Parameters:**
- `id` - Flashcard ID

**Request Body:**
```json
{
  "front": "What is Nuxt 3?",
  "back": "Nuxt 3 is a modern Vue.js framework for building performant web applications"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "front": "What is Nuxt 3?",
    "back": "Nuxt 3 is a modern Vue.js framework for building performant web applications",
    "source": "ai-edited",
    "generation_id": 5,
    "created_at": "2025-10-09T10:00:00Z",
    "updated_at": "2025-10-09T11:30:00Z"
  }
}
```

**Business Logic:**
- If the flashcard `source` was `ai-full` and is being edited, update `source` to `ai-edited`
- If the flashcard `source` was `manual` or `ai-edited`, keep the original source
- Automatically update `updated_at` timestamp via database trigger
- front: maximum length: 200 characters
- back: maximum length: 500 characters
- source: must be one of `ai-edited` or `manual`


**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Flashcard does not belong to user
- `404 Not Found` - Flashcard not found
- `400 Bad Request` - Invalid data (front > 200 chars, back > 500 chars)
- `500 Internal Server Error` - Server error

---

#### DELETE /api/flashcards/:id
Delete a flashcard.


**URL Parameters:**
- `id` - Flashcard ID

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Flashcard deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Flashcard does not belong to user
- `404 Not Found` - Flashcard not found
- `500 Internal Server Error` - Server error

---

### 2.3 Generation Endpoints

#### POST /api/generations
Generate flashcard suggestions from text using AI.


**Request Body:**
```json
{
  "source_text": "TypeScript is a strongly typed programming language...",
}
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "generation_id": 15,
    "model": "openai/gpt-4",
    "generated_count": 8,
    "source_text_length": 5420,
    "generation_duration": 3200,
    "suggestions": [
      {
        "front": "What is TypeScript?",
        "back": "TypeScript is a strongly typed programming language that builds on JavaScript"
      },
      {
        "front": "What are the benefits of TypeScript?",
        "back": "TypeScript provides static typing, better IDE support, and catches errors at compile time"
      }
    ],
    "created_at": "2025-10-09T10:00:00Z"
  }
}
```

**Business Logic:**
1. Validate source text length (1000-10000 characters)
2. Send text to LLM via OpenRouter API
3. Measure generation duration
4. Parse LLM response into flashcard suggestions
5. Create generation record with initial stats
6. Return suggestions for user review (not yet saved as flashcards)

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid text length (must be 1000-10000 chars) or missing model
- `422 Unprocessable Entity` - LLM API error or unable to parse response
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

**Error Logging:**
- On LLM API errors, create record in `generation_error_logs` table

---

#### GET /api/generations
Retrieve generation history for authenticated user.


**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page (max: 50)
- `sort` (optional, default: `created_at_desc`) - Sort options: `created_at_asc`, `created_at_desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "generations": [
      {
        "id": 15,
        "model": "openai/gpt-4",
        "generated_count": 8,
        "accepted_unedited_count": 3,
        "accepted_edited_count": 2,
        "source_text_hash": "sha256-hash",
        "source_text_length": 5420,
        "generation_duration": 3200,
        "created_at": "2025-10-09T10:00:00Z",
        "updated_at": "2025-10-09T10:05:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45,
      "items_per_page": 20
    }
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Server error

---

#### GET /api/generation-error-logs
Retrieve error logs from failed AI generation attempts for authenticated user.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 20) - Items per page (max: 50)
- `sort` (optional, default: `created_at_desc`) - Sort options: `created_at_asc`, `created_at_desc`

**Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "error_logs": [
      {
        "id": 3,
        "model": "openai/gpt-4",
        "source_text_hash": "sha256-abc123...",
        "source_text_length": 5420,
        "error_code": "RATE_LIMIT_EXCEEDED",
        "error_message": "Rate limit exceeded for API requests",
        "created_at": "2025-10-09T09:30:00Z"
      },
      {
        "id": 2,
        "model": "openai/gpt-4",
        "source_text_hash": "sha256-def456...",
        "source_text_length": 3200,
        "error_code": "INVALID_RESPONSE",
        "error_message": "Unable to parse LLM response into valid flashcard format",
        "created_at": "2025-10-09T08:15:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 2,
      "items_per_page": 20
    }
  }
}
```

**Business Logic:**
- Returns only error logs belonging to authenticated user
- Error logs are created automatically when AI generation fails
- Useful for debugging and monitoring generation issues
- Does not include actual source text for privacy/storage reasons (only hash and length)

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Invalid query parameters
- `500 Internal Server Error` - Server error

---

## 3. Authentication and Authorization

### Authentication Mechanism
The API uses **JWT (JSON Web Token) based authentication** provided by Supabase Auth.

### Implementation Details

#### Registration & Login Flow
1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Supabase Auth validates credentials and creates user in `auth.users` table


---

## 4. Validation and Business Logic

### 4.1 Validation Rules by Resource

#### Flashcards
| Field | Validation |
|-------|------------|
| `front` | Required, string, max 200 characters |
| `back` | Required, string, max 500 characters |
| `source` | Required on creation, must be one of: `ai-full`, `ai-edited`, `manual` |
| `generation_id` | Optional, must reference existing generation owned by user |
| `user_id` | Required, automatically set from authenticated user |

#### Generations
| Field | Validation |
|-------|------------|
| `model` | Required, string, valid LLM model identifier |
| `source_text` | Required for creation, length between 1000-10000 characters |
| `source_text_length` | Required, integer, between 1000-10000 |
| `source_text_hash` | Required, SHA-256 hash of source text |
| `generated_count` | Required, integer, > 0 |
| `accepted_unedited_count` | Optional, integer, >= 0, <= generated_count |
| `accepted_edited_count` | Optional, integer, >= 0, <= generated_count |
| `generation_duration` | Required, integer (milliseconds), > 0 |
| `user_id` | Required, automatically set from authenticated user |

#### Generation Error Logs
| Field | Validation |
|-------|------------|
| `model` | Required, string |
| `source_text_hash` | Required, string |
| `source_text_length` | Required, integer, between 1000-10000 |
| `error_code` | Required, string, max 100 characters |
| `error_message` | Required, string |
| `user_id` | Required, automatically set from authenticated user |

### 4.2 Business Logic Implementation

#### Flashcard Source Tracking
**Requirement:** Track whether flashcards are AI-generated (unedited/edited) or manually created

**Implementation:**
1. **Manual Creation** (`POST /api/flashcards`):
   - Set `source = 'manual'`
   - Set `generation_id = null`

2. **AI Generation Acceptance** (`POST /api/generations/:id/accept`):
   - If flashcard not modified: `source = 'ai-full'`
   - If flashcard modified: `source = 'ai-edited'`
   - Set `generation_id` to reference generation

3. **Flashcard Editing** (`PUT /api/flashcards/:id`):
   - If current `source = 'ai-full'`: change to `source = 'ai-edited'`
   - If current `source = 'manual'` or `'ai-edited'`: keep existing source
   - Maintain `generation_id` reference

#### Generation Statistics Tracking
**Requirement:** Track AI generation effectiveness for product metrics

**Implementation:**
1. **On Generation** (`POST /api/generations`):
   - Record `generated_count` (number of suggestions from LLM)
   - Set `accepted_unedited_count = null`
   - Set `accepted_edited_count = null`

2. **On Acceptance** (`POST /api/generations/:id/accept`):
   - Count flashcards where `edited = false` → update `accepted_unedited_count`
   - Count flashcards where `edited = true` → update `accepted_edited_count`
   - Update `updated_at` timestamp

3. **Statistics Endpoint** (`GET /api/generations/statistics`):
   - Calculate aggregate metrics:
     - Acceptance rate (accepted / generated)
     - Edit rate (edited / accepted)
     - Average generation duration
     - Total error count

#### Error Logging
**Requirement:** Track LLM API failures for monitoring and debugging

**Implementation:**
1. On any LLM API error during generation:
   - Extract error code and message
   - Create record in `generation_error_logs`
   - Include same metadata as successful generation (model, text hash, length)
   - Return appropriate error response to client

2. Do not create `generations` record on error (only error log)

#### Text Hashing
**Requirement:** Detect duplicate generation requests

**Implementation:**
- Create SHA-256 hash of source text before generation
- Store hash in `generations` or `generation_error_logs`
- Future enhancement: Check for duplicate hashes to prevent redundant API calls


### 4.3 Rate Limiting and Security


### 4.4 Pagination Standards

All list endpoints follow consistent pagination:

**Query Parameters:**
- `page` - Page number (1-indexed)
- `limit` - Items per page (default varies by endpoint, max enforced)

**Response Format:**
```json
{
  "pagination": {
    "current_page": 1,
    "total_pages": 10,
    "total_items": 500,
    "items_per_page": 50
  }
}
```

### 4.5 Error Response Format

All errors follow consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Front text exceeds maximum length of 200 characters",
    "details": {
      "field": "front",
      "received_length": 250,
      "max_length": 200
    }
  }
}
```

**Common Error Codes:**
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - User not authorized for resource
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_ERROR` - Too many requests
- `LLM_API_ERROR` - External LLM API failure
- `SERVER_ERROR` - Internal server error

---

