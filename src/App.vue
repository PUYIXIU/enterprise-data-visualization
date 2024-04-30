<script setup>

import {onMounted, onBeforeUnmount} from "vue";

// 窗口大小变化
function resize(){
  let rootWidth = document.documentElement.clientWidth || document.body.clientWidth
  let rootDom = document.querySelector('html')
  // 根据窗口大小，调整字体大小  1920 16px    y=kx
  // y = kx + b
  // 16 = 1920k + b
  // 12 = 1024k + b
  // 4 = 896k
  // k = 0.00446
  // 16 =
  let k = 4/896
  let b = 16 - 1920*k
  rootDom.style.fontSize = (k*rootWidth+b) + 'px'
}

onMounted(()=>{
  window.addEventListener('resize',resize)
})

onBeforeUnmount(()=>{
  window.removeEventListener('resize',resize)
})
</script>

<template>
  <div class="wrapper">
    <div class="head">111</div>
    <div class="content">
      <div class="main-content br-box">主区域</div>
      <div class="sub-content">
        <div class="sub-top br-box">项目热度</div>
        <div class="sub-middle br-box">项目占比</div>
        <div class="sub-bottom br-box">风险项目</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/fun.scss';
.wrapper{
  background: #e9effa;
  width: 100%;
  height:100vh;
  min-width: 1024px;
  min-height:768px;
  display: flex;
  flex-direction: column;
  &::-webkit-scrollbar{
    width:0px;
    display: none;
  }
}
.head{
  background: #fff;
  height:3.81rem;
  font-size: 1rem;
}
.content{
  flex:1;
  padding: 0.75rem;
  padding-right: 1.5rem;
  display: flex;
  // 主界面
  .main-content{
    width:86.56rem;
    margin-right:0.75rem;
  }
  // 侧边
  .sub-content{
    width:30.44rem;
    display: flex;
    flex-direction: column;
    .sub-top{
      height:22rem;
      margin-bottom:0.75rem;
    }
    .sub-middle{
      height:15.56rem;
      margin-bottom: 0.75rem;
    }
    .sub-bottom{
      flex:1
    }
  }
}
// 圆角盒子
.br-box{
  background: white;
  border-radius: 0.625rem;
  box-shadow: 0px 0px 3px 0px rgba(149,172,231,0.25);
}
</style>
