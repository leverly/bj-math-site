/* ==========================================================
   P2 · 冲刺满分方法卡（15 张，补齐北京卷高频考点）

   补的是「第 8 / 16 / 27 题」这三个区分度最高的题号所对应的模型。
   现有 29 张卡偏基础与中档，这批专攻压轴。

   五段结构同 data-methods.js：
     signal / steps / pitfalls / motherId / variantIds
   ========================================================== */

export const METHODS_2 = [
  /* ==================== 数与式 · 数轴动点 ==================== */
  {
    id: 'm-numberline-move', chapter: 'ch-real', name: '数轴动点问题', tier: 'dist',
    signal: '题面出现「点 $P$ 从数轴上的 $A$ 点出发，以每秒 $v$ 个单位的速度向右运动」，且问 $t$ 秒后两点的距离、某点位置或何时重合。',
    steps: [
      { label: '定起点与方向', ask: '第一步先确定什么？', score: 1 },
      { label: '写动点坐标式', ask: '点 $P$ 在 $t$ 秒后的坐标怎么写？', score: 2 },
      { label: '列距离或等量关系', ask: '两点距离怎么表示？', score: 2 },
      { label: '解方程并检验', ask: '最后要注意什么？', score: 1 },
    ],
    pitfalls: [
      { t: '向左运动也写成加', bad: '向左运动写 $x_A+vt$', good: '向左运动写 $x_A-vt$',
        why: '数轴上向右为正、向左为负，方向错则全题错。' },
      { t: '距离不加绝对值', bad: '$AB=x_B-x_A$', good: '$AB=|x_B-x_A|$',
        why: '不知两点左右关系时必须加绝对值，否则会得到负距离。' },
      { t: '忽略时间范围', bad: '解出 $t=-2$ 也当答案', good: '舍去负值，并检查是否超出运动区间',
        why: '时间是正的，且动点可能中途停止或折返，要检验。' },
    ],
    motherId: 'q-nlmove-1', variantIds: ['v-nlmove-1', 'v-nlmove-2', 'v-nlmove-3'],
  },

  /* ==================== 图形变换 · 折叠 ==================== */
  {
    id: 'm-fold', chapter: 'ch-transform', name: '折叠问题', tier: 'dist',
    signal: '题面出现「把 $\\triangle ABC$ 沿 $DE$ 折叠，点 $A$ 落在 $A\'$ 处」，求折痕长、某角或某线段长。',
    steps: [
      { label: '认定折叠即轴对称', ask: '折叠的本质是什么变换？', score: 1 },
      { label: '写全等与等角等边', ask: '折叠能直接得到哪些相等关系？', score: 2 },
      { label: '设未知数用勾股', ask: '求长度时通常怎么设？', score: 2 },
      { label: '解方程并检验', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '忘记折痕是对应点连线的垂直平分线', bad: '只用「两部分全等」', good: '再用 $AA\'\\perp DE$ 且被 $DE$ 平分',
        why: '垂直平分线这条性质常是求折痕长的关键。' },
      { t: '设元后找不到直角三角形', bad: '随意设 $x$ 却列不出方程', good: '先找折叠后形成的直角（常是原直角或垂直）',
        why: '折叠题几乎都靠勾股定理，必须先定位直角三角形。' },
      { t: '多解不检验', bad: '解出两个 $x$ 都保留', good: '按线段长度为正、点在线段上等条件取舍',
        why: '二次方程常出两解，其中一解往往使点跑到线段外。' },
    ],
    motherId: 'q-fold-1', variantIds: ['v-fold-1', 'v-fold-2', 'v-fold-3'],
  },
  {
    id: 'm-rotate-90', chapter: 'ch-transform', name: '旋转 90° 与坐标变换', tier: 'dist',
    signal: '题面出现「将 $\\triangle ABC$ 绕点 $O$ 旋转 $90^{\\circ}$」「绕原点旋转」或给出旋转后的坐标求原坐标。',
    steps: [
      { label: '确定旋转中心与方向', ask: '第一步确认什么？', score: 1 },
      { label: '套坐标变换公式', ask: '绕原点逆时针转 $90^{\\circ}$ 的坐标怎么变？', score: 2 },
      { label: '用旋转保长保角', ask: '旋转后哪些量不变？', score: 2 },
      { label: '回代验证', ask: '最后怎么验证？', score: 1 },
    ],
    pitfalls: [
      { t: '顺逆时针搞反', bad: '逆时针写成 $(x,y)\\to(y,-x)$', good: '逆时针 $90^{\\circ}$：$(x,y)\\to(-y,x)$',
        why: '顺时针是 $(x,y)\\to(y,-x)$，两者互为反变换，写反整题错。' },
      { t: '绕非原点旋转也用公式', bad: '绕 $(1,2)$ 旋转直接套原点公式', good: '先平移到原点、旋转、再平移回去',
        why: '坐标变换公式只对绕原点成立。' },
      { t: '忘记旋转角对应线段夹角', bad: '旋转后不检查对应边夹角', good: '旋转 $90^{\\circ}$ 后对应边互相垂直',
        why: '这是证明垂直关系最常用的结论。' },
    ],
    motherId: 'q-rot90-1', variantIds: ['v-rot90-1', 'v-rot90-2', 'v-rot90-3'],
  },

  /* ==================== 几何 · 最值与面积 ==================== */
  {
    id: 'm-geo-minmax', chapter: 'ch-geo-aux', name: '几何最值（将军饮马）', tier: 'dist',
    signal: '题面出现「求 $PA+PB$ 的最小值」「在直线 $l$ 上找一点 $P$ 使 $|PA-PB|$ 最大」，且 $A$、$B$ 在直线同侧或异侧。',
    steps: [
      { label: '判断同侧还是异侧', ask: '第一步先看 $A$、$B$ 在直线哪一侧？', score: 1 },
      { label: '作对称点转化', ask: '求和最小要作几次对称？', score: 2 },
      { label: '连线段取交点', ask: '转化后最小值是哪条线段？', score: 2 },
      { label: '求该线段长度', ask: '最后怎么算？', score: 1 },
    ],
    pitfalls: [
      { t: '同侧直接连线', bad: '$A$、$B$ 同侧时直接连 $AB$', good: '先作 $A$ 关于 $l$ 的对称点 $A\'$，连 $A\'B$',
        why: '同侧连线不与 $l$ 相交，取不到最小值。' },
      { t: '异侧也作对称', bad: '$A$、$B$ 异侧时还作对称', good: '异侧直接连 $AB$ 与 $l$ 的交点即最优',
        why: '异侧时线段 $AB$ 本身就与 $l$ 相交，无需对称。' },
      { t: '求差最大值时也作一次对称', bad: '求 $|PA-PB|$ 最大时作一次对称', good: '求和最小作一次对称，求差最大需 $A$、$B$ 同侧直接连线延长',
        why: '两者转化方式相反：和最小→同侧对称；差最大→同侧连延长。' },
    ],
    motherId: 'q-minmax-1', variantIds: ['v-minmax-1', 'v-minmax-2', 'v-minmax-3'],
  },
  {
    id: 'm-area-method', chapter: 'ch-geo-aux', name: '面积法与等积变换', tier: 'dist',
    signal: '题面要求「求证两线段相等」「求线段比值」，且图形中存在同一三角形可用不同底高表示，或存在等高三角形。',
    steps: [
      { label: '找同一图形的两种面积表达', ask: '第一步找什么？', score: 1 },
      { label: '建立等积关系', ask: '两种表达相等能得到什么？', score: 2 },
      { label: '化简得线段关系', ask: '怎么化成要求的形式？', score: 2 },
      { label: '检验是否漏情况', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '等高三角形面积比写错', bad: '等高时面积比等于底之比的反比', good: '等高三角形面积比 = 底之比',
        why: '同高时面积与底成正比，这是最常用的等积结论。' },
      { t: '用面积法却不写理由', bad: '直接说「所以 $AB=CD$」', good: '写明「同一三角形面积相等，故对应底相等」',
        why: '面积法必须有「同一个量两种表达」这一步，否则是循环论证。' },
    ],
    motherId: 'q-area-1', variantIds: ['v-area-1', 'v-area-2', 'v-area-3'],
  },
  {
    id: 'm-angle-bisector', chapter: 'ch-geo-aux', name: '角平分线模型', tier: 'dist',
    signal: '题面出现「$AD$ 平分 $\\angle BAC$」，且需要证线段相等、求距离或构造全等。',
    steps: [
      { label: '识别角平分线条件', ask: '第一步确认什么？', score: 1 },
      { label: '选三种辅助线之一', ask: '角平分线常用哪三种辅助线？', score: 2 },
      { label: '用性质得等距', ask: '向两边作垂线能得到什么？', score: 2 },
      { label: '转化为要证的结论', ask: '最后怎么收尾？', score: 1 },
    ],
    pitfalls: [
      { t: '只想到作垂线', bad: '所有角平分线题都作垂线', good: '还可用「截取相等线段」或「作平行线构造等腰」',
        why: '求距离用垂线，证线段相等常用截取，求角度常作平行线。' },
      { t: '垂足位置画错', bad: '向角的外部作垂线', good: '向角的两边（射线）作垂线',
        why: '点到角两边距离指的是到两条射线的距离。' },
    ],
    motherId: 'q-bisector-1', variantIds: ['v-bisector-1', 'v-bisector-2', 'v-bisector-3'],
  },
  {
    id: 'm-line-3angles', chapter: 'ch-geo-aux', name: '一线三等角', tier: 'dist',
    signal: '题面图形中出现一条直线上有三个相等的角（常为 $\\angle B=\\angle APD=\\angle C$），要求证相似或求线段长。',
    steps: [
      { label: '确认三相等角', ask: '第一步找什么？', score: 1 },
      { label: '用补角推第二组等角', ask: '怎么得到第二组相等的角？', score: 2 },
      { label: '写相似并求比例', ask: '相似后能得什么？', score: 2 },
      { label: '代值求解', ask: '最后怎么算？', score: 1 },
    ],
    pitfalls: [
      { t: '直接说两三角形相似', bad: '看到三等角就说相似', good: '必须写出「由 $\\angle APB+\\angle APC=180^{\\circ}$ 推出另一组角相等」',
        why: '相似需要两组角，三个等角只给出一组，第二组要靠补角推。' },
      { t: '对应顶点写错', bad: '$\\triangle ABP\\sim\\triangle PCD$ 对应关系错', good: '按相等角配对：$A\\leftrightarrow P$、$B\\leftrightarrow C$',
        why: '对应关系错则比例式错，后面全错。' },
    ],
    motherId: 'q-3ang-1', variantIds: ['v-3ang-1', 'v-3ang-2', 'v-3ang-3'],
  },
  {
    id: 'm-equal-tri-construct', chapter: 'ch-geo-aux', name: '等腰等边构造', tier: 'dist',
    signal: '题面要求「求证 $AB=AC$」「求 $60^{\\circ}$ 角」，或图形中出现 $30^{\\circ}$、$120^{\\circ}$ 等特殊角需要补形。',
    steps: [
      { label: '找可补的特殊角', ask: '第一步找什么？', score: 1 },
      { label: '选补形方式', ask: '补成等边还是等腰直角？', score: 2 },
      { label: '用特殊三角形性质', ask: '补形后能得到什么？', score: 2 },
      { label: '回到原图求结论', ask: '最后怎么用？', score: 1 },
    ],
    pitfalls: [
      { t: '补形后忘记说明共线', bad: '补完直接用', good: '先证三点共线或四点共圆',
        why: '补出的点必须与原点在同一直线上，否则图形关系不成立。' },
      { t: '把 $30^{\\circ}$ 直接当等边', bad: '$30^{\\circ}$ 就补等边', good: '$30^{\\circ}$ 常补等腰直角或作 $60^{\\circ}$ 旋转',
        why: '不同特殊角对应不同补形策略，选错反而更繁。' },
    ],
    motherId: 'q-eqtri-1', variantIds: ['v-eqtri-1', 'v-eqtri-2', 'v-eqtri-3'],
  },

  /* ==================== 圆 · 综合 ==================== */
  {
    id: 'm-circle-synth', chapter: 'ch-circle', name: '圆的综合（切线+相似）', tier: 'dist',
    signal: '题面是第 23 题形态：先「求证 $PA$ 是 $\\odot O$ 的切线」，第二问「求线段长」或「求比值」。',
    steps: [
      { label: '第一问连半径证垂直', ask: '证切线第一步连哪条线？', score: 2 },
      { label: '找第二问的相似或勾股', ask: '第二问求长时找什么？', score: 2 },
      { label: '写比例式或勾股方程', ask: '怎么建立方程？', score: 2 },
      { label: '解出并写单位', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '第一问不连半径', bad: '直接说「是切线」', good: '连过切点的半径，证 $OA\\perp PA$',
        why: '切线判定必须落到「垂直于过切点的半径」。' },
      { t: '第二问忘记用第一问结论', bad: '第二问重新找关系', good: '先用第一问得到的垂直或等角',
        why: '第 23 题两问是递进的，第二问几乎必用第一问的结论。' },
      { t: '相似对应边写错', bad: '比例式对应关系混乱', good: '先写相似式，再按字母顺序写比例',
        why: '对应边写错是圆综合题最常见的失分点。' },
    ],
    motherId: 'q-cirsyn-1', variantIds: ['v-cirsyn-1', 'v-cirsyn-2', 'v-cirsyn-3'],
  },

  /* ==================== 统计 · 决策 ==================== */
  {
    id: 'm-stat-decision', chapter: 'ch-stat', name: '统计综合与决策', tier: 'mid',
    signal: '题面给出两组数据或两种方案，要求「用统计量说明哪个更合适」「做出选择并说明理由」。',
    steps: [
      { label: '算齐三数一差', ask: '第一步算哪些量？', score: 1 },
      { label: '比较平均水平', ask: '平均水平看哪个量？', score: 2 },
      { label: '比较稳定性', ask: '稳定性看哪个量？', score: 2 },
      { label: '结合情境给结论', ask: '最后怎么写结论？', score: 2 },
    ],
    pitfalls: [
      { t: '只看平均数下结论', bad: '平均数大的就选它', good: '还要看方差与中位数，并说明理由',
        why: '决策题必须给两个以上统计量支撑，单看平均数得分不全。' },
      { t: '结论不结合情境', bad: '「因为方差小所以选甲」', good: '「甲组成绩更稳定，适合需要稳定发挥的比赛」',
        why: '题目问「哪个更合适」必须回到实际情境作答。' },
    ],
    motherId: 'q-statdec-1', variantIds: ['v-statdec-1', 'v-statdec-2', 'v-statdec-3'],
  },

  /* ==================== 方程 · 实际与含参 ==================== */
  {
    id: 'm-realworld-eq', chapter: 'ch-design', name: '实际问题与方程不等式', tier: 'mid',
    signal: '题面出现利润、工程、行程、方案比较等实际情境，要求「求最大利润」「至少需要多少」「哪种方案更省」。',
    steps: [
      { label: '设未知数', ask: '第一步设什么？', score: 1 },
      { label: '找等量或不等关系', ask: '根据什么列式？', score: 2 },
      { label: '解方程或不等式', ask: '解的时候注意什么？', score: 2 },
      { label: '回到实际取整', ask: '最后怎么处理？', score: 2 },
    ],
    pitfalls: [
      { t: '不取整', bad: '算出人数 12.5 就写 12.5', good: '人数取整，且方向要符合实际（至少向上取整）',
        why: '人数、件数必须是整数，取整方向取决于「至少」还是「至多」。' },
      { t: '忘记检验范围', bad: '解出 $x=-3$ 也当答案', good: '舍去非正解，并检查是否超出约束',
        why: '实际问题的解必须符合物理意义。' },
      { t: '「至少」写成大于', bad: '「至少 5 人」写成 $x>5$', good: '写成 $x\\ge5$',
        why: '「至少」含等号，边界点算不算直接影响答案。' },
    ],
    motherId: 'q-rweq-1', variantIds: ['v-rweq-1', 'v-rweq-2', 'v-rweq-3'],
  },
  {
    id: 'm-param-integer', chapter: 'ch-eq', name: '含参方程与整数解', tier: 'mid',
    signal: '题面出现「关于 $x$ 的方程有整数解，求整数 $m$ 的值」，或「方程组的解为正整数」。',
    steps: [
      { label: '解出含参表达式', ask: '第一步把解用参数表示？', score: 1 },
      { label: '写整数条件', ask: '整数解要求什么？', score: 2 },
      { label: '枚举或整除分析', ask: '怎么找参数？', score: 2 },
      { label: '逐个检验', ask: '最后检查什么？', score: 2 },
    ],
    pitfalls: [
      { t: '忘记分母不为零', bad: '解出 $m=2$ 就直接保留', good: '检验 $m=2$ 时是否使二次项系数或分母为零',
        why: '含参题常因参数取特殊值导致方程退化，必须检验。' },
      { t: '整数解漏负数', bad: '只枚举正整数', good: '题目说「整数解」时负整数也要考虑',
        why: '「整数」包含负整数和零，除非题目明确说正整数。' },
    ],
    motherId: 'q-paramint-1', variantIds: ['v-paramint-1', 'v-paramint-2', 'v-paramint-3'],
  },

  /* ==================== 第 8 题 · 动点图象与规律 ==================== */
  {
    id: 'm-moving-graph', chapter: 'ch-quad', name: '动点与函数图象', tier: 'dist',
    signal: '题面是第 8 题形态：给出几何图形与动点，问「下列图象中能表示 $y$ 与 $x$ 关系的是」，四个选项为不同形状的图象。',
    steps: [
      { label: '定分段节点', ask: '第一步找什么？', score: 2 },
      { label: '逐段写函数式', ask: '每段的函数式怎么来？', score: 2 },
      { label: '判每段形状', ask: '一次还是二次？开口朝哪？', score: 2 },
      { label: '比对选项', ask: '最后怎么排除？', score: 1 },
    ],
    pitfalls: [
      { t: '不分段直接写一个式子', bad: '整段用一个函数式', good: '按动点经过的顶点、拐点分段',
        why: '动点跨过图形顶点时函数关系会变，不分段必错。' },
      { t: '只看起点不看拐点', bad: '起点对就选', good: '重点核对拐点位置与每段增减性',
        why: '第 8 题的区分度就在拐点，四个选项起点常相同。' },
      { t: '二次项符号判错', bad: '面积随距离增大而增大就说开口向上', good: '看二次项系数符号，面积常是 $S=\\dfrac12 ah$ 型',
        why: '开口方向由二次项系数决定，与增减性不是一回事。' },
    ],
    motherId: 'q-movegraph-1', variantIds: ['v-movegraph-1', 'v-movegraph-2', 'v-movegraph-3'],
  },
  {
    id: 'm-pattern', chapter: 'ch-newdef', name: '规律探究', tier: 'dist',
    signal: '题面给出前几项（图形个数、点坐标、等式），要求「第 $n$ 个是什么」「求第 2026 项」。',
    steps: [
      { label: '算前三项', ask: '第一步做什么？', score: 1 },
      { label: '找差分规律', ask: '相邻两项差是多少？', score: 2 },
      { label: '写第 $n$ 项表达式', ask: '怎么归纳？', score: 2 },
      { label: '代值验证', ask: '最后检查什么？', score: 2 },
    ],
    pitfalls: [
      { t: '不验证就写答案', bad: '归纳出式子直接填', good: '代 $n=1,2,3$ 回代验证',
        why: '归纳常差一位（$n$ 与 $n-1$ 混淆），代值能立刻发现。' },
      { t: '等差当成等比', bad: '差为常数却写 $a\\cdot q^{n}$', good: '差为常数用一次式 $an+b$',
        why: '先算差分：差恒定是等差，比恒定才是等比。' },
      { t: '下标从 0 还是 1 开始搞错', bad: '第 1 项对应 $n=0$', good: '明确「第 $n$ 项」时 $n$ 从 1 开始',
        why: '起始下标错一位，整个式子都错。' },
    ],
    motherId: 'q-pattern-1', variantIds: ['v-pattern-1', 'v-pattern-2', 'v-pattern-3'],
  },
  {
    id: 'm-midpoint-coord', chapter: 'ch-linear', name: '中点坐标与坐标系几何', tier: 'mid',
    signal: '题面在平面直角坐标系中给出两点或线段中点，要求「求中点坐标」「求对称点」「求第三点使构成平行四边形」。',
    steps: [
      { label: '写中点公式', ask: '中点坐标公式是什么？', score: 1 },
      { label: '套用或反解', ask: '已知中点求端点怎么算？', score: 2 },
      { label: '用平行四边形对角线性质', ask: '构成平行四边形怎么列式？', score: 2 },
      { label: '检验多解', ask: '最后注意什么？', score: 2 },
    ],
    pitfalls: [
      { t: '中点公式漏除 2', bad: '$M=\\left(\\dfrac{x_1+x_2}{1},\\cdots\\right)$', good: '$M=\\left(\\dfrac{x_1+x_2}{2},\\dfrac{y_1+y_2}{2}\\right)$',
        why: '中点是平均，必须除以 2。' },
      { t: '平行四边形第三点只算一个', bad: '只算出一个 $D$', good: '三个已知点可作三条对角线，$D$ 有三个解',
        why: '题目说「以 $A$、$B$、$C$ 为顶点」时，$D$ 有三种可能，漏解是高频失分点。' },
    ],
    motherId: 'q-midcoord-1', variantIds: ['v-midcoord-1', 'v-midcoord-2', 'v-midcoord-3'],
  },
];
