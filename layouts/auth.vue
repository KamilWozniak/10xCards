<template>
  <div class="auth-layout">
    <div style="width: 420px; max-width: calc(100vw - 2rem)" class="space-y-6">
      <!-- Logo/Header Area -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">10xCards</h1>
        <p class="mt-2 text-sm text-gray-600">Ucz się szybciej z AI</p>
      </div>

      <!-- Main Content Slot -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal layout for authentication pages (login, register)
// No navigation, no user info, just centered content
</script>
