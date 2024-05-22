<template lang="pug">
.h-full
  .hidden
    canvas(ref="top")
    canvas(ref="bottom")
    canvas(ref="front")
    canvas(ref="right")
    canvas(ref="back")
    canvas(ref="left")
  .h-full.flex.justify-center.items-center.scene.overflow-hidden(
    @mousedown.self.capture="lock",
    @mouseup.self="unlock"
  )
    .cube
      .bg-gray-400.face.splitter.x0(v-show="xShow")
      .bg-gray-400.face.splitter.x1(v-show="xShow")
      .bg-gray-400.face.splitter.y0(v-show="yShow")
      .bg-gray-400.face.splitter.y1(v-show="yShow")
      .bg-gray-400.face.splitter.z0(v-show="zShow")
      .bg-gray-400.face.splitter.z1(v-show="zShow")
      .face.base(style="--i: 1"): .top.frame
        canvas.split.top0(ref="topSplit0")
        canvas.split.middle.top1(ref="topSplit1")
        canvas.split.top2(ref="topSplit2")
      .face.base(style="--i: -1"): .bottom.frame
        canvas.split.bottom0(ref="bottomSplit0")
        canvas.split.middle.bottom1(ref="bottomSplit1")
        canvas.split.bottom2(ref="bottomSplit2")
      .face.side(style="--i: 0"): .front.frame
        canvas.split.front0(ref="frontSplit0")
        canvas.split.middle.front1(ref="frontSplit1")
        canvas.split.front2(ref="frontSplit2")
      .face.side(style="--i: 1"): .right.frame
        canvas.split.right0(ref="rightSplit0")
        canvas.split.middle.right1(ref="rightSplit1")
        canvas.split.right2(ref="rightSplit2")
      .face.side(style="--i: 2"): .back.frame
        canvas.split.back0(ref="backSplit0")
        canvas.split.middle.back1(ref="backSplit1")
        canvas.split.back2(ref="backSplit2")
      .face.side(style="--i: 3"): .left.frame
        canvas.split.left0(ref="leftSplit0")
        canvas.split.middle.left1(ref="leftSplit1")
        canvas.split.left2(ref="leftSplit2")
