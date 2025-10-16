# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**10xCards** is an AI-powered educational flashcard application built with Nuxt 3. The app helps users create flashcard sets efficiently by generating suggestions from text (1,000-10,000 characters) using LLM APIs, while also supporting manual flashcard creation. Key features include user authentication, spaced repetition learning sessions, and GDPR-compliant private data storage.

**Tech Stack:**
- Frontend: Nuxt 3, Vue 3 (Composition API with `<script setup>`), TypeScript, Tailwind CSS, shadcn-vue
- Backend: Nuxt server routes, Supabase (PostgreSQL + Auth)
- AI: OpenRouter API (currently mocked in development)
- Testing: Vitest with happy-dom
- State Management: Pinia

## Common Commands

### Development
```bash
pnpm dev          # Start dev server on http://localhost:3000
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm test         # Run all tests with Vitest
pnpm test --watch # Run tests in watch mode
```

### Testing
```bash
# Run specific test file
pnpm test path/to/file.spec.ts

# Run tests matching pattern
pnpm test -t "pattern"

# Run with coverage (if configured)
pnpm test --coverage
```

## Architecture & Key Patterns

### Service Layer Pattern
The app uses a service-oriented architecture with factory functions:

- **AI Service** (`services/ai/AIService.ts`): Handles OpenRouter API communication. Currently returns mock data during development. Factory: `createAIService()`
- **Database Services** (`services/database/`):
  - `FlashcardsService`: CRUD operations for flashcards
  - `GenerationsService`: Stores AI generation metadata
  - `GenerationErrorLoggerService`: Logs generation failures
  - All use factory pattern (`createFlashcardsService()`, etc.)

### API Route Structure
Server routes follow a command/response pattern:

1. **Validation** - Use validators in `server/utils/validators/`
2. **Authentication** - `getUserId()` from `server/utils/auth/get-user-id.ts` (uses default dev user ID)
3. **Service Layer** - Call appropriate service (AI or Database)
4. **Error Handling** - Custom errors: `ValidationError`, `AIServiceError`, `DatabaseError`
5. **Response** - Return DTOs defined in `types/dto/`

Example: `server/api/generations.post.ts` orchestrates the full AI generation flow.

### Type System Organization
- `types/database/database.types.ts`: Auto-generated Supabase types (do not edit manually)
- `types/dto/`: Data Transfer Objects for API requests/responses
- `types/commands/`: Command objects for service layer operations
- `types/views/`: View models for frontend components

### Component Architecture
- UI components: `components/ui/` (shadcn-vue components)
- Feature components: `components/generate/` (generation-specific components)
- Use Composition API with `<script setup>` exclusively
- Prefer `ref` over `reactive` for primitives

### State Management Strategy
- **Composables** for component-local state and logic reuse:
  - `useFlashcardProposals`: Manages proposal acceptance/rejection
  - `useGenerationState`: Manages generation flow state
  - `useFormValidation`: Client-side validation
  - `useSupabase`: Supabase client access
  - `useOpenRouter`: OpenRouter API interactions
- **Pinia stores**: For global state (currently minimal usage - `store/testStore.ts`)

### Database Schema
Key tables (see `supabase/migrations/` for full schema):
- `flashcards`: User flashcards (front, back, source, generation_id FK)
- `generations`: AI generation metadata (counts, duration, hash)
- `generation_error_logs`: Error tracking for failed generations

All tables use RLS (Row Level Security) policies to ensure users only access their own data.

## Development Workflow

### Environment Setup
Required `.env` variables:
```
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_key
```

### Code Style & Conventions
- **Commits**: Use conventional commits format `type(scope): description`
- **Branches**: `feature/short-description` pattern
- **TypeScript**: Strict mode enabled, all functions should have type annotations
- **Vue**: Always use Composition API with `<script setup>`, leverage auto-imports
- **Testing**: Follow Arrange-Act-Assert pattern, use `vi.fn()` for mocks

### Working with the Database
- Supabase migrations in `supabase/migrations/`
- After schema changes, regenerate types: `pnpm supabase gen types typescript --project-id <id> > types/database/database.types.ts`
- Use typed Supabase client from `useSupabase()` composable

### Adding New API Endpoints
1. Create route file in `server/api/` (e.g., `endpoint.post.ts`)
2. Define DTOs in `types/dto/`
3. Create command types in `types/commands/`
4. Add validator in `server/utils/validators/`
5. Use service layer pattern with factory functions
6. Handle errors with custom error classes
7. Document in `docs/api/` directory

### Testing Strategy
- **Unit tests**: Validators, utilities, services (`.spec.ts`)
- **Component tests**: Vue components (`.nuxt.spec.ts`)
- Use Vitest with Nuxt test utils
- Mock external services (Supabase, OpenRouter) in tests
- Place tests in `__tests__/` directories or co-locate with source

## Important Notes

- **Development Mode**: Currently uses a default test user ID for all requests (see `server/utils/auth/get-user-id.ts`)
- **AI Service**: Returns mock data until OpenRouter integration is fully implemented
- **RLS Policies**: Currently disabled for development (see migration `20251009120001_disable_rls_policies.sql`)
- **Auto-imports**: Nuxt auto-imports Vue composables, components, and Nuxt utilities - no need to import them explicitly

## Documentation

For detailed information, refer to:
- Product requirements: `docs/prd.md`
- Tech stack details: `docs/tech_stack.md`
- API documentation: `docs/api/`
- Code style rules: `.cursor/rules/` (shared, nuxt, backend, testing)
