# Supabase Nuxt 3 Initialization

This document provides a reproducible guide to create the necessary file structure for integrating Supabase with your Nuxt 3 project.

## Prerequisites

- Your project should use Nuxt 3, TypeScript, Vue 3, and Tailwind CSS.
- Install the `@supabase/supabase-js` package (already installed: v2.75.0).
- Ensure that `/supabase/config.toml` exists ✓
- Ensure that a file `/types/database/database.types.ts` exists and contains the correct type definitions for your database ✓

IMPORTANT: Check prerequisites before performing actions below. If they're not met, stop and ask a user for the fix.

## File Structure and Setup

### 1. Supabase Client Composable

Create the file `/composables/useSupabase.ts` with the following content:

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  return { supabase }
}
```

This composable initializes the Supabase client using the Nuxt runtime configuration and returns it for use in your components and pages.

### 2. Supabase Plugin (Optional)

If you want the Supabase client to be globally available, create the file `/plugins/supabase.client.ts` with the following content:

```ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database/database.types'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  const supabase = createClient<Database>(supabaseUrl, supabaseKey)

  return {
    provide: {
      supabase
    }
  }
})
```

This plugin makes the Supabase client available throughout your application via `$supabase` in templates and `useNuxtApp().$supabase` in script.

### 3. Runtime Configuration

Update your `/nuxt.config.ts` to include the Supabase configuration:

```ts
export default defineNuxtConfig({
  // ... existing config ...
  
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || '',
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || ''
    }
  }
})
```

This configuration makes your Supabase credentials available to the client-side application.

### 4. Environment Variables

Create a `.env` file in the root of your project with the following content:

```env
NUXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NUXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key_here
```

Replace `your_supabase_url_here` and `your_supabase_anon_key_here` with your actual Supabase credentials.

**Important:** Add `.env` to your `.gitignore` file to prevent committing sensitive credentials.

### 5. TypeScript Type Extensions (Optional)

If you used the plugin approach, create or update the file `/types/nuxt.d.ts` with the following content:

```ts
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database/database.types'

declare module '#app' {
  interface NuxtApp {
    $supabase: SupabaseClient<Database>
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: SupabaseClient<Database>
  }
}

export {}
```

This file augments the Nuxt types to include proper TypeScript support for the Supabase client throughout your application.

## Usage Examples

### Using the Composable (Recommended)

```vue
<script setup lang="ts">
const { supabase } = useSupabase()

const { data: flashcards } = await supabase
  .from('flashcards')
  .select('*')
</script>
```

### Using the Plugin

```vue
<script setup lang="ts">
const { $supabase } = useNuxtApp()

const { data: flashcards } = await $supabase
  .from('flashcards')
  .select('*')
</script>
```

## Notes

- The **composable approach** (`useSupabase`) is more flexible and recommended for most use cases.
- The **plugin approach** is useful if you need a single, globally shared instance across your entire application.
- Both approaches provide full TypeScript support with your database types.
- Environment variables in Nuxt 3 use the `NUXT_PUBLIC_` prefix for public (client-side) variables.

