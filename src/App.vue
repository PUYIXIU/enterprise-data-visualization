<script setup>
import {onMounted} from "vue";
import screenfull from "screenfull";
import MainKanban from '@/components/MainKanban'
import HotSort from '@/components/HotSort'
import ProjPercent from '@/components/ProjPercent'
import DangerProj from '@/components/DangerProj'
import Drawer from '@/components/Drawer'
</script>

<template>
  <div class="wrapper">
    <div class="head"></div>
    <div class="content">
      <div class="main-content br-box">
<!--        主看板-->
        <main-kanban/>
      </div>
      <div class="sub-content">
<!--        项目热度-->
        <div class="sub-top br-box">
          <hot-sort/>
        </div>
<!--        项目占比 -->
        <div class="sub-middle br-box">
          <proj-percent/>
        </div>
<!--        风险项目-->
        <div class="sub-bottom br-box">
          <danger-proj/>
        </div>
      </div>
    </div>
<!--    右侧抽屉-->
    <drawer dom-id="right-drawer-id" />
  </div>
</template>

<style scoped lang="scss">
@import '@/assets/styles/fun.scss';
@import '@/assets/styles/global.scss';
.wrapper{
  background: #e9effa;
  width: 100%;
  height:67.5rem;
  min-width: 1024px;
  min-height:768px;
  max-width: 3840px;
  max-height:1838px;
  display: flex;
  flex-direction: column;
  position:absolute;
  overflow-x: hidden;
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
    height:100%;
    height:$main-kanban-h;
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
      //flex:1
      height:23.13rem;
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
