<script setup>
import {computed, onMounted, onBeforeUnmount, ref, nextTick} from "vue";

const props = defineProps(['domId'])

const data = ref({})

const barHeightList = computed(()=>{
  if(!data.value.hourList) return []
  let maxH = 0 , minH = 0
  data.value.hourList.forEach(item=>{
    let h = item[1]
    if(maxH<h) maxH = h
    if(minH>h) minH = h
  })
  let diff = maxH - minH
  let result = data.value.hourList.map(item=>{
    let value = Math.ceil((item[1]-minH)/diff* 100)
    return value+'%'
  })
  return result
})

let transformX = ref(0)

// 获取浮窗的位置  让浮窗在预计开始和节数之间浮动
function getTipPosition(){
  // 获取到第一个预计时间的右边界
  // 第二个预计时间的左边界
  // 需要计算的内容就在这两个边界之间
  let realDom = document.getElementById('real-bar-split')
  let tipDom = document.querySelector('.real-bar-tip')
  let realBarDom = document.querySelector('.real-bar')
  let left = 0
  let right = realBarDom.clientWidth
  let splitLeft = realDom.offsetLeft
  let halfWidth = tipDom.clientWidth / 2
  transformX.value = 0 - halfWidth
  if(splitLeft - halfWidth < left){
    transformX.value += (left - splitLeft + halfWidth)
  }else if (splitLeft + halfWidth > right){
    transformX.value -= ( splitLeft + halfWidth - right)
  }

}

let label_dx = ref(0)
// 计算工时label的偏移量
function getLabelPosition(){
  let wrapDom = document.querySelector('.hour-bar')
  let hourBarDom = document.querySelector('.hour-bar-inner')
  let spanDom = hourBarDom.querySelector('span')

  let wrapW = wrapDom.clientWidth
  let barW = hourBarDom.clientWidth
  let spanW = spanDom.clientWidth

  let rightW = wrapW - barW - hourBarDom.offsetLeft
  let diff = rightW -  spanW
  if(diff>=0){
    label_dx.value = spanW
  }else{
    label_dx.value = rightW
  }
}

// 计算预计的位置点
// 1- 预计时间点超出容器边框，收回
// 2- 预计开始时间长度 超过预计和开始之间的间隔，进行截断

function getPreLabelPosition(){
  let startDom = document.getElementById('predict-start')
  let endDom = document.getElementById('predict-end')
  let wrapperDom = document.querySelector('.predict-tip')

  let startRight = startDom.offsetLeft + startDom.clientWidth // 开始时间右侧
  let endDomLeft = endDom.offsetLeft
  let endDomRight = endDom.offsetLeft + endDom.clientWidth
  let diff = endDomLeft - startRight
  if(diff<0){
    startDom.style.width = `${startDom.clientWidth - Math.abs(diff)}px`
  }else{
    startDom.style.width = 'fit-content'
  }
  let rightExtend = endDomRight - wrapperDom.clientWidth
  if(rightExtend>0){
    endDom.style.transform = `translateX(${-rightExtend}px)`
  }else{
    endDom.style.transform = `translateX(0px)`
  }
}
function resize(){
  getTipPosition()
  getLabelPosition()
  getPreLabelPosition()
}

// 销毁
function dispose(){
  init = true
  window.removeEventListener('resize',resize)
}
let init = true // 是否为初始化
function dataReady(src){
  if(init){
    init = false
    window.addEventListener('resize',resize)
  }
  data.value = src
  nextTick(()=>{
    getTipPosition()
    getLabelPosition()
    getPreLabelPosition()
  })
}

defineExpose({
  dataReady,
  dispose
})

</script>

<template>
  <div class="gant-wrapper" :id="domId">
    <div class="label-box">
      <li id="predict-label">预计：</li>
      <li id="real-label">实际：</li>
      <li>工时：</li>
      <li>工时详情：</li>
    </div>

    <div class="gant-box" :style="{
      '--predict':data.progress + '%',
      '--delay':data.realStart_p + '%',
      '--real': data.progress+ '%',
      '--pre-start': data.preStart_p+ '%',
      '--pre-end': data.preEnd_p+ '%',
      '--current': data.current_p+ '%',
    }">
<!--      预计行-->
      <div class="predict-tip gant-box-bar">
        <span id="predict-start" class="text">{{data.predictStartTime}}</span>
        <span id="predict-end" class="text">{{data.predictEndTime}}</span>
      </div>
<!--      实际行-->
      <div class="real-bar gant-box-bar">
        <div id="real-bar-fore">
          <span class="text">{{data.realStartTime}}</span>
        </div>
        <span class="text real-bar-end-time">{{data.realEndTime}}</span>
        <div id="real-bar-split" :style="{
          '--dx':transformX+'px',
        }">
          <div class="real-bar-tip">
            <p>截止到{{data.currentTime}}</p>
            <p>
              <span class="tip-icon red"></span>
              <span class="tip-text red">预计进度 {{data.predictProgress}}%</span>
              <span class="tip-icon blue"></span>
              <span class="tip-text blue">实际进度 {{data.realProgress}}%</span>
            </p>
          </div>
        </div>
      </div>
<!--      工时行-->
      <div class="hour-bar gant-box-bar" :style="{'--span-dx':label_dx+'px'}">
        <div class="hour-bar-inner">
          <span class="text">{{data.totalHour}}h</span>
        </div>

      </div>
<!--      工时详情行-->
      <div class="detail-bar gant-box-bar" :style="{'--bar-size':barHeightList.length}">
        <p>
          <span v-for="item in barHeightList" :style="{'--height':item}"></span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">

.gant-wrapper{
  font-family: SourceHanSansCN-Regular;
  padding-top:0.69rem;
  box-sizing: border-box;
  width:100%;
  height:calc(8.56rem - 1.5rem);
  display: flex;
}
.label-box{
  margin-right: 0.25rem;
  li{
    font-size: 0.75rem;
    color: rgba(29,29,29,0.7);
    height: 1.13rem;
    margin-bottom: 0.25rem;
    text-align: right;
    &:last-child{margin-bottom: 0rem}
    &#real-label{
      color: #001133;
      font-size: 0.88rem;
      font-family: SourceHanSansCN-Medium;
    }
    &#predict-label{
      color:#FF505Dcc;
      margin-bottom: 0.44rem;
    }
  }
}

.gant-box{
  flex:1;
  .text{
    font-size: 0.75rem;
  }
  .gant-box-bar{
    height:1.13rem;
    margin-bottom: 0.25rem;
    &:last-child{margin-bottom: 0}
  }
  .predict-tip{
    //display: flex;
    //justify-content: space-between;
    margin-bottom: 0.44rem;
    color:#FF505D;
    position:relative;
    span{
      display: inline-block;
      position:absolute;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      width:fit-content;
    }
    #predict-start{left:var(--pre-start);}
    #predict-end{left:var(--pre-end);}
  }
  .real-bar{
    display: flex;
    background-color: rgba(101,145,255,0.2);
    position:relative;
    cursor:pointer;
    box-shadow:inset 0px 0px 0px rgba(182, 203, 255, 0.2);
    transition-property: box-shadow;transition-timing-function: ease-in-out;transition-duration: 0.1s;
    &:hover{box-shadow:inset 0px 0px 14px rgba(174, 199, 255, 0.3);}
    #real-bar-fore{
      pointer-events: none;
      display: flex;
      position:absolute;
      height:100%;
      width:var(--real);
      background: linear-gradient( 180deg, #DDE7FF 0%, #487DFE 100%);
      left:var(--delay);
      span{
        color:#ffffffcc;
      }
    }
    .real-bar-end-time{
      pointer-events: none;
      position:absolute;
      right:0.13rem;
      color:#3870F2;
    }
    #real-bar-split{
      z-index:998;
      pointer-events: none;
      position:absolute;
      height: 1.5rem;
      width:0.13rem;
      left:var(--current);
      top:-50%;
      transform:translateY(20%);
      background: linear-gradient( 180deg, #BAB5FF 0%, #6459F4 100%);
      .real-bar-tip{
        opacity: 1;transition-property: opacit;transition-timing-function: ease-in-out;
        transition-duration: 0.2s;
        position:absolute;
        top:calc(-50% - (1.5rem - 1.13rem) / 2 );
        left:0%;
        transform:translateY(-80%) translateX( var(--dx) );
        width: fit-content;
        height: 3.44rem;
        padding:0.5rem;
        box-sizing: border-box;
        background: #FFFFFF;
        box-shadow: 0rem 0.25rem 1.25rem 0rem rgba(149,172,231,0.25);
        border-radius: 0.63rem 0.63rem 0.63rem 0.63rem;
        cursor: pointer;
        pointer-events: all;
        transition-property: transform;
        transition-duration: 0.2s;
        transition-delay: 0.1s;
        &:hover{
          transform:translateY(-120%) translateX( var(--dx) );
        }
        p{
          white-space: nowrap;
          &:nth-child(1){
            color: rgba(28, 28, 28, 0.7);
            font-size: 0.75rem;
            margin-bottom:0.25rem;
          }
          &:nth-child(2){
            font-family: SourceHanSansCN-Medium;
            display: flex;
            align-items: center;
            span{
              margin-right: 0.25rem;
              &:last-child{margin-right: 0rem}
            }
            .tip-icon{
              display: inline-block;
              width: 0.69rem;
              height: 0.69rem;
              background: linear-gradient( 180deg, #DDE7FF 0%, #487DFE 100%);
              border-radius: 50%;
              &.red{
                background: linear-gradient( 180deg, #FFD4D8 0%, #FF505D 100%);
              }
            }
            .tip-text{
              font-size: 0.88rem;
              background:linear-gradient(90deg,#7AA1FEcc 0%, #487DFEcc 50%, #6E64F6 100%);
              background-clip: text;
              color:transparent;
              &.red{
                background:linear-gradient(90deg, rgba(254, 122, 133, 0.8) 0%, rgba(254, 72, 72, 0.8) 50%, #f66464 100%);
                background-clip: text;
                color:transparent;
              }
            }
          }
        }
      }
    }
  }
  .hour-bar{
    display: flex;
    position:relative;
    align-items: center;
    .hour-bar-inner{
      margin:auto 0;
      background-color: #FFB800;
      width:var(--real);
      height: 0.38rem;
      position:absolute;
      left:var(--delay);
      span{
        color:#E7AB12;
        position:absolute;
        top:-100%;
        right:0;
        transform:translateX(var(--span-dx));
        mix-blend-mode: difference;
        filter:invert(1);
      }
    }
  }
  .detail-bar{
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    position:relative;
    p{
      left:var(--delay);
      position:absolute;
      width:var(--real);
      height:100%;
    }
    span{
      $bar-width:0.13;
      //$bar-gap:0.25;
      $bar-gap:0;

      display: inline-block;
      width:calc(100% / ($bar-width + $bar-gap) * $bar-width / var(--bar-size));
      height:var(--height);
      background: linear-gradient( 180deg, #6692FF 0%, #BED1FF 100%);
    }
  }
}
</style>
