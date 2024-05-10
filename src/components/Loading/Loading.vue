<script setup>
import {useLocalDataStore} from "@/storage/index.js";

const store = useLocalDataStore()

const props = defineProps(['delay','duration'])
</script>

<template>
  <div
      class="loading-box"
      :class="{'loading':store.loading}"
      :style="{
        '--delay':delay+'s',
        '--duration':duration+'s'
      }"
  >
    加载中...
<!--    <div class="inner"> 加载中...</div>-->
  </div>
</template>

<style scoped lang="scss">
.inner{
  width:100px;
  height:100px;
  background: #9e9ebc;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color:#fff;
  font-family: 时尚中黑简体;
}
.loading-box{
  position:absolute;
  width:100%;
  height:100%;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  z-index:99999;
  display: grid;
  place-items: center;
  opacity: 0;
  transition-property: opacity;
  transition-delay: var(--delay);
  transition-duration: var(--duration);
  transition-timing-function: ease-in-out;
  pointer-events: none;
  &.loading{
    opacity: 0.75;
    pointer-events: all;
  }
}
</style>