</template>
<script setup lang="ts">
const { x, y } = useMouse({ type: "movement" });
const rotY = ref(45);
const rotX = ref(-45);
const { lock, unlock, element } = usePointerLock();
watch([x, y], ([x, y]) => {
  if (!element.value) return;
  rotY.value += x / 2;
  rotX.value -= y / 2;
});
enum Color {
  R,
  G,
  B,
  Y,
  W,
  O,
}
const i2color = ["red", "lime", "blue", "yellow", "white", "orange"] as const;
class Face {
  data: Color[];
  editedIndexes: number[] = [];
  rotate: Ref<0 | 1 | 2 | 3> = ref(0);
  ctx: CanvasRenderingContext2D;
  constructor(
    public canvas: HTMLCanvasElement,
    public splits: HTMLCanvasElement[],
    public size: number,
    initialColor: Color,
  ) {
    this.data = Array<number>(size ** 2).fill(initialColor);
    this.ctx = canvas.getContext("2d")!;
    this.ctx.fillStyle = i2color[initialColor];
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.render(1, 1, 0);
  }
  getIndexAt(x: number, y: number) {
    switch (this.rotate.value) {
      case 0:
        return x + this.size * y;
      case 1:
        return y + this.size * (this.size - x - 1);
      case 2:
        return this.size - x - 1 + this.size * (this.size - y - 1);
      case 3:
        return this.size - y - 1 + this.size * x;
    }
  }
  getCoordAt(x: number, y: number) {
    switch (this.rotate.value) {
      case 0:
        return [x, y];
      case 1:
        return [y, this.size - x - 1];
      case 2:
        return [this.size - x - 1, this.size - y - 1];
      case 3:
        return [this.size - y - 1, x];
    }
  }
  getAt(x: number, y: number) {
    return this.data[this.getIndexAt(x, y)];
  }
  setAt(x: number, y: number, v: Color) {
    const i = this.getIndexAt(x, y);
    this.data[i] = v;
    const [coordX, coordY] = this.getCoordAt(x, y);
    const pixelSize = this.canvas.width / this.size;
    this.ctx.fillStyle = i2color[v];
    this.ctx.fillRect(
      coordX * pixelSize,
      coordY * pixelSize,
      pixelSize,
      pixelSize,
    );
  }
  render(offset0: number, offset1: number, axis: 0 | 1) {
    const rotate = (this.rotate.value + axis) % 4;
    const pos0 = axis ? offset0 * 0.5 + 0.5 : -offset1 * 0.5 + 0.5;
    const pos1 = axis ? -offset1 * 0.5 + 0.5 : offset0 * 0.5 + 0.5;
    const w = this.canvas.width;
    const w0 = w * pos0;
    const w1 = w * pos1;
    const m = Math.abs(w0 - w1);
    const iw1 = w - w1;
    if (rotate === 0 || rotate === 2) {
      this.splits[0].width = w0;
      this.splits[1].width = m;
      this.splits[2].width = iw1;
      this.splits[0].height = w;
      this.splits[1].height = w;
      this.splits[2].height = w;
      const ctx0 = this.splits[0].getContext("2d")!;
      const ctx1 = this.splits[1].getContext("2d")!;
      const ctx2 = this.splits[2].getContext("2d")!;
      ctx0.drawImage(this.canvas, 0, 0, w0, w, 0, 0, w0, w);
      ctx1.drawImage(this.canvas, w0, 0, m, w, 0, 0, m, w);
      ctx2.drawImage(this.canvas, w1, 0, iw1, w, 0, 0, iw1, w);
    } else {
      this.splits[0].width = w;
      this.splits[1].width = w;
      this.splits[2].width = w;
      this.splits[0].height = w0;
      this.splits[1].height = m;
      this.splits[2].height = iw1;
      const ctx0 = this.splits[0].getContext("2d")!;
      const ctx1 = this.splits[1].getContext("2d")!;
      const ctx2 = this.splits[2].getContext("2d")!;
      ctx0.drawImage(this.canvas, 0, 0, w, w0, 0, 0, w, w0);
      ctx1.drawImage(this.canvas, 0, w0, w, m, 0, 0, w, m);
      ctx2.drawImage(this.canvas, 0, w1, w, iw1, 0, 0, w, iw1);
    }
  }
}
class Cube {
  front: Face;
  right: Face;
  left: Face;
  back: Face;
  top: Face;
  bottom: Face;
  animationSpeed = 1;
  constructor(
    canvases: HTMLCanvasElement[],
    splits: HTMLCanvasElement[],
    public animParams: {
      x0Offset: Ref<number>;
      x1Offset: Ref<number>;
      y0Offset: Ref<number>;
      y1Offset: Ref<number>;
      z0Offset: Ref<number>;
      z1Offset: Ref<number>;
      rotAxis: Ref<0 | 1 | 2 | 3>;
      xRot: Ref<number>;
      yRot: Ref<number>;
      zRot: Ref<number>;
    },
    public size: number,
  ) {
    canvases.forEach((c) => {
      c.width = Math.max(size, 1024);
      c.height = Math.max(size, 1024);
    });
    this.front = new Face(canvases[0], splits.slice(0, 3), size, Color.R);
    this.right = new Face(canvases[1], splits.slice(3, 6), size, Color.G);
    this.left = new Face(canvases[2], splits.slice(6, 9), size, Color.B);
    this.back = new Face(canvases[3], splits.slice(9, 12), size, Color.O);
    this.top = new Face(canvases[4], splits.slice(12, 15), size, Color.Y);
    this.bottom = new Face(canvases[5], splits.slice(15, 18), size, Color.W);
  }
  rotate(axis: 0 | 1 | 2, start: number, end: number, amount: number) {
    if (this.animationSpeed) {
      const offset0 = (end / this.size) * 2 - 1;
      const offset1 = (start / this.size) * -2 + 1;
      switch (axis) {
        case 0:
          this.animParams.x0Offset.value = offset0;
          this.animParams.x1Offset.value = offset1;
          this.front.render(1, 1, 0);
          this.right.render(offset0, offset1, 0);
          this.left.render(offset0, offset1, 0);
          this.back.render(1, 1, 0);
          this.top.render(offset0, offset1, 0);
          this.bottom.render(offset0, offset1, 0);
      }
    }
  }
}
const front = ref<HTMLCanvasElement>();
const right = ref<HTMLCanvasElement>();
const left = ref<HTMLCanvasElement>();
const back = ref<HTMLCanvasElement>();
const top = ref<HTMLCanvasElement>();
const bottom = ref<HTMLCanvasElement>();

const x0Offset = ref(1);
const x1Offset = ref(1);
const y0Offset = ref(1);
const y1Offset = ref(1);
const z0Offset = ref(1);
const z1Offset = ref(1);
const x0OffsetVMmin = computed(() => (x0Offset.value - 0.001) * 25 + "vmin");
const x1OffsetVMmin = computed(() => (x1Offset.value - 0.001) * 25 + "vmin");
const y0OffsetVMmin = computed(() => (y0Offset.value - 0.001) * 25 + "vmin");
const y1OffsetVMmin = computed(() => (y1Offset.value - 0.001) * 25 + "vmin");
const z0OffsetVMmin = computed(() => (z0Offset.value - 0.001) * 25 + "vmin");
const z1OffsetVMmin = computed(() => (z1Offset.value - 0.001) * 25 + "vmin");
const rotAxis: Ref<0 | 1 | 2 | 3> = ref(0);
const xShow = computed(() => rotAxis.value === 1);
const yShow = computed(() => rotAxis.value === 2);
const zShow = computed(() => rotAxis.value === 3);
const xRot = ref(0);
const yRot = ref(0);
const zRot = ref(0);
const xRotDeg = computed(() => xRot.value + "deg");
const yRotDeg = computed(() => yRot.value + "deg");
const zRotDeg = computed(() => zRot.value + "deg");
const xRotDegMinus = computed(() => -xRot.value + "deg");
const yRotDegMinus = computed(() => -yRot.value + "deg");
const zRotDegMinus = computed(() => -zRot.value + "deg");
const topZRot = computed(() =>
  y1Offset.value === 1 ? yRot.value + "deg" : "0deg",
);
const bottomZRot = computed(() =>
  y0Offset.value === 1 ? -yRot.value + "deg" : "0deg",
);
const frontZRot = computed(() =>
  x1Offset.value === 1 ? xRot.value + "deg" : "0deg",
);
const rightZRot = computed(() =>
  z1Offset.value === 1 ? zRot.value + "deg" : "0deg",
);
const backZRot = computed(() =>
  x0Offset.value === 1 ? -xRot.value + "deg" : "0deg",
);
const leftZRot = computed(() =>
  z0Offset.value === 1 ? -zRot.value + "deg" : "0deg",
);
const topTop = computed(() => (1 - x1Offset.value) * 25 + "vmin");
const topBottom = computed(() => (1 - x0Offset.value) * 25 + "vmin");
const topLeft = computed(() => (1 - z1Offset.value) * 25 + "vmin");
const topRight = computed(() => (1 - z0Offset.value) * 25 + "vmin");
const topWidth = computed(
  () => (z0Offset.value + z1Offset.value) * 25 + "vmin",
);
const topHeight = computed(
  () => (x0Offset.value + x1Offset.value) * 25 + "vmin",
);
const frontTop = computed(() => (1 - y0Offset.value) * 25 + "vmin");
const frontBottom = computed(() => (1 - y1Offset.value) * 25 + "vmin");
const frontLeft = computed(() => (1 - z1Offset.value) * 25 + "vmin");
const frontRight = computed(() => (1 - z0Offset.value) * 25 + "vmin");
const frontWidth = computed(
  () => (z0Offset.value + z1Offset.value) * 25 + "vmin",
);
const frontHeight = computed(
  () => (y0Offset.value + y1Offset.value) * 25 + "vmin",
);
const rightTop = computed(() => (1 - y0Offset.value) * 25 + "vmin");
const rightBottom = computed(() => (1 - y1Offset.value) * 25 + "vmin");
const rightLeft = computed(() => (1 - x0Offset.value) * 25 + "vmin");
const rightRight = computed(() => (1 - x1Offset.value) * 25 + "vmin");
const rightWidth = computed(
  () => (x0Offset.value + x1Offset.value) * 25 + "vmin",
);
const rightHeight = computed(
  () => (y0Offset.value + y1Offset.value) * 25 + "vmin",
);
const topRotOffset = computed(
  () => (y1Offset.value - y0Offset.value) * 12.5 + "vmin",
);
const bottomRotOffset = computed(
  () => (y0Offset.value - y1Offset.value) * 12.5 + "vmin",
);
const rightRotOffset = computed(
  () => (z0Offset.value - z1Offset.value) * 12.5 + "vmin",
);
const leftRotOffset = computed(
  () => (z1Offset.value - z0Offset.value) * 12.5 + "vmin",
);
const frontRotOffset = computed(
  () => (x0Offset.value - x1Offset.value) * 12.5 + "vmin",
);
const backRotOffset = computed(
  () => (x1Offset.value - x0Offset.value) * 12.5 + "vmin",
);
const topSplit0 = ref<HTMLCanvasElement>();
const topSplit1 = ref<HTMLCanvasElement>();
const topSplit2 = ref<HTMLCanvasElement>();
const bottomSplit0 = ref<HTMLCanvasElement>();
const bottomSplit1 = ref<HTMLCanvasElement>();
const bottomSplit2 = ref<HTMLCanvasElement>();
const frontSplit0 = ref<HTMLCanvasElement>();
const frontSplit1 = ref<HTMLCanvasElement>();
const frontSplit2 = ref<HTMLCanvasElement>();
const rightSplit0 = ref<HTMLCanvasElement>();
const rightSplit1 = ref<HTMLCanvasElement>();
const rightSplit2 = ref<HTMLCanvasElement>();
const backSplit0 = ref<HTMLCanvasElement>();
const backSplit1 = ref<HTMLCanvasElement>();
const backSplit2 = ref<HTMLCanvasElement>();
const leftSplit0 = ref<HTMLCanvasElement>();
const leftSplit1 = ref<HTMLCanvasElement>();
const leftSplit2 = ref<HTMLCanvasElement>();
let cubeRef = shallowRef<Cube>();
let topRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
let bottomRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
let frontRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
let rightRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
let backRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
let leftRotate = computed(
  () => (cubeRef.value?.top.rotate.value || 0) * 90 + "deg",
);
onMounted(() => {
  const cube = new Cube(
    [
      front.value!,
      right.value!,
      left.value!,
      back.value!,
      top.value!,
      bottom.value!,
    ],
    [
      frontSplit0.value!,
      frontSplit1.value!,
      frontSplit2.value!,
      rightSplit0.value!,
      rightSplit1.value!,
      rightSplit2.value!,
      leftSplit0.value!,
      leftSplit1.value!,
      leftSplit2.value!,
      backSplit0.value!,
      backSplit1.value!,
      backSplit2.value!,
      topSplit0.value!,
      topSplit1.value!,
      topSplit2.value!,
      bottomSplit0.value!,
      bottomSplit1.value!,
      bottomSplit2.value!,
    ],
    {
      x0Offset,
      x1Offset,
      y0Offset,
      y1Offset,
      z0Offset,
      z1Offset,
      rotAxis,
      xRot,
      yRot,
      zRot,
    },
    5,
  );
  cubeRef.value = cube;
  cube.rotate(0, 1, 3, 1);
});
</script>
<style scoped lang="scss">
.scene {
  perspective: 100vmin;
}

