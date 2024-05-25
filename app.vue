<template lang="pug">
.h-full
  .hidden
    canvas(ref="top")
    canvas(ref="bottom")
    canvas(ref="front")
    canvas(ref="right")
    canvas(ref="back")
    canvas(ref="left")
  .h-full.flex.justify-center.items-center.scene.overflow-hidden
    .cube(@mousedown.capture="lock" @mouseup="unlock")
      .bg-gray-400.border-2.border-black.face.splitter.x0(v-show="xShow")
      .bg-gray-400.border-2.border-black.face.splitter.x1(v-show="xShow")
      .bg-gray-400.border-2.border-black.face.splitter.y0(v-show="yShow")
      .bg-gray-400.border-2.border-black.face.splitter.y1(v-show="yShow")
      .bg-gray-400.border-2.border-black.face.splitter.z0(v-show="zShow")
      .bg-gray-400.border-2.border-black.face.splitter.z1(v-show="zShow")
      .bg-gray-400.border-2.border-black.face.splitter.ix0(
        v-show="xShow && x0Offset !== 1"
      )
      .bg-gray-400.border-2.border-black.face.splitter.ix1(
        v-show="xShow && x1Offset !== 1"
      )
      .bg-gray-400.border-2.border-black.face.splitter.iy0(
        v-show="yShow && y0Offset !== 1"
      )
      .bg-gray-400.border-2.border-black.face.splitter.iy1(
        v-show="yShow && y1Offset !== 1"
      )
      .bg-gray-400.border-2.border-black.face.splitter.iz0(
        v-show="zShow && z0Offset !== 1"
      )
      .bg-gray-400.border-2.border-black.face.splitter.iz1(
        v-show="zShow && z1Offset !== 1"
      )
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
  input.fixed.top-0(v-model="animationSpeed" type="range" min="0" max="10")
  div.fixed.top-0.right-0
    input(v-model="rotY" type="range" min="-180" max="180")
    input(v-model="rotX" type="range" min="-90" max="90")
