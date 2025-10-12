# POST /api/generations - API Documentation

## Overview

The `POST /api/generations` endpoint initiates an AI-powered flashcard generation process from user-provided source text. It validates the input, calls the AI service, stores generation metadata in the database, and returns flashcard proposals for user review.

## Endpoint Details

- **URL**: `/api/generations`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Authentication**: Required (Development: uses DEFAULT_USER_ID)

## Request

### Request Body

```json
{
  "source_text": "Your educational text here (1000-10000 characters)..."
}
```

### Request Parameters

| Parameter | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|-------------|
| source_text | string | Yes | 1000-10000 characters | Educational text to generate flashcards from |

### Validation Rules

- `source_text` must be present
- `source_text` must be a string
- `source_text` length must be between 1000 and 10000 characters (inclusive)

## Response

### Success Response (201 Created)

```json
{
  "generation_id": 123,
  "flashcards_proposals": [
    {
      "front": "What is photosynthesis?",
      "back": "The process by which plants convert light energy into chemical energy",
      "source": "ai-full"
    },
    {
      "front": "Where does photosynthesis occur?",
      "back": "In the chloroplasts of plant cells",
      "source": "ai-full"
    }
  ],
  "generated_count": 2
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| generation_id | number | Unique identifier for this generation record |
| flashcards_proposals | array | Array of AI-generated flashcard proposals |
| flashcards_proposals[].front | string | Front side of the flashcard (question) |
| flashcards_proposals[].back | string | Back side of the flashcard (answer) |
| flashcards_proposals[].source | string | Always "ai-full" for proposals |
| generated_count | number | Total number of flashcards generated |

## Error Responses

### 400 Bad Request - Missing Field

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid input",
  "data": {
    "error": "Invalid input",
    "details": "source_text field is required"
  }
}
```

### 400 Bad Request - Invalid Type

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid input",
  "data": {
    "error": "Invalid input",
    "details": "source_text must be a string"
  }
}
```

### 400 Bad Request - Length Validation

```json
{
  "statusCode": 400,
  "statusMessage": "Invalid input",
  "data": {
    "error": "Invalid input",
    "details": "source_text must be between 1000 and 10000 characters. Received: 500 characters"
  }
}
```

### 500 Internal Server Error - AI Service Failure

```json
{
  "statusCode": 500,
  "statusMessage": "Failed to generate flashcards. Please try again later.",
  "data": {
    "error": "Failed to generate flashcards. Please try again later.",
    "details": "AI service encountered an error"
  }
}
```

**Note**: Detailed AI error information is logged to the `generation_error_logs` table but not exposed to the user for security reasons.

### 500 Internal Server Error - Database Failure

```json
{
  "statusCode": 500,
  "statusMessage": "Database error. Please try again.",
  "data": {
    "error": "Database error. Please try again.",
    "details": "Failed to create generation: [error details]"
  }
}
```

## Data Flow

1. **Authentication**: User ID is retrieved (development mode uses DEFAULT_USER_ID)
2. **Validation**: Request body is validated for required fields and constraints
3. **Preprocessing**: 
   - Compute MD5 hash of source text
   - Calculate source text length
   - Start timer for duration measurement
4. **AI Generation**: Call AI service to generate flashcard proposals
5. **Error Logging**: If AI fails, log error to `generation_error_logs` table
6. **Database Storage**: Save generation metadata to `generations` table
7. **Response**: Return generation ID and flashcard proposals

## Database Records

### generations table

The endpoint creates a record in the `generations` table with the following data:

```typescript
{
  user_id: string           // User who initiated the generation
  model: string             // AI model used (e.g., "openai/gpt-4o-mini")
  source_text_hash: string  // MD5 hash of source text
  source_text_length: number // Character count of source text
  generated_count: number   // Number of flashcards generated
  generation_duration: number // Time taken in milliseconds
}
```

### generation_error_logs table

If AI generation fails, an error record is created:

```typescript
{
  user_id: string
  model: string
  source_text_hash: string
  source_text_length: number
  error_code: string        // e.g., "AI_GENERATION_FAILED"
  error_message: string     // Detailed error message
}
```

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/api/generations \
  -H "Content-Type: application/json" \
  -d '{
    "source_text": "Photosynthesis is the process by which green plants and some other organisms use sunlight to synthesize foods with the help of chlorophyll. Plants absorb water through their roots and carbon dioxide through their leaves. The chlorophyll in the leaves captures light energy from the sun. This energy is used to convert water and carbon dioxide into glucose (a type of sugar) and oxygen. The glucose is used by the plant for energy and growth, while the oxygen is released into the atmosphere. This process is crucial for life on Earth as it provides oxygen for animals to breathe and serves as the base of the food chain. Photosynthesis occurs primarily in the leaves of plants, specifically in structures called chloroplasts. These chloroplasts contain the green pigment chlorophyll, which gives plants their green color. The process can be divided into two main stages: the light-dependent reactions and the light-independent reactions (Calvin cycle). During the light-dependent reactions, light energy is converted into chemical energy in the form of ATP and NADPH. These energy carriers are then used in the Calvin cycle to fix carbon dioxide into organic molecules."
  }'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:3000/api/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    source_text: 'Your educational text here (1000-10000 characters)...'
  })
})

const data = await response.json()
console.log('Generation ID:', data.generation_id)
console.log('Flashcard proposals:', data.flashcards_proposals)
```

## Performance Considerations

- **AI Service Latency**: Typical response time is 2-10 seconds depending on text length and AI service load
- **Timeout**: AI service calls have a 60-second timeout
- **Mock Mode**: In development, the endpoint uses mock AI responses with ~1 second delay

## Security Notes

1. **Error Message Sanitization**: Detailed error messages are logged but not exposed to users
2. **Hash Storage**: MD5 hash of source text is stored for audit purposes (not for security)
3. **User Isolation**: All records are associated with user_id (RLS policies enforce data isolation)
4. **Development Mode**: Currently uses DEFAULT_USER_ID; production will require valid Supabase Auth token

## Future Enhancements

- Full Supabase Auth integration for production
- Asynchronous processing for better scalability
- Rate limiting per user
- Caching based on source_text_hash to avoid duplicate generations
- Retry logic with exponential backoff for AI service failures

