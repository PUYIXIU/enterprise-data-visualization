<script setup>
import {useLocalDataStore} from "@/storage/index.js";

const store = useLocalDataStore()

const props = defineProps(['delay','duration'])
</script>

<template>
  <div
      class="loading-box"
      :class="{'loading':store.loading}"
      :style="{
        '--delay':delay+'s',
        '--duration':duration+'s'
      }"
      加载中
  >
<!--    <div class="text">加载中</div>-->
<!--    <div class="gray-g">-->
<!--      <div class="contrast-g">-->
<!--        <div class="g-circle"></div>-->
<!--        <ul class="g-bubbles">-->
<!--          <li v-for="i in 15"></li>-->
<!--        </ul>-->
<!--      </div>-->
<!--    </div>-->
  </div>
</template>

<style scoped lang="scss">
.inner{
  width:100px;
  height:100px;
  background: #9e9ebc;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color:#000;
  font-family: 时尚中黑简体;
}
.text{
  position:absolute;
}
.loading-box{
  position:absolute;
  width:100%;
  height:100%;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  z-index:99999;
  display: grid;
  place-items: center;
  opacity: 0;
  transition-property: opacity;
  transition-delay: var(--delay);
  transition-duration: var(--duration);
  transition-timing-function: ease-in-out;
  pointer-events: none;
  &.loading{
    opacity: 1;
    pointer-events: all;
  }
}

$content-w: 15rem; // 宽度
$content-h: 15rem; // 高度
$bg-color:#fff;
$water-color:#a100ff;
.gray-g{
  position:absolute;
  width:$content-w;
  height:$content-h;
  background: $bg-color;
  .contrast-g{
    width:100%;
    height:100%;
    position:relative;
    .g-circle{
      position:relative;
      width:$content-w;
      height:$content-h;
      box-sizing: border-box;
      &::after{
        content:"";
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%) rotateZ(0);
        width:75%;
        height:75%;
        background: $water-color;
        border-radius: 42% 38% 62% 49% / 45%;
        animation:rotate 10s infinite linear;
      }
      &::before{
        content:"";
        position:absolute;
        top:50%;
        left:50%;
        transform:translate(-50%, -50%) rotateZ(0);
        width:70%;
        height:70%;
        background: $bg-color;
        border-radius: 50%;
        z-index:2;
      }
      @keyframes rotate  {
        50%{border-radius: 45% / 42% 38% 58% 49%}
        100%{transform:translate(-50%, -50%) rotateZ(720deg)}
      }
    }
    .g-bubbles{
      z-index:5;
      position:absolute;
      top:50%;
      left:50%;
      width:3rem;
      height:3rem;
      background: $water-color;
      li{
        position:absolute;
        border-radius: 50%;
        background: $water-color;
      }
      @for $i from 0 through 15 {
        li:nth-child(#{$i}){
          $width: 15 + random(15) + px;
          left: 15 + random(70) + px;
          top:50%;
          transform:translate(-50%, -50%);
          width:$width;
          height:$width;
          animation: moveToTop #{random(6) + 3}s ease-in-out -#{random(5000)/1000}s infinite;
        }
      }
      @keyframes moveToTop{
        90%{
          opacity:1;
        }
        100%{
          opacity: .1;
          transform:translate(-50%, -$content-w/2);
        }
      }
    }
  }
}
</style>
