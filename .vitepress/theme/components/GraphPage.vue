<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useData, useRouter, withBase } from 'vitepress'
import { data as graphData, type GraphArticle } from '../graph.data'
import {
  buildGraph,
  computeBounds,
  DEFAULT_FORCES,
  getNodeColor,
  getTopicColor,
  stepSimulation,
  TAG_PALETTE,
  type ForceParams,
  type SimEdge,
  type SimNode,
} from './graphEngine'

const { isDark } = useData()
const router = useRouter()

// ============ 图谱筛选与显示配置（仿 Obsidian Graph View） ============
const searchQuery = ref('')
const showTopics = ref(true)
const showTags = ref(true)
const onlySharedTags = ref(false)
const showOrphans = ref(true)

const showArrows = ref(true)
const textFadeThreshold = ref(0.45) // 越低显示越多文字，越高需要放大才显示
const nodeSizeMultiplier = ref(1.0)
const lineSizeMultiplier = ref(1.0)

const forces = reactive<ForceParams>({ ...DEFAULT_FORCES })

// 专题分组可见性（默认全部开启）
const enabledTopics = ref<Set<string>>(new Set(graphData.topics.map((t) => t.dir)))

// 局部图谱模式（Obsidian Local Graph）
const localFocusId = ref<string | null>(null)
const localDepth = ref<1 | 2>(1)

// 面板展开/折叠状态
const settingsOpen = ref(false)
const sectionOpen = reactive({
  filters: true,
  groups: true,
  display: false,
  forces: false,
})

// 节点交互状态
const hoveredNodeId = ref<string | null>(null)
const selectedNodeId = ref<string | null>(null)

// 实时图谱统计（用于左上角胶囊展示）
const graphStats = ref({
  articleCount: graphData.articles.length,
  tagCount: 0,
  topicCount: graphData.topics.length,
  directLinkCount: 0,
  edgeCount: 0,
})

// ============ 预计算文章元索引（用于详情卡片：入链、出链、共享标签关联） ============
const articleById = new Map(graphData.articles.map((a) => [a.id, a]))
const backlinksMap = new Map<string, GraphArticle[]>()
for (const a of graphData.articles) backlinksMap.set(a.id, [])
for (const a of graphData.articles) {
  for (const targetId of a.links) {
    const list = backlinksMap.get(targetId)
    if (list) list.push(a)
  }
}

const topicCounts = computed(() => {
  const map = new Map<string, number>()
  for (const a of graphData.articles) {
    map.set(a.topicDir, (map.get(a.topicDir) || 0) + 1)
  }
  return map
})

const allTopicsEnabled = computed(
  () => enabledTopics.value.size === graphData.topics.length,
)

// 搜索命中的节点 ID 集合
const searchMatches = computed<Set<string>>(() => {
  void graphVersion.value
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return new Set()
  const matched = new Set<string>()
  for (const n of simNodes) {
    if (n.label.toLowerCase().includes(q)) {
      matched.add(n.id)
    } else if (
      n.article &&
      (n.article.topicLabel.toLowerCase().includes(q) ||
        n.article.categoryLabel.toLowerCase().includes(q) ||
        n.article.tags.some((t) => t.toLowerCase().includes(q)))
    ) {
      matched.add(n.id)
    }
  }
  return matched
})

// 当前选中的节点对象（供左下角详情面板展示）
const selectedNode = computed<SimNode | null>(() => {
  void graphVersion.value
  if (!selectedNodeId.value) return null
  return simNodeById.get(selectedNodeId.value) || null
})

// 局部图谱的中心节点名
const localFocusLabel = computed(() => {
  void graphVersion.value
  if (!localFocusId.value) return ''
  return simNodeById.get(localFocusId.value)?.label || ''
})

// 选中文章的关联详情
const selectedArticleDetails = computed(() => {
  const node = selectedNode.value
  if (!node || node.type !== 'article' || !node.article) return null
  const art = node.article
  const outgoing = art.links
    .map((id) => articleById.get(id))
    .filter((x): x is GraphArticle => Boolean(x))
  const incoming = backlinksMap.get(art.id) || []
  const directSet = new Set([art.id, ...outgoing.map((a) => a.id), ...incoming.map((a) => a.id)])

  // 共同标签关联文章（按共享标签数量降序）
  const artTags = new Set(art.tags)
  const related = graphData.articles
    .filter((other) => !directSet.has(other.id))
    .map((other) => {
      const shared = other.tags.filter((t) => artTags.has(t))
      return { article: other, shared }
    })
    .filter((item) => item.shared.length > 0)
    .sort((a, b) => b.shared.length - a.shared.length)
    .slice(0, 8)

  return { article: art, outgoing, incoming, related }
})

// 选中标签的关联文章
const selectedTagArticles = computed(() => {
  const node = selectedNode.value
  if (!node || node.type !== 'tag' || !node.tagName) return []
  return graphData.articles.filter((a) => a.tags.includes(node.tagName!))
})

// 选中专题的关联文章
const selectedTopicArticles = computed(() => {
  const node = selectedNode.value
  if (!node || node.type !== 'topic' || !node.topic) return []
  return graphData.articles.filter((a) => a.topicDir === node.topic!.dir)
})

// ============ Canvas 与物理引擎运行时状态（非响应式，保证 60fps 零额外开销） ============
const shellRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const searchInputRef = ref<HTMLInputElement | null>(null)

let ctx: CanvasRenderingContext2D | null = null
let viewW = 800
let viewH = 600
let dpr = 1

let simNodes: SimNode[] = []
let simEdges: SimEdge[] = []
let simAdj = new Map<string, Set<string>>()
let simNodeById = new Map<string, SimNode>()
const graphVersion = ref(0) // 用于在图谱重建后触发 selectedNode / searchMatches 重新求值

const ALPHA_FLOOR = 0.11 // 永不彻底僵死，保持细腻呼吸漂浮
const AMBIENT_STRENGTH = 0.065
const MIN_ZOOM = 0.15
const MAX_ZOOM = 6.0

let simAlpha = 0.9
let ambientTime = 0
let lastFrameTs = 0
let isTabHidden = false
let rafId: number | null = null
let needsRender = false

// 相机状态与平滑缓动目标
const cam = { x: 0, y: 0, zoom: 0.72 }
let camTarget: { x: number; y: number; zoom: number } | null = null

// 光标锚定平滑滚轮缩放目标（同时兼容鼠标滚轮与触控板双指缩放）
let wheelZoomTarget: number | null = null
let wheelAnchorScreen = { x: 0, y: 0 }
let wheelAnchorWorld = { x: 0, y: 0 }

// 指针拖拽 / 缩放 / 双击状态
let dragNode: SimNode | null = null
let isPanning = false
let pointerDownPos = { x: 0, y: 0 }
let panStartCam = { x: 0, y: 0 }
let pointerTravel = 0
let lastClickTime = 0
let lastClickNodeId: string | null = null

// 触摸双指缩放状态
const activePointers = new Map<number, { x: number; y: number }>()
let pinchStartDist = 0
let pinchStartZoom = 1
let pinchStartMidWorld = { x: 0, y: 0 }

// ============ 坐标变换工具 ============
function worldToScreen(wx: number, wy: number): { x: number; y: number } {
  return {
    x: (wx - cam.x) * cam.zoom + viewW / 2,
    y: (wy - cam.y) * cam.zoom + viewH / 2,
  }
}

function screenToWorld(sx: number, sy: number): { x: number; y: number } {
  return {
    x: (sx - viewW / 2) / cam.zoom + cam.x,
    y: (sy - viewH / 2) / cam.zoom + cam.y,
  }
}

function nodeRadius(n: SimNode): number {
  // 随缩放次线性变化：缩小时保持清晰可见，放大时避免变成巨大色块
  const zoomComp = Math.pow(cam.zoom, -0.25)
  return n.baseRadius * nodeSizeMultiplier.value * zoomComp
}

function hitTestNode(sx: number, sy: number): SimNode | null {
  const w = screenToWorld(sx, sy)
  let best: SimNode | null = null
  let bestDist = Infinity
  // 逆序检测，优先命中顶层节点
  for (let i = simNodes.length - 1; i >= 0; i--) {
    const n = simNodes[i]
    const hitR = Math.max(nodeRadius(n) + 6 / cam.zoom, 13 / cam.zoom)
    const dx = w.x - n.x
    const dy = w.y - n.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d <= hitR && d < bestDist) {
      best = n
      bestDist = d
    }
  }
  return best
}

