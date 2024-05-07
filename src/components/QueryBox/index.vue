<script setup>
import DropDownBox from '@/components/DropDownBox'
import {ref,onMounted} from 'vue'
import {getrem} from "@/utils/style.js";
const visible = ref(false)
const props = defineProps(['btnId','value','domId','options','height'])
const emit = defineEmits(['update:value', 'change'])
function expand(){
  visible.value = !visible.value
  emit('change', visible.value)
}

defineExpose({
  expand
})
function queryChange(option){
  emit('update:value',option.value)
}

// 计算下拉框位置
function setPosition(){
  const btn = document.querySelector(`#${props.btnId}`)
  const target = document.querySelector(`#${props.domId}`)
  target.style.left = getrem(btn.offsetLeft - target.clientWidth/2) + 'rem'
}

onMounted(()=>{
  setPosition()
})
</script>

<template>
  <drop-down-box :visible-box="visible" :height="height" :dom-id="domId" @blur="expand" :btn-id="btnId">
    <div class="query-inner full">
      <div :class="{'active':value === option.value}" class="option-item" v-for="option in options" @click="queryChange(option)">
        {{option.label}}
      </div>
    </div>
  </drop-down-box>
</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.query-inner{
  padding:0.5rem;
  display: flex;
  flex-flow: row wrap;
  overflow-y: scroll;
  &::-webkit-scrollbar{
    width:0px;
  }
}
.option-item{
  flex:0 0 50%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  font-family: SourceHanSansCN-Medium;
  color: rgba(0, 17, 51, 0.7);
  text-align: center;
  margin-bottom: 0.5rem;
  cursor:pointer;
  &.active{
    color: #3f77fc;
  }
  &:hover{
    color: #3f77fc;
  }

}
</style>
