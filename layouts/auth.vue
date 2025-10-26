<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-gray-900">10xCards</h1>
        <p class="mt-2 text-sm text-gray-600">Ucz się szybciej z AI</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.auth-container {
  width: 420px;
  max-width: calc(100vw - 2rem);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