.cube {
  transform-style: preserve-3d;
  --rotY: v-bind(rotY);
  --rotX: v-bind(rotX);
  transform: rotateX(calc(var(--rotX) * 1deg)) rotateY(calc(var(--rotY) * 1deg))
    translateX(-25vmin) translateY(-25vmin);
}

.face {
  position: absolute;
  transform-style: preserve-3d;
  top: 0;
  left: 0;
  width: 50vmin;
  height: 50vmin;
}

.base {
  transform: rotateX(calc(90deg * var(--i))) translateZ(25vmin);
}

.side {
  transform: rotateY(calc(90deg * var(--i))) translateZ(25vmin);
}

.x0 {
  transform: rotateY(calc(90deg * 0)) translateZ(v-bind(x0OffsetVMmin))
    rotate(v-bind(xRotDeg));
}

.x1 {
  transform: rotateY(calc(90deg * 2)) translateZ(v-bind(x1OffsetVMmin))
    rotate(v-bind(xRotDegMinus));
}

.y0 {
  transform: rotateX(calc(90deg * 1)) translateZ(v-bind(y0OffsetVMmin))
    rotate(v-bind(yRotDeg));
}

.y1 {
  transform: rotateX(calc(90deg * 3)) translateZ(v-bind(y1OffsetVMmin))
    rotate(v-bind(yRotDegMinus));
}

.z0 {
  transform: rotateY(calc(90deg * 1)) translateZ(v-bind(z0OffsetVMmin))
    rotate(v-bind(zRotDeg));
}

.z1 {
  transform: rotateY(calc(90deg * 3)) translateZ(v-bind(z1OffsetVMmin))
    rotate(v-bind(zRotDegMinus));
}

.split {
  position: absolute;
}

.middle {
  border: 0.15rem black solid;
}

.frame {
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
}

.top {
  transform: rotate(v-bind(topRotate)) rotate(v-bind(topZRot));
}

.top0 {
  top: 0;
  left: 0;
  width: v-bind(topLeft);
  height: v-bind(topTop);
}

.top1 {
  top: v-bind(topTop);
  left: v-bind(topLeft);
  width: v-bind(topWidth);
  height: v-bind(topHeight);
  transform: translate3d(v-bind(leftRotOffset), v-bind(backRotOffset), -25vmin)
    rotateY(v-bind(xRotDeg)) rotateX(v-bind(zRotDeg))
    translate3d(v-bind(rightRotOffset), v-bind(frontRotOffset), 25vmin);
}

.top2 {
  bottom: 0;
  right: 0;
  width: v-bind(topRight);
  height: v-bind(topBottom);
}

.bottom {
  transform: rotate(v-bind(bottomRotate)) rotate(v-bind(bottomZRot));
}

.bottom0 {
  bottom: 0;
  left: 0;
  width: v-bind(topLeft);
  height: v-bind(topTop);
}

.bottom1 {
  bottom: v-bind(topTop);
  left: v-bind(topLeft);
  width: v-bind(topWidth);
  height: v-bind(topHeight);
  transform: translate3d(v-bind(leftRotOffset), v-bind(frontRotOffset), -25vmin)
    rotateY(v-bind(xRotDegMinus)) rotateX(v-bind(zRotDeg))
    translate3d(v-bind(rightRotOffset), v-bind(backRotOffset), 25vmin);
}

.bottom2 {
  top: 0;
  right: 0;
  width: v-bind(topRight);
  height: v-bind(topBottom);
}

.front {
  transform: rotate(v-bind(frontRotate)) rotate(v-bind(frontZRot));
}

.front0 {
  top: 0;
  left: 0;
  width: v-bind(frontLeft);
  height: v-bind(frontTop);
}

.front1 {
  top: v-bind(frontTop);
  left: v-bind(frontLeft);
  width: v-bind(frontWidth);
  height: v-bind(frontHeight);
  transform: translate3d(
      v-bind(leftRotOffset),
      v-bind(bottomRotOffset),
      -25vmin
    )
    rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(zRotDeg))
    translate3d(v-bind(rightRotOffset), v-bind(topRotOffset), 25vmin);
}

.front2 {
  bottom: 0;
  right: 0;
  width: v-bind(frontRight);
  height: v-bind(frontBottom);
}

.right {
  transform: rotate(v-bind(rightRotate)) rotate(v-bind(rightZRot));
}

.right0 {
  top: 0;
  left: 0;
  width: v-bind(rightLeft);
  height: v-bind(rightTop);
}

.right1 {
  top: v-bind(rightTop);
  left: v-bind(rightLeft);
  width: v-bind(rightWidth);
  height: v-bind(rightHeight);
  transform: translate3d(
      v-bind(frontRotOffset),
      v-bind(bottomRotOffset),
      -25vmin
    )
    rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(xRotDegMinus))
    translate3d(v-bind(backRotOffset), v-bind(topRotOffset), 25vmin);
}

.right2 {
  bottom: 0;
  right: 0;
  width: v-bind(rightRight);
  height: v-bind(rightBottom);
}

.back {
  transform: rotate(v-bind(backRotate)) rotate(v-bind(backZRot));
}

.back0 {
  top: 0;
  right: 0;
  width: v-bind(frontLeft);
  height: v-bind(frontTop);
}

.back1 {
  top: v-bind(frontTop);
  right: v-bind(frontLeft);
  width: v-bind(frontWidth);
  height: v-bind(frontHeight);
  transform: translate3d(
      v-bind(rightRotOffset),
      v-bind(bottomRotOffset),
      -25vmin
    )
    rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(zRotDegMinus))
    translate3d(v-bind(leftRotOffset), v-bind(topRotOffset), 25vmin);
}

.back2 {
  bottom: 0;
  left: 0;
  width: v-bind(frontRight);
  height: v-bind(frontBottom);
}

.left {
  transform: rotate(v-bind(leftRotate)) rotate(v-bind(leftZRot));
}

.left0 {
  top: 0;
  right: 0;
  width: v-bind(rightLeft);
  height: v-bind(rightTop);
}

.left1 {
  top: v-bind(rightTop);
  right: v-bind(rightLeft);
  width: v-bind(rightWidth);
  height: v-bind(rightHeight);
  transform: translate3d(
      v-bind(backRotOffset),
      v-bind(bottomRotOffset),
      -25vmin
    )
    rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(xRotDeg))
    translate3d(v-bind(frontRotOffset), v-bind(topRotOffset), 25vmin);
}

.left2 {
  bottom: 0;
  left: 0;
  width: v-bind(rightRight);
  height: v-bind(rightBottom);
}
</style>
<style lang="scss">
html,
body,
body > :first-child {
  height: 100%;
  background-color: #555;
}
</style>
