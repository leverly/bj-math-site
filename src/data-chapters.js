/* ==========================================================
   P1 · 章节树（18 章）
   口径：按《义务教育数学课程标准（2022 年版）》知识块划分，
        不跟教材目录——北京各区人教/北师大版并行，但中考以课标为准。

   tier    该章在卷面的主要落点：send 送分区 / mid 中档区 / dist 区分区
   prereq  前置依赖边（P3 用于「卡点在前置节点」诊断）
   examRefs 关联题号（集中管理，改一处全站生效）
   ========================================================== */

export const CHAPTERS = [
  /* ==================== 数与代数（7 章） ==================== */
  {
    id: 'ch-real', no: 1, name: '实数与运算', block: '数与代数',
    prereq: [], examRefs: [1, 2, 9, 17], tier: ['send'],
    summary: '实数分类、科学记数法、绝对值、平方根与立方根、实数运算。',
    methods: [],
  },
  {
    id: 'ch-poly', no: 2, name: '整式与因式分解', block: '数与代数',
    prereq: ['ch-real'], examRefs: [3, 10, 18], tier: ['send'],
    summary: '幂的运算、整式乘除、乘法公式、因式分解四法。',
    methods: ['m-factor-4'],
  },
  {
    id: 'ch-frac', no: 3, name: '分式与二次根式', block: '数与代数',
    prereq: ['ch-poly'], examRefs: [11, 18], tier: ['send'],
    summary: '分式有意义条件、分式化简求值、二次根式化简与混合运算。',
    methods: ['m-frac-simplify', 'm-sqrt-simplify'],
  },
  {
    id: 'ch-eq', no: 4, name: '方程与方程组', block: '数与代数',
    prereq: ['ch-poly', 'ch-frac'], examRefs: [4, 12, 19], tier: ['send', 'mid'],
    summary: '一元一次方程、二元一次方程组、一元二次方程四种解法、分式方程与增根。',
    methods: ['m-eq-system', 'm-quad-solve'],
  },
  {
    id: 'ch-ineq', no: 5, name: '不等式与不等式组', block: '数与代数',
    prereq: ['ch-eq'], examRefs: [5, 13, 19], tier: ['send'],
    summary: '不等式性质、解一元一次不等式、不等式组解集、含参不等式。',
    methods: ['m-ineq-param'],
  },
  {
    id: 'ch-linear', no: 6, name: '一次函数与反比例函数', block: '数与代数',
    prereq: ['ch-eq'], examRefs: [6, 14, 21], tier: ['send', 'mid'],
    summary: '一次函数图象与性质、待定系数法、反比例函数 k 的几何意义、实际应用。',
    methods: ['m-func-coef', 'm-k-meaning'],
  },
  {
    id: 'ch-quad', no: 7, name: '二次函数', block: '数与代数',
    prereq: ['ch-eq', 'ch-linear'], examRefs: [7, 15, 22, 24, 26], tier: ['mid', 'dist'],
    summary: '三种表达式、平移变换、区间最值、含参二次、根的分布。',
    methods: ['m-quad-3forms', 'm-quad-translate', 'm-quad-interval', 'm-quad-param'],
  },

  /* ==================== 图形与几何（7 章） ==================== */
  {
    id: 'ch-triangle', no: 8, name: '三角形与全等', block: '图形与几何',
    prereq: ['ch-real'], examRefs: [8, 20], tier: ['send', 'mid'],
    summary: '三角形性质、全等判定、等腰与等边三角形、勾股定理、尺规作图。',
    methods: ['m-congruent', 'm-isosceles'],
  },
  {
    id: 'ch-quadrilateral', no: 9, name: '四边形', block: '图形与几何',
    prereq: ['ch-triangle'], examRefs: [16, 20], tier: ['send', 'mid'],
    summary: '平行四边形判定与性质、矩形菱形正方形、中位线、梯形。',
    methods: ['m-parallelogram'],
  },
  {
    id: 'ch-similar', no: 10, name: '相似三角形', block: '图形与几何',
    prereq: ['ch-triangle'], examRefs: [22], tier: ['mid', 'dist'],
    summary: '相似判定、相似比与面积比、A 字型与 X 字型、一线三等角。',
    methods: ['m-similar-4'],
  },
  {
    id: 'ch-circle', no: 11, name: '圆', block: '图形与几何',
    prereq: ['ch-triangle'], examRefs: [23], tier: ['mid'],
    summary: '圆的性质、圆周角、垂径定理、切线判定与性质、弧长与扇形面积。',
    methods: ['m-circle-aux', 'm-tangent-2ways'],
  },
  {
    id: 'ch-transform', no: 12, name: '图形变换', block: '图形与几何',
    prereq: ['ch-triangle', 'ch-quadrilateral'], examRefs: [16], tier: ['send', 'dist'],
    summary: '平移、旋转、轴对称、位似、折叠问题、三视图。',
    methods: [],
  },
  {
    id: 'ch-trig', no: 13, name: '锐角三角函数与解直角三角形', block: '图形与几何',
    prereq: ['ch-triangle', 'ch-similar'], examRefs: [21], tier: ['send', 'mid'],
    summary: '正弦余弦正切、特殊角三角函数值、解直角三角形、仰角俯角坡度。',
    methods: ['m-right-triangle'],
  },
  {
    id: 'ch-geo-aux', no: 14, name: '几何辅助线综合', block: '图形与几何',
    prereq: ['ch-triangle', 'ch-quadrilateral', 'ch-similar', 'ch-circle'],
    examRefs: [27], tier: ['dist'],
    summary: '中点四模型、手拉手旋转、半角模型、一线三等角、三条线段关系。',
    methods: ['m-midpoint-4', 'm-hand-in-hand', 'm-half-angle', 'm-three-segments'],
  },

  /* ==================== 统计与概率（2 章） ==================== */
  {
    id: 'ch-stat', no: 15, name: '统计', block: '统计与概率',
    prereq: ['ch-real'], examRefs: [15, 25], tier: ['send', 'mid'],
    summary: '数据收集与整理、三种统计图、平均数中位数众数、方差、频率分布。',
    methods: ['m-chart-read', 'm-three-measures'],
  },
  {
    id: 'ch-prob', no: 16, name: '概率', block: '统计与概率',
    prereq: ['ch-frac'], examRefs: [14], tier: ['send'],
    summary: '随机事件、等可能概率、列表法与树状图、频率估计概率。',
    methods: ['m-tree-diagram'],
  },

  /* ==================== 综合与实践（2 章） ==================== */
  {
    id: 'ch-newdef', no: 17, name: '新定义与阅读理解', block: '综合与实践',
    prereq: ['ch-quad', 'ch-geo-aux'], examRefs: [16, 28], tier: ['dist'],
    summary: '自定义概念的理解与迁移、三问递进结构、边界与临界。',
    methods: ['m-newdef-3step', 'm-boundary'],
  },
  {
    id: 'ch-design', no: 18, name: '方案设计与跨学科', block: '综合与实践',
    prereq: ['ch-ineq', 'ch-linear', 'ch-stat'], examRefs: [22], tier: ['mid'],
    summary: '最优化方案、利润与成本建模、统计决策、跨学科情境。',
    methods: ['m-model-4step'],
  },
];

/* 卷面结构：北京卷 100 分 / 28 题 */
export const EXAM_STRUCTURE = {
  total: 100, minutes: 120, questions: 28,
  parts: [
    { name: '选择题', from: 1, to: 8, each: 2, count: 8, sum: 16 },
    { name: '填空题', from: 9, to: 16, each: 2, count: 8, sum: 16 },
    { name: '解答题（17–22）', from: 17, to: 22, each: 5, count: 6, sum: 30 },
    { name: '解答题（23–26）', from: 23, to: 26, each: 6, count: 4, sum: 24 },
    { name: '解答题（27–28）', from: 27, to: 28, each: 7, count: 2, sum: 14 },
  ],
};

/* 三层分区：本站的核心信息架构 */
export const TIERS = {
  send: { name: '送分区', score: 58, target: 1.0, note: '选 1–7 / 填 9–15 / 17–22' },
  mid: { name: '中档区', score: 24, target: 0.9, note: '23 圆 / 24 二次 / 25 统计 / 26 含参二次' },
  dist: { name: '区分区', score: 18, target: 0.6, note: '8 / 16 / 27 / 28 四道题' },
};
