<script setup>
import {computed, onMounted, onBeforeUnmount, ref} from "vue";

const props = defineProps(['domId','data'])

const barHeightList = computed(()=>{
  let maxH = 0 , minH = 0
  props.data.hourList.forEach(item=>{
    let h = item[1]
    if(maxH<h) maxH = h
    if(minH>h) minH = h
  })
  let diff = maxH - minH
  let result = props.data.hourList.map(item=>{
    let value = Math.ceil((item[1]-minH)/diff* 100)
    return value+'%'
  })
  return result
})

// 鼠标位置
const mouse_position = ref(['0%','0%'])

function mouseMoveEvent(e){
  if(!props.data.realProgress) return;
  let totalWidth = this.clientWidth
  let x = e.offsetX
  let y = e.offsetY
  let initX = totalWidth/100*props.data.realProgress
  mouse_position.value = [
      `${x-initX}px`,
      `${y}px`,
  ]

}
onMounted(()=>{
  document.querySelector('.real-bar').addEventListener('mousemove',mouseMoveEvent)
})
onBeforeUnmount(()=>{
  document.querySelector('.real-bar').removeEventListener('mousemove',mouseMoveEvent)
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
      '--predict':data.predictProgress + '%',
      '--delay':data.delayProgress + '%',
      '--real':data.realProgress + '%',
    }">
<!--      预计行-->
      <div class="predict-tip gant-box-bar">
        <span class="text">{{data.predictStartTime}}</span>
        <span class="text">{{data.predictEndTime}}</span>
      </div>
<!--      实际行-->
      <div class="real-bar gant-box-bar">
        <div id="real-bar-fore">
          <span class="text">{{data.realStartTime}}</span>
        </div>
        <span class="text real-bar-end-time">{{data.realEndTime}}</span>
        <div id="real-bar-split" :style="{
          '--offsetX':mouse_position[0],
          '--offsetY':mouse_position[1],
        }">
          <div class="real-bar-tip">
            <p>截止到{{data.currentTime}}</p>
            <p>
              <span class="tip-icon"></span>
              <span>进度 {{data.realProgress}}%</span>
            </p>
          </div>
        </div>
        <div id="predict-bar-split">
          <p class="tip-text">预计：{{data.predictProgress}}%</p>
          <p class="split-line"></p>
        </div>
      </div>
<!--      工时行-->
      <div class="hour-bar gant-box-bar">
        <div class="hour-bar-inner">
          <span class="text">{{data.totalHour}}h</span>
        </div>

      </div>
<!--      工时详情行-->
      <div class="detail-bar gant-box-bar" :style="{'--bar-size':barHeightList.length}">
        <span v-for="item in barHeightList" :style="{'--height':item}"></span>
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
    display: flex;
    margin-bottom: 0.44rem;
    color:#FF505D;
    justify-content: space-between;
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
      width:calc(var(--real) - var(--delay));
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
    &:hover > #real-bar-split > .real-bar-tip{
      opacity: 1;
    }
    #real-bar-split{
      z-index:999;
      pointer-events: none;
      position:absolute;
      height: 1.5rem;
      width:0.13rem;
      left:var(--real);
      top:-50%;
      transform:translateY(20%);
      background: linear-gradient( 180deg, #BAB5FF 0%, #6459F4 100%);
      .real-bar-tip{
        opacity: 0;transition-property: opacit;transition-timing-function: ease-in-out;
        transition-duration: 0.2s;
        position:absolute;
        top:calc(-50% + var(--offsetY));
        left:var(--offsetX);
        transform:translateY(-80%) translateX(0.5rem);
        width: 7.38rem;
        height: 3.44rem;
        padding:0.5rem;
        box-sizing: border-box;
        background: #FFFFFF;
        box-shadow: 0rem 0.25rem 1.25rem 0rem rgba(149,172,231,0.25);
        border-radius: 0.63rem 0.63rem 0.63rem 0.63rem;
        p{
          .tip-icon{
            display: inline-block;
            width: 0.69rem;
            height: 0.69rem;
            margin-right: 0.25rem;
            background: linear-gradient( 180deg, #DDE7FF 0%, #487DFE 100%);
            border-radius: 50%;
          }
          &:nth-child(1){
            color: rgba(28, 28, 28, 0.7);
            font-size: 0.75rem;
            margin-bottom:0.25rem;
          }
          &:nth-child(2){
            font-family: SourceHanSansCN-Medium;
            display: flex;
            align-items: center;
            font-size: 0.88rem;
            background:linear-gradient(90deg,#7AA1FEcc 0%, #487DFEcc 50%, #6E64F6 100%);
            background-clip: text;
            color:transparent;
          }
        }
      }
    }
    #predict-bar-split{
      position:absolute;
      height: 1.5rem;
      width:0.13rem;
      left:var(--predict);
      top:-50%;
      transform:translateY(20%);
      background-color: #FF505D;
      .tip-text{
        color:#FF505D;
        font-size: 0.75rem;
        position:absolute;
        top:calc(-100% + (1.5rem - 1.13rem) / 2);
        white-space: nowrap;
        transform: translateX(-50%);
      }
    }
  }
  .hour-bar{
    display: flex;
    .hour-bar-inner{
      margin:auto 0;
      background-color: #FFB800;
      width:var(--real);
      height: 0.38rem;
      position:relative;
      span{
        color:#E7AB12;
        position:absolute;
        top:-100%;
        right:0;
        transform:translateX(115%);
      }
    }
  }
  .detail-bar{
    display: flex;
    width:var(--real);
    justify-content: space-between;
    align-items: flex-end;
    span{
      $bar-width:0.13;
      $bar-gap:0.25;

      display: inline-block;
      width:calc(100% / ($bar-width + $bar-gap) * $bar-width / var(--bar-size));
      height:var(--height);
      background: linear-gradient( 180deg, #6692FF 0%, #BED1FF 100%);
    }
  }
}
</style>
