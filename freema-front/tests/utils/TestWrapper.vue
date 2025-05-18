<template>
  <!-- app.vueをテストするためのラッパー -->
  <DefaultLayout>
    <PageComponent />
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '~/layouts/default.vue'
import PageComponent from '~/pages/index.vue'
</script>