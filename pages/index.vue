<script setup lang="ts">
// Redirect to /generate by default
await navigateTo('/generate')
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
</template>
