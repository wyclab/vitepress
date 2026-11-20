import type { GraphArticle, GraphData, GraphTopic } from '../graph.data'

export type NodeType = 'article' | 'tag' | 'topic'
export type EdgeKind = 'link' | 'tag' | 'topic'

export interface SimNode {
  id: string
  type: NodeType
  label: string
  topicDir: string
  degree: number
  baseRadius: number
  x: number
  y: number
  vx: number
  vy: number
  fx: number | null
  fy: number | null
  /** 柔和呼吸漂浮相位（确定性分配，保证每个节点有独立舒缓节奏） */
  driftPhase: number
  driftSpeed: number
  /** 当前帧的视觉不透明度（用于悬停/搜索时的平滑淡入淡出） */
  renderAlpha: number
  article?: GraphArticle
  topic?: GraphTopic
  tagName?: string
  tagCount?: number
}

export interface SimEdge {
  id: string
  source: SimNode
  target: SimNode
  kind: EdgeKind
  /** 直接引用边可显示方向箭头 */
  directed: boolean
  bidirectional: boolean
}

export interface GraphBuildOptions {
  enabledTopics: Set<string>
  showTopics: boolean
  showTags: boolean
  onlySharedTags: boolean
  showOrphans: boolean
  localFocusId: string | null
  localDepth: 1 | 2
}

export interface ForceParams {
  centerStrength: number // 0.02 - 1.0, default 0.1
  repelStrength: number // 4 - 36, default 20
  linkStrength: number // 0.05 - 1.5, default 0.2
  linkDistance: number // 60 - 260, default 170
}

export const DEFAULT_FORCES: ForceParams = {
  centerStrength: 0.1,
  repelStrength: 20,
  linkStrength: 0.2,
  linkDistance: 170,
}

export interface TopicPalette {
  dark: string
  light: string
}

const TOPIC_PALETTE_MAP: Record<string, TopicPalette> = {
  zstn: { dark: '#60a5fa', light: '#2563eb' },
  life: { dark: '#34d399', light: '#059669' },
  fitness: { dark: '#fb923c', light: '#ea580c' },
  ai: { dark: '#a78bfa', light: '#7c3aed' },
  invest: { dark: '#f472b6', light: '#db2777' },
  manage: { dark: '#fbbf24', light: '#d97706' },
}

const FALLBACK_PALETTE: TopicPalette = { dark: '#94a3b8', light: '#64748b' }
export const TAG_PALETTE: TopicPalette = { dark: '#22d3ee', light: '#0891b2' }

export function getTopicColor(topicDir: string, isDark: boolean): string {
  const palette = TOPIC_PALETTE_MAP[topicDir] || FALLBACK_PALETTE
  return isDark ? palette.dark : palette.light
}

export function getNodeColor(node: SimNode, isDark: boolean): string {
  if (node.type === 'tag') return isDark ? TAG_PALETTE.dark : TAG_PALETTE.light
  return getTopicColor(node.topicDir, isDark)
}