</template>
<script setup lang="ts">
const { lock, unlock, element } = usePointerLock()
const { x, y } = useMouse({ type: 'movement' })
const rotY = ref(-45);
const rotX = ref(-45);
watch([x, y], ([x, y]) => {
  if (!element.value)
    return
  rotY.value += x / 2
  rotX.value -= y / 2
})
enum Color {
  R = "R",
  G = "G",
  B = "B",
  Y = "Y",
  W = "W",
  O = "O",
}
const i2color = {
  R: "red",
  G: "lime",
  B: "blue",
  Y: "yellow",
  W: "white",
  O: "orange",
} as const;
class Face {
  data: Color[];
  editedIndexes: number[] = [];
  ctx: CanvasRenderingContext2D;
  ocanvas: HTMLCanvasElement;
  octx: CanvasRenderingContext2D;
  rot: 0 | 1 | 2 | 3 = 0;
  constructor(
    public canvas: HTMLCanvasElement,
    public splits: HTMLCanvasElement[],
    public size: number,
    initialColor: Color,
  ) {
    this.data = Array<Color>(size ** 2).fill(initialColor);
    this.ctx = canvas.getContext("2d")!;
    this.ctx.fillStyle = i2color[initialColor];
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.ocanvas = document.createElement("canvas");
    this.octx = this.ocanvas.getContext("2d")!;
    this.render(1, 1, 0);
  }
  forceRender() {
    const pixelSize = this.canvas.width / this.size;
    for (let coordX = 0; coordX < this.size; coordX++) {
      for (let coordY = 0; coordY < this.size; coordY++) {
        this.ctx.fillStyle = i2color[this.data[coordX + coordY * this.size]];
        this.ctx.fillRect(
          coordX * pixelSize,
          coordY * pixelSize,
          pixelSize,
          pixelSize,
        );
      }
    }
  }
  getIndexAt(x: number, y: number) {
    if (x < 0) {
      x = this.size + x;
    }
    if (y < 0) {
      y = this.size + y;
    }
    switch (this.rot) {
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
  getAt(x: number, y: number) {
    return this.data[this.getIndexAt(x, y)];
  }
  setAt(x: number, y: number, v: Color) {
    const i = this.getIndexAt(x, y);
    this.data[i] = v;
    const pixelSize = this.canvas.width / this.size;
    this.ctx.fillStyle = i2color[v];
    this.ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
  }
  rotate(amount: 1 | 2 | 3) {
    this.rot = ((this.rot + amount) % 4) as 0 | 1 | 2 | 3;
    this.octx.save();
    this.octx.translate(this.canvas.width / 2, this.canvas.height / 2);
    this.octx.rotate(Math.PI * 0.5 * amount);
    this.octx.drawImage(
      this.canvas,
      -this.canvas.width / 2,
      -this.canvas.height / 2,
    );
    this.octx.restore();
    this.ctx.drawImage(this.ocanvas, 0, 0);
  }
  render(offset0: number, offset1: number, axis: 0 | 1, inv = false) {
    const h = this.size;
    const w0 = Math.floor(Math.abs((1 - offset0 + 0.001) * 0.5 * this.size));
    const w2 = Math.floor(Math.abs((1 - offset1 + 0.001) * 0.5 * this.size));
    const w1 = this.size - w0 - w2;
    if (axis === 0) {
      this.splits[0].width = w0;
      this.splits[1].width = w1;
      this.splits[2].width = w2;
      this.splits[0].height = h;
      this.splits[1].height = h;
      this.splits[2].height = h;
      const ctx0 = this.splits[0].getContext("2d")!;
      const ctx1 = this.splits[1].getContext("2d")!;
      const ctx2 = this.splits[2].getContext("2d")!;
      if (inv) {
        ctx0.drawImage(this.canvas, 0, 0);
        ctx1.drawImage(this.canvas, -w0, 0);
        ctx2.drawImage(this.canvas, -(w0 + w1), 0);
      } else {
        ctx0.drawImage(this.canvas, -(w2 + w1), 0);
        ctx1.drawImage(this.canvas, -w2, 0);
        ctx2.drawImage(this.canvas, 0, 0);
      }
    } else {
      this.splits[2].width = h;
      this.splits[1].width = h;
      this.splits[0].width = h;
      this.splits[2].height = w0;
      this.splits[1].height = w1;
      this.splits[0].height = w2;
      const ctx0 = this.splits[0].getContext("2d")!;
      const ctx1 = this.splits[1].getContext("2d")!;
      const ctx2 = this.splits[2].getContext("2d")!;
      if (inv) {
        ctx2.drawImage(this.canvas, 0, 0);
        ctx1.drawImage(this.canvas, 0, -w0);
        ctx0.drawImage(this.canvas, 0, -(w0 + w1));
      } else {
        ctx2.drawImage(this.canvas, 0, -(w2 + w1));
        ctx1.drawImage(this.canvas, 0, -w2);
        ctx0.drawImage(this.canvas, 0, 0);
      }
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
  animationSpeed = 1000;
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
      c.width = size;
      c.height = size;
    });
    this.front = new Face(canvases[0], splits.slice(0, 3), size, Color.R);
    this.right = new Face(canvases[1], splits.slice(3, 6), size, Color.G);
    this.left = new Face(canvases[2], splits.slice(6, 9), size, Color.B);
    this.back = new Face(canvases[3], splits.slice(9, 12), size, Color.O);
    this.top = new Face(canvases[4], splits.slice(12, 15), size, Color.Y);
    this.bottom = new Face(canvases[5], splits.slice(15, 18), size, Color.W);
  }
  async rotate(axis: 0 | 1 | 2, start: number, end: number, amount: 1 | 2 | 3) {
    let rotator: Ref<number | undefined> = ref(undefined);
    if (start < 0) {
      start = this.size + start;
    }
    if (end < 0) {
      end = this.size + end;
    }
    await new Promise<void>((resolve) => {
      const offset0 = ((end + 1) / this.size) * 2 - 1;
      const offset1 = (start / this.size) * -2 + 1;
      this.animParams.rotAxis.value = (axis + 1) as 1 | 2 | 3;
      switch (axis) {
        case 0:
          this.animParams.x0Offset.value = offset0;
          this.animParams.x1Offset.value = offset1;
          this.front.render(1, 1, 0);
          this.right.render(offset0, offset1, 0, true);
          this.left.render(offset0, offset1, 0);
          this.back.render(1, 1, 0);
          this.top.render(offset0, offset1, 1);
          this.bottom.render(offset0, offset1, 1, true);
          rotator = this.animParams.xRot;
          break;
        case 1:
          this.animParams.y0Offset.value = offset0;
          this.animParams.y1Offset.value = offset1;
          this.front.render(offset1, offset0, 1);
          this.right.render(offset1, offset0, 1);
          this.left.render(offset1, offset0, 1);
          this.back.render(offset1, offset0, 1);
          this.top.render(1, 1, 0);
          this.bottom.render(1, 1, 0);
          rotator = this.animParams.yRot;
          break;
        case 2:
          this.animParams.z0Offset.value = offset0;
          this.animParams.z1Offset.value = offset1;
          this.front.render(offset1, offset0, 0, true);
          this.right.render(1, 1, 0);
          this.left.render(1, 1, 0);
          this.back.render(offset1, offset0, 0);
          this.top.render(offset1, offset0, 0, true);
          this.bottom.render(offset1, offset0, 0, true);
          rotator = this.animParams.zRot;
      }
      let startTime = Date.now();
      const animTime = amount === 2 ? 2 : 1;
      const frame = () => {
        rotator.value =
          ((Date.now() - startTime) / this.animationSpeed) *
          90 *
          (amount === 3 ? -1 : 1);
        startTime + this.animationSpeed * animTime > Date.now()
          ? requestAnimationFrame(frame)
          : resolve();
      };
      frame();
    });
    rotator.value && (rotator.value = 0);
    this.animParams.x0Offset.value = 1;
    this.animParams.x1Offset.value = 1;
    this.animParams.y0Offset.value = 1;
    this.animParams.y1Offset.value = 1;
    this.animParams.z0Offset.value = 1;
    this.animParams.z1Offset.value = 1;
    this.animParams.rotAxis.value = 0
    if (start === 0) {
      [this.back, this.bottom, this.left][axis].rotate(
        (4 - amount) as 1 | 2 | 3,
      );
    }
    if (end === this.size - 1) {
      [this.front, this.top, this.right][axis].rotate(amount);
    }
    for (let j = start; j < end + 1; j++) {
      const elements: Color[][] = [
        () => {
          const ret: Color[][] = [[], [], [], []];
          for (let k = 0; k < this.size; k++) {
            ret[0][k] = this.top.getAt(k, j);
            ret[1][k] = this.right.getAt(this.size - j - 1, k);
            ret[2][k] = this.bottom.getAt(this.size - k - 1, this.size - j - 1);
            ret[3][k] = this.left.getAt(j, this.size - k - 1);
          }
          return ret;
        },
        () => {
          const ret: Color[][] = [[], [], [], []];
          for (let k = 0; k < this.size; k++) {
            ret[0][k] = this.front.getAt(k, this.size - j - 1);
            ret[1][k] = this.left.getAt(k, this.size - j - 1);
            ret[2][k] = this.back.getAt(k, this.size - j - 1);
            ret[3][k] = this.right.getAt(k, this.size - j - 1);
          }
          return ret;
        },
        () => {
          const ret: Color[][] = [[], [], [], []];
          for (let k = 0; k < this.size; k++) {
            ret[0][k] = this.front.getAt(j, k);
            ret[1][k] = this.top.getAt(j, k);
            ret[2][k] = this.back.getAt(this.size - j - 1, this.size - k - 1);
            ret[3][k] = this.bottom.getAt(j, k);
          }
          return ret;
        },
      ][axis]();
      for (let i = 0; i < amount; i++) {
        elements.unshift(elements.pop()!);
      }
      [
        () => {
          for (let k = 0; k < this.size; k++) {
            this.top.setAt(k, j, elements[0][k]);
            this.right.setAt(this.size - j - 1, k, elements[1][k]);
            this.bottom.setAt(
              this.size - k - 1,
              this.size - j - 1,
              elements[2][k],
            );
            this.left.setAt(j, this.size - k - 1, elements[3][k]);
          }
        },
        () => {
          for (let k = 0; k < this.size; k++) {
            this.front.setAt(k, this.size - j - 1, elements[0][k]);
            this.left.setAt(k, this.size - j - 1, elements[1][k]);
            this.back.setAt(k, this.size - j - 1, elements[2][k]);
            this.right.setAt(k, this.size - j - 1, elements[3][k]);
          }
        },
        () => {
          for (let k = 0; k < this.size; k++) {
            this.front.setAt(j, k, elements[0][k]);
            this.top.setAt(j, k, elements[1][k]);
            this.back.setAt(
              this.size - j - 1,
              this.size - k - 1,
              elements[2][k],
            );
            this.bottom.setAt(j, k, elements[3][k]);
          }
        },
      ][axis]();
    }
    this.front.render(1, 1, 0);
    this.right.render(1, 1, 0);
    this.left.render(1, 1, 0);
    this.back.render(1, 1, 0);
    this.top.render(1, 1, 0);
    this.bottom.render(1, 1, 0);
  }
}
enum SolveStep {
  BIG_WHITE_UP,
  FACE,
  BIG_EDGE,
  EDGE_PARITY,
  WHITE_UP,
  FLOWER,
  FLOWER_DOWN,
  DOWN_CORNER,
  EDGE,
  WHITE_X,
  WHITE_EDGE,
  YELLOW_UP,
  WHITE_DOWN,
  LAST_CORNER,
  LAST,
}
const whiteUp: Step[][] = [
  [],
  [[0, 0, -1, 2]],
  [[2, 0, -1, 1]],
  [[0, 0, -1, 3]],
  [[2, 0, -1, 3]],
  [[0, 0, -1, 1]],
];
const flower: Step[][] = [
  [[2, -1, -1, 1]],
  [[0, -1, -1, 1]],
  [[2, 0, 0, 1]],
  [[0, 0, 0, 1]],
  [
    [1, -1, -1, 3],
    [0, 0, 0, 3],
  ],
  [
    [1, -1, -1, 1],
    [0, -1, -1, 3],
  ],
  [[2, -1, -1, 1]],
  [
    [1, -1, -1, 2],
    [2, 0, 0, 1],
  ],
  [
    [1, -1, -1, 1],
    [0, -1, -1, 1],
  ],
  [
    [1, -1, -1, 3],
    [0, 0, 0, 1],
  ],
  [
    [1, -1, -1, 2],
    [2, 0, 0, 3],
  ],
  [[2, -1, -1, 3]],
  [[2, -1, -1, 1]],
  [
    [1, -1, -1, 1],
    [0, -1, -1, 1],
  ],
  [
    [1, -1, -1, 2],
    [2, 0, 0, 1],
  ],
  [
    [1, -1, -1, 3],
    [0, 0, 0, 1],
  ],
  [[2, -1, -1, 2]],
  [
    [1, -1, -1, 1],
    [0, -1, -1, 2],
  ],
  [
    [1, -1, -1, 2],
    [2, 0, 0, 2],
  ],
  [
    [1, -1, -1, 3],
    [0, 0, 0, 2],
  ],
];
const rightStep: Step[] = [[1, -1, -1, 1], [2, -1, -1, 1], [1, -1, -1, 3], [2, -1, -1, 3],]
const leftStep: Step[] = [[1, -1, -1, 3], [2, 0, 0, 1], [1, -1, -1, 1], [2, 0, 0, 3],]
const insertRightEdge: Step[] = [...rightStep, [1, 0, -1, 1], ...leftStep]
const insertLeftEdge: Step[] = [...leftStep, [1, 0, -1, 3], ...rightStep]
const whiteX: Step[] = [[0, -1, -1, 1], ...rightStep, [0, -1, -1, 3]]
const whiteX2: Step[] = [[0, -1, -1, 1], ...rightStep, ...rightStep, [0, -1, -1, 3]]
const whiteEdge: Step[] = [[1, -1, -1, 1], [2, -1, -1, 1], [1, -1, -1, 2], [2, -1, -1, 3], [1, -1, -1, 3], [2, -1, -1, 1], [1, -1, -1, 3], [2, -1, -1, 3]]
const rightStep3: Step[] = [...rightStep, ...rightStep, ...rightStep]
const solveStepFuncs: ((cube: Cube, state: { v: number, w: number, f: number }) => (Step | null)[])[] = [
  (cube) => {
    if (cube.size % 2) {
      let retI: number;
      const c = cube.size * .5 - .5
      switch (Color.W) {
        case cube.top.getAt(c, c):
          retI = 0;
          break;
        case cube.bottom.getAt(c, c):
          retI = 1;
          break;
        case cube.front.getAt(c, c):
          retI = 2;
          break;
        case cube.right.getAt(c, c):
          retI = 3;
          break;
        case cube.back.getAt(c, c):
          retI = 4;
          break;
        case cube.left.getAt(c, c):
          retI = 5;
          break;
        default:
          retI = 0;
      }
      return whiteUp[retI];
    }
    return []
  },
  (cube, state) => {
    if (cube.size < 4 || state.f === 5) {
      return []
    }
    const c = Math.floor((cube.size - 1) / 2) - state.v
    const nc = ~c
    if (state.v === Math.floor((cube.size - 1) / 2)) {
      state.f++
      state.v = 0
      state.w = 0
      if (cube.size % 2) {
        if (state.f === 5) {
          return []
        }
        const n = (["W", "R", "B", "O", "G", "Y"] as const)[state.f]
        const c = cube.size * .5 - .5
        switch (n) {
          case cube.front.getAt(c, c):
            return [[2, 0, -1, 1]]
          case cube.left.getAt(c, c):
            return [[0, 0, -1, 1]]
          case cube.back.getAt(c, c):
            return [[2, 0, -1, 3]]
          case cube.right.getAt(c, c):
            return [[0, 0, -1, 3]]
        }
      } else {
        switch (state.f) {
          case 1:
            return [[2, 0, -1, 1]]
          case 2:
          case 3:
          case 4:
            switch (Color.W) {
              case cube.back.getAt(1, 1):
                return [[0, 0, -1, 3]]
              case cube.left.getAt(1, 1):
                return [[1, 0, -2, 1], [0, 0, -1, 3]]
              case cube.front.getAt(1, 1):
                return [[1, 0, -2, 2], [0, 0, -1, 3]]
              case cube.right.getAt(1, 1):
                return [[1, 0, -2, 3], [0, 0, -1, 3]]
            }
          case 5:
            return []
        }
      }
    }
    const w = (["W", "R", "B", "O", "G", "Y"] as const)[state.f]
    const c0 = cube.top.getAt(c, c) === w ? "T" : "F"
    const c1 = cube.top.getAt(nc, c) === w ? "T" : "F"
    const c2 = cube.top.getAt(nc, nc) === w ? "T" : "F"
    const c3 = cube.top.getAt(c, nc) === w ? "T" : "F"
    if (state.w < 4) {
      switch (c0 + c1 + c2 + c3) {
        case "TTTT":
          state.w++
          return [null]
        case "TTFT":
        case "TTFF":
        case "TFFF":
          return [[1, -1, -1, 1]]
        case "TFTT":
        case "TFFT":
        case "FFFT":
          return [[1, -1, -1, 2]]
        case "FTTT":
        case "FFTT":
        case "FFTF":
          return [[1, -1, -1, 3]]
      }
      switch (w) {
        case cube.front.getAt(nc, c):
          state.w++
          return [[2, nc, nc, 1], [1, -1, -1, 3], [2, nc, nc, 3]]
        case cube.front.getAt(nc, nc):
          return [[0, -1, -1, 3]]
        case cube.front.getAt(c, nc):
          return [[0, -1, -1, 2]]
        case cube.front.getAt(c, c):
          return [[0, -1, -1, 1]]
        case cube.bottom.getAt(nc, c):
          state.w++
          return [[2, nc, nc, 2], [1, -1, -1, 3], [2, nc, nc, 2]]
        case cube.bottom.getAt(nc, nc):
          return [[1, 0, 0, 1]]
        case cube.bottom.getAt(c, nc):
          return [[1, 0, 0, 2]]
        case cube.bottom.getAt(c, c):
          return [[1, 0, 0, 3]]
        case cube.left.getAt(nc, c):
        case cube.left.getAt(nc, nc):
        case cube.left.getAt(c, nc):
        case cube.left.getAt(c, c):
          return [[1, 0, -2, 3]]
        case cube.back.getAt(nc, c):
        case cube.back.getAt(nc, nc):
        case cube.back.getAt(c, nc):
        case cube.back.getAt(c, c):
          return [[1, 0, -2, 2]]
        case cube.right.getAt(nc, c):
        case cube.right.getAt(nc, nc):
        case cube.right.getAt(c, nc):
        case cube.right.getAt(c, c):
          return [[1, 0, -2, 1]]
      }
    }
    if (cube.size % 2 === 0 && state.v === 0) {
      state.v++
      state.w = 0
      return [null]
    }
    const ci = Math.floor((cube.size - 1) / 2)
    const x = 1 - cube.size % 2 + state.v + ci
    const y = (state.w - 4) % (cube.size - 2 * (ci - state.v)) + ci - state.v
    switch (w) {
      case cube.top.getAt(x, y):
        state.w++
        if (state.w === 4 + (cube.size - 2 * (ci - state.v) + 1 - cube.size % 2) * 4) {
          state.v++
          state.w = 0
          return [null]
        }
        return (state.w - 4) % (cube.size - 2 * (ci - state.v) + 1 - cube.size % 2) === 0 ? [[1, -1, -1, 1]] : [null]
      case cube.front.getAt(x, y):
        return [[2, x, x, 1], [1, -1, -1, 1], [2, ~y, ~y, 1], [1, -1, -1, 3],
        [2, x, x, 3], [1, -1, -1, 1], [2, ~y, ~y, 3], [1, -1, -1, 3]
        ]
      case cube.front.getAt(y, ~x):
        return [[0, -1, -1, 1]]
      case cube.front.getAt(~x, ~y):
        return [[0, -1, -1, 2]]
      case cube.front.getAt(~y, x):
        return [[0, -1, -1, 3]]
      case cube.bottom.getAt(x, y):
        return [[2, x, x, 2], [1, -1, -1, 1], [2, ~y, ~y, 2], [1, -1, -1, 3],
        [2, x, x, 2], [1, -1, -1, 1], [2, ~y, ~y, 2], [1, -1, -1, 3]
        ]
      case cube.bottom.getAt(y, ~x):
        return [[1, 0, 0, 3]]
      case cube.bottom.getAt(~x, ~y):
        return [[1, 0, 0, 2]]
      case cube.bottom.getAt(~y, x):
        return [[1, 0, 0, 1]]
      case cube.right.getAt(x, y):
      case cube.right.getAt(y, ~x):
      case cube.right.getAt(~x, ~y):
      case cube.right.getAt(~y, x):
        return [[1, 0, -2, 1]]
      case cube.back.getAt(x, y):
      case cube.back.getAt(y, ~x):
      case cube.back.getAt(~x, ~y):
      case cube.back.getAt(~y, x):
        return [[1, 0, -2, 2]]
      case cube.left.getAt(x, y):
      case cube.left.getAt(y, ~x):
      case cube.left.getAt(~x, ~y):
      case cube.left.getAt(~y, x):
        return [[1, 0, -2, 3]]
    }
    return []
  },
  (cube, state) => {
    if (cube.size < 4) {
      return []
    }
    const c1 = cube.top.getAt(Math.floor((cube.size - 1) / 2), -1)
    const c2 = cube.front.getAt(Math.floor((cube.size - 1) / 2), 0)
    if (state.w === cube.size - 2) {
      let isFinished = true
      loop: for (let i = 1; i < cube.size - 1; i++) {
        const u1 = cube.top.getAt(i, -1)
        const u2 = cube.front.getAt(i, 0)
        switch (c1 + c2) {
          case u1 + u2:
          case u2 + u1:
            continue loop
          default:
            isFinished = false
            break loop
        }
      }
      if (isFinished) {
        state.f++
        switch (state.f) {
          case 1:
          case 2:
          case 3:
          case 5:
          case 6:
          case 7:
            return [[0, -1, -1, 1]]
          case 4:
            return [[1, 0, -1, 2]]
          case 8:
            return [[1, 0, -1, 1]]
          case 9:
          case 10:
            return [[2, 0, -1, 1]]
          case 11:
            return []
        }
      } else {
        state.w = 0
        state.f = 0
        return [null]
      }

    }
    const y = state.w + 1
    const ny = ~y
    const u1 = cube.top.getAt(y, -1)
    const u2 = cube.front.getAt(y, 0)
    const f1 = cube.front.getAt(-1, ny)
    const f2 = cube.right.getAt(0, ny)
    const rrc = cube.right.getAt(-1, ny)
    const blc = cube.back.getAt(0, ny)
    const brc = cube.back.getAt(-1, ny)
    const llc = cube.left.getAt(0, ny)
    const lrc = cube.left.getAt(-1, ny)
    const flc = cube.front.getAt(0, ny)
    const frn = cube.front.getAt(-1, y)
    const rln = cube.right.getAt(0, y)
    const rrn = cube.right.getAt(-1, y)
    const bln = cube.back.getAt(0, y)
    const brn = cube.back.getAt(-1, y)
    const lln = cube.left.getAt(0, y)
    const lrn = cube.left.getAt(-1, y)
    const fln = cube.front.getAt(0, y)
    const trc = cube.top.getAt(-1, y)
    const rtc = cube.right.getAt(ny, 0)
    const orc = cube.bottom.getAt(-1, ny)
    const rbc = cube.right.getAt(ny, -1)
    const trn = cube.top.getAt(-1, ny)
    const rtn = cube.right.getAt(y, 0)
    const orn = cube.bottom.getAt(-1, y)
    const rbn = cube.right.getAt(y, -1)
    const ttc = cube.top.getAt(y, 0)
    const btc = cube.back.getAt(ny, 0)
    const bbc = cube.back.getAt(ny, -1)
    const obc = cube.bottom.getAt(y, -1)
    const ttn = cube.top.getAt(ny, 0)
    const btn = cube.back.getAt(y, 0)
    const bbn = cube.back.getAt(y, -1)
    const obn = cube.bottom.getAt(ny, -1)
    const tlc = cube.top.getAt(0, ny)
    const ltc = cube.left.getAt(ny, 0)
    const lbc = cube.left.getAt(ny, -1)
    const olc = cube.bottom.getAt(0, y)
    const tln = cube.top.getAt(0, y)
    const ltn = cube.left.getAt(y, 0)
    const lbn = cube.left.getAt(y, -1)
    const oln = cube.bottom.getAt(0, ny)
    const fbc = cube.front.getAt(y, -1)
    const otc = cube.bottom.getAt(y, 0)
    const fbn = cube.front.getAt(ny, -1)
    const otn = cube.bottom.getAt(ny, 0)
    switch (c1 + c2) {
      case u1 + u2:
      case u2 + u1:
        state.w++
        return [null]
      case f1 + f2:
      case f2 + f1:
        return [[1, -1, -1, 1], [2, -1, -1, 1], [1, -1, -1, 3], [2, ny, ny, 3],
        [1, 0, -1, 1], ...leftStep, [1, 0, -1, 3], [2, ny, ny, 1], [0, 0, 0, 1], [1, 0, -2, 1],
        [2, 0, 0, 3], [0, 0, -2, 1], [1, -1, -1, 1], [2, -1, -1, 1], [1, -1, -1, 3], [2, ny, ny, 3],
        [1, 0, -1, 1], ...leftStep, [1, 0, -1, 3], [2, ny, ny, 1], [0, -1, -1, 2], [2, 0, -1, 1]]
      case rrc + blc:
      case blc + rrc:
        return [[1, 0, -2, 1]]
      case brc + llc:
      case llc + brc:
        return [[1, 0, -2, 2]]
      case lrc + flc:
      case flc + lrc:
        return [[1, 0, -2, 3]]
      case frn + rln:
      case rln + frn:
      case rrn + bln:
      case bln + rrn:
        return [[2, -1, -1, 2]]
      case brn + lln:
      case lln + brn:
      case lrn + fln:
      case fln + lrn:
        return [[2, 0, 0, 2]]
      case trc + rtc:
      case rtc + trc:
      case orc + rbc:
      case rbc + orc:
        return [[2, -1, -1, 1]]
      case trn + rtn:
      case rtn + trn:
      case orn + rbn:
      case rbn + orn:
        return [[2, -1, -1, 3]]
      case ttc + btc:
      case btc + ttc:
      case bbc + obc:
      case obc + bbc:
        return [[0, 0, 0, 1]]
      case ttn + btn:
      case btn + ttn:
      case bbn + obn:
      case obn + bbn:
        return [[0, 0, 0, 3]]
      case tlc + ltc:
      case ltc + tlc:
      case lbc + olc:
      case olc + lbc:
        return [[2, 0, 0, 1]]
      case tln + ltn:
      case ltn + tln:
      case lbn + oln:
      case oln + lbn:
        return [[2, 0, 0, 3]]
      case fbc + otc:
      case otc + fbc:
      case fbn + otn:
      case otn + fbn:
        return [[1, 0, 0, 1]]
    }
    return []
  },
  () => {
    return []
  },
  (cube) => {
    let retI: number;
    switch (Color.W) {
      case cube.top.getAt(1, 1):
        retI = 0;
        break;
      case cube.bottom.getAt(1, 1):
        retI = 1;
        break;
      case cube.front.getAt(1, 1):
        retI = 2;
        break;
      case cube.right.getAt(1, 1):
        retI = 3;
        break;
      case cube.back.getAt(1, 1):
        retI = 4;
        break;
      case cube.left.getAt(1, 1):
        retI = 5;
        break;
      default:
        retI = 0;
    }
    return whiteUp[retI];
  },
  (cube) => {
    const y0 = cube.top.getAt(0, 1) === Color.Y,
      y1 = cube.top.getAt(1, 0) === Color.Y,
      y2 = cube.top.getAt(-1, 1) === Color.Y,
      y3 = cube.top.getAt(1, -1) === Color.Y;
    if (y0 && y1 && y2 && y3) {
      return [];
    }
    if (y0 && y2 && y3) {
      return [[1, 0, -1, 1]];
    }
    if (y2) {
      return [[1, 0, -1, 3]];
    }
    let retI: number;
    switch (Color.Y) {
      case cube.left.getAt(-1, 1):
        retI = 8;
        break;
      case cube.left.getAt(0, 1):
        retI = 9;
        break;
      case cube.back.getAt(-1, 1):
        retI = 10;
        break;
      case cube.back.getAt(0, 1):
        retI = 11;
        break;
      case cube.right.getAt(1, 0):
        retI = 0;
        break;
      case cube.front.getAt(1, 0):
        retI = 1;
        break;
      case cube.left.getAt(1, 0):
        retI = 2;
        break;
      case cube.back.getAt(1, 0):
        retI = 3;
        break;
      case cube.right.getAt(-1, 1):
        retI = 4;
        break;
      case cube.right.getAt(0, 1):
        retI = 5;
        break;
      case cube.front.getAt(-1, 1):
        retI = 6;
        break;
      case cube.front.getAt(0, 1):
        retI = 7;
        break;
      case cube.right.getAt(1, -1):
        retI = 12;
        break;
      case cube.front.getAt(1, -1):
        retI = 13;
        break;
      case cube.left.getAt(1, -1):
        retI = 14;
        break;
      case cube.back.getAt(1, -1):
        retI = 15;
        break;
      case cube.bottom.getAt(-1, 1):
        retI = 16;
        break;
      case cube.bottom.getAt(1, 0):
        retI = 17;
        break;
      case cube.bottom.getAt(0, 1):
        retI = 18;
        break;
      case cube.bottom.getAt(1, -1):
        retI = 19;
        break;
      default:
        retI = 0;
    }
    return flower[retI];
  },
  (cube, state) => {
    if (state.v === 4) {
      return [];
    }
    switch (cube.front.getAt(1, 1) + Color.Y) {
      case cube.front.getAt(1, 0) + cube.top.getAt(1, -1):
        state.v++;
        return state.v === 4
          ? [[0, -1, -1, 2]]
          : [
            [0, -1, -1, 2],
            [1, 0, -1, 1],
          ];
      case cube.left.getAt(1, 0) + cube.top.getAt(0, 1):
        return [[1, -1, -1, 3]];
      case cube.back.getAt(1, 0) + cube.top.getAt(1, 0):
        return [[1, -1, -1, 2]];
      case cube.right.getAt(1, 0) + cube.top.getAt(-1, 1):
        return [[1, -1, -1, 1]];
    }
    return [];
  },
  (cube, state) => {
    if (state.v === 20) {
      return []
    }
    if (state.v % 5 === 4) {

      state.v -= 4
      if (state.v === 0) {
        return [[1, 0, -1, 1], ...rightStep, [1, 0, -1, 1], ...rightStep, [1, 0, -1, 1], ...rightStep, [1, 0, -1, 1]]
      }
      if (state.v === 5) {
        return [[1, 0, -1, 1], ...rightStep, [1, 0, -1, 1], ...rightStep, [1, 0, -1, 2]]
      }
      if (state.v === 10) {
        return [[1, 0, -1, 1], ...rightStep, [1, 0, -1, 3]]
      }
    }
    const c1 = cube.front.getAt(1, -1)
    const c2 = cube.right.getAt(1, -1)
    const b1 = cube.front.getAt(-1, -1)
    const b2 = cube.right.getAt(0, -1)
    const b3 = cube.bottom.getAt(-1, 0)
    const a1 = cube.top.getAt(-1, -1)
    const a2 = cube.front.getAt(-1, 0)
    const a3 = cube.right.getAt(0, 0)
    switch (c1 + c2) {
      case b1 + b2:
        state.v = Math.floor(state.v / 5 + 1) * 5
        return state.v === 20 ? [] : [[1, 0, -1, 1]]
      case b3 + b1:
        state.v = Math.floor(state.v / 5 + 1) * 5
        return [[1, 0, -1, 1], ...leftStep, ...leftStep]
      case b2 + b3:
        return [...rightStep, ...rightStep]
      case a3 + a2:
        return [...rightStep, ...rightStep, ...rightStep]
      case a2 + a1:
        state.v = Math.floor(state.v / 5 + 1) * 5
        return [[1, 0, -1, 1], ...leftStep]
      case a1 + a3:
        return rightStep
      default:
        state.v++
        return [[1, -1, -1, 1]]
    }
  },
  (cube, state) => {
    if (state.v === 20) {
      return []
    }
    if (state.v % 5 === 4) {
      state.v -= 4

      if (state.v === 0) {
        return [...insertRightEdge, ...insertRightEdge, ...insertRightEdge, ...insertRightEdge]
      }
      if (state.v === 5) {
        return [...insertRightEdge, ...insertRightEdge, ...insertRightEdge, [1, 0, -1, 1]]
      }
      if (state.v === 10) {
        return [...insertRightEdge, ...insertRightEdge, [1, 0, -1, 2]]
      }
      if (state.v === 15) {
        return [...insertRightEdge, [1, 0, -1, 3]]
      }
    }
    const fc = cube.front.getAt(1, 1)
    const rc = cube.right.getAt(1, 1)
    const fr = cube.front.getAt(-1, 1)
    const rl = cube.right.getAt(0, 1)
    if (fc === fr && rc === rl) {
      state.v = Math.floor(state.v / 5 + 1) * 5
      return state.v === 20 ? [] : [[1, 0, -1, 1]]
    }
    const ft = cube.front.getAt(1, 0)
    const tf = cube.top.getAt(1, -1)
    if (ft === fc && tf === rc) {
      return insertRightEdge
    }
    const rt = cube.right.getAt(1, 0)
    const tr = cube.top.getAt(-1, 1)
    if (rt === rc && tr === fc) {
      state.v = Math.floor(state.v / 5 + 1) * 5
      return state.v === 20 ? [[1, 0, -1, 1], ...insertLeftEdge,] : [[1, 0, -1, 1], ...insertLeftEdge, [1, 0, -1, 1]]
    }
    state.v++
    return [[1, -1, -1, 1]]
  },
  (cube) => {
    const t = cube.top.getAt(1, 0) === Color.W ? "W" : "N"
    const r = cube.top.getAt(-1, 1) === Color.W ? "W" : "N"
    const b = cube.top.getAt(1, -1) === Color.W ? "W" : "N"
    const l = cube.top.getAt(0, 1) === Color.W ? "W" : "N"
    switch (t + r + b + l) {
      case "WWWW":
        return []
      case "WNWN":
      case "NWNW":
      case "WNNW":
        return whiteX
      case "NNNN":
        return whiteX2
      case "NNWW":
        return [[1, -1, -1, 1]]
      case "NWWN":
        return [[1, -1, -1, 2]]
      case "WWNN":
        return [[1, -1, -1, 3]]
    }
    const ci = Math.floor((cube.size - 2) / 2)
    const nci = ~ci
    return [[2, 1, ci, 2], [0, 0, 0, 2], [1, -1, -1, 2], [2, nci, -2, 3], [1, -1, -1, 2], [2, 1, ci, 3], [1, -1, -1, 2],
    [2, 1, ci, 1], [1, -1, -1, 2], [0, -1, -1, 2], [2, 1, ci, 1], [0, -1, -1, 2], [2, nci, -2, 1], [0, 0, 0, 2], [2, 1, ci, 2]]
  },
  (cube) => {
    const t = cube.back.getAt(1, 0)
    const r = cube.right.getAt(1, 0)
    const b = cube.front.getAt(1, 0)
    const l = cube.left.getAt(1, 0)
    const fe = cube.front.getAt(1, 1) === b ? "F" : "N"
    const le = cube.left.getAt(1, 1) === l ? "L" : "N"
    const be = cube.back.getAt(1, 1) === t ? "B" : "N"
    const re = cube.right.getAt(1, 1) === r ? "R" : "N"

    switch (fe + le + be + re) {
      case "FLBR":
        return []
      case "FLNN":
      case "FNBN":
        return whiteEdge
      case "FNNR":
        return [[1, 0, -1, 1]]
      case "NNBR":
        return [[1, 0, -1, 2]]
      case "NLBN":
        return [[1, 0, -1, 3]]
      default:
        return [[1, -1, -1, 1]]

    }
  },
  (cube) => cube.top.getAt(1, 1) === "W" ? [[0, 0, -1, 2]] : [],
  (cube, state) => {
    if (state.v === 4) {
      return []
    }
    if (cube.bottom.getAt(-1, 0) === "W") {
      state.v++
      return [[1, 0, 0, 1]]
    } else {
      return rightStep
    }
  },
  (cube, state) => {
    const fb = cube.front.getAt(1, -1)
    const fc = cube.front.getAt(-1, -1)
    if (fb === fc) {
      state.v++
      return state.v === 4 ? [] : [[1, 0, 0, 1]]
    } else {
      state.v = 0
      state.w++
      return [...rightStep3, [1, 0, 0, 1], ...rightStep3, [1, 0, 0, 3], ...rightStep3, [1, 0, 0, 1]]
    }
  },
  (cube) => {
    const c = cube.front.getAt(1, 1)
    const f = cube.front.getAt(1, -1)
    const r = cube.right.getAt(1, -1)
    const b = cube.back.getAt(1, -1)
    const l = cube.left.getAt(1, -1)
    switch (c) {
      case f:
        return []
      case r:
        return [[1, 0, 0, 1]]
      case b:
        return [[1, 0, 0, 2]]
      case l:
        return [[1, 0, 0, 3]]
    }
    return []
  }
];
type Step = [axis: 0 | 1 | 2, start: number, end: number, amount: 1 | 2 | 3];
class Solver {
  constructor(public cube: Cube) { }
  async solve(startAt: SolveStep = 0) {
    const state = { v: 0, w: 0, f: 0 };
    while (SolveStep[startAt] !== undefined) {
      const queue: (Step | null)[] = solveStepFuncs[startAt](this.cube, state).slice();
      if (queue[0] === null || queue.length) {
        let step: Step | null | undefined;
        while ((step = queue.shift())) {
          step && await this.cube.rotate(...step);
        }
      } else {
        // TODO: パリティ処理
        startAt++;
        state.v = 0;
        state.w = 0
        state.f = 0
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
  y0Offset.value === 1 ? yRot.value + "deg" : "0deg",
);
const bottomZRot = computed(() =>
  y1Offset.value === 1 ? -yRot.value + "deg" : "0deg",
);
const frontZRot = computed(() =>
  x0Offset.value === 1 ? xRot.value + "deg" : "0deg",
);
const rightZRot = computed(() =>
  z0Offset.value === 1 ? zRot.value + "deg" : "0deg",
);
const backZRot = computed(() =>
  x1Offset.value === 1 ? -xRot.value + "deg" : "0deg",
);
const leftZRot = computed(() =>
  z1Offset.value === 1 ? -zRot.value + "deg" : "0deg",
);
const topTop = computed(() => (1 - x1Offset.value) * 25 + "vmin");
const topLeft = computed(() => (1 - z1Offset.value) * 25 + "vmin");
const topTopAxis = computed(
  () => (rotAxis.value === 3 ? 2 : 1 - x1Offset.value) * 25 + "vmin",
);
const topBottomAxis = computed(
  () => (rotAxis.value === 3 ? 2 : 1 - x0Offset.value) * 25 + "vmin",
);
const topLeftAxis = computed(
  () => (rotAxis.value === 1 ? 2 : 1 - z1Offset.value) * 25 + "vmin",
);
const topRightAxis = computed(
  () => (rotAxis.value === 1 ? 2 : 1 - z0Offset.value) * 25 + "vmin",
);
const topWidth = computed(
  () => (z0Offset.value + z1Offset.value) * 25 + "vmin",
);
const topHeight = computed(
  () => (x0Offset.value + x1Offset.value) * 25 + "vmin",
);
const frontTop = computed(() => (1 - y0Offset.value) * 25 + "vmin");
const frontLeft = computed(() => (1 - z1Offset.value) * 25 + "vmin");
const frontTopAxis = computed(
  () => (rotAxis.value === 3 ? 2 : 1 - y0Offset.value) * 25 + "vmin",
);
const frontBottomAxis = computed(
  () => (rotAxis.value === 3 ? 2 : 1 - y1Offset.value) * 25 + "vmin",
);
const frontLeftAxis = computed(
  () => (rotAxis.value === 2 ? 2 : 1 - z1Offset.value) * 25 + "vmin",
);
const frontRightAxis = computed(
  () => (rotAxis.value === 2 ? 2 : 1 - z0Offset.value) * 25 + "vmin",
);
const frontWidth = computed(
  () => (z0Offset.value + z1Offset.value) * 25 + "vmin",
);
const frontHeight = computed(
  () => (y0Offset.value + y1Offset.value) * 25 + "vmin",
);
const rightTop = computed(() => (1 - y0Offset.value) * 25 + "vmin");
const rightLeft = computed(() => (1 - x0Offset.value) * 25 + "vmin");
const rightTopAxis = computed(
  () => (rotAxis.value === 1 ? 2 : 1 - y0Offset.value) * 25 + "vmin",
);
const rightBottomAxis = computed(
  () => (rotAxis.value === 1 ? 2 : 1 - y1Offset.value) * 25 + "vmin",
);
const rightLeftAxis = computed(
  () => (rotAxis.value === 2 ? 2 : 1 - x0Offset.value) * 25 + "vmin",
);
const rightRightAxis = computed(
  () => (rotAxis.value === 2 ? 2 : 1 - x1Offset.value) * 25 + "vmin",
);
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
const animationSpeed = ref(4)
onMounted(async () => {
  const size = 16;
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
    size,
  );
  watchEffect(() => {
    cube.animationSpeed = 2 ** animationSpeed.value
  })
  while (true) {
    for (let i = 0; i < size * 4; i++) {
      const axis = Math.floor(Math.random() * 3) as 0 | 1 | 2;
      const start = Math.floor(Math.random() * size);
      const end = Math.floor(Math.random() * (size - start - 1)) + start;
      const amount = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      await cube.rotate(axis, start, end, amount);
    }
    const solver = new Solver(cube);
    await solver.solve();
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 1000)
    })
    break
  }
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
  transform: rotateX(calc(var(--rotX) * 1deg)) rotateY(calc(var(--rotY) * 1deg)) translateX(-25vmin) translateY(-25vmin);
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
  transform: rotateY(calc(90deg * 0)) translateZ(v-bind(x0OffsetVMmin)) rotate(v-bind(xRotDeg));
}

.x1 {
  transform: rotateY(calc(90deg * 2)) translateZ(v-bind(x1OffsetVMmin)) rotate(v-bind(xRotDegMinus));
}

.y0 {
  transform: rotateX(calc(90deg * 1)) translateZ(v-bind(y0OffsetVMmin)) rotate(v-bind(yRotDeg));
}

.y1 {
  transform: rotateX(calc(90deg * 3)) translateZ(v-bind(y1OffsetVMmin)) rotate(v-bind(yRotDegMinus));
}

.z0 {
  transform: rotateY(calc(90deg * 1)) translateZ(v-bind(z0OffsetVMmin)) rotate(v-bind(zRotDeg));
}

.z1 {
  transform: rotateY(calc(90deg * 3)) translateZ(v-bind(z1OffsetVMmin)) rotate(v-bind(zRotDegMinus));
}

.ix0 {
  transform: rotateY(calc(90deg * 0)) translateZ(v-bind(x0OffsetVMmin));
}

.ix1 {
  transform: rotateY(calc(90deg * 2)) translateZ(v-bind(x1OffsetVMmin));
}

.iy0 {
  transform: rotateX(calc(90deg * 1)) translateZ(v-bind(y0OffsetVMmin));
}

.iy1 {
  transform: rotateX(calc(90deg * 3)) translateZ(v-bind(y1OffsetVMmin));
}

.iz0 {
  transform: rotateY(calc(90deg * 1)) translateZ(v-bind(z0OffsetVMmin));
}

.iz1 {
  transform: rotateY(calc(90deg * 3)) translateZ(v-bind(z1OffsetVMmin));
}

.split {
  position: absolute;
  image-rendering: pixelated;
}

.frame {
  transform-style: preserve-3d;
  width: 100%;
  height: 100%;
}

.top {
  transform: rotate(v-bind(topZRot));
}

.top0 {
  top: 0;
  left: 0;
  width: v-bind(topLeftAxis);
  height: v-bind(topTopAxis);
}

.top1 {
  top: v-bind(topTop);
  left: v-bind(topLeft);
  width: v-bind(topWidth);
  height: v-bind(topHeight);
  transform: translate3d(v-bind(leftRotOffset), v-bind(backRotOffset), -25vmin) rotateY(v-bind(xRotDeg)) rotateX(v-bind(zRotDeg)) translate3d(v-bind(rightRotOffset), v-bind(frontRotOffset), 25vmin);
}

.top2 {
  bottom: 0;
  right: 0;
  width: v-bind(topRightAxis);
  height: v-bind(topBottomAxis);
}

.bottom {
  transform: rotate(v-bind(bottomZRot));
}

.bottom0 {
  bottom: 0;
  left: 0;
  width: v-bind(topLeftAxis);
  height: v-bind(topTopAxis);
}

.bottom1 {
  bottom: v-bind(topTop);
  left: v-bind(topLeft);
  width: v-bind(topWidth);
  height: v-bind(topHeight);
  transform: translate3d(v-bind(leftRotOffset), v-bind(frontRotOffset), -25vmin) rotateY(v-bind(xRotDegMinus)) rotateX(v-bind(zRotDeg)) translate3d(v-bind(rightRotOffset), v-bind(backRotOffset), 25vmin);
}

.bottom2 {
  top: 0;
  right: 0;
  width: v-bind(topRightAxis);
  height: v-bind(topBottomAxis);
}

.front {
  transform: rotate(v-bind(frontZRot));
}

.front0 {
  top: 0;
  left: 0;
  width: v-bind(frontLeftAxis);
  height: v-bind(frontTopAxis);
}

.front1 {
  top: v-bind(frontTop);
  left: v-bind(frontLeft);
  width: v-bind(frontWidth);
  height: v-bind(frontHeight);
  transform: translate3d(v-bind(leftRotOffset),
      v-bind(bottomRotOffset),
      -25vmin) rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(zRotDeg)) translate3d(v-bind(rightRotOffset), v-bind(topRotOffset), 25vmin);
}

