<script setup>
const props = defineProps(['loading'])
</script>

<template>
  <div class="window-loading-wrapper" :class="{'loading':loading}" v-if="loading">
    <div class="wrap">
      <ul class="loading-box">
        <li></li>
        <li></li>
        <li></li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
.window-loading-wrapper{
  width:100%;
  height:100%;
  background: #ffffffcc;
  backdrop-filter: blur(3px);
  position:absolute;
  top:0;
  left:0;
  z-index:99;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 时尚中黑简体;
  opacity: 1;
  transition-property: opacity;transition-duration: 0.2s;
  &.loading{
    opacity: 1;
  }
}
$bg-color:#fff;
$wave-color:#000;

.wrap{
  width:100%;
  height:100%;
  display: grid;
  place-items: center;
  filter:contrast(15) opacity(0.1);
  background-color: $bg-color;
  transform:scale(0.5);
  transform-origin: center;
}
.loading-box{
  width:0rem;
  // white-space: nowrap;
  background-color: $bg-color;
  position:relative;
  display: flex;
  animation:collapse 1.5s ease-in-out  infinite alternate-reverse;
  li{

    position: absolute;
    top:0;
    filter:blur(8px);
    border-radius: 50%;
    list-style: none;
    width:2rem;
    height:2rem;
    background-color: $wave-color;
    // animation:jump 1.5s ease-in-out infinite ;

  }
  @for $i from 0 through 3 {
    li:nth-child(#{$i}){
      animation-delay:($i - 1) * 0.5s;
      left:33% * ($i - 1);
    }
  }
}

@keyframes collapse{
  to{width:8rem;}
}
@keyframes jump{
  0%{ transform:translate(0, 0rem) }
  25%{transform:translate(0, -1rem) }
  75%{transform:translate(0, 1rem) }
  100%{transform:translate(0, 0rem) }
  // to{transform: translate(0,1rem);}
}
</style>
