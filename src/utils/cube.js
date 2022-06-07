import * as tome from 'chromotome'

import Apparatus from 'apparatus-generator'
import toposort from 'toposort'

let THE_SEED

const cubedim = 23
const mag = 23

const xr = -Math.PI / 6
const yr = Math.PI / 2
const zr = Math.PI / 6

const xu = [Math.cos(xr) * mag, Math.sin(xr) * mag] // X Unit
const yu = [Math.cos(yr) * mag, Math.sin(yr) * mag] // Y Unit
const zu = [Math.cos(zr) * mag, Math.sin(zr) * mag] // Z Unit
const nxu = xu.map((v) => -v)
const nyu = yu.map((v) => -v)
const nzu = zu.map((v) => -v)

const shadingEnabled = true
const strokeEnabled = true

const maxDepth = 3
const depthSteps = 8

// const palette = get_palette()
const shade = [0, 80]
const none = [0, 40]
const light = [0, 0]

const stroke = [0, 150]

const palette = {
  name: 'cevoid',
  colors: ['#8349FF', '#9767FF', '#A449FF', '#ddd'],
  stroke: '#000',
  background: '#000',
  size: 4
}

const generator = new Apparatus(cubedim, cubedim, {
  simple: true,
  extension_chance: 0.95,
  horizontal_symmetry: false,
  vertical_chance: 0.5
})

const innerApparatusOptions = {
  simple: true,
  extension_chance: 0.8,
  horizontal_symmetry: false,
  vertical_chance: 0.5,
  color_mode: 'group',
  group_size: 0.4,
  colors: palette?.colors
}

let frontLayout, leftLayout, topLayout

export const setup = (p5, canvasParentRef) => {
  p5.createCanvas(2000, 1200).parent(canvasParentRef)
  THE_SEED = p5.floor(p5.random(9999999))
  p5.randomSeed(THE_SEED)
  p5.noFill()
  p5.smooth()
  p5.frameRate(0.5)
  p5.background(palette.background ? palette.background : '#eee')
  p5.strokeJoin(p5.ROUND)
}

