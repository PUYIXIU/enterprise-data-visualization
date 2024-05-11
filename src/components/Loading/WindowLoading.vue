<script setup>
const props = defineProps(['loading'])
</script>

<template>
  <div class="window-loading-wrapper" :class="{'loading':loading}">
    加载中
  </div>
</template>

<style scoped lang="scss">
.window-loading-wrapper{
  width:100%;
  height:100%;
  background: #ffffffcc;
  backdrop-filter: blur(3px);
  position:absolute;
  top:0;
  left:0;
  z-index:99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 时尚中黑简体;
  opacity: 0;
  transition-property: opacity;transition-duration: 0.2s;
  &.loading{
    opacity: 1;
  }
}
</style>
