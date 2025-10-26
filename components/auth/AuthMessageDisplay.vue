<template>
  <Alert
    v-if="message"
    :variant="alertVariant"
    :class="alertClasses"
    :data-testid="`auth-message-${type}`"
  >
    <AlertDescription data-testid="auth-message-text">
      {{ message }}
    </AlertDescription>
  </Alert>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Alert, AlertDescription } from '~/components/ui/alert'

interface Props {
  message: string | null
  type?: 'error' | 'success' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  type: 'error',
})

const alertVariant = computed(() => {
  switch (props.type) {
    case 'success':
      return 'default'
    case 'info':
      return 'default'
    case 'error':
    default:
      return 'destructive'
  }
})

const alertClasses = computed(() => {
  const baseClasses = 'mb-4'

  switch (props.type) {
    case 'success':
      return `${baseClasses} border-green-500 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100`
    case 'info':
      return `${baseClasses} border-blue-500 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-100`
    case 'error':
    default:
      return baseClasses
  }
})
</script>
