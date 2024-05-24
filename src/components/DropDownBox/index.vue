<script setup>
import gsap from 'gsap'
import {watch,onMounted,onBeforeUnmount,reactive} from 'vue'
const props = defineProps(['visibleBox','height','domId','btnId'])
const emit = defineEmits(['blur'])
const collapseVars = {
  height:`0rem`,
  opacity:0,
  y:-10
}
const expandVars ={
  height:`${props.height}rem`,
  opacity:1,
  y:0
}
function expand(){
  gsap.fromTo(`#${props.domId}`,collapseVars,{
    ...expandVars,
    duration:0.3
  })
}

function collapse(){
  gsap.fromTo(`#${props.domId}`,expandVars,{
    ...collapseVars,
    duration:0.3
  })
}

function change(){
  if(props.visibleBox){
    expand() // 展开
  }else{
    collapse() // 关闭
  }
}

watch(()=>props.visibleBox, (nv,ov)=>change())
watch(()=>props.height, (nv,ov)=>expandVars.height = `${props.height}rem`)

// 检查是否点击了指定dom以外的部分
function checkClick(e){
  if(!props.visibleBox) return
  const target = document.querySelector(`#${props.domId}`)
  const btn =  document.querySelector(`#${props.btnId}`)
  if(target.contains(e.target) || btn.contains(e.target)) return // 不退出
  emit('blur') // 退出
}

onMounted(()=>{
  window.addEventListener('click', checkClick)
})

onBeforeUnmount(()=>{
  window.removeEventListener('click', checkClick)
})

</script>

<template>
<!-- 下拉框 -->
<div class="drop-down-wrapper" :id="domId" >
  <slot></slot>
</div>

</template>

<style scoped lang="scss">
@import '@/assets/styles/global.scss';
.drop-down-wrapper{
  position:absolute;
  z-index:999;
  background-color: #ffffff;
  box-shadow: 0rem 0.25rem 1.25rem 0rem rgba(149,172,231,0.25);
  border-radius: 1.25rem 1.25rem 1.25rem 1.25rem;
  overflow: hidden;
  height:0;
  opacity: 0;
}
</style>
