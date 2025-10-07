<template>
  <div class="test-component">
    <h1>Hello World</h1>
  </div>
</template>
<script setup lang="ts">
  onMounted(() => {
    console.log('TestComponent mounted')
  })
</script>
<style scoped>
.test-component {
  color: red;
}
</style>