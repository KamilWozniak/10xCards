<template>
  <Alert v-if="message" :variant="alertVariant" class="mb-4">
    <AlertDescription>
      {{ message }}
    </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Alert, AlertDescription } from '~/components/ui/alert'
import type { AuthErrorDisplayProps } from '~/types/auth/auth.types'

// Props
interface Props {
  message: string | null
  type?: 'error' | 'success' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
})

// Computed
const alertVariant = computed(() => {
  switch (props.type) {
    case 'success':
      return 'default' // shadcn-vue doesn't have success variant, use default with custom styling
    case 'info':
      return 'default'
    case 'error':
    default:
      return 'destructive'
  }
})
</script>
