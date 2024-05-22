<script setup>

import BtnList from "@/components/ContentHeader/BtnList.vue";

const props = defineProps(['title','btnList','fade'])



</script>

<template>
<!--看板头部-->
  <div class="kanban-head">
    <div class="title">{{title}}</div>
    <btn-list :btn-list="btnList" class="btn-list-box" :class="{'fade':fade}" />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.kanban-head{
  display: flex;
  align-items: center;
  justify-content: space-between;
  height:$content-header-h;
  .title{
    font-family: SourceHanSansCN-Regular;
    font-size: 1.5rem;
    color: #001133;
  }
}
.btn-list-box{
  opacity:1;
  transition-property: opacity;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  &.fade{
    opacity: 0.1;
    pointer-events: none;
  }
}
</style>
