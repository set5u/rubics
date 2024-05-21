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
      .bg-gray-400.face.split.x0(v-show="x0Show")
      .bg-gray-400.face.split.x1(v-show="x1Show")
      .bg-gray-400.face.split.y0(v-show="y0Show")
      .bg-gray-400.face.split.y1(v-show="y1Show")
      .bg-gray-400.face.split.z0(v-show="z0Show")
      .bg-gray-400.face.split.z1(v-show="z1Show")
      canvas.face(ref="topSplit0")
      canvas.face(ref="topSplit1")
      canvas.face(ref="topSplit2")
      canvas.face(ref="bottomSplit0")
      canvas.face(ref="bottomSplit1")
      canvas.face(ref="bottomSplit2")
      canvas.face(ref="frontSplit0")
      canvas.face(ref="frontSplit1")
      canvas.face(ref="frontSplit2")
      canvas.face(ref="rightSplit0")
      canvas.face(ref="rightSplit1")
      canvas.face(ref="rightSplit2")
      canvas.face(ref="backSplit0")
      canvas.face(ref="backSplit1")
      canvas.face(ref="backSplit2")
      canvas.face(ref="leftSplit0")
      canvas.face(ref="leftSplit1")
      canvas.face(ref="leftSplit2")

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
const i2color = ["red", "lime", "blue", "yellow", "white", "orange"] as const
class Face {
  data: Color[]
  editedIndexes: number[] = []
  rotate: 0 | 1 | 2 | 3 = 0
  ctx: CanvasRenderingContext2D
  constructor(public canvas: HTMLCanvasElement, public splits: HTMLCanvasElement[], public size: number, initialColor: Color) {
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
  constructor(canvases: HTMLCanvasElement[], splits: HTMLCanvasElement[], size: number) {
    canvases.forEach((c) => { c.width = Math.max(size, 1024); c.height = Math.max(size, 1024) })
    this.front = new Face(canvases[0], splits.slice(0, 3), size, Color.R)
    this.right = new Face(canvases[1], splits.slice(3, 6), size, Color.G)
    this.left = new Face(canvases[2], splits.slice(6, 9), size, Color.B)
    this.back = new Face(canvases[3], splits.slice(9, 12), size, Color.O)
    this.top = new Face(canvases[4], splits.slice(12, 15), size, Color.Y)
    this.bottom = new Face(canvases[5], splits.slice(15, 18), size, Color.W)
  }
}
const front = ref<HTMLCanvasElement>()
const right = ref<HTMLCanvasElement>()
const left = ref<HTMLCanvasElement>()
const back = ref<HTMLCanvasElement>()
const top = ref<HTMLCanvasElement>()
const bottom = ref<HTMLCanvasElement>()

const x0Offset = ref(0)
const x1Offset = ref(0)
const y0Offset = ref(0)
const y1Offset = ref(0)
const z0Offset = ref(0)
const z1Offset = ref(0)
const x0OffsetVMmin = computed(() => x0Offset.value * 25 + "vmin")
const x1OffsetVMmin = computed(() => x1Offset.value * 25 + "vmin")
const y0OffsetVMmin = computed(() => y0Offset.value * 25 + "vmin")
const y1OffsetVMmin = computed(() => y1Offset.value * 25 + "vmin")
const z0OffsetVMmin = computed(() => z0Offset.value * 25 + "vmin")
const z1OffsetVMmin = computed(() => z1Offset.value * 25 + "vmin")
const x0Show = ref(false)
const x1Show = ref(false)
const y0Show = ref(false)
const y1Show = ref(false)
const z0Show = ref(false)
const z1Show = ref(false)

const topSplit0 = ref<HTMLCanvasElement>()
const topSplit1 = ref<HTMLCanvasElement>()
const topSplit2 = ref<HTMLCanvasElement>()
const bottomSplit0 = ref<HTMLCanvasElement>()
const bottomSplit1 = ref<HTMLCanvasElement>()
const bottomSplit2 = ref<HTMLCanvasElement>()
const frontSplit0 = ref<HTMLCanvasElement>()
const frontSplit1 = ref<HTMLCanvasElement>()
const frontSplit2 = ref<HTMLCanvasElement>()
const rightSplit0 = ref<HTMLCanvasElement>()
const rightSplit1 = ref<HTMLCanvasElement>()
const rightSplit2 = ref<HTMLCanvasElement>()
const backSplit0 = ref<HTMLCanvasElement>()
const backSplit1 = ref<HTMLCanvasElement>()
const backSplit2 = ref<HTMLCanvasElement>()
const leftSplit0 = ref<HTMLCanvasElement>()
const leftSplit1 = ref<HTMLCanvasElement>()
const leftSplit2 = ref<HTMLCanvasElement>()
onMounted(() => {
  const cube = new Cube([front.value!, right.value!, left.value!, back.value!, top.value!, bottom.value!,], [
    topSplit0.value!,
    topSplit1.value!,
    topSplit2.value!,
    bottomSplit0.value!,
    bottomSplit1.value!,
    bottomSplit2.value!,
    frontSplit0.value!,
    frontSplit1.value!,
    frontSplit2.value!,
    rightSplit0.value!,
    rightSplit1.value!,
    rightSplit2.value!,
    backSplit0.value!,
    backSplit1.value!,
    backSplit2.value!,
    leftSplit0.value!,
    leftSplit1.value!,
    leftSplit2.value!,
  ], 5)
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

.x0 {
  transform: rotateY(calc(90deg * 0)) translateZ(v-bind(x0OffsetVMmin));
}

.x1 {
  transform: rotateY(calc(90deg * 2)) translateZ(v-bind(x1OffsetVMmin));
}

.y0 {
  transform: rotateX(calc(90deg * 1)) translateZ(v-bind(y0OffsetVMmin));
}

.y1 {
  transform: rotateX(calc(90deg *3)) translateZ(v-bind(y1OffsetVMmin));
}

.z0 {
  transform: rotateY(calc(90deg * 1)) translateZ(v-bind(z0OffsetVMmin));
}

.z1 {
  transform: rotateY(calc(90deg * 3)) translateZ(v-bind(z1OffsetVMmin));
}
</style>
<style lang="scss">
html,
body,
body>:first-child {
  height: 100%
}
</style>