# POST /api/flashcards - Create Flashcards

## Overview

The POST `/api/flashcards` endpoint allows authenticated users to create one or more flashcards. It supports both manual creation and creation from AI-generated content. The endpoint provides comprehensive validation, authorization checks, and returns the created flashcards with generated IDs.

## Endpoint Details

- **URL**: `/api/flashcards`
- **Method**: `POST`
- **Authentication**: Required (Bearer token)
- **Content-Type**: `application/json`

## Request Format

### Headers
```
Authorization: Bearer <your-token>
Content-Type: application/json
```

### Request Body
```json
{
  "flashcards": [
    {
      "front": "string (max 200 chars)",
      "back": "string (max 500 chars)",
      "source": "ai-full" | "ai-edited" | "manual",
      "generation_id": "number | null"
    }
  ]
}
```

### Field Specifications

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| `flashcards` | Array | Yes | 1-50 items | Array of flashcard objects to create |
| `front` | String | Yes | 1-200 chars, non-empty | The question or front side of the flashcard |
| `back` | String | Yes | 1-500 chars, non-empty | The answer or back side of the flashcard |
| `source` | Enum | Yes | `ai-full`, `ai-edited`, `manual` | Source type of the flashcard |
| `generation_id` | Number\|Null | Conditional | Positive integer or null | Required for AI sources, must be null for manual |

### Source Types

- **`manual`**: User-created flashcard, `generation_id` must be `null`
- **`ai-full`**: AI-generated flashcard (unedited), `generation_id` required
- **`ai-edited`**: AI-generated flashcard (user-edited), `generation_id` required

## Response Format

### Success Response (201 Created)
```json
{
  "flashcards": [
    {
      "id": 1,
      "front": "What is the capital of France?",
      "back": "Paris",
      "source": "manual",
      "generation_id": null,
      "user_id": "1b80fade-ccb5-43e8-ba09-c2e07bd3ddf9",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Error Responses

#### 400 Bad Request - Validation Errors
```json
{
  "error": "Invalid source value",
  "details": "Flashcard at index 0: source must be one of: ai-full, ai-edited, manual. Received: invalid"
}
```

#### 400 Bad Request - Field Length Exceeded
```json
{
  "error": "Field exceeds maximum length",
  "details": "Flashcard at index 0: front exceeds maximum length of 200 characters. Received: 250"
}
```

#### 400 Bad Request - Business Rule Violation
```json
{
  "error": "Invalid generation_id for source type",
  "details": "Generation IDs do not belong to user: 999"
}
```

#### 401 Unauthorized - Missing Authentication
```json
{
  "error": "Unauthorized",
  "details": "Authentication token is required"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "details": "Failed to create flashcards"
}
```

## Business Rules

1. **Authentication**: All requests must include a valid Bearer token
2. **Generation Ownership**: All `generation_id` values must belong to the authenticated user
3. **Source Validation**: 
   - `manual` flashcards cannot have a `generation_id`
   - `ai-full` and `ai-edited` flashcards must have a valid `generation_id`
4. **Batch Limits**: Maximum 50 flashcards per request
5. **Data Sanitization**: All text fields are trimmed of whitespace

## Examples

### Example 1: Create Manual Flashcards
```bash
curl -X POST "https://api.10xcards.com/api/flashcards" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is React?",
        "back": "A JavaScript library for building user interfaces",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "What is TypeScript?",
        "back": "A typed superset of JavaScript that compiles to plain JavaScript",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

### Example 2: Create AI-Generated Flashcards
```bash
curl -X POST "https://api.10xcards.com/api/flashcards" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is photosynthesis?",
        "back": "The process by which plants convert light energy into chemical energy",
        "source": "ai-full",
        "generation_id": 123
      },
      {
        "front": "What is the speed of light?",
        "back": "Approximately 299,792,458 meters per second in vacuum",
        "source": "ai-edited",
        "generation_id": 123
      }
    ]
  }'
```

### Example 3: Mixed Source Types
```bash
curl -X POST "https://api.10xcards.com/api/flashcards" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is the capital of Japan?",
        "back": "Tokyo",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "What is machine learning?",
        "back": "A subset of artificial intelligence that enables computers to learn without being explicitly programmed",
        "source": "ai-full",
        "generation_id": 456
      }
    ]
  }'
```

## Error Handling

The endpoint provides detailed error messages to help developers understand and fix issues:

- **Validation errors** include the specific field and index that failed validation
- **Business rule violations** clearly indicate which rules were violated
- **Authentication errors** specify whether the token is missing or invalid
- **Server errors** provide generic messages to avoid exposing internal details

## Rate Limiting

- Maximum 50 flashcards per request
- Rate limiting may be applied at the API gateway level
- Consider implementing client-side batching for large flashcard sets

## Security Considerations

- All user data is isolated using Row-Level Security (RLS)
- Generation ownership is validated before creating flashcards
- Input sanitization prevents injection attacks
- Authentication tokens are validated on every request

## Related Endpoints

- `POST /api/generations` - Create AI-generated flashcard proposals
- `GET /api/flashcards` - Retrieve user's flashcards
- `GET /api/generations` - Retrieve user's generations
