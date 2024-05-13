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
  >
    <!-- 颜色滤镜 -->
    <div class="g-color-filter">
      <!-- 对比度滤镜 -->
      <div class='g-contract'>
        <!-- 中心圆 -->
        <div class='g-circle'>
        </div>
        <div class="t-blur">加载中...</div>
        <ul class='g-bubbles'>
          <li></li> <li></li> <li></li> <li></li> <li></li>
          <li></li> <li></li> <li></li> <li></li> <li></li>
          <li></li> <li></li> <li></li> <li></li> <li></li>
          <li></li> <li></li> <li></li> <li></li> <li></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
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
$bg-color:rgb(0, 0, 0);
$wave-color:rgb(255, 255, 255);
$wrap-color:rgba(255, 255, 255,0.7);
$content_w:10rem;
$content_h:10rem;
$wrap_w:20rem;
$wrap_h:20rem;
.wrapper{
  width:100%;
  height:100%;
  display: grid;
  place-items: center;
  position:relative;
  background-color: $wrap-color;
  backdrop-filter:blur(8px) contrast(0.9);
}

.g-color-filter{
  position:absolute;
  width:$wrap_w;
  height:$wrap_w;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0px 0px 20px #000;
  backdrop-filter: invert(1) blur(10px);
  filter:invert(1) opacity(0.05);

  .g-contract{
    filter:contrast(15);
    width:100%;
    height:100%;
    display: grid; place-items: center;
    background-color: $bg-color;
    .g-circle{
      filter:blur(5px);
      width:$content_w;
      height:$content_h;
      position:absolute;
      display: grid;
      place-items: center;
      &::after{
        content:'';
        display: block;
        width:100%;
        height:100%;
        background: $wave-color;
        border-radius: 42% 38% 62% 49% / 45%;
        position:absolute;
        transform: rotateZ(0deg);
        animation:rotate 20s linear infinite;
      }
      &::before{
        content:'';
        display:block;
        width:85%;
        height:85%;
        background-color: $bg-color;
        position:absolute;
        z-index:1;
        border-radius:45% / 40% 35% 50% 63% ;
        animation:rotate 30s linear infinite reverse;
      }
    }

    .t-blur{
      z-index:6;
      position:absolute;
      background-color: #000;
      font-size: 25px;
      color:white;
      filter:blur(1px) ;
      white-space: nowrap;
      //animation: text-change infinite 3s ease-out;
      animation-delay: 0.5s;
      font-family: 时尚中黑简体;
    }
  }
}

.g-bubbles{
  filter:blur(5px);
  width:100%;
  height:100%;
  position:relative;
  display: grid;place-items: center;
  z-index:7;
  animation:bubble_rotate 60s linear infinite;
  li{
    list-style: none;
    background-color: $wave-color;
    display: block;
    position:absolute;
  }
  $li-number:20;
  $split-number:360/$li-number ;
  @for $i from 0 through $li-number{
    li:nth-child(#{$i}){
      $radius-diff:random(10) * 0.2 + rem; // 半径偏差
      $radius:calc($radius-diff + $content_w * 0.5); // 半径
      $angle: $i * $split-number + deg; // 角度
      $x: calc($radius * cos($angle));
      $y: calc($radius * sin($angle));

      $r: random(10) * 0.2  + rem;
      width:$r;
      height:$r;
      opacity: 0;
      border-radius: 50%;
      animation:moveToCenter infinite forwards;
      animation-duration: #{random(6) + 8}s;
      animation-timing-function: ease-in-out;
      animation-delay: -#{random(6000)/1000}s;
      transform:translate( $x, $y ) ;
    }
  }
}


@keyframes text-change{
  0%{opacity: 0; filter:blur(5px);}
  20%{opacity: 1; filter:blur(1px);}
  80%{ opacity: 1;  filter:blur(1px);}
  100%{
    filter:blur(2px);
    opacity: 0.7;
    letter-spacing: 0.2rem;;
  }
}

@keyframes bubble_rotate {
  to{
    transform:rotateZ(720deg);
  }
}

@keyframes rotate{
  50%{
    border-radius:45% / 42% 38% 62% 49%;
  }
  100%{
    transform:rotateZ(720deg)
  }
}

@keyframes moveToCenter{
  0%{
    opacity: 0;
  }
  10%{
    opacity: 1;
  }
  90%{
    opacity: 1;
  }
  100%{
    opacity: 0;
    width: 0px;
    height: 0px;
    transform:translate(0px, 0px) rotateZ(360deg);
  }
}
</style>