.front2 {
  bottom: 0;
  right: 0;
  width: v-bind(frontRightAxis);
  height: v-bind(frontBottomAxis);
}

.right {
  transform: rotate(v-bind(rightZRot));
}

.right0 {
  top: 0;
  left: 0;
  width: v-bind(rightLeftAxis);
  height: v-bind(rightTopAxis);
}

.right1 {
  top: v-bind(rightTop);
  left: v-bind(rightLeft);
  width: v-bind(rightWidth);
  height: v-bind(rightHeight);
  transform: translate3d(v-bind(frontRotOffset),
      v-bind(bottomRotOffset),
      -25vmin) rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(xRotDegMinus)) translate3d(v-bind(backRotOffset), v-bind(topRotOffset), 25vmin);
}

.right2 {
  bottom: 0;
  right: 0;
  width: v-bind(rightRightAxis);
  height: v-bind(rightBottomAxis);
}

.back {
  transform: rotate(v-bind(backZRot));
}

.back0 {
  top: 0;
  right: 0;
  width: v-bind(frontLeftAxis);
  height: v-bind(frontTopAxis);
}

.back1 {
  top: v-bind(frontTop);
  right: v-bind(frontLeft);
  width: v-bind(frontWidth);
  height: v-bind(frontHeight);
  transform: translate3d(v-bind(rightRotOffset),
      v-bind(bottomRotOffset),
      -25vmin) rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(zRotDegMinus)) translate3d(v-bind(leftRotOffset), v-bind(topRotOffset), 25vmin);
}

.back2 {
  bottom: 0;
  left: 0;
  width: v-bind(frontRightAxis);
  height: v-bind(frontBottomAxis);
}

.left {
  transform: rotate(v-bind(leftZRot));
}

.left0 {
  top: 0;
  right: 0;
  width: v-bind(rightLeftAxis);
  height: v-bind(rightTopAxis);
}

.left1 {
  top: v-bind(rightTop);
  right: v-bind(rightLeft);
  width: v-bind(rightWidth);
  height: v-bind(rightHeight);
  transform: translate3d(v-bind(backRotOffset),
      v-bind(bottomRotOffset),
      -25vmin) rotateY(v-bind(yRotDegMinus)) rotateX(v-bind(xRotDeg)) translate3d(v-bind(frontRotOffset), v-bind(topRotOffset), 25vmin);
}

.left2 {
  bottom: 0;
  left: 0;
  width: v-bind(rightRightAxis);
  height: v-bind(rightBottomAxis);
}
</style>
<style lang="scss">
html,
body,
body> :first-child {
  height: 100%;
  background-color: #555;
}
</style>
