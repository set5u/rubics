<template lang="pug">
.h-full
  .h-full.flex.justify-center.items-center.scene.overflow-hidden(@mousedown.exact.capture="lock" @mouseup.exact="unlock")
    .cube
      canvas.face.base(style="--i: 1")
      canvas.face.base(style="--i: -1")
      canvas.face.side(style="--i: 0")
      canvas.face.side(style="--i: 1")
      canvas.face.side(style="--i: 2")
      canvas.face.side(style="--i: 3")
</template>
<script setup lang="ts">
const { x, y } = useMouse({ type: 'movement' })
const rotY = ref(45)
const rotX = ref(-45)
const { lock, unlock, element } = usePointerLock()
const scale = ref(50)
const scaleVmin = computed(() => scale.value + "vmin")
const scaleVminHalf = computed(() => scale.value / 2 + "vmin")
const scaleVminMinusHalf = computed(() => -scale.value / 2 + "vmin")
watch([x, y], ([x, y]) => {
  if (!element.value)
    return
  rotY.value += x / 2
  rotX.value -= y / 2
})
</script>
<style scoped lang="scss">
.scene {
  perspective: 100vmin;
}

.cube {
  transform-style: preserve-3d;
  --rotY: v-bind(rotY);
  --rotX: v-bind(rotX);
  transform: translateY(-50%) rotateX(calc(var(--rotX) * 1deg)) rotateY(calc(var(--rotY) * 1deg)) translateX(v-bind(scaleVminMinusHalf)) translateY(v-bind(scaleVminMinusHalf));
}

.face {
  position: absolute;
  top: 0;
  left: 0;
  width: v-bind(scaleVmin);
  height: v-bind(scaleVmin);
  border: .15rem black solid;
}

.base {
  transform: rotateX(calc(90deg * var(--i))) translateZ(v-bind(scaleVminHalf));
}

.side {
  transform: rotateY(calc(90deg * var(--i))) translateZ(v-bind(scaleVminHalf));
}
</style>
<style lang="scss">
html,
body,
body>:first-child {
  height: 100%
}
</style>