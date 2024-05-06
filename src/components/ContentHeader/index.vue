<script setup>
const props = defineProps(['title','btnList'])

</script>

<template>
<!--看板头部-->
  <div class="kanban-head">
    <div class="title">{{title}}</div>
    <div class="tool-box">
      <p class="tool-btn" v-for="(btn,i) in btnList" :key="i" @click="btn.onclick">
        <span>{{btn.name}}</span>
        <i :class="btn.class"></i>
      </p>
    </div>
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
    font-family: D-DINExp;
    font-size: 1.5rem;
    color: #001133;
  }
  .tool-box{
    display: flex;
    .tool-btn{
      color: #9e9ebc;
      display: flex;
      align-items: center;
      margin-right: 1.5rem;
      cursor: pointer;
      transition-property: color;
      transition-duration: 0.1s;
      transition-timing-function: ease-in-out;
      &:hover{
        color: #7d7dc5;
      }
      &:last-child{
        margin-right: 0;
      }
      span{
        font-family: SourceHanSansCN-Medium;
        font-size: 0.75rem;
      }
      i{
        display: inline-block;
        width:1rem;
        height:1rem;
        background-color: currentColor;
        &.reload{mask-image: $reload-icon;}
        &.expand{mask-image: $bottom-arrow-icon;}
      }
    }
  }
}

</style>