// ============ 图谱构建与热启动 ============
function rebuildGraph(preservePositions = true, autoFit = false) {
  let prevPos: Map<string, { x: number; y: number }> | undefined
  if (preservePositions && simNodes.length) {
    prevPos = new Map(simNodes.map((n) => [n.id, { x: n.x, y: n.y }]))
  }

  const built = buildGraph(
    graphData,
    {
      enabledTopics: enabledTopics.value,
      showTopics: showTopics.value,
      showTags: showTags.value,
      onlySharedTags: onlySharedTags.value,
      showOrphans: showOrphans.value,
      localFocusId: localFocusId.value,
      localDepth: localDepth.value,
    },
    prevPos,
  )

  simNodes = built.nodes
  simEdges = built.edges
  simAdj = built.adjacency
  simNodeById = new Map(simNodes.map((n) => [n.id, n]))
  graphStats.value = built.stats
  graphVersion.value++

  // 若当前选中或悬停的节点已被筛除，清空状态
  if (selectedNodeId.value && !simNodeById.has(selectedNodeId.value)) {
    selectedNodeId.value = null
  }
  if (hoveredNodeId.value && !simNodeById.has(hoveredNodeId.value)) {
    hoveredNodeId.value = null
  }

  // 仅做轻量预热，保留肉眼可见的星团自然舒展入场动画
  const warmupSteps = preservePositions ? 8 : 22
  let warmAlpha = preservePositions ? 0.5 : 0.95
  for (let i = 0; i < warmupSteps; i++) {
    stepSimulation(simNodes, simEdges, forces, warmAlpha)
    warmAlpha *= 0.985
  }

  simAlpha = preservePositions ? 0.65 : 0.92
  if (autoFit) {
    fitToView(!preservePositions)
  }
  wakeLoop()
}

function fitToView(instant = false) {
  if (!simNodes.length) return
  wheelZoomTarget = null
  const b = computeBounds(simNodes)
  // 为桌面端右侧设置面板预留视觉留白
  const rightPad = settingsOpen.value && viewW >= 1024 ? 270 : 32
  const availW = Math.max(240, viewW - rightPad - 48)
  const availH = Math.max(240, viewH - 96)
  const scaleX = availW / b.width
  const scaleY = availH / b.height
  const targetZoom = Math.min(1.65, Math.max(0.28, Math.min(scaleX, scaleY) * 0.9))
  const offsetX = settingsOpen.value && viewW >= 1024 ? rightPad / (2 * targetZoom) : 0
  const target = { x: b.cx + offsetX * 0.5, y: b.cy, zoom: targetZoom }

  if (instant) {
    cam.x = target.x
    cam.y = target.y
    cam.zoom = target.zoom
    camTarget = null
  } else {
    camTarget = target
  }
  wakeLoop()
}

function focusCameraOnNode(nodeId: string, zoomBoost = false) {
  const n = simNodeById.get(nodeId)
  if (!n) return
  wheelZoomTarget = null
  const targetZoom = zoomBoost ? Math.max(cam.zoom, 1.25) : cam.zoom
  camTarget = { x: n.x, y: n.y, zoom: targetZoom }
  wakeLoop()
}

function zoomBy(factor: number) {
  wheelZoomTarget = null
  const baseZoom = camTarget?.zoom ?? cam.zoom
  const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, baseZoom * factor))
  camTarget = {
    x: camTarget?.x ?? cam.x,
    y: camTarget?.y ?? cam.y,
    zoom: nextZoom,
  }
  wakeLoop()
}

// ============ Canvas 渲染循环 ============
function drawArrowHead(
  c: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  targetR: number,
  size: number,
) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < targetR + size + 4) return
  const ux = dx / dist
  const uy = dy / dist
  const tipX = x2 - ux * (targetR + 3.5)
  const tipY = y2 - uy * (targetR + 3.5)
  const angle = Math.atan2(uy, ux)
  const spread = 0.44

  c.beginPath()
  c.moveTo(tipX, tipY)
  c.lineTo(tipX - Math.cos(angle - spread) * size, tipY - Math.sin(angle - spread) * size)
  c.lineTo(tipX - Math.cos(angle + spread) * size, tipY - Math.sin(angle + spread) * size)
  c.closePath()
  c.fill()
}

