<template lang="pug">
.h-full
  .h-full.flex.justify-center.items-center.scene.overflow-hidden(@mousedown.self.capture="lock" @mouseup.self="unlock")
    .cube
      canvas.face.base(ref="top" style="--i: 1")
      canvas.face.base(ref="bottom" style="--i: -1")
      canvas.face.side(ref="front" style="--i: 0")
      canvas.face.side(ref="right" style="--i: 1")
      canvas.face.side(ref="back" style="--i: 2")
      canvas.face.side(ref="left" style="--i: 3")
</template>
<script setup lang="ts">
const { x, y } = useMouse({ type: 'movement' })
const rotY = ref(45)
const rotX = ref(-45)
const { lock, unlock, element } = usePointerLock()
watch([x, y], ([x, y]) => {
  if (!element.value)
    return
  rotY.value += x / 2
  rotX.value -= y / 2
})
enum Color {
  R,
  G,
  B,
  Y,
  W,
  O,
}
const i2color = ["red", "green", "blue", "yellow", "white", "orange"] as const
class Face {
  data: Color[]
  editedIndexes: number[] = []
  rotate: 0 | 1 | 2 | 3 = 0
  ctx: CanvasRenderingContext2D
  constructor(public canvas: HTMLCanvasElement, public size: number, initialColor: Color) {
    this.data = Array<number>(size ** 2).fill(initialColor)
    this.ctx = canvas.getContext("2d")!
    this.ctx.fillStyle = i2color[initialColor]
    this.ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  getIndexAt(x: number, y: number) {
    switch (this.rotate) {
      case 0:
        return x + this.size * y
      case 1:
        return y + this.size * (this.size - x - 1)
      case 2:
        return (this.size - x - 1) + this.size * (this.size - y - 1)
      case 3:
        return (this.size - y - 1) + this.size * x
    }
  }
  getCoordAt(x: number, y: number) {
    switch (this.rotate) {
      case 0:
        return [x, y]
      case 1:
        return [y, (this.size - x - 1)]
      case 2:
        return [(this.size - x - 1), (this.size - y - 1)]
      case 3:
        return [(this.size - y - 1), x]
    }
  }
  getAt(x: number, y: number) {
    return this.data[this.getIndexAt(x, y)]
  }
  setAt(x: number, y: number, v: Color) {
    const i = this.getIndexAt(x, y)
    this.data[i] = v
    const [coordX, coordY] = this.getCoordAt(x, y)
    const pixelSize = this.canvas.width / this.size
    this.ctx.fillStyle = i2color[v]
    this.ctx.fillRect(coordX * pixelSize, coordY * pixelSize, pixelSize, pixelSize)
  }
}
class Cube {
  front: Face
  right: Face
  left: Face
  back: Face
  top: Face
  bottom: Face
  constructor(canvases: HTMLCanvasElement[], size: number) {
    this.front = new Face(canvases[0], size, Color.R)
    this.right = new Face(canvases[1], size, Color.G)
    this.left = new Face(canvases[2], size, Color.B)
    this.back = new Face(canvases[3], size, Color.O)
    this.top = new Face(canvases[4], size, Color.Y)
    this.bottom = new Face(canvases[5], size, Color.W)
  }
}
const front = ref<HTMLCanvasElement>()
const right = ref<HTMLCanvasElement>()
const left = ref<HTMLCanvasElement>()
const back = ref<HTMLCanvasElement>()
const top = ref<HTMLCanvasElement>()
const bottom = ref<HTMLCanvasElement>()
onMounted(() => {
  const cube = new Cube([front.value!, right.value!, left.value!, back.value!, top.value!, bottom.value!], 5)
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
  transform: rotateX(calc(var(--rotX) * 1deg)) rotateY(calc(var(--rotY) * 1deg)) translateX(-25vmin) translateY(-25vmin)
}

.face {
  position: absolute;
  top: 0;
  left: 0;
  width: 50vmin;
  height: 50vmin;
  border: .15rem black solid;
}

.base {
  transform: rotateX(calc(90deg * var(--i))) translateZ(25vmin);
}

.side {
  transform: rotateY(calc(90deg * var(--i))) translateZ(25vmin);
}
</style>
<style lang="scss">
html,
body,
body>:first-child {
  height: 100%
}
</style>