<script setup>
const props = defineProps(['showDiv'])
</script>

<template>
  <div class="empty-wrapper" v-if="showDiv">暂无数据</div>
</template>

<style scoped lang="scss">
.empty-wrapper{
  width:100%;
  height:100%;
  position:absolute;
  top:0;
  left:0;
  z-index:99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 时尚中黑简体;
  font-size: 2rem;
  color: #cecece;
  opacity: 0.5;
  pointer-events: none;
}
</style>
