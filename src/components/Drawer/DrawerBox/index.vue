<script setup>

import {QuestionFilled} from '@element-plus/icons-vue'
const props = defineProps(['height','title','tooltip'])
</script>

<template>
  <div class="drawer-box-wrapper" :style="{'--height':height}">
    <div class="box-header">
        <span></span>
        <h5>{{props.title}}</h5>
        <el-popover trigger="hover" placement="top" :width="tooltip.width" v-if="tooltip">
          <template #reference>
            <el-button size="large" :icon="QuestionFilled" circle text />
          </template>
          <template #default>
            <p class="popover-text">
              <span>提示：</span>
              <span>{{tooltip.context}}</span>
            </p>
          </template>
        </el-popover>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped lang="scss">
.popover-text{
  font-family: SourceHanSansCN-Regular;
  white-space: nowrap;
  width:100%;
  text-align: center;
  span:first-child{
    color: #332b69;
  }
  span:last-child{
    color: rgba(51, 43, 105, 0.69);
  }
}
.drawer-box-wrapper{
  width:100%;
  background-color: rgba(255, 255, 255,0.8);
  border-radius: 1.25rem;
  margin-bottom:0.75rem;
  box-shadow: 0px 0px 3px 0px rgba(149,172,231,0.25);
  height:var(--height);

  padding:1.5rem;
  box-sizing: border-box;
  position:relative;
  &:last-child{
    margin-bottom: 0;
  }
}
.box-header{
  display: flex;
  height:1.13rem;
  align-items: center;
  span{
    display: inline-block;
    width:0.13rem;
    height:0.88rem;
    background-color: #6459F4;
    margin-right:0.37rem;
  }
  h5{
    font-family: SourceHanSansCN-Normal;
    color:#001133cc;
    font-size: 0.75rem;
  }
}
</style>