function truncateLabel(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen)}…`
}

function renderFrame(nowTs: number): boolean {
  if (!ctx) return false
  const dark = isDark.value
  const dt = lastFrameTs ? Math.min(0.05, (nowTs - lastFrameTs) / 1000) : 0.016
  lastFrameTs = nowTs
  ambientTime += dt

  // 1. 持续活态力导向模拟（主收敛 + 轻柔星尘呼吸漂浮）
  const liveAlpha = dragNode ? Math.max(simAlpha, 0.45) : Math.max(simAlpha, ALPHA_FLOOR)
  stepSimulation(simNodes, simEdges, forces, liveAlpha, ambientTime, AMBIENT_STRENGTH)
  if (!dragNode && simAlpha > ALPHA_FLOOR) {
    simAlpha = Math.max(ALPHA_FLOOR, simAlpha * 0.988)
  }

  // 2a. 光标锚定平滑滚轮缩放插值（彻底消除阶梯跳跃感）
  if (wheelZoomTarget !== null) {
    const diff = wheelZoomTarget - cam.zoom
    if (Math.abs(diff) < 0.0008 * cam.zoom) {
      cam.zoom = wheelZoomTarget
      wheelZoomTarget = null
    } else {
      cam.zoom += diff * 0.28
    }
    cam.x = wheelAnchorWorld.x - (wheelAnchorScreen.x - viewW / 2) / cam.zoom
    cam.y = wheelAnchorWorld.y - (wheelAnchorScreen.y - viewH / 2) / cam.zoom
  }

  // 2b. 相机平滑缓动（适应画布 / 按钮缩放 / 聚焦节点）
  if (camTarget) {
    const ease = 0.18
    cam.x += (camTarget.x - cam.x) * ease
    cam.y += (camTarget.y - cam.y) * ease
    cam.zoom += (camTarget.zoom - cam.zoom) * ease
    if (
      Math.abs(camTarget.x - cam.x) < 0.35 &&
      Math.abs(camTarget.y - cam.y) < 0.35 &&
      Math.abs(camTarget.zoom - cam.zoom) < 0.002
    ) {
      cam.x = camTarget.x
      cam.y = camTarget.y
      cam.zoom = camTarget.zoom
      camTarget = null
    }
  }

  // 3. 计算高亮焦点集（悬停优先于选中；无焦点时按搜索词高亮）
  const activeFocusId = hoveredNodeId.value || selectedNodeId.value
  const focusNeighbors = activeFocusId ? simAdj.get(activeFocusId) : null
  const hasSearch = searchQuery.value.trim().length > 0
  const matches = searchMatches.value

  const isHighlightedNode = (id: string): boolean => {
    if (activeFocusId) return id === activeFocusId || Boolean(focusNeighbors?.has(id))
    if (hasSearch) return matches.has(id)
    return true
  }

  const isDimMode = Boolean(activeFocusId) || hasSearch

  // 平滑更新每个节点的 renderAlpha（Obsidian 经典柔滑淡入淡出）
  for (let i = 0; i < simNodes.length; i++) {
    const n = simNodes[i]
    const target = isHighlightedNode(n.id) ? 1 : 0.12
    const diff = target - n.renderAlpha
    if (Math.abs(diff) > 0.01) {
      n.renderAlpha += diff * 0.22
    } else {
      n.renderAlpha = target
    }
  }

  // 4. 绘制背景与微妙空间点阵
  ctx.save()
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const bgColor = dark ? '#111622' : '#f4f6f9'
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, viewW, viewH)

  // 轻微径向氛围光
  const radGrad = ctx.createRadialGradient(
    viewW * 0.45,
    viewH * 0.45,
    0,
    viewW * 0.45,
    viewH * 0.45,
    Math.max(viewW, viewH) * 0.72,
  )
  if (dark) {
    radGrad.addColorStop(0, 'rgba(99, 102, 241, 0.065)')
    radGrad.addColorStop(0.55, 'rgba(30, 41, 59, 0.03)')
    radGrad.addColorStop(1, 'rgba(9, 13, 22, 0.25)')
  } else {
    radGrad.addColorStop(0, 'rgba(59, 130, 246, 0.055)')
    radGrad.addColorStop(1, 'rgba(15, 23, 42, 0.02)')
  }
  ctx.fillStyle = radGrad
  ctx.fillRect(0, 0, viewW, viewH)

  // 空间微点阵（随相机移动，提供空间锚定感）
  const baseGrid = 36
  const step = baseGrid * cam.zoom
  if (step >= 12) {
    const ox = ((viewW / 2 - cam.x * cam.zoom) % step + step) % step
    const oy = ((viewH / 2 - cam.y * cam.zoom) % step + step) % step
    ctx.fillStyle = dark ? 'rgba(255, 255, 255, 0.045)' : 'rgba(15, 23, 42, 0.055)'
    for (let gx = ox; gx < viewW; gx += step) {
      for (let gy = oy; gy < viewH; gy += step) {
        ctx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5)
      }
    }
  }

  // 5. 切入世界坐标系
  ctx.translate(viewW / 2, viewH / 2)
  ctx.scale(cam.zoom, cam.zoom)
  ctx.translate(-cam.x, -cam.y)

  const lineMult = lineSizeMultiplier.value
  const invZoom = 1 / cam.zoom

  // 6. 绘制连线（按层次：专题线 -> 标签线 -> 直接双链，确保重要连线在最上层）
  for (let i = 0; i < simEdges.length; i++) {
    const e = simEdges[i]
    const s = e.source
    const t = e.target

    const edgeHighlighted = activeFocusId
      ? s.id === activeFocusId || t.id === activeFocusId
      : hasSearch
        ? matches.has(s.id) || matches.has(t.id)
        : false

    const edgeAlpha = isDimMode
      ? edgeHighlighted
        ? e.kind === 'link'
          ? 0.96
          : 0.78
        : 0.045
      : e.kind === 'link'
        ? 0.68
        : e.kind === 'tag'
          ? 0.25
          : 0.16

    let strokeColor = dark ? '#94a3b8' : '#64748b'
    if (e.kind === 'link') {
      strokeColor = dark ? '#a78bfa' : '#6366f1'
    } else if (e.kind === 'tag') {
      strokeColor = edgeHighlighted
        ? dark
          ? TAG_PALETTE.dark
          : TAG_PALETTE.light
        : dark
          ? '#64748b'
          : '#94a3b8'
    } else if (e.kind === 'topic') {
      strokeColor = getTopicColor(s.topicDir || t.topicDir, dark)
    }

    const baseWidth =
      e.kind === 'link'
        ? edgeHighlighted
          ? 2.2
          : 1.55
        : edgeHighlighted
          ? 1.55
          : e.kind === 'tag'
            ? 0.95
            : 0.85

    ctx.save()
    ctx.globalAlpha = edgeAlpha
    ctx.strokeStyle = strokeColor
    ctx.fillStyle = strokeColor
    ctx.lineWidth = Math.max(0.5, baseWidth * lineMult * Math.min(1.3, Math.max(0.65, invZoom)))

    ctx.beginPath()
    ctx.moveTo(s.x, s.y)
    ctx.lineTo(t.x, t.y)
    ctx.stroke()

    // 直接文章双链的箭头
    if (showArrows.value && e.kind === 'link' && edgeAlpha > 0.1) {
      const arrowSize = Math.max(5.5, 7 * Math.min(1.2, Math.max(0.75, invZoom)))
      drawArrowHead(ctx, s.x, s.y, t.x, t.y, nodeRadius(t), arrowSize)
      if (e.bidirectional) {
        drawArrowHead(ctx, t.x, t.y, s.x, s.y, nodeRadius(s), arrowSize)
      }
    }
    ctx.restore()
  }

  // 7. 绘制节点
  for (let i = 0; i < simNodes.length; i++) {
    const n = simNodes[i]
    const isHovered = n.id === hoveredNodeId.value
    const isSelected = n.id === selectedNodeId.value
    const isMatched = hasSearch && matches.has(n.id)
    const isFocused = isHovered || isSelected
    const color = getNodeColor(n, dark)
    const r = nodeRadius(n) * (isHovered ? 1.24 : isSelected ? 1.18 : 1)

    ctx.save()
    ctx.globalAlpha = n.renderAlpha

    // 悬停 / 选中 / 搜索命中光晕
    if (isFocused || isMatched) {
      ctx.beginPath()
      ctx.arc(n.x, n.y, r + 6 * invZoom, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = n.renderAlpha * (isFocused ? 0.24 : 0.16)
      ctx.fill()
      ctx.globalAlpha = n.renderAlpha
    }

    if (n.type === 'topic') {
      // 专题锚点：双环星核样式
      ctx.beginPath()
      ctx.arc(n.x, n.y, r + 3.2, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.globalAlpha = n.renderAlpha * 0.18
      ctx.fill()

      ctx.globalAlpha = n.renderAlpha
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      ctx.lineWidth = Math.max(1.4, 2 * invZoom)
      ctx.strokeStyle = isFocused ? (dark ? '#ffffff' : '#0f172a') : bgColor
      ctx.stroke()
    } else if (n.type === 'tag') {
      // 标签节点：菱形徽章（一眼区分文章圆点与 #标签）
      const d = r * 1.15
      ctx.beginPath()
      ctx.moveTo(n.x, n.y - d)
      ctx.lineTo(n.x + d, n.y)
      ctx.lineTo(n.x, n.y + d)
      ctx.lineTo(n.x - d, n.y)
      ctx.closePath()
      ctx.fillStyle = dark ? '#0e2936' : '#ecfeff'
      ctx.fill()
      ctx.lineWidth = Math.max(1.3, 1.7 * invZoom)
      ctx.strokeStyle = isFocused ? (dark ? '#ffffff' : '#0e7490') : color
      ctx.stroke()
    } else {
      // 文章节点：Obsidian 标志性实心圆点
      ctx.beginPath()
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      if (isFocused || isMatched) {
        ctx.lineWidth = Math.max(1.5, 2.2 * invZoom)
        ctx.strokeStyle = dark ? '#f8fafc' : '#0f172a'
        ctx.stroke()
      } else {
        ctx.lineWidth = Math.max(0.8, 1.1 * invZoom)
        ctx.strokeStyle = bgColor
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // 8. 切回屏幕坐标系绘制文字标签（保证任意缩放倍率下字号始终锐利一致，不再忽大忽小）
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  const labelQueue: { node: SimNode; alpha: number; priority: number }[] = []
  for (let i = 0; i < simNodes.length; i++) {
    const n = simNodes[i]
    const isHovered = n.id === hoveredNodeId.value
    const isSelected = n.id === selectedNodeId.value
    const isNeighbor = Boolean(activeFocusId && focusNeighbors?.has(n.id))
    const isMatched = hasSearch && matches.has(n.id)

    if (isHovered || isSelected) {
      labelQueue.push({ node: n, alpha: 1, priority: 3 })
      continue
    }
    if (isNeighbor || isMatched) {
      labelQueue.push({ node: n, alpha: 0.96, priority: 2 })
      continue
    }
    if (isDimMode) continue

    // 按缩放比例与节点重要度计算平滑淡入透明度
    let importance = 0.62 + Math.min(0.55, n.degree * 0.08)
    if (n.type === 'topic') importance = 1.9
    else if (n.type === 'tag') importance = 0.78 + Math.min(0.45, n.degree * 0.06)

    const vis = (cam.zoom * importance - textFadeThreshold.value) * 2.1
    if (vis > 0.05) {
      labelQueue.push({ node: n, alpha: Math.min(0.92, vis), priority: n.type === 'topic' ? 1 : 0 })
    }
  }

  labelQueue.sort((a, b) => a.priority - b.priority)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  for (let i = 0; i < labelQueue.length; i++) {
    const { node: n, alpha, priority } = labelQueue[i]
    const isPrimary = priority >= 3
    const sp = worldToScreen(n.x, n.y)
    // 跳过视口外标签，省去无效绘制
    if (sp.x < -140 || sp.x > viewW + 140 || sp.y < -60 || sp.y > viewH + 60) continue

    const screenR = nodeRadius(n) * cam.zoom
    const fontSize = n.type === 'topic' ? 13 : isPrimary ? 12.5 : 11.5
    const text = isPrimary || n.type === 'topic' ? n.label : truncateLabel(n.label, 16)
    const ty = sp.y + screenR + (n.type === 'topic' ? 6 : 5)

    ctx.save()
    ctx.globalAlpha = alpha
    ctx.font = `${n.type === 'topic' || isPrimary ? '600' : '400'} ${fontSize}px -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`

    ctx.lineJoin = 'round'
    ctx.lineWidth = 3.4
    ctx.strokeStyle = dark ? 'rgba(17, 22, 34, 0.9)' : 'rgba(244, 246, 249, 0.94)'
    ctx.strokeText(text, sp.x, ty)

    ctx.fillStyle =
      n.type === 'topic'
        ? dark
          ? '#f8fafc'
          : '#0f172a'
        : n.type === 'tag'
          ? dark
            ? '#67e8f9'
            : '#0e7490'
          : isPrimary
            ? dark
              ? '#ffffff'
              : '#0f172a'
            : dark
              ? '#cbd5e1'
              : '#334155'
    ctx.fillText(text, sp.x, ty)
    ctx.restore()
  }

  ctx.restore()
  return !isTabHidden
}

function loop(nowTs: number) {
  rafId = null
  needsRender = false
  const keepGoing = renderFrame(nowTs)
  if ((keepGoing || needsRender) && !isTabHidden) {
    rafId = window.requestAnimationFrame(loop)
  }
}

function wakeLoop() {
  needsRender = true
  if (rafId === null && typeof window !== 'undefined') {
    rafId = window.requestAnimationFrame(loop)
  }
}

// ============ Canvas 尺寸同步 ============
function syncCanvasSize() {
  const canvas = canvasRef.value
  const shell = shellRef.value
  if (!canvas || !shell) return
  const rect = shell.getBoundingClientRect()
  viewW = Math.max(1, Math.floor(rect.width))
  viewH = Math.max(1, Math.floor(rect.height))
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(viewW * dpr)
  canvas.height = Math.floor(viewH * dpr)
  ctx = canvas.getContext('2d')
  wakeLoop()
}

// ============ 指针与手势交互（鼠标拖拽 / 滚轮缩放 / 触屏双指缩放） ============
function getCanvasXY(e: PointerEvent | WheelEvent): { x: number; y: number } {
  const rect = canvasRef.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function onPointerDown(e: PointerEvent) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  const canvas = canvasRef.value
  if (!canvas) return
  canvas.setPointerCapture(e.pointerId)

  const pt = getCanvasXY(e)
  activePointers.set(e.pointerId, pt)
  camTarget = null
  wheelZoomTarget = null

  // 双指手势：进入 pinch-to-zoom 模式
  if (activePointers.size === 2) {
    dragNode = null
    isPanning = false
    const pts = [...activePointers.values()]
    pinchStartDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1
    pinchStartZoom = cam.zoom
    const midX = (pts[0].x + pts[1].x) / 2
    const midY = (pts[0].y + pts[1].y) / 2
    pinchStartMidWorld = screenToWorld(midX, midY)
    return
  }

  pointerDownPos = pt
  pointerTravel = 0

  const hit = hitTestNode(pt.x, pt.y)
  if (hit) {
    dragNode = hit
    const w = screenToWorld(pt.x, pt.y)
    dragNode.fx = w.x
    dragNode.fy = w.y
    simAlpha = Math.max(simAlpha, 0.35)
    hoveredNodeId.value = hit.id
    wakeLoop()
  } else {
    isPanning = true
    panStartCam = { x: cam.x, y: cam.y }
  }
}

function onPointerMove(e: PointerEvent) {
  const pt = getCanvasXY(e)

  if (activePointers.has(e.pointerId)) {
    activePointers.set(e.pointerId, pt)
  }

  // 双指缩放
  if (activePointers.size === 2) {
    const pts = [...activePointers.values()]
    const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y) || 1
    const midX = (pts[0].x + pts[1].x) / 2
    const midY = (pts[0].y + pts[1].y) / 2
    const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * (dist / pinchStartDist)))
    cam.zoom = nextZoom
    cam.x = pinchStartMidWorld.x - (midX - viewW / 2) / cam.zoom
    cam.y = pinchStartMidWorld.y - (midY - viewH / 2) / cam.zoom
    wakeLoop()
    return
  }

  if (dragNode) {
    pointerTravel = Math.max(
      pointerTravel,
      Math.hypot(pt.x - pointerDownPos.x, pt.y - pointerDownPos.y),
    )
    const w = screenToWorld(pt.x, pt.y)
    dragNode.fx = w.x
    dragNode.fy = w.y
    simAlpha = Math.max(simAlpha, 0.32)
    wakeLoop()
    return
  }

  if (isPanning) {
    const dx = pt.x - pointerDownPos.x
    const dy = pt.y - pointerDownPos.y
    pointerTravel = Math.max(pointerTravel, Math.hypot(dx, dy))
    cam.x = panStartCam.x - dx / cam.zoom
    cam.y = panStartCam.y - dy / cam.zoom
    wakeLoop()
    return
  }

  // 悬停命中检测
  const hit = hitTestNode(pt.x, pt.y)
  const nextHover = hit ? hit.id : null
  if (nextHover !== hoveredNodeId.value) {
    hoveredNodeId.value = nextHover
    if (canvasRef.value) {
      canvasRef.value.style.cursor = nextHover ? 'pointer' : 'grab'
    }
    wakeLoop()
  }
}

function onPointerUp(e: PointerEvent) {
  activePointers.delete(e.pointerId)
  const wasClick = pointerTravel < 6

  if (dragNode) {
    const clickedNode = dragNode
    dragNode.fx = null
    dragNode.fy = null
    dragNode = null
    simAlpha = Math.max(simAlpha, 0.2)

    if (wasClick) {
      const now = Date.now()
      // 双击文章节点直接跳转阅读
      if (
        clickedNode.type === 'article' &&
        clickedNode.article &&
        lastClickNodeId === clickedNode.id &&
        now - lastClickTime < 340
      ) {
        openArticle(clickedNode.article.url)
        lastClickTime = 0
        lastClickNodeId = null
      } else {
        selectedNodeId.value = clickedNode.id
        lastClickTime = now
        lastClickNodeId = clickedNode.id
      }
    }
    wakeLoop()
    return
  }

  if (isPanning) {
    isPanning = false
    if (wasClick) {
      selectedNodeId.value = null
      wakeLoop()
    }
  }
}

function onPointerLeave() {
  if (!dragNode && !isPanning && hoveredNodeId.value !== null) {
    hoveredNodeId.value = null
    wakeLoop()
  }
}

function onWheel(e: WheelEvent) {
  e.preventDefault()
  camTarget = null
  const pt = getCanvasXY(e)

  // 光标位置明显移动或刚开始新一轮缩放时，重新锚定光标对应的世界坐标
  if (
    wheelZoomTarget === null ||
    Math.hypot(pt.x - wheelAnchorScreen.x, pt.y - wheelAnchorScreen.y) > 4
  ) {
    wheelAnchorScreen = pt
    wheelAnchorWorld = screenToWorld(pt.x, pt.y)
  }

  // 区分 macOS 触控板捏合（ctrlKey）、像素滚动与行模式鼠标滚轮，保证手感一致丝滑
  let rawDelta = -e.deltaY
  if (e.deltaMode === 1) {
    rawDelta *= 28
  } else if (e.deltaMode === 2) {
    rawDelta *= 240
  }
  const sensitivity = e.ctrlKey ? 0.011 : 0.0024
  // 限制单次事件跨度，避免极速甩滚轮瞬间飞出视野
  const clamped = Math.max(-0.45, Math.min(0.45, rawDelta * sensitivity))
  const base = wheelZoomTarget ?? cam.zoom
  wheelZoomTarget = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, base * Math.exp(clamped)))
  wakeLoop()
}

// ============ 操作动作 ============
function openArticle(url: string) {
  router.go(withBase(url))
}

function selectAndFocus(nodeId: string) {
  if (!simNodeById.has(nodeId)) {
    // 若该节点在当前局部视图外，切回全局视图再聚焦
    if (localFocusId.value) {
      localFocusId.value = null
      rebuildGraph(true, false)
    }
    if (!simNodeById.has(nodeId)) return
  }
  selectedNodeId.value = nodeId
  focusCameraOnNode(nodeId, true)
}

function enterLocalGraph(nodeId: string) {
  localFocusId.value = nodeId
  selectedNodeId.value = nodeId
  rebuildGraph(true, true)
}

function exitLocalGraph() {
  localFocusId.value = null
  rebuildGraph(true, true)
}

function toggleTopic(dir: string) {
  const next = new Set(enabledTopics.value)
  if (next.has(dir)) {
    // 至少保留一个专题，避免空白画布
    if (next.size <= 1) return
    next.delete(dir)
  } else {
    next.add(dir)
  }
  enabledTopics.value = next
}

function enableAllTopics() {
  enabledTopics.value = new Set(graphData.topics.map((t) => t.dir))
}

function resetForces() {
  Object.assign(forces, DEFAULT_FORCES)
  simAlpha = 0.7
  wakeLoop()
}

function relayout() {
  rebuildGraph(false, true)
}

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (searchQuery.value) searchQuery.value = ''
    else if (selectedNodeId.value) selectedNodeId.value = null
    else if (localFocusId.value) exitLocalGraph()
    wakeLoop()
  } else if (
    e.key === '/' &&
    document.activeElement?.tagName !== 'INPUT' &&
    document.activeElement?.tagName !== 'TEXTAREA'
  ) {
    e.preventDefault()
    settingsOpen.value = true
    sectionOpen.filters = true
    window.requestAnimationFrame(() => searchInputRef.value?.focus())
  } else if (
    e.key === '0' &&
    document.activeElement?.tagName !== 'INPUT' &&
    document.activeElement?.tagName !== 'TEXTAREA'
  ) {
    fitToView(false)
  }
}

// ============ 响应式监听 ============
watch(
  [enabledTopics, showTopics, showTags, onlySharedTags, showOrphans, localDepth],
  () => {
    rebuildGraph(true, false)
  },
  { deep: false },
)

watch(
  () => ({ ...forces }),
  () => {
    simAlpha = Math.max(simAlpha, 0.55)
    wakeLoop()
  },
)

watch([isDark, showArrows, textFadeThreshold, nodeSizeMultiplier, lineSizeMultiplier, searchQuery], () => {
  wakeLoop()
})

// 当 graphVersion 变化时，强制 computed 感知 simNodeById 更新
watch(graphVersion, () => {
  wakeLoop()
})

let resizeObserver: ResizeObserver | null = null

function onVisibilityChange() {
  isTabHidden = document.hidden
  if (!isTabHidden) {
    lastFrameTs = 0
    wakeLoop()
  }
}

onMounted(() => {
  // 宽屏默认展开控制面板，小屏默认收起为右上角齿轮按钮
  settingsOpen.value = window.innerWidth >= 1120
  isTabHidden = document.hidden
  syncCanvasSize()
  rebuildGraph(false, true)

  if (shellRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => syncCanvasSize())
    resizeObserver.observe(shellRef.value)
  }
  window.addEventListener('keydown', onKeyDown)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onBeforeUnmount(() => {
  if (rafId !== null) window.cancelAnimationFrame(rafId)
  resizeObserver?.disconnect()
  window.removeEventListener('keydown', onKeyDown)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div ref="shellRef" class="og-shell" :class="{ 'is-dark': isDark }">
    <!-- 主力导向画布 -->
    <canvas
      ref="canvasRef"
      class="og-canvas"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerLeave"
      @wheel.prevent="onWheel"
    />

    <!-- 左上角：标题与实时统计胶囊 -->
    <div class="og-topbar">
      <div class="og-brand-pill">
        <span class="og-brand-dot" aria-hidden="true" />
        <h1 class="og-brand-title">知识图谱</h1>
        <span class="og-brand-sep" aria-hidden="true" />
        <span class="og-brand-stats">
          {{ graphStats.articleCount }} 篇文章
          <template v-if="showTags && graphStats.tagCount"> · {{ graphStats.tagCount }} 标签</template>
          <template v-if="graphStats.directLinkCount"> · {{ graphStats.directLinkCount }} 双链</template>
        </span>
      </div>

      <!-- 局部图谱模式状态条 -->
      <div v-if="localFocusId" class="og-local-pill">
        <span class="og-local-label">局部图谱：{{ localFocusLabel }}</span>
        <div class="og-depth-group" role="group" aria-label="关联层级">
          <button
            type="button"
            class="og-depth-btn"
            :class="{ active: localDepth === 1 }"
            @click="localDepth = 1"
          >
            1 跳
          </button>
          <button
            type="button"
            class="og-depth-btn"
            :class="{ active: localDepth === 2 }"
            @click="localDepth = 2"
          >
            2 跳
          </button>
        </div>
        <button type="button" class="og-local-exit" @click="exitLocalGraph">
          返回全局
        </button>
      </div>
    </div>

    <!-- 右上角：Obsidian 风格折叠设置面板 -->
    <div class="og-controls-anchor">
      <button
        type="button"
        class="og-icon-btn og-gear-btn"
        :class="{ active: settingsOpen }"
        :aria-expanded="settingsOpen"
        aria-label="图谱设置"
        title="图谱设置"
        @click="settingsOpen = !settingsOpen"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <Transition name="og-panel">
        <aside v-if="settingsOpen" class="og-panel" aria-label="图谱控制面板">
          <!-- 1. 筛选 -->
          <section class="og-sec">
            <button
              type="button"
              class="og-sec-head"
              @click="sectionOpen.filters = !sectionOpen.filters"
            >
              <span class="og-chevron" :class="{ open: sectionOpen.filters }">▸</span>
              <span>筛选</span>
            </button>
            <div v-if="sectionOpen.filters" class="og-sec-body">
              <div class="og-search-wrap">
                <svg class="og-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  ref="searchInputRef"
                  v-model="searchQuery"
                  type="text"
                  class="og-search-input"
                  placeholder="搜索文章或标签… (/)"
                  aria-label="搜索文章或标签"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="og-search-clear"
                  aria-label="清空搜索"
                  @click="searchQuery = ''"
                >
                  ×
                </button>
              </div>
              <p v-if="searchQuery.trim()" class="og-search-hint">
                命中 {{ searchMatches.size }} 个节点
              </p>

              <label class="og-toggle-row">
                <span>专题节点</span>
                <input v-model="showTopics" type="checkbox" class="og-switch" />
              </label>
              <label class="og-toggle-row">
                <span>标签节点</span>
                <input v-model="showTags" type="checkbox" class="og-switch" />
              </label>
              <label v-if="showTags" class="og-toggle-row og-sub-row">
                <span>仅共享标签（≥2 篇）</span>
                <input v-model="onlySharedTags" type="checkbox" class="og-switch" />
              </label>
              <label class="og-toggle-row">
                <span>孤立文章</span>
                <input v-model="showOrphans" type="checkbox" class="og-switch" />
              </label>
            </div>
          </section>

          <!-- 2. 专题分组（图例 + 筛选） -->
          <section class="og-sec">
            <button
              type="button"
              class="og-sec-head"
              @click="sectionOpen.groups = !sectionOpen.groups"
            >
              <span class="og-chevron" :class="{ open: sectionOpen.groups }">▸</span>
              <span>专题分组</span>
              <span
                v-if="!allTopicsEnabled"
                class="og-reset-inline"
                @click.stop="enableAllTopics"
              >
                全选
              </span>
            </button>
            <div v-if="sectionOpen.groups" class="og-sec-body og-groups-list">
              <button
                v-for="t in graphData.topics"
                :key="t.dir"
                type="button"
                class="og-group-item"
                :class="{ disabled: !enabledTopics.has(t.dir) }"
                @click="toggleTopic(t.dir)"
              >
                <span
                  class="og-group-dot"
                  :style="{ backgroundColor: getTopicColor(t.dir, isDark) }"
                />
                <span class="og-group-name">{{ t.label }}</span>
                <span class="og-group-count">{{ topicCounts.get(t.dir) || 0 }}</span>
              </button>
              <div v-if="showTags" class="og-legend-note">
                <span
                  class="og-legend-diamond"
                  :style="{ borderColor: isDark ? TAG_PALETTE.dark : TAG_PALETTE.light }"
                />
                <span>菱形为标签节点，亮紫线为文章双链</span>
              </div>
            </div>
          </section>

          <!-- 3. 显示 -->
          <section class="og-sec">
            <button
              type="button"
              class="og-sec-head"
              @click="sectionOpen.display = !sectionOpen.display"
            >
              <span class="og-chevron" :class="{ open: sectionOpen.display }">▸</span>
              <span>显示</span>
            </button>
            <div v-if="sectionOpen.display" class="og-sec-body">
              <label class="og-toggle-row">
                <span>双链箭头</span>
                <input v-model="showArrows" type="checkbox" class="og-switch" />
              </label>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>文字淡出阈值</span>
                  <span class="og-slider-val">{{ textFadeThreshold.toFixed(2) }}</span>
                </div>
                <input
                  v-model.number="textFadeThreshold"
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  class="og-range"
                />
              </div>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>节点大小</span>
                  <span class="og-slider-val">{{ nodeSizeMultiplier.toFixed(2) }}×</span>
                </div>
                <input
                  v-model.number="nodeSizeMultiplier"
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.05"
                  class="og-range"
                />
              </div>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>连线粗细</span>
                  <span class="og-slider-val">{{ lineSizeMultiplier.toFixed(2) }}×</span>
                </div>
                <input
                  v-model.number="lineSizeMultiplier"
                  type="range"
                  min="0.5"
                  max="2.2"
                  step="0.1"
                  class="og-range"
                />
              </div>
            </div>
          </section>

          <!-- 4. 力学参数 -->
          <section class="og-sec">
            <button
              type="button"
              class="og-sec-head"
              @click="sectionOpen.forces = !sectionOpen.forces"
            >
              <span class="og-chevron" :class="{ open: sectionOpen.forces }">▸</span>
              <span>力学参数</span>
            </button>
            <div v-if="sectionOpen.forces" class="og-sec-body">
              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>向心力</span>
                  <span class="og-slider-val">{{ forces.centerStrength.toFixed(2) }}</span>
                </div>
                <input
                  v-model.number="forces.centerStrength"
                  type="range"
                  min="0.02"
                  max="1.0"
                  step="0.02"
                  class="og-range"
                />
              </div>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>节点斥力</span>
                  <span class="og-slider-val">{{ forces.repelStrength.toFixed(1) }}</span>
                </div>
                <input
                  v-model.number="forces.repelStrength"
                  type="range"
                  min="4"
                  max="36"
                  step="1"
                  class="og-range"
                />
              </div>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>连线引力</span>
                  <span class="og-slider-val">{{ forces.linkStrength.toFixed(2) }}</span>
                </div>
                <input
                  v-model.number="forces.linkStrength"
                  type="range"
                  min="0.05"
                  max="1.5"
                  step="0.05"
                  class="og-range"
                />
              </div>

              <div class="og-slider-row">
                <div class="og-slider-head">
                  <span>连线距离</span>
                  <span class="og-slider-val">{{ Math.round(forces.linkDistance) }}</span>
                </div>
                <input
                  v-model.number="forces.linkDistance"
                  type="range"
                  min="60"
                  max="260"
                  step="5"
                  class="og-range"
                />
              </div>

              <button type="button" class="og-ghost-btn" @click="resetForces">
                恢复默认参数
              </button>
            </div>
          </section>
        </aside>
      </Transition>
    </div>

    <!-- 左下角：选中节点详情卡片 -->
    <Transition name="og-card">
      <aside v-if="selectedNode" class="og-inspector" aria-label="节点详情">
        <!-- A. 文章节点详情 -->
        <template v-if="selectedArticleDetails">
          <div class="og-ins-head">
            <div class="og-ins-badge">
              <span
                class="og-ins-dot"
                :style="{ backgroundColor: getTopicColor(selectedArticleDetails.article.topicDir, isDark) }"
              />
              <span>{{ selectedArticleDetails.article.topicLabel }}</span>
              <span v-if="selectedArticleDetails.article.categoryLabel" class="og-ins-slash">/</span>
              <span v-if="selectedArticleDetails.article.categoryLabel">
                {{ selectedArticleDetails.article.categoryLabel }}
              </span>
            </div>
            <button
              type="button"
              class="og-ins-close"
              aria-label="关闭详情"
              @click="selectedNodeId = null"
            >
              ×
            </button>
          </div>

          <h2 class="og-ins-title">
            <a
              :href="withBase(selectedArticleDetails.article.url)"
              @click.prevent="openArticle(selectedArticleDetails.article.url)"
            >
              {{ selectedArticleDetails.article.title }}
            </a>
          </h2>

          <p v-if="selectedArticleDetails.article.description" class="og-ins-desc">
            {{ selectedArticleDetails.article.description }}
          </p>

          <p class="og-ins-meta">
            <span v-if="selectedArticleDetails.article.date">
              发布 {{ selectedArticleDetails.article.date }}
            </span>
            <span
              v-if="
                selectedArticleDetails.article.updated &&
                selectedArticleDetails.article.updated !== selectedArticleDetails.article.date
              "
            >
              · 更新 {{ selectedArticleDetails.article.updated }}
            </span>
          </p>

          <div v-if="selectedArticleDetails.article.tags.length" class="og-ins-tags">
            <button
              v-for="tag in selectedArticleDetails.article.tags"
              :key="tag"
              type="button"
              class="og-tag-chip"
              @click="showTags && selectAndFocus(`tag:${tag}`)"
            >
              #{{ tag }}
            </button>
          </div>

          <div class="og-ins-links-scroll">
            <div v-if="selectedArticleDetails.outgoing.length" class="og-ins-group">
              <p class="og-ins-group-label">文中引用 ({{ selectedArticleDetails.outgoing.length }})</p>
              <button
                v-for="a in selectedArticleDetails.outgoing"
                :key="a.id"
                type="button"
                class="og-rel-item"
                @click="selectAndFocus(a.id)"
              >
                <span class="og-rel-arrow">→</span>
                <span class="og-rel-title">{{ a.title }}</span>
              </button>
            </div>

            <div v-if="selectedArticleDetails.incoming.length" class="og-ins-group">
              <p class="og-ins-group-label">反向引用 ({{ selectedArticleDetails.incoming.length }})</p>
              <button
                v-for="a in selectedArticleDetails.incoming"
                :key="a.id"
                type="button"
                class="og-rel-item"
                @click="selectAndFocus(a.id)"
              >
                <span class="og-rel-arrow">←</span>
                <span class="og-rel-title">{{ a.title }}</span>
              </button>
            </div>

            <div v-if="selectedArticleDetails.related.length" class="og-ins-group">
              <p class="og-ins-group-label">同标签关联 ({{ selectedArticleDetails.related.length }})</p>
              <button
                v-for="item in selectedArticleDetails.related"
                :key="item.article.id"
                type="button"
                class="og-rel-item"
                @click="selectAndFocus(item.article.id)"
              >
                <span
                  class="og-rel-dot"
                  :style="{ backgroundColor: getTopicColor(item.article.topicDir, isDark) }"
                />
                <span class="og-rel-title">{{ item.article.title }}</span>
                <span class="og-rel-tag">#{{ item.shared[0] }}</span>
              </button>
            </div>
          </div>

          <div class="og-ins-actions">
            <button
              type="button"
              class="og-btn-secondary"
              @click="enterLocalGraph(selectedNode.id)"
            >
              局部图谱
            </button>
            <button
              type="button"
              class="og-btn-primary"
              @click="openArticle(selectedArticleDetails.article.url)"
            >
              阅读文章 →
            </button>
          </div>
        </template>

        <!-- B. 标签节点详情 -->
        <template v-else-if="selectedNode.type === 'tag'">
          <div class="og-ins-head">
            <div class="og-ins-badge">
              <span
                class="og-legend-diamond"
                :style="{ borderColor: isDark ? TAG_PALETTE.dark : TAG_PALETTE.light }"
              />
              <span>标签 · {{ selectedTagArticles.length }} 篇文章</span>
            </div>
            <button
              type="button"
              class="og-ins-close"
              aria-label="关闭详情"
              @click="selectedNodeId = null"
            >
              ×
            </button>
          </div>

          <h2 class="og-ins-title">{{ selectedNode.label }}</h2>

          <div class="og-ins-links-scroll">
            <div
              v-for="a in selectedTagArticles"
              :key="a.id"
              class="og-rel-row"
            >
              <button
                type="button"
                class="og-rel-item"
                @click="selectAndFocus(a.id)"
              >
                <span
                  class="og-rel-dot"
                  :style="{ backgroundColor: getTopicColor(a.topicDir, isDark) }"
                />
                <span class="og-rel-title">{{ a.title }}</span>
              </button>
              <button
                type="button"
                class="og-rel-go"
                title="打开文章"
                aria-label="打开文章"
                @click="openArticle(a.url)"
              >
                ↗
              </button>
            </div>
          </div>

          <div class="og-ins-actions">
            <button
              type="button"
              class="og-btn-secondary og-btn-full"
              @click="enterLocalGraph(selectedNode.id)"
            >
              聚焦此标签局部图谱
            </button>
          </div>
        </template>

        <!-- C. 专题节点详情 -->
        <template v-else-if="selectedNode.type === 'topic' && selectedNode.topic">
          <div class="og-ins-head">
            <div class="og-ins-badge">
              <span
                class="og-ins-dot"
                :style="{ backgroundColor: getTopicColor(selectedNode.topic.dir, isDark) }"
              />
              <span>专题 · {{ selectedTopicArticles.length }} 篇文章</span>
            </div>
            <button
              type="button"
              class="og-ins-close"
              aria-label="关闭详情"
              @click="selectedNodeId = null"
            >
              ×
            </button>
          </div>

          <h2 class="og-ins-title">{{ selectedNode.topic.label }}</h2>
          <p class="og-ins-desc">{{ selectedNode.topic.description }}</p>

          <div class="og-ins-links-scroll">
            <div
              v-for="a in selectedTopicArticles"
              :key="a.id"
              class="og-rel-row"
            >
              <button
                type="button"
                class="og-rel-item"
                @click="selectAndFocus(a.id)"
              >
                <span
                  class="og-rel-dot"
                  :style="{ backgroundColor: getTopicColor(a.topicDir, isDark) }"
                />
                <span class="og-rel-title">{{ a.title }}</span>
              </button>
              <button
                type="button"
                class="og-rel-go"
                title="打开文章"
                aria-label="打开文章"
                @click="openArticle(a.url)"
              >
                ↗
              </button>
            </div>
          </div>

          <div class="og-ins-actions">
            <button
              type="button"
              class="og-btn-secondary"
              @click="enterLocalGraph(selectedNode.id)"
            >
              局部图谱
            </button>
            <button
              type="button"
              class="og-btn-primary"
              @click="openArticle(selectedNode.topic.url)"
            >
              进入专题 →
            </button>
          </div>
        </template>
      </aside>
    </Transition>

    <!-- 右下角：缩放与视图复位工具栏 -->
    <div class="og-zoom-bar" role="toolbar" aria-label="画布缩放控制">
      <button type="button" class="og-icon-btn" title="放大" aria-label="放大" @click="zoomBy(1.3)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <button type="button" class="og-icon-btn" title="缩小" aria-label="缩小" @click="zoomBy(1 / 1.3)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M5 12h14" />
        </svg>
      </button>
      <span class="og-zoom-sep" aria-hidden="true" />
      <button type="button" class="og-icon-btn" title="适应画布 (0)" aria-label="适应画布" @click="fitToView(false)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
        </svg>
      </button>
      <button type="button" class="og-icon-btn" title="重新布局" aria-label="重新布局" @click="relayout">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      </button>
    </div>

    <!-- 底部极简交互提示（桌面端且未打开详情卡片时显示） -->
    <div v-if="!selectedNode" class="og-hint-pill" aria-hidden="true">
      滚轮缩放 · 拖拽画布或节点 · 单击查看关联 · 双击打开文章
    </div>
  </div>
</template>

<style scoped>
.og-shell {
  --og-glass-bg: rgba(255, 255, 255, 0.82);
  --og-glass-border: rgba(15, 23, 42, 0.09);
  --og-glass-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  --og-text: #1e293b;
  --og-text-sub: #64748b;
  --og-text-muted: #94a3b8;
  --og-hover-bg: rgba(15, 23, 42, 0.055);
  --og-accent: #6366f1;
  --og-accent-soft: rgba(99, 102, 241, 0.12);
  --og-divider: rgba(15, 23, 42, 0.07);

  position: relative;
  width: 100%;
  height: calc(100dvh - var(--vp-nav-height, 64px));
  min-height: 480px;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.og-shell.is-dark {
  --og-glass-bg: rgba(20, 25, 38, 0.8);
  --og-glass-border: rgba(255, 255, 255, 0.1);
  --og-glass-shadow: 0 14px 36px rgba(0, 0, 0, 0.48);
  --og-text: #f1f5f9;
  --og-text-sub: #94a3b8;
  --og-text-muted: #64748b;
  --og-hover-bg: rgba(255, 255, 255, 0.07);
  --og-accent: #a78bfa;
  --og-accent-soft: rgba(167, 139, 250, 0.16);
  --og-divider: rgba(255, 255, 255, 0.08);
}

.og-canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: grab;
}

.og-canvas:active {
  cursor: grabbing;
}

/* ============ 左上角胶囊 ============ */
.og-topbar {
  position: absolute;
  top: 16px;
  left: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  pointer-events: none;
  z-index: 10;
  max-width: calc(100% - 76px);
}

.og-brand-pill,
.og-local-pill {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--og-glass-bg);
  border: 1px solid var(--og-glass-border);
  box-shadow: var(--og-glass-shadow);
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  color: var(--og-text);
  font-size: 13px;
}

.og-brand-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--og-accent);
  box-shadow: 0 0 10px var(--og-accent);
  flex-shrink: 0;
}

.og-brand-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
  white-space: nowrap;
}

.og-brand-sep {
  width: 1px;
  height: 13px;
  background: var(--og-divider);
}

.og-brand-stats {
  color: var(--og-text-sub);
  font-size: 12px;
  white-space: nowrap;
}

.og-local-pill {
  border-color: var(--og-accent);
  padding: 6px 10px 6px 14px;
  gap: 8px;
  flex-wrap: wrap;
}

.og-local-label {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--og-accent);
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.og-depth-group {
  display: inline-flex;
  background: var(--og-hover-bg);
  border-radius: 999px;
  padding: 2px;
}

.og-depth-btn {
  border: none;
  background: transparent;
  color: var(--og-text-sub);
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.og-depth-btn.active {
  background: var(--og-accent);
  color: #ffffff;
}

.og-local-exit {
  border: none;
  background: var(--og-hover-bg);
  color: var(--og-text);
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.15s;
}

.og-local-exit:hover {
  background: var(--og-accent-soft);
  color: var(--og-accent);
}

/* ============ 右上角 Obsidian 控制面板 ============ */
.og-controls-anchor {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 12;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.og-icon-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid var(--og-glass-border);
  background: var(--og-glass-bg);
  color: var(--og-text-sub);
  box-shadow: var(--og-glass-shadow);
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  cursor: pointer;
  transition: color 0.18s, border-color 0.18s, background 0.18s, transform 0.18s;
}

.og-icon-btn svg {
  width: 18px;
  height: 18px;
}

.og-icon-btn:hover {
  color: var(--og-text);
  border-color: var(--og-accent);
}

.og-icon-btn.active {
  color: var(--og-accent);
  border-color: var(--og-accent);
}

.og-panel {
  width: 264px;
  max-height: calc(100dvh - var(--vp-nav-height, 64px) - 138px);
  overflow-y: auto;
  border-radius: 14px;
  background: var(--og-glass-bg);
  border: 1px solid var(--og-glass-border);
  box-shadow: var(--og-glass-shadow);
  backdrop-filter: blur(16px) saturate(1.6);
  -webkit-backdrop-filter: blur(16px) saturate(1.6);
  color: var(--og-text);
  font-size: 13px;
}

.og-panel::-webkit-scrollbar,
.og-ins-links-scroll::-webkit-scrollbar {
  width: 5px;
}

.og-panel::-webkit-scrollbar-thumb,
.og-ins-links-scroll::-webkit-scrollbar-thumb {
  background: var(--og-divider);
  border-radius: 999px;
}

.og-sec {
  border-bottom: 1px solid var(--og-divider);
}

.og-sec:last-child {
  border-bottom: none;
}

.og-sec-head {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 11px 14px;
  border: none;
  background: transparent;
  color: var(--og-text);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.og-sec-head:hover {
  background: var(--og-hover-bg);
}

.og-chevron {
  display: inline-block;
  font-size: 11px;
  color: var(--og-text-muted);
  transition: transform 0.18s ease;
}

.og-chevron.open {
  transform: rotate(90deg);
}

.og-reset-inline {
  margin-left: auto;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--og-accent);
  padding: 1px 6px;
  border-radius: 6px;
}

.og-reset-inline:hover {
  background: var(--og-accent-soft);
}

.og-sec-body {
  padding: 2px 14px 13px;
  display: flex;
  flex-direction: column;
  gap: 9px;
}

/* 搜索框 */
.og-search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.og-search-icon {
  position: absolute;
  left: 9px;
  width: 14px;
  height: 14px;
  color: var(--og-text-muted);
  pointer-events: none;
}

.og-search-input {
  width: 100%;
  padding: 7px 26px 7px 29px;
  border-radius: 9px;
  border: 1px solid var(--og-glass-border);
  background: var(--og-hover-bg);
  color: var(--og-text);
  font-size: 12.5px;
  outline: none;
  transition: border-color 0.16s, background 0.16s;
}

.og-search-input:focus {
  border-color: var(--og-accent);
}

.og-search-input::placeholder {
  color: var(--og-text-muted);
}

.og-search-clear {
  position: absolute;
  right: 6px;
  border: none;
  background: transparent;
  color: var(--og-text-muted);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 4px;
}

.og-search-clear:hover {
  color: var(--og-text);
}

.og-search-hint {
  margin: -3px 0 0;
  font-size: 11.5px;
  color: var(--og-accent);
}

/* 开关行 */
.og-toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--og-text-sub);
  font-size: 12.5px;
  cursor: pointer;
}

.og-sub-row {
  padding-left: 10px;
  font-size: 12px;
}

.og-switch {
  appearance: none;
  -webkit-appearance: none;
  width: 32px;
  height: 18px;
  border-radius: 999px;
  background: var(--og-divider);
  border: 1px solid var(--og-glass-border);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  flex-shrink: 0;
}

.og-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.og-switch:checked {
  background: var(--og-accent);
  border-color: var(--og-accent);
}

.og-switch:checked::after {
  transform: translateX(14px);
}

/* 专题分组 */
.og-groups-list {
  gap: 4px;
}

.og-group-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--og-text);
  font-size: 12.5px;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}

.og-group-item:hover {
  background: var(--og-hover-bg);
}

.og-group-item.disabled {
  opacity: 0.38;
}

.og-group-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}

.og-group-name {
  flex: 1;
  text-align: left;
}

.og-group-count {
  font-size: 11.5px;
  color: var(--og-text-muted);
  font-variant-numeric: tabular-nums;
}

.og-legend-note {
  margin-top: 6px;
  padding-top: 8px;
  border-top: 1px dashed var(--og-divider);
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11.5px;
  color: var(--og-text-muted);
}

.og-legend-diamond {
  width: 8px;
  height: 8px;
  border: 1.6px solid currentColor;
  transform: rotate(45deg);
  flex-shrink: 0;
}

/* 滑块 */
.og-slider-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.og-slider-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--og-text-sub);
}

.og-slider-val {
  color: var(--og-text-muted);
  font-variant-numeric: tabular-nums;
}

.og-range {
  width: 100%;
  accent-color: var(--og-accent);
  height: 4px;
  cursor: pointer;
}

.og-ghost-btn {
  margin-top: 4px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid var(--og-glass-border);
  background: transparent;
  color: var(--og-text-sub);
  font-size: 12px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.og-ghost-btn:hover {
  background: var(--og-hover-bg);
  color: var(--og-text);
}

/* ============ 左下角节点详情卡片 ============ */
.og-inspector {
  position: absolute;
  left: 16px;
  bottom: 16px;
  width: 336px;
  max-width: calc(100% - 32px);
  max-height: min(62vh, 470px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px 16px;
  border-radius: 16px;
  background: var(--og-glass-bg);
  border: 1px solid var(--og-glass-border);
  box-shadow: var(--og-glass-shadow);
  backdrop-filter: blur(18px) saturate(1.6);
  -webkit-backdrop-filter: blur(18px) saturate(1.6);
  color: var(--og-text);
  z-index: 11;
}

.og-ins-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.og-ins-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--og-text-sub);
}

.og-ins-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.og-ins-slash {
  color: var(--og-text-muted);
}

.og-ins-close {
  border: none;
  background: transparent;
  color: var(--og-text-muted);
  font-size: 20px;
  line-height: 1;
  padding: 0 4px;
  border-radius: 6px;
  cursor: pointer;
}

.og-ins-close:hover {
  background: var(--og-hover-bg);
  color: var(--og-text);
}

.og-ins-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--og-text);
}

.og-ins-title a {
  color: inherit;
  text-decoration: none;
}

.og-ins-title a:hover {
  color: var(--og-accent);
}

.og-ins-desc {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--og-text-sub);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.og-ins-meta {
  margin: -2px 0 0;
  font-size: 11.5px;
  color: var(--og-text-muted);
}

.og-ins-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.og-tag-chip {
  border: 1px solid var(--og-glass-border);
  background: var(--og-hover-bg);
  color: var(--og-text-sub);
  font-size: 11.5px;
  padding: 2px 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.og-tag-chip:hover {
  border-color: var(--og-accent);
  color: var(--og-accent);
  background: var(--og-accent-soft);
}

.og-ins-links-scroll {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 2px;
  min-height: 0;
}

.og-ins-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.og-ins-group-label {
  margin: 0 0 3px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  color: var(--og-text-muted);
}

.og-rel-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.og-rel-item {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 5px 8px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--og-text);
  font-size: 12.5px;
  cursor: pointer;
  text-align: left;
  transition: background 0.15s;
}

.og-rel-item:hover {
  background: var(--og-hover-bg);
}

.og-rel-arrow {
  color: var(--og-accent);
  font-weight: 700;
  flex-shrink: 0;
}

.og-rel-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.og-rel-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.og-rel-tag {
  font-size: 11px;
  color: var(--og-text-muted);
  flex-shrink: 0;
}

.og-rel-go {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--og-text-muted);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 13px;
  transition: background 0.15s, color 0.15s;
}

.og-rel-go:hover {
  background: var(--og-accent-soft);
  color: var(--og-accent);
}

.og-ins-actions {
  display: flex;
  gap: 8px;
  padding-top: 4px;
  border-top: 1px solid var(--og-divider);
}

.og-btn-primary,
.og-btn-secondary {
  flex: 1;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.16s, background 0.16s, border-color 0.16s;
}

.og-btn-primary {
  border: none;
  background: var(--og-accent);
  color: #ffffff;
}

.og-btn-primary:hover {
  opacity: 0.9;
}

.og-btn-secondary {
  border: 1px solid var(--og-glass-border);
  background: var(--og-hover-bg);
  color: var(--og-text);
}

.og-btn-secondary:hover {
  border-color: var(--og-accent);
  color: var(--og-accent);
}

.og-btn-full {
  width: 100%;
}

/* ============ 右下角缩放工具栏 ============ */
.og-zoom-bar {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 12px;
  background: var(--og-glass-bg);
  border: 1px solid var(--og-glass-border);
  box-shadow: var(--og-glass-shadow);
  backdrop-filter: blur(14px) saturate(1.5);
  -webkit-backdrop-filter: blur(14px) saturate(1.5);
  z-index: 10;
}

.og-zoom-bar .og-icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  box-shadow: none;
  backdrop-filter: none;
  border-radius: 8px;
}

.og-zoom-bar .og-icon-btn:hover {
  background: var(--og-hover-bg);
}

.og-zoom-sep {
  width: 1px;
  height: 16px;
  background: var(--og-divider);
  margin: 0 2px;
}

/* ============ 底部操作提示 ============ */
.og-hint-pill {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--og-glass-bg);
  border: 1px solid var(--og-glass-border);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--og-text-muted);
  font-size: 11.5px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 9;
}

/* ============ 过渡动画 ============ */
.og-panel-enter-active,
.og-panel-leave-active,
.og-card-enter-active,
.og-card-leave-active {
  transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
}

.og-panel-enter-from,
.og-panel-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.og-card-enter-from,
.og-card-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.98);
}

/* ============ 移动端适配 ============ */
@media (max-width: 768px) {
  .og-topbar {
    top: 12px;
    left: 12px;
  }

  .og-brand-pill {
    padding: 7px 12px;
    gap: 7px;
  }

  .og-brand-stats {
    font-size: 11.5px;
  }

  .og-controls-anchor {
    top: 12px;
    right: 12px;
  }

  .og-panel {
    width: min(272px, calc(100vw - 24px));
    max-height: calc(100dvh - var(--vp-nav-height, 64px) - 124px);
  }

  .og-inspector {
    left: 12px;
    right: 12px;
    bottom: 62px;
    width: auto;
    max-width: none;
    max-height: 46vh;
  }

  .og-zoom-bar {
    right: 12px;
    bottom: 12px;
  }

  .og-hint-pill {
    display: none;
  }
}
</style>