/** 确定性伪随机（避免每次重载布局完全不可控） */
function hashUnit(str: string): number {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

export interface BuiltGraph {
  nodes: SimNode[]
  edges: SimEdge[]
  adjacency: Map<string, Set<string>>
  stats: {
    articleCount: number
    tagCount: number
    topicCount: number
    directLinkCount: number
    edgeCount: number
  }
}

/** 根据当前筛选配置构建节点与边；尽可能继承 prevPositions 实现平滑变形 */
export function buildGraph(
  data: GraphData,
  options: GraphBuildOptions,
  prevPositions?: Map<string, { x: number; y: number }>,
): BuiltGraph {
  const visibleArticles = data.articles.filter((a) => options.enabledTopics.has(a.topicDir))
  const articleById = new Map(visibleArticles.map((a) => [a.id, a]))

  // 1. 预计算各专题星团的舒展初始锚点（大圆环分布，避免初始拥挤）
  const activeTopics = data.topics.filter((t) => options.enabledTopics.has(t.dir))
  const topicAnchors = new Map<string, { x: number; y: number }>()
  const ringR = activeTopics.length <= 1 ? 0 : 340
  activeTopics.forEach((t, idx) => {
    const angle = (idx / activeTopics.length) * Math.PI * 2 - Math.PI / 2
    topicAnchors.set(t.dir, {
      x: Math.cos(angle) * ringR,
      y: Math.sin(angle) * ringR,
    })
  })

  const nodeMap = new Map<string, SimNode>()

  // 2. 创建专题节点（若开启）
  if (options.showTopics) {
    for (const topic of activeTopics) {
      const id = `topic:${topic.dir}`
      const prev = prevPositions?.get(id)
      const anchor = topicAnchors.get(topic.dir) || { x: 0, y: 0 }
      const phase = hashUnit(id) * Math.PI * 2
      nodeMap.set(id, {
        id,
        type: 'topic',
        label: topic.label,
        topicDir: topic.dir,
        degree: 0,
        baseRadius: 11,
        x: prev ? prev.x : anchor.x,
        y: prev ? prev.y : anchor.y,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        driftPhase: phase,
        driftSpeed: 0.35 + hashUnit(`${id}:s`) * 0.25,
        renderAlpha: 1,
        topic,
      })
    }
  }

  // 3. 创建文章节点（按专题星团做宽敞的黄金角螺旋分布）
  const topicCounters = new Map<string, number>()
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  for (const article of visibleArticles) {
    const prev = prevPositions?.get(article.id)
    const anchor = topicAnchors.get(article.topicDir) || { x: 0, y: 0 }
    const idx = topicCounters.get(article.topicDir) ?? 0
    topicCounters.set(article.topicDir, idx + 1)

    const r = 68 + Math.sqrt(idx + 1) * 42
    const theta = idx * goldenAngle + hashUnit(article.id) * 0.8

    nodeMap.set(article.id, {
      id: article.id,
      type: 'article',
      label: article.title,
      topicDir: article.topicDir,
      degree: 0,
      baseRadius: 5.5,
      x: prev ? prev.x : anchor.x + Math.cos(theta) * r,
      y: prev ? prev.y : anchor.y + Math.sin(theta) * r,
      vx: 0,
      vy: 0,
      fx: null,
      fy: null,
      driftPhase: hashUnit(article.id) * Math.PI * 2,
      driftSpeed: 0.45 + hashUnit(`${article.id}:s`) * 0.45,
      renderAlpha: 1,
      article,
    })
  }

  // 4. 创建标签节点（若开启）
  const tagArticles = new Map<string, GraphArticle[]>()
  if (options.showTags) {
    for (const article of visibleArticles) {
      for (const tag of article.tags) {
        const list = tagArticles.get(tag)
        if (list) list.push(article)
        else tagArticles.set(tag, [article])
      }
    }

    for (const [tag, list] of tagArticles.entries()) {
      if (options.onlySharedTags && list.length < 2) continue
      const id = `tag:${tag}`
      const prev = prevPositions?.get(id)

      let cx = 0
      let cy = 0
      for (const a of list) {
        const n = nodeMap.get(a.id)
        if (n) {
          cx += n.x
          cy += n.y
        }
      }
      cx /= list.length || 1
      cy /= list.length || 1
      const jitterAngle = hashUnit(id) * Math.PI * 2
      const jitterR = 48

      const topicFreq = new Map<string, number>()
      for (const a of list) topicFreq.set(a.topicDir, (topicFreq.get(a.topicDir) || 0) + 1)
      const dominantTopic =
        [...topicFreq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || ''

      nodeMap.set(id, {
        id,
        type: 'tag',
        label: `#${tag}`,
        topicDir: dominantTopic,
        degree: 0,
        baseRadius: 4.5,
        x: prev ? prev.x : cx + Math.cos(jitterAngle) * jitterR,
        y: prev ? prev.y : cy + Math.sin(jitterAngle) * jitterR,
        vx: 0,
        vy: 0,
        fx: null,
        fy: null,
        driftPhase: hashUnit(id) * Math.PI * 2,
        driftSpeed: 0.4 + hashUnit(`${id}:s`) * 0.4,
        renderAlpha: 1,
        tagName: tag,
        tagCount: list.length,
      })
    }
  }

  // 5. 构建边集合
  const edges: SimEdge[] = []

  // 5a. 文章直接双链（合并互指边为双向边，避免双线重影）
  const linkPairMap = new Map<string, { source: SimNode; target: SimNode; bidirectional: boolean }>()
  for (const article of visibleArticles) {
    const srcNode = nodeMap.get(article.id)
    if (!srcNode) continue
    for (const targetId of article.links) {
      if (!articleById.has(targetId) || targetId === article.id) continue
      const tgtNode = nodeMap.get(targetId)
      if (!tgtNode) continue
      const revKey = `${targetId}=>${article.id}`
      const fwdKey = `${article.id}=>${targetId}`
      const existingRev = linkPairMap.get(revKey)
      if (existingRev) {
        existingRev.bidirectional = true
      } else if (!linkPairMap.has(fwdKey)) {
        linkPairMap.set(fwdKey, { source: srcNode, target: tgtNode, bidirectional: false })
      }
    }
  }
  for (const [key, entry] of linkPairMap.entries()) {
    edges.push({
      id: `link:${key}`,
      source: entry.source,
      target: entry.target,
      kind: 'link',
      directed: true,
      bidirectional: entry.bidirectional,
    })
  }

  // 5b. 文章 <-> 标签边
  if (options.showTags) {
    for (const [tag, list] of tagArticles.entries()) {
      const tagNode = nodeMap.get(`tag:${tag}`)
      if (!tagNode) continue
      for (const a of list) {
        const artNode = nodeMap.get(a.id)
        if (!artNode) continue
        edges.push({
          id: `tag:${a.id}=>${tag}`,
          source: artNode,
          target: tagNode,
          kind: 'tag',
          directed: false,
          bidirectional: false,
        })
      }
    }
  }

  // 5c. 文章 <-> 专题边
  if (options.showTopics) {
    for (const a of visibleArticles) {
      const artNode = nodeMap.get(a.id)
      const topicNode = nodeMap.get(`topic:${a.topicDir}`)
      if (!artNode || !topicNode) continue
      edges.push({
        id: `topic:${a.topicDir}=>${a.id}`,
        source: topicNode,
        target: artNode,
        kind: 'topic',
        directed: false,
        bidirectional: false,
      })
    }
  }

  // 6. 构建邻接表
  const fullAdj = new Map<string, Set<string>>()
  for (const id of nodeMap.keys()) fullAdj.set(id, new Set())
  for (const e of edges) {
    fullAdj.get(e.source.id)!.add(e.target.id)
    fullAdj.get(e.target.id)!.add(e.source.id)
  }

  // 7. 局部图谱过滤（BFS 1跳 / 2跳）或孤立节点过滤
  let allowedIds: Set<string> | null = null
  if (options.localFocusId && nodeMap.has(options.localFocusId)) {
    allowedIds = new Set<string>([options.localFocusId])
    let frontier = new Set<string>([options.localFocusId])
    for (let step = 0; step < options.localDepth; step++) {
      const next = new Set<string>()
      for (const id of frontier) {
        for (const nb of fullAdj.get(id) || []) {
          if (!allowedIds.has(nb)) {
            allowedIds.add(nb)
            next.add(nb)
          }
        }
      }
      frontier = next
    }
  }

  const finalNodes: SimNode[] = []
  const finalNodeSet = new Set<string>()

  for (const node of nodeMap.values()) {
    if (allowedIds && !allowedIds.has(node.id)) continue
    const deg = fullAdj.get(node.id)?.size ?? 0
    if (!options.showOrphans && node.type === 'article' && deg === 0 && !allowedIds) continue
    if (node.type === 'topic' && deg === 0) continue
    finalNodes.push(node)
    finalNodeSet.add(node.id)
  }

  const finalEdges = edges.filter(
    (e) => finalNodeSet.has(e.source.id) && finalNodeSet.has(e.target.id),
  )

  // 8. 重算最终度数、节点半径和邻接表
  const adjacency = new Map<string, Set<string>>()
  for (const n of finalNodes) {
    n.degree = 0
    adjacency.set(n.id, new Set())
  }
  for (const e of finalEdges) {
    e.source.degree++
    e.target.degree++
    adjacency.get(e.source.id)!.add(e.target.id)
    adjacency.get(e.target.id)!.add(e.source.id)
  }

  for (const n of finalNodes) {
    if (n.type === 'topic') {
      n.baseRadius = 9.5 + Math.min(4.5, Math.sqrt(n.degree) * 1.05)
    } else if (n.type === 'tag') {
      n.baseRadius = 4.6 + Math.min(4.0, Math.sqrt(n.degree) * 1.15)
    } else {
      n.baseRadius = 5.0 + Math.min(5.0, Math.sqrt(n.degree) * 1.25)
    }
  }

  return {
    nodes: finalNodes,
    edges: finalEdges,
    adjacency,
    stats: {
      articleCount: finalNodes.filter((n) => n.type === 'article').length,
      tagCount: finalNodes.filter((n) => n.type === 'tag').length,
      topicCount: finalNodes.filter((n) => n.type === 'topic').length,
      directLinkCount: finalEdges.filter((e) => e.kind === 'link').length,
      edgeCount: finalEdges.length,
    },
  }
}

/**
 * 单步力导向物理模拟（仿 Obsidian 舒展星团力学 + 微呼吸动态漂浮）
 * - repelK 足够强劲，保证节点之间留出充足呼吸空间、绝不堆叠成团
 * - centerK 轻柔收敛，只防止星团飘离视野而不会把节点压扁
 * - ambientTime 开启后提供极细腻的微漂浮生命感，连接边随之弹性微动
 */
export function stepSimulation(
  nodes: SimNode[],
  edges: SimEdge[],
  params: ForceParams,
  alpha: number,
  ambientTime = 0,
  ambientStrength = 0,
): void {
  const n = nodes.length
  if (n === 0) return

  // 强斥力 + 轻向心力：默认 0.1 / 20 / 0.2 / 170 下呈现舒展平衡的星团
  const repelK = params.repelStrength * 140
  const centerK = params.centerStrength * 0.009
  const linkBaseK = params.linkStrength * 0.095
  const baseDist = params.linkDistance

  // 1. 节点间库仑斥力 + 宽敞软碰撞间距
  for (let i = 0; i < n; i++) {
    const a = nodes[i]
    for (let j = i + 1; j < n; j++) {
      const b = nodes[j]
      let dx = b.x - a.x
      let dy = b.y - a.y
      let distSq = dx * dx + dy * dy
      if (distSq < 0.01) {
        dx = (hashUnit(a.id + b.id) - 0.5) * 4 || 1
        dy = (hashUnit(b.id + a.id) - 0.5) * 4 || -1
        distSq = dx * dx + dy * dy
      }
      const dist = Math.sqrt(distSq)

      // 专题节点之间斥力更大，让 6 个主题星团泾渭分明
      let pairScale = 1
      if (a.type === 'topic' && b.type === 'topic') pairScale = 4.0
      else if (a.type === 'topic' || b.type === 'topic') pairScale = 1.6
      else if (a.type === 'tag' && b.type === 'tag') pairScale = 1.25

      const clampedSq = distSq + 280
      const force = Math.min(8, ((repelK * pairScale) / clampedSq) * alpha)

      const fx = (dx / dist) * force
      const fy = (dy / dist) * force

      a.vx -= fx
      a.vy -= fy
      b.vx += fx
      b.vy += fy

      // 软碰撞推开，留出清晰阅读间隙
      const minGap = a.baseRadius + b.baseRadius + 30
      if (dist < minGap) {
        const push = ((minGap - dist) / dist) * 0.36 * alpha
        const px = dx * push
        const py = dy * push
        a.vx -= px
        a.vy -= py
        b.vx += px
        b.vy += py
      }
    }
  }

  // 2. 边弹簧引力（按关系类型区分理想间距与弹性）
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i]
    const a = e.source
    const b = e.target
    const dx = b.x - a.x
    const dy = b.y - a.y
    const dist = Math.sqrt(dx * dx + dy * dy) || 0.001

    let targetLen = baseDist
    let k = linkBaseK
    if (e.kind === 'link') {
      targetLen = baseDist * 0.72
      k = linkBaseK * 1.7
    } else if (e.kind === 'tag') {
      targetLen = baseDist * 0.85
      k = linkBaseK * 0.95
    } else if (e.kind === 'topic') {
      targetLen = baseDist * 1.18
      k = linkBaseK * 0.65
    }

    const diff = (dist - targetLen) / dist
    const pull = diff * k * alpha

    // 度数越大越稳重
    const wA = 1 / (1 + a.degree * 0.16)
    const wB = 1 / (1 + b.degree * 0.16)
    const wSum = wA + wB || 1

    const fx = dx * pull
    const fy = dy * pull
    a.vx += fx * (wA / wSum) * 2
    a.vy += fy * (wA / wSum) * 2
    b.vx -= fx * (wB / wSum) * 2
    b.vy -= fy * (wB / wSum) * 2
  }

  // 3. 轻柔向心力 + 呼吸微漂浮 + 阻尼积分
  const maxSpeed = 24
  const damping = 0.86
  for (let i = 0; i < n; i++) {
    const node = nodes[i]
    if (node.fx !== null && node.fy !== null) {
      node.x = node.fx
      node.y = node.fy
      node.vx = 0
      node.vy = 0
      continue
    }

    const gravity = node.degree === 0 ? centerK * 2.1 : centerK
    node.vx -= node.x * gravity * alpha
    node.vy -= node.y * gravity * alpha

    // 持续的轻柔有机漂浮（节点像星辰般缓缓呼吸，弹簧随之联动）
    if (ambientStrength > 0) {
      const t = ambientTime * node.driftSpeed + node.driftPhase
      const amp = node.type === 'topic' ? ambientStrength * 0.45 : ambientStrength
      node.vx += Math.cos(t) * amp
      node.vy += Math.sin(t * 0.83 + 1.1) * amp
    }

    node.vx *= damping
    node.vy *= damping

    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy)
    if (speed > maxSpeed) {
      node.vx = (node.vx / speed) * maxSpeed
      node.vy = (node.vy / speed) * maxSpeed
    }

    node.x += node.vx
    node.y += node.vy
  }
}

/** 计算当前可见节点的包围盒 */
export function computeBounds(nodes: SimNode[]): {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
  cx: number
  cy: number
} {
  if (!nodes.length) {
    return { minX: -200, maxX: 200, minY: -200, maxY: 200, width: 400, height: 400, cx: 0, cy: 0 }
  }
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const n of nodes) {
    const pad = n.baseRadius + 36
    if (n.x - pad < minX) minX = n.x - pad
    if (n.x + pad > maxX) maxX = n.x + pad
    if (n.y - pad < minY) minY = n.y - pad
    if (n.y + pad > maxY) maxY = n.y + pad
  }
  return {
    minX,
    maxX,
    minY,
    maxY,
    width: Math.max(240, maxX - minX),
    height: Math.max(240, maxY - minY),
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
  }
}
