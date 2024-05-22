<script setup>
const props = defineProps(['btnList'])

function btnClick(btn){
  // 有2种状态切换的按钮
  if(!btn.deactiveName) btn.deactiveName = btn.name
  btn.onclick()
}
</script>

<template>
  <div class="tool-box">
    <p class="tool-btn" v-for="(btn,i) in btnList" :key="i"
       @click="btnClick(btn)"
       :id="btn.id || ''"
       v-show="btn.show == undefined || btn.show"
    >
      <span>{{btn.active?btn.deactiveName:btn.name}}</span>
      <i :class="btn.class" :style="btn.active?btn.deactiveIconStyle:{}"></i>
    </p>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
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
      transition:all 0.1s ease-in-out;
      mask-size:100% 100%;
      &.reload{mask-image: $reload-icon;}
      &.expand{mask-image: $bottom-arrow-icon;}
    }
  }
}
</style>
