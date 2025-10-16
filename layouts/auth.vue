<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <!-- Logo/Header Area -->
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">10xCards</h1>
        <p class="mt-2 text-sm text-gray-600">
          Ucz się szybciej z AI
        </p>
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