export const draw = (p5) => {
  reset()
  displayLayout(4, true)

  function reset() {
    p5.background(palette.background ? palette.background : '#eee')
    p5.translate(p5.width / 2, p5.height / 2)

    const frontApp = generator.generate(null, null, true)
    const leftApp = generator.generate(
      frontApp[1].map((i) => ({ ...i[1], v: i[1].h })),
      null,
      true
    )
    const topApp = generator.generate(
      leftApp[1].map((i) => ({ ...i[1], v: i[1].h })),
      frontApp[1][1].map((i) => ({ ...i, h: i.v })),
      true
    )

    const frontGrids = frontApp[0].map((a) => createGrid(a, null, null))
    const leftGrids = leftApp[0].map((a) => createGrid(a, frontGrids, null))
    const topGrids = topApp[0].map((a) => createGrid(a, leftGrids, frontGrids))

    frontLayout = get_overlap_graph(frontGrids.flatMap((g) => g.content))
    leftLayout = get_overlap_graph(leftGrids.flatMap((g) => g.content))
    topLayout = get_overlap_graph(topGrids.flatMap((g) => g.content))
  }

  function displayLayout(depth, colorize) {
    frontLayout.forEach((i) =>
      displayBox(i, depth, colorize, xu, yu, zu, [none, shade, light])
    )
    leftLayout.forEach((i) =>
      displayBox(i, depth, colorize, yu, nzu, nxu, [shade, light, none])
    )
    topLayout.forEach((i) =>
      displayBox(i, depth, colorize, nzu, xu, nyu, [light, none, shade])
    )
  }

  function displayBox(box, maxLevel, colorize, xu, yu, zu, shades) {
    if (box.content != null && box.content.length > 0 && maxLevel > box.level) {
      box.content.forEach((c) => displayBox(c, maxLevel, colorize))
    }

    if (box.filled && colorize) p5.fill(box.col)
    else p5.noFill()

    if (strokeEnabled) p5.stroke(stroke[0], stroke[1])
    else p5.noStroke()

    p5.beginShape()
    p5.vertex(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    )
    p5.endShape(p5.CLOSE)

    p5.beginShape()
    p5.vertex(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
      box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
    )
    p5.vertex(box.x1 * xu[0] + box.y1 * yu[0], box.x1 * xu[1] + box.y1 * yu[1])
    p5.endShape(p5.CLOSE)

    p5.beginShape()
    p5.vertex(
      box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
    )
    p5.vertex(
      (box.x1 + box.w) * xu[0] + box.y1 * yu[0],
      (box.x1 + box.w) * xu[1] + box.y1 * yu[1]
    )
    p5.vertex(box.x1 * xu[0] + box.y1 * yu[0], box.x1 * xu[1] + box.y1 * yu[1])
    p5.endShape(p5.CLOSE)

    if (shadingEnabled) {
      p5.noStroke()

      p5.fill(shades[0][0], shades[0][1])
      p5.beginShape()
      p5.vertex(
        box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        (box.x1 + box.w) * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        (box.x1 + box.w) * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      )
      p5.endShape(p5.CLOSE)

      p5.fill(shades[1][0], shades[1][1])
      p5.beginShape()
      p5.vertex(
        box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        box.x1 * xu[0] + (box.y1 + box.h) * yu[0],
        box.x1 * xu[1] + (box.y1 + box.h) * yu[1]
      )
      p5.vertex(
        box.x1 * xu[0] + box.y1 * yu[0],
        box.x1 * xu[1] + box.y1 * yu[1]
      )
      p5.endShape(p5.CLOSE)

      p5.fill(shades[2][0], shades[2][1])
      p5.beginShape()
      p5.vertex(
        box.x1 * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        box.x1 * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        (box.x1 + box.w) * xu[0] + box.y1 * yu[0] + box.z1 * zu[0],
        (box.x1 + box.w) * xu[1] + box.y1 * yu[1] + box.z1 * zu[1]
      )
      p5.vertex(
        (box.x1 + box.w) * xu[0] + box.y1 * yu[0],
        (box.x1 + box.w) * xu[1] + box.y1 * yu[1]
      )
      p5.vertex(
        box.x1 * xu[0] + box.y1 * yu[0],
        box.x1 * xu[1] + box.y1 * yu[1]
      )
      p5.endShape(p5.CLOSE)
    }
  }

  function createGrid(box, topside, leftside) {
    const { x1, y1, w, h } = box

    const topsideGrid =
      topside && y1 == 1
        ? topside.filter((c) => c.x1 == 1 && c.y1 == x1)[0]
        : null

    const leftsideGrid =
      leftside && x1 == 1
        ? leftside.filter((c) => c.y1 == 1 && c.x1 == y1)[0]
        : null

    const cols = topsideGrid
      ? topsideGrid.rows
      : Math.ceil((Math.random() * w) / 3)
    const rows = leftsideGrid
      ? leftsideGrid.cols
      : Math.ceil((Math.random() * h) / 2)

    const cell_w = w / cols
    const cell_h = h / rows

    const init_top = topsideGrid
      ? topsideGrid.apparatus.map((i) => ({ ...i[1], v: i[1].h }))
      : null

    const init_left = leftsideGrid
      ? leftsideGrid.apparatus[1].map((i) => ({ ...i, h: i.v }))
      : null

    const apparatus = createApparatus(cell_w, cell_h, init_top, init_left)
    let grid = []
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const content = apparatus[0].map((app) => {
          const xpos = x1 + app.x1 + j * cell_w - 1
          const ypos = y1 + app.y1 + i * cell_h - 1
          let y_offset =
            topsideGrid && i == 0 && ypos <= 0
              ? topsideGrid.content.filter(
                  (c) => c.x1 <= 0 && p5.max(c.y1, 0) == xpos
                )[0].z1
              : 0
          let x_offset =
            leftsideGrid && j == 0 && xpos <= 0
              ? leftsideGrid.content.filter(
                  (c) => c.y1 <= 0 && p5.max(c.x1, 0) == ypos
                )[0].z1
              : 0
          return {
            ...app,
            x1: xpos - x_offset,
            y1: ypos - y_offset,
            w: app.w + x_offset,
            h: app.h + y_offset,
            level: 2,
            filled: true,
            crossed: app.w < 1.5 && app.h < 1.5 && Math.random() < 0.3,
            legend_width: 2 + Math.random() * (app.w - 3)
          }
        })

        grid = grid.concat(content)
      }
    }
    return {
      x1: x1,
      y1: y1,
      cols: cols,
      rows: rows,
      apparatus: apparatus[1],
      content: grid
    }
  }

  function createApparatus(w, h, top, left) {
    const cols = Math.round(w, 0)
    const rows = Math.round(h, 0)

    const w_unit = w / cols
    const h_unit = h / rows

    const generator = new Apparatus(
      (cols - 11) / 2,
      (rows - 11) / 2,
      innerApparatusOptions
    )

    const apparatus = generator.generate(top, left, true)
    apparatus[0] = apparatus[0].map((a) => ({
      x1: (a.x1 - 1) * w_unit,
      y1: (a.y1 - 1) * h_unit,
      z1: maxDepth * (Math.floor(Math.random() * depthSteps) / depthSteps),
      w: a.w * w_unit,
      h: a.h * h_unit,
      col: a.col
    }))

    return apparatus
  }

  function overlaps(a, b) {
    const lca = [a.x1 + a.w, a.y1]
    const rca = [a.x1, a.y1 + a.h]
    const ba = [a.x1, a.y1]

    const lcb = [b.x1 + b.w, b.y1]
    const rcb = [b.x1, b.y1 + b.h]
    const bb = [b.x1, b.y1]

    if (a.y1 + 0.005 >= b.y1 + b.h || a.x1 + 0.005 >= b.x1 + b.w) return false

    if (ba[1] - ba[0] < bb[1] - bb[0]) {
      // A is left of B
      if (rca[1] - rca[0] <= lcb[1] - lcb[0]) return false
      return rca[1] + rca[0] < lcb[1] + lcb[0] // positive if A is in front of B
    }

    if (ba[1] - ba[0] > bb[1] - bb[0]) {
      // A is right of B
      if (lca[1] - lca[0] >= rcb[1] - rcb[0]) return false
      return lca[1] + lca[0] < rcb[1] + rcb[0] // positive if A is in front of B
    }
    return ba[1] + ba[0] < bb[1] + bb[0]
  }

  function get_overlap_graph(boxes) {
    const nodes = []
    boxes.forEach((box, i) => nodes.push(i))

    const edges = []
    boxes.forEach((b1, i) => {
      boxes.forEach((b2, j) => {
        if (overlaps(b1, b2)) edges.push([i, j, b1, b2])
      })
    })

    const overlapping = toposort(edges)
    return overlapping.reverse().map((i) => boxes[i])
  }
}

function get_palette() {
  if (typeof window !== 'undefined') {
    const url = window.location.href.split('#')
    if (url.length === 1) return tome.get()
    return tome.get(url[1])
  }
}
