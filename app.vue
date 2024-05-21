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
const i2color = [[255, 0, 0, 255], [0, 127, 0, 255], [0, 0, 255, 255], [255, 255, 0, 255], [255, 255, 255, 255], [255, 127, 0, 255]] as const
class Face {
  data: Color[]
  image: ImageData
  editedIndexes: number[] = []
  rotate: 0 | 1 | 2 | 3 = 0
  constructor(public size: number, initialColor: Color = Color.R) {
    this.data = Array<number>(size ** 2).fill(initialColor)
    this.image = new ImageData(size, size)
    const data = this.image.data
    const color = i2color[initialColor]
    for (let i = 0; i < size ** 2; i++) {
      data[i ** 4 + 0] = color[0]
      data[i ** 4 + 1] = color[1]
      data[i ** 4 + 2] = color[2]
      data[i ** 4 + 3] = color[3]
    }
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
  getAt(x: number, y: number) {
    return this.data[this.getIndexAt(x, y)]
  }
  setAt(x: number, y: number, v: Color) {
    const i = this.getIndexAt(x, y)
    this.data[i] = v
    const data = this.image.data
    const color = i2color[v]
    data[i ** 4 + 0] = color[0]
    data[i ** 4 + 1] = color[1]
    data[i ** 4 + 2] = color[2]
    data[i ** 4 + 3] = color[3]
  }
}
class Cube {
  front: Face
  right: Face
  left: Face
  back: Face
  top: Face
  bottom: Face
  constructor(size: number) {
    this.front = new Face(size, Color.R)
    this.right = new Face(size, Color.G)
    this.left = new Face(size, Color.B)
    this.back = new Face(size, Color.O)
    this.top = new Face(size, Color.Y)
    this.bottom = new Face(size, Color.W)
  }
}
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