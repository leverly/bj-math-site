/* ==========================================================
   P1 · 方法卡（20 张，覆盖送分区与中档区）
   原有 3 张（P0 样张）迁入本文件，本章只增不删。

   五段结构（顺序不可调）：
     ① signal    识别信号——题面出现什么时该想到它
     ② steps     标准步骤，3–5 步，每步一个给分点
     ③ pitfalls  常见误用，✕ 错法 / ✓ 正解 / 一句错因
     ④ motherId  母题
     ⑤ variantIds 三个变式：number / condition / reverse
   ========================================================== */

export const METHODS = [
  /* ==================== 数与式 ==================== */
  {
    id: 'm-factor-4', chapter: 'ch-poly', name: '因式分解四法', tier: 'send',
    signal: '题面出现「因式分解」「分解因式」「把下列各式分解因式」，多项式含 2–3 项或为二次三项式。',
    steps: [
      { label: '先提公因式', ask: '拿到多项式第一步先做什么？', score: 1 },
      { label: '看项数选方法', ask: '提完公因式后，按项数怎么选方法？', score: 1 },
      { label: '套公式或十字相乘', ask: '两项、三项分别对应哪种方法？', score: 2 },
      { label: '检查是否彻底', ask: '最后一步检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '提公因式后忘变号', bad: '$-x^{2}+x=-x(x+1)$', good: '$-x^{2}+x=-x(x-1)$',
        why: '提出 $-x$ 后，括号内每一项都要除以 $-x$，$x\\div(-x)=-1$。' },
      { t: '分解不彻底', bad: '$x^{4}-1=(x^{2}+1)(x^{2}-1)$', good: '$x^{4}-1=(x^{2}+1)(x+1)(x-1)$',
        why: '$x^2-1$ 还能继续分解，必须分解到每个因式都不能再分为止。' },
      { t: '两项也想用十字相乘', bad: '$x^{2}-4$ 用十字相乘', good: '$x^{2}-4=(x+2)(x-2)$ 用平方差',
        why: '两项优先考虑平方差（$a^2-b^2$），三项才考虑十字相乘。' },
    ],
    motherId: 'q-factor-1', variantIds: ['v-factor-1', 'v-factor-2', 'v-factor-3'],
  },
  {
    id: 'm-frac-simplify', chapter: 'ch-frac', name: '分式化简求值', tier: 'send',
    signal: '题面出现「先化简，再求值」且含分式，或出现分数形式的代数式要求化简。',
    steps: [
      { label: '先分解因式', ask: '化简分式的第一步是什么？', score: 1 },
      { label: '通分或约分', ask: '加减要通分，乘除要约分——本题是哪一种？', score: 1 },
      { label: '化简到最简', ask: '化简的目标形式是什么？', score: 1 },
      { label: '代值求结果', ask: '代入求值时要注意什么？', score: 2 },
    ],
    pitfalls: [
      { t: '直接约去和式中的项', bad: '$\\dfrac{x+2}{x+3}=\\dfrac{2}{3}$', good: '分子分母是和式，不能约，保持原样',
        why: '只有乘积形式才能约分。和式中约去单项是最常见的错误。' },
      { t: '代值时使分母为 0', bad: '取 $x=1$ 代入 $\\dfrac{1}{x-1}$', good: '取 $x\\ne1$ 的值',
        why: '代入的值必须使原式有意义，分母不能为 0。' },
    ],
    motherId: 'q-frac-1', variantIds: ['v-frac-1', 'v-frac-2', 'v-frac-3'],
  },
  {
    id: 'm-sqrt-simplify', chapter: 'ch-frac', name: '二次根式化简', tier: 'send',
    signal: '题面出现 $\\sqrt{\\ }$ 且被开方数含完全平方因数、或含分母，要求「化简」「计算」。',
    steps: [
      { label: '分解被开方数', ask: '第一步把被开方数怎么处理？', score: 1 },
      { label: '把能开方的因数开出', ask: '$\\sqrt{12}$ 化成什么？', score: 1 },
      { label: '分母有理化', ask: '被开方数含分母时怎么办？', score: 2 },
      { label: '合并同类根式', ask: '多个根式相加减的前提是什么？', score: 1 },
    ],
    pitfalls: [
      { t: '把根式当同类项合并', bad: '$\\sqrt{2}+\\sqrt{3}=\\sqrt{5}$', good: '$\\sqrt{2}+\\sqrt{3}$ 已是最终结果',
        why: '被开方数不同不能合并。$\\sqrt2+\\sqrt3\\approx3.146$，而 $\\sqrt5\\approx2.236$。' },
      { t: '$\\sqrt{a^{2}}$ 直接写成 $a$', bad: '$\\sqrt{(-3)^{2}}=-3$', good: '$\\sqrt{(-3)^{2}}=|-3|=3$',
        why: '$\\sqrt{a^2}=|a|$，必须先加绝对值再按符号化简。' },
    ],
    motherId: 'q-sqrt-1', variantIds: ['v-sqrt-1', 'v-sqrt-2', 'v-sqrt-3'],
  },
  {
    id: 'm-eq-system', chapter: 'ch-eq', name: '方程组消元', tier: 'send',
    signal: '题面出现两个未知数、两个方程，或出现「解方程组」「求 $x$、$y$ 的值」。',
    steps: [
      { label: '观察系数', ask: '先看两个方程中哪个未知数系数容易消？', score: 1 },
      { label: '选择消元方式', ask: '代入还是加减？依据是什么？', score: 1 },
      { label: '解一元一次方程', ask: '消元后得到什么？', score: 2 },
      { label: '回代求另一个未知数', ask: '解出一个后做什么？', score: 1 },
    ],
    pitfalls: [
      { t: '加减消元时漏乘', bad: '用 $2\\times$①减②时只乘了 $x$ 项', good: '整个方程每一项都要乘 2',
        why: '等式两边同乘一个数，每一项都要乘，漏乘会导致系数错。' },
      { t: '回代时代错方程', bad: '解出 $x$ 后代回变形后的方程', good: '代回原方程之一',
        why: '变形后的方程可能引入误差，代回原方程最保险。' },
    ],
    motherId: 'q-eqsys-1', variantIds: ['v-eqsys-1', 'v-eqsys-2', 'v-eqsys-3'],
  },
  {
    id: 'm-quad-solve', chapter: 'ch-eq', name: '一元二次方程解法', tier: 'send',
    signal: '题面出现 $ax^{2}+bx+c=0$ 形式，或出现「解方程」「求根」。',
    steps: [
      { label: '看能否直接开方', ask: '拿到一元二次方程先看什么？', score: 1 },
      { label: '选解法', ask: '四种解法怎么选？', score: 2 },
      { label: '解出两根', ask: '解出后要写几个解？', score: 1 },
      { label: '检验合理性', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '两边同除未知数导致丢根', bad: '$x^{2}=2x$ 两边除 $x$ 得 $x=2$', good: '$x^{2}-2x=0$，$x(x-2)=0$，$x=0$ 或 $x=2$',
        why: '除以 $x$ 时假设了 $x\\ne0$，丢掉了 $x=0$ 这个根。必须先移项再因式分解。' },
      { t: '只写一个根', bad: '$x^{2}=4$ 的解是 $x=2$', good: '$x=\\pm2$',
        why: '一元二次方程通常有两个根，$\\Delta>0$ 时两个不等根都要写。' },
    ],
    motherId: 'q-quadsolve-1', variantIds: ['v-quadsolve-1', 'v-quadsolve-2', 'v-quadsolve-3'],
  },
  {
    id: 'm-ineq-param', chapter: 'ch-ineq', name: '含参不等式', tier: 'send',
    signal: '题面出现「关于 $x$ 的不等式」「解集为」，且系数含字母参数。',
    steps: [
      { label: '整理成标准形式', ask: '先把不等式整理成什么形式？', score: 1 },
      { label: '判断系数符号', ask: '系数含参时要先讨论什么？', score: 2 },
      { label: '分类写出解集', ask: '系数正、负、零三种情况分别怎么写？', score: 2 },
      { label: '检验边界', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '忽略系数为负要变号', bad: '$ax>1$ 直接写 $x>\\dfrac{1}{a}$', good: '$a>0$ 时 $x>\\dfrac1a$；$a<0$ 时 $x<\\dfrac1a$',
        why: '除以负数不等号方向要改变。含参时必须分 $a>0$、$a<0$ 讨论。' },
      { t: '漏掉系数为 0 的情况', bad: '只讨论 $a>0$ 和 $a<0$', good: '还要讨论 $a=0$：$0>1$ 不成立，无解',
        why: '系数为 0 时不等式退化为常数不等式，可能无解或恒成立。' },
    ],
    motherId: 'q-ineqparam-1', variantIds: ['v-ineqparam-1', 'v-ineqparam-2', 'v-ineqparam-3'],
  },

  /* ==================== 函数 ==================== */
  {
    id: 'm-func-coef', chapter: 'ch-linear', name: '待定系数法求解析式', tier: 'send',
    signal: '题面给出函数图象上的点、或说「求函数解析式」「求 $y$ 与 $x$ 的关系式」。',
    steps: [
      { label: '设解析式', ask: '第一步设什么形式？', score: 1 },
      { label: '代入已知点', ask: '把点代进去得到什么？', score: 1 },
      { label: '解方程（组）', ask: '有几个待定系数就要几个条件？', score: 2 },
      { label: '写出解析式并验证', ask: '最后做什么？', score: 1 },
    ],
    pitfalls: [
      { t: '一次函数只代一个点', bad: '求 $y=kx+b$ 只代一个点就写答案', good: '代两个点解方程组',
        why: '有两个待定系数 $k,b$，必须两个条件（两个点）才能确定。' },
      { t: '反比例函数设错形式', bad: '设 $y=kx$', good: '设 $y=\\dfrac{k}{x}$',
        why: '反比例函数是一次分式，只有一个待定系数，代一个点即可。' },
    ],
    motherId: 'q-coef-1', variantIds: ['v-coef-1', 'v-coef-2', 'v-coef-3'],
  },
  {
    id: 'm-k-meaning', chapter: 'ch-linear', name: '反比例函数 k 的几何意义', tier: 'mid',
    signal: '题面出现反比例函数图象上一点、要求「面积」「三角形面积」「矩形面积」。',
    steps: [
      { label: '设点坐标', ask: '第一步怎么设这个点？', score: 1 },
      { label: '用 $k$ 表示面积', ask: '矩形面积与 $k$ 什么关系？', score: 2 },
      { label: '三角形面积是矩形的一半', ask: '过原点连两点构成三角形，面积怎么算？', score: 2 },
      { label: '用 $k$ 的符号定象限', ask: '最后要注意什么？', score: 1 },
    ],
    pitfalls: [
      { t: '忘记面积取绝对值', bad: '$k=-3$ 时说面积是 $-3$', good: '面积 $=|k|=3$',
        why: '面积一定为正，$k<0$ 时取绝对值。' },
      { t: '把面积当成 $k$ 而不是 $|k|$ 的一半', bad: '三角形面积 $=|k|$', good: '三角形面积 $=\\dfrac{1}{2}|k|$',
        why: '过原点与图象上一点、再作坐标轴垂线构成的三角形面积是 $\\dfrac12|k|$。' },
    ],
    motherId: 'q-kmean-1', variantIds: ['v-kmean-1', 'v-kmean-2', 'v-kmean-3'],
  },
  {
    id: 'm-quad-3forms', chapter: 'ch-quad', name: '二次函数三种形式', tier: 'mid',
    signal: '题面给出顶点、与 $x$ 轴交点、或三个点，要求「求二次函数解析式」。',
    steps: [
      { label: '看给的条件类型', ask: '给了什么条件？', score: 1 },
      { label: '选对应表达式', ask: '顶点、交点、一般点分别用哪种形式？', score: 2 },
      { label: '代入求系数', ask: '代入后得到什么方程？', score: 1 },
      { label: '化为要求的形式', ask: '最后是否需要展开？', score: 1 },
    ],
    pitfalls: [
      { t: '顶点式符号写错', bad: '顶点 $(2,3)$ 写成 $y=a(x+2)^{2}+3$', good: '$y=a(x-2)^{2}+3$',
        why: '顶点式是 $y=a(x-h)^2+k$，括号内是减号。' },
      { t: '交点式用于无交点情形', bad: '$\\Delta<0$ 时用交点式', good: '用一般式或顶点式',
        why: '交点式需要两个实根，$\\Delta<0$ 时不存在交点。' },
    ],
    motherId: 'q-quad3-1', variantIds: ['v-quad3-1', 'v-quad3-2', 'v-quad3-3'],
  },
  {
    id: 'm-quad-translate', chapter: 'ch-quad', name: '二次函数图象平移', tier: 'mid',
    signal: '题面出现「平移」「向左/右/上/下平移 $n$ 个单位」后求新解析式或求参数。',
    steps: [
      { label: '化为顶点式', ask: '第一步先把解析式化成什么形式？', score: 1 },
      { label: '确定平移方向', ask: '「左加右减、上加下减」具体怎么用？', score: 2 },
      { label: '写出新解析式', ask: '平移后顶点怎么变？', score: 1 },
      { label: '需要时展开', ask: '最后是否需要化回一般式？', score: 1 },
    ],
    pitfalls: [
      { t: '左右平移符号反了', bad: '$y=x^{2}$ 右移 2 得 $y=(x+2)^{2}$', good: '$y=(x-2)^{2}$',
        why: '右移是「减」：$x$ 换成 $x-2$。这是最高频的符号错误。' },
      { t: '上下平移加到 $x$ 上', bad: '$y=x^{2}$ 上移 3 得 $y=(x+3)^{2}$', good: '$y=x^{2}+3$',
        why: '上下平移加在常数项上，不改变 $x$。' },
    ],
    motherId: 'q-quadt-1', variantIds: ['v-quadt-1', 'v-quadt-2', 'v-quadt-3'],
  },
  {
    id: 'm-quad-interval', chapter: 'ch-quad', name: '二次函数区间最值', tier: 'dist',
    signal: '题面出现「在 $m \\le x \\le n$ 上求最值」「当 $a \\le x \\le b$ 时 $y$ 的最大/最小值」，且对称轴含参数或区间端点含参数。',
    steps: [
      { label: '先求对称轴', ask: '第一步该先求什么？', score: 1 },
      { label: '判断对称轴与区间的位置关系', ask: '对称轴求出后，接下来判断什么？', score: 1 },
      { label: '分三类取值', ask: '对称轴与区间的三种位置关系下，最值分别在哪取？', score: 2 },
      { label: '代回求值并比较', ask: '最后一步做什么？', score: 1 },
    ],
    pitfalls: [
      { t: '直接代入区间端点', bad: '把 $x=m$ 和 $x=n$ 代入就当作最值', good: '先判对称轴在区间内还是外；在区间内时顶点才是最值点',
        why: '区间包含顶点时，最值在顶点取，端点代入会漏掉顶点这个极值。' },
      { t: '开口方向搞反', bad: '$a>0$ 时认为顶点是最大值', good: '$a>0$ 开口向上，顶点是最小值',
        why: '开口向上时两端趋向正无穷，顶点是谷底。' },
      { t: '三类只写两类', bad: '只讨论「对称轴在区间内」和「在区间左侧」', good: '必须写全：在左、在内、在右',
        why: '漏掉一类就丢一半过程分，这是北京卷 26 题最常见的失分点。' },
    ],
    motherId: 'q-quad-int-1', variantIds: ['v-quad-int-1', 'v-quad-int-2', 'v-quad-int-3'],
  },
  {
    id: 'm-quad-param', chapter: 'ch-quad', name: '含参二次函数', tier: 'dist',
    signal: '题面出现「二次函数 $y=x^{2}-2mx+\\cdots$」且系数含字母，要求最值、根的个数或参数范围。',
    steps: [
      { label: '确认二次项系数不为 0', ask: '第一步先确认什么隐含条件？', score: 1 },
      { label: '求对称轴（含参）', ask: '对称轴含参时怎么处理？', score: 1 },
      { label: '按参数分类讨论', ask: '要按什么分类？', score: 2 },
      { label: '综合各情况写结论', ask: '最后怎么组织答案？', score: 1 },
    ],
    pitfalls: [
      { t: '漏掉二次项系数不为 0', bad: '$y=(m-1)x^{2}+2x$ 直接当二次函数', good: '先写 $m\\ne1$',
        why: '这是隐含条件，不写会丢分，且 $m=1$ 时函数根本不是二次函数。' },
      { t: '分类讨论不全', bad: '只讨论对称轴在区间内', good: '对称轴在左、在内、在右三种都要讨论',
        why: '参数变化会使对称轴位置变化，必须覆盖所有可能。' },
    ],
    motherId: 'q-quadparam-1', variantIds: ['v-quadparam-1', 'v-quadparam-2', 'v-quadparam-3'],
  },

  /* ==================== 几何 ==================== */
  {
    id: 'm-congruent', chapter: 'ch-triangle', name: '全等三角形构造', tier: 'send',
    signal: '题面要求「求证两线段相等」「求证两角相等」，且图形中有公共边、公共角或对顶角。',
    steps: [
      { label: '找已有的相等条件', ask: '图上已经有哪些相等关系？', score: 1 },
      { label: '确定用哪个判定', ask: '按现有条件能凑出 SSS/SAS/ASA/AAS/HL 哪个？', score: 2 },
      { label: '补足缺少的条件', ask: '缺一个条件时怎么补？', score: 2 },
      { label: '写全等并转化结论', ask: '全等后怎么得到要证的结论？', score: 1 },
    ],
    pitfalls: [
      { t: '用 SSA 判定全等', bad: '两边及其中一边的对角相等就判全等', good: '必须是两边及**夹角**（SAS）',
        why: 'SSA 不能判定全等，满足条件的三角形可能有两种形状。' },
      { t: '用 AAA 判定全等', bad: '三角相等就判全等', good: 'AAA 只能判相似',
        why: '三角相等但大小可以不同，不保证全等。' },
      { t: '对应顶点写错位置', bad: '$\\triangle ABC\\cong\\triangle DFE$ 但实际 $A$ 对应 $D$、$B$ 对应 $F$', good: '按对应关系写',
        why: '全等式的字母顺序表示对应关系，写错会导致后续对应边找错。' },
    ],
    motherId: 'q-congr-1', variantIds: ['v-congr-1', 'v-congr-2', 'v-congr-3'],
  },
  {
    id: 'm-isosceles', chapter: 'ch-triangle', name: '等腰三角形三线合一', tier: 'send',
    signal: '题面出现等腰三角形，且有底边中点、顶角平分线或底边上的高其中之一。',
    steps: [
      { label: '确认等腰与底边', ask: '哪两条边相等？底边是哪条？', score: 1 },
      { label: '连底边中线', ask: '底边中点该怎么用？', score: 1 },
      { label: '用三线合一得垂直与平分', ask: '连中线后能得到什么？', score: 2 },
      { label: '转化到要证的结论', ask: '最后怎么用这两个结论？', score: 1 },
    ],
    pitfalls: [
      { t: '把三线合一周到所有三角形', bad: '任意三角形底边中线也是高', good: '只有等腰三角形才三线合一',
        why: '三线合一是等腰三角形特有的性质，其他三角形不成立。' },
      { t: '不知道连哪条线', bad: '等腰三角形随便作辅助线', good: '连底边中点与顶角',
        why: '连这条线才能触发三线合一，其他辅助线没有这个效果。' },
    ],
    motherId: 'q-isos-1', variantIds: ['v-isos-1', 'v-isos-2', 'v-isos-3'],
  },
  {
    id: 'm-parallelogram', chapter: 'ch-quadrilateral', name: '平行四边形的判定与性质', tier: 'send',
    signal: '题面出现「四边形 $ABCD$ 中」「求证是平行四边形」或已知平行四边形求线段、角。',
    steps: [
      { label: '判断是证判定还是用性质', ask: '题目要证平行四边形，还是已知平行四边形？', score: 1 },
      { label: '选对应定理', ask: '证判定有五种方法，选哪个？', score: 2 },
      { label: '找条件凑定理', ask: '怎么把已知条件凑成定理要求的形式？', score: 2 },
      { label: '写出结论', ask: '最后写什么？', score: 1 },
    ],
    pitfalls: [
      { t: '一组对边平行另一组相等', bad: '用「一组对边平行，另一组对边相等」判平行四边形', good: '必须是**同一组**对边平行且相等',
        why: '这个条件是等腰梯形的特征，不是平行四边形。' },
      { t: '对角线相等就判矩形', bad: '对角线相等的四边形是矩形', good: '对角线相等的**平行四边形**是矩形',
        why: '必须先是平行四边形，等腰梯形对角线也相等。' },
    ],
    motherId: 'q-parallelo-1', variantIds: ['v-parallelo-1', 'v-parallelo-2', 'v-parallelo-3'],
  },
  {
    id: 'm-similar-4', chapter: 'ch-similar', name: '相似四模型', tier: 'mid',
    signal: '题面出现「$DE\\parallel BC$」「求线段长度之比」「求证比例式」，或图形中有平行线、公共角。',
    steps: [
      { label: '找平行或等角', ask: '图中有平行线或相等的角吗？', score: 1 },
      { label: '确定相似模型', ask: '是 A 字型、X 字型、一线三等角还是旋转型？', score: 2 },
      { label: '写出对应比例式', ask: '相似后对应边怎么成比例？', score: 2 },
      { label: '代入求值或证结论', ask: '最后怎么用比例式？', score: 1 },
    ],
    pitfalls: [
      { t: '对应边写错', bad: '$\\triangle ABC\\sim\\triangle DEF$ 时写 $\\dfrac{AB}{EF}=\\dfrac{BC}{DE}$', good: '$\\dfrac{AB}{DE}=\\dfrac{BC}{EF}$',
        why: '对应边要按相似式中的字母顺序配对，写错比例式全错。' },
      { t: '面积比当成相似比', bad: '相似比 $1:2$ 说面积比 $1:2$', good: '面积比 $1:4$',
        why: '面积比是相似比的平方。' },
    ],
    motherId: 'q-sim-1', variantIds: ['v-sim-1', 'v-sim-2', 'v-sim-3'],
  },
  {
    id: 'm-circle-aux', chapter: 'ch-circle', name: '圆中辅助线', tier: 'mid',
    signal: '题面出现圆、弦、圆周角，要求证线段相等、求角度或求长度。',
    steps: [
      { label: '判断用哪条性质', ask: '是弦、圆周角还是切线问题？', score: 1 },
      { label: '选辅助线', ask: '连半径、作弦心距还是连圆周角？', score: 2 },
      { label: '用定理转化', ask: '垂径定理、圆周角定理怎么用？', score: 2 },
      { label: '求值或证结论', ask: '最后怎么得结论？', score: 1 },
    ],
    pitfalls: [
      { t: '见弦不作弦心距', bad: '有弦但没作垂线', good: '作弦心距用垂径定理',
        why: '垂径定理需要垂直于弦的直径，不作出这条线就无法使用。' },
      { t: '圆周角与圆心角混淆', bad: '圆周角等于圆心角', good: '圆周角是圆心角的一半',
        why: '同弧所对的圆周角等于圆心角的一半，这是最常错的倍数关系。' },
    ],
    motherId: 'q-circle-1', variantIds: ['v-circle-1', 'v-circle-2', 'v-circle-3'],
  },
  {
    id: 'm-tangent-2ways', chapter: 'ch-circle', name: '切线两路', tier: 'mid',
    signal: '题面出现「切线」「相切」「证切线」，或已知切线求角度、长度。',
    steps: [
      { label: '判断是证切线还是用切线', ask: '题目要证切线，还是已知切线？', score: 1 },
      { label: '选对应路径', ask: '证切线用「连半径证垂直」还是「作垂线证等于半径」？', score: 2 },
      { label: '连半径或作垂线', ask: '具体连哪条半径？', score: 2 },
      { label: '用切线性质求值', ask: '已知切线时用哪条性质？', score: 1 },
    ],
    pitfalls: [
      { t: '证切线不连半径', bad: '直接说「是切线」', good: '连过切点的半径，证垂直',
        why: '切线的判定必须落到「垂直于过切点的半径」这条定理上。' },
      { t: '切线垂直于任意半径', bad: '切线垂直于所有半径', good: '只垂直于过切点的半径',
        why: '只有过切点的那条半径与切线垂直。' },
    ],
    motherId: 'q-tangent-1', variantIds: ['v-tangent-1', 'v-tangent-2', 'v-tangent-3'],
  },
  {
    id: 'm-right-triangle', chapter: 'ch-trig', name: '解直角三角形', tier: 'send',
    signal: '题面出现直角三角形、仰角俯角坡度，或给出角度与一边求另一边。',
    steps: [
      { label: '找或构造直角三角形', ask: '图中有现成的直角三角形吗？', score: 1 },
      { label: '确定用哪个三角函数', ask: '已知和要求的边分别是斜边、对边还是邻边？', score: 2 },
      { label: '列式求解', ask: '用 $\\sin$、$\\cos$ 还是 $\\tan$？', score: 2 },
      { label: '检验并写单位', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '正弦余弦的分母搞混', bad: '$\\cos A=\\dfrac{\\text{对边}}{\\text{斜边}}$', good: '$\\cos A=\\dfrac{\\text{邻边}}{\\text{斜边}}$',
        why: '余弦用邻边，正弦用对边，分母都是斜边。' },
      { t: '没有直角三角形硬套', bad: '钝角三角形直接用三角函数', good: '先作高构造直角三角形',
        why: '三角函数只定义在直角三角形上。' },
    ],
    motherId: 'q-righttri-1', variantIds: ['v-righttri-1', 'v-righttri-2', 'v-righttri-3'],
  },
  {
    id: 'm-midpoint-4', chapter: 'ch-geo-aux', name: '中点四模型', tier: 'dist',
    signal: '题面出现「$M$ 是 $AB$ 的中点」「$D$ 为 $BC$ 中点」或出现「中线」「中位线」字样，且需要证明线段关系或求长度。',
    steps: [
      { label: '识别中点类型', ask: '这个中点属于哪一类？（普通边中点 / 直角三角形斜边中点 / 等腰三角形底边中点 / 梯形腰中点）', score: 1 },
      { label: '选对应模型', ask: '按类型该用哪个模型？', score: 1 },
      { label: '作辅助线', ask: '这个模型的标准辅助线怎么作？', score: 2 },
      { label: '用模型结论转化', ask: '作完辅助线，用哪条结论把条件转成结论？', score: 2 },
    ],
    pitfalls: [
      { t: '见中点就作中位线', bad: '不管什么中点，一律连成中位线', good: '直角三角形斜边中点要连直角顶点（斜边中线等于斜边一半）',
        why: '模型选错，辅助线白作。斜边中点连斜边中点没有结论，连直角顶点才有。' },
      { t: '等腰底边中点不连顶角', bad: '等腰三角形底边中点只作平行线', good: '连顶角，得「三线合一」：垂直 + 平分',
        why: '等腰三角形底边中线同时是底边上的高和顶角平分线，这是最容易拿的分。' },
    ],
    motherId: 'q-mid-1', variantIds: ['v-mid-1', 'v-mid-2', 'v-mid-3'],
  },
  {
    id: 'm-hand-in-hand', chapter: 'ch-geo-aux', name: '手拉手旋转模型', tier: 'dist',
    signal: '图形中有两个共顶点的等腰三角形（或等边、正方形），顶角相等，要求证线段相等或求角度。',
    steps: [
      { label: '找共顶点的等腰三角形', ask: '哪两个三角形共顶点且腰相等？', score: 1 },
      { label: '确认顶角相等', ask: '两个顶角相等吗？', score: 1 },
      { label: '旋转得全等', ask: '旋转哪个三角形、转多少度？', score: 2 },
      { label: '用全等得结论', ask: '全等后能推出什么？', score: 2 },
    ],
    pitfalls: [
      { t: '找不到旋转中心', bad: '随便选一点旋转', good: '旋转中心是共顶点',
        why: '手拉手的旋转中心必须是两个等腰三角形的公共顶点。' },
      { t: '忘记证明顶角相等', bad: '直接说两个三角形全等', good: '先证顶角相等（常由公共角推出）',
        why: '全等需要 SAS，顶角相等是夹角条件，不能跳过。' },
    ],
    motherId: 'q-hand-1', variantIds: ['v-hand-1', 'v-hand-2', 'v-hand-3'],
  },
  {
    id: 'm-half-angle', chapter: 'ch-geo-aux', name: '半角模型', tier: 'dist',
    signal: '题面出现「$\\angle EAF=\\dfrac{1}{2}\\angle BAD$」这类半角关系，且图形含正方形或等腰直角三角形。',
    steps: [
      { label: '确认半角关系', ask: '哪个角是哪个角的一半？', score: 1 },
      { label: '旋转小三角形', ask: '把哪个三角形旋转多少度？', score: 2 },
      { label: '证全等', ask: '旋转后怎么证全等？', score: 2 },
      { label: '得线段关系', ask: '全等后三条线段什么关系？', score: 1 },
    ],
    pitfalls: [
      { t: '旋转方向反了', bad: '把三角形转到图形外面', good: '旋转到与另一半角重合',
        why: '旋转的目的是把分散的线段拼到一起，方向错了拼不上。' },
      { t: '忘记说明旋转后共线', bad: '旋转后直接说全等', good: '先证三点共线',
        why: '旋转后要证对应点共线才能构成三角形全等。' },
    ],
    motherId: 'q-half-1', variantIds: ['v-half-1', 'v-half-2', 'v-half-3'],
  },
  {
    id: 'm-three-segments', chapter: 'ch-geo-aux', name: '三条线段关系', tier: 'dist',
    signal: '题面要求证「$a=b+c$」「$a^{2}=b^{2}+c^{2}$」或「三条线段之间的等量关系」。',
    steps: [
      { label: '判断关系类型', ask: '是线性关系 $a=b+c$ 还是平方关系 $a^{2}=b^{2}+c^{2}$？', score: 1 },
      { label: '选方法', ask: '线性关系用截长补短，平方关系用勾股或相似？', score: 2 },
      { label: '构造辅助线', ask: '怎么把三条线段凑到一个三角形里？', score: 2 },
      { label: '写出等量关系', ask: '最后怎么得结论？', score: 2 },
    ],
    pitfalls: [
      { t: '平方关系用截长补短', bad: '$a^{2}=b^{2}+c^{2}$ 用截长', good: '构造直角三角形用勾股',
        why: '截长补短处理线性关系，平方关系需要勾股定理或相似。' },
      { t: '凑不到同一个三角形', bad: '三条线段分散在三个位置', good: '通过旋转或平移集中',
        why: '必须在同一个三角形中才能建立关系，否则无法使用定理。' },
    ],
    motherId: 'q-3seg-1', variantIds: ['v-3seg-1', 'v-3seg-2', 'v-3seg-3'],
  },

  /* ==================== 统计概率 ==================== */
  {
    id: 'm-chart-read', chapter: 'ch-stat', name: '统计图表读取', tier: 'send',
    signal: '题面给出条形图、扇形图、折线图或直方图，要求读数据、算占比或补全图表。',
    steps: [
      { label: '读图找总量', ask: '第一步先求出什么？', score: 1 },
      { label: '算占比或频数', ask: '某项占比怎么算？', score: 2 },
      { label: '注意图表类型差异', ask: '扇形图看占比、直方图看什么？', score: 2 },
      { label: '检验总数是否吻合', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '直方图纵轴当频数读', bad: '直方图纵轴数值当频数', good: '纵轴是「频率/组距」，面积才是频率',
        why: '直方图纵轴是频率除以组距，直接当频数是最高频的读图错误。' },
      { t: '扇形图用角度当人数', bad: '扇形图 90° 就是 90 人', good: '90° 对应占比 $\\dfrac{90}{360}=\\dfrac14$',
        why: '扇形图表示占比，要乘以总数才是人数。' },
    ],
    motherId: 'q-chart-1', variantIds: ['v-chart-1', 'v-chart-2', 'v-chart-3'],
  },
  {
    id: 'm-three-measures', chapter: 'ch-stat', name: '三数一差', tier: 'send',
    signal: '题面出现「平均数」「中位数」「众数」「方差」，要求计算或比较稳定性。',
    steps: [
      { label: '排序（求中位数必须）', ask: '求中位数前必须先做什么？', score: 1 },
      { label: '分别计算', ask: '平均数、中位数、众数怎么算？', score: 2 },
      { label: '比较稳定性用方差', ask: '比较两组数据谁更稳定看什么？', score: 2 },
      { label: '结合实际解释', ask: '最后怎么回答实际问题？', score: 1 },
    ],
    pitfalls: [
      { t: '求中位数不排序', bad: '直接取中间位置的数', good: '先从小到大排序再取',
        why: '不排序取的位置是错的，这是中位数最常见的错误。' },
      { t: '方差越大越稳定', bad: '方差大说明稳定', good: '方差小才稳定',
        why: '方差衡量波动程度，越大波动越大，越不稳定。' },
    ],
    motherId: 'q-measure-1', variantIds: ['v-measure-1', 'v-measure-2', 'v-measure-3'],
  },
  {
    id: 'm-tree-diagram', chapter: 'ch-prob', name: '树状图与列表法', tier: 'send',
    signal: '题面出现「两次」「不放回」「求概率」，且试验分两步进行。',
    steps: [
      { label: '判断是否放回', ask: '第一次取出后放回吗？', score: 1 },
      { label: '画树状图或列表', ask: '第二步的可选结果有几个？', score: 2 },
      { label: '数总结果与有利结果', ask: '总共有多少种等可能结果？', score: 2 },
      { label: '算概率', ask: '最后怎么算？', score: 1 },
    ],
    pitfalls: [
      { t: '忽略「不放回」', bad: '不放回时第二次仍按原总数算', good: '不放回时第二次总数减 1',
        why: '不放回会改变第二次的总数，概率不同。这是最常错的地方。' },
      { t: '漏掉某些结果', bad: '树状图只画了一种顺序', good: '有序与无序要分清，按题目要求列全',
        why: '漏结果会导致分母错，概率全错。' },
    ],
    motherId: 'q-tree-1', variantIds: ['v-tree-1', 'v-tree-2', 'v-tree-3'],
  },

  /* ==================== 综合 ==================== */
  {
    id: 'm-newdef-3step', chapter: 'ch-newdef', name: '新定义三步法', tier: 'dist',
    signal: '题面出现「我们定义：……」「称点 $P$ 为图形 $M$ 的××点」等自定义概念，且后接 (1)(2)(3) 三问。',
    steps: [
      { label: '圈出定义的三个要素', ask: '这个定义由哪几个要素构成？（对象、条件、关系）', score: 1 },
      { label: '第 (1) 问直接代入验证', ask: '第 (1) 问该怎么做？', score: 2 },
      { label: '第 (2) 问取特殊值或临界', ask: '第 (2) 问找不到思路时，第一步试什么？', score: 2 },
      { label: '第 (3) 问分类或转函数', ask: '第 (3) 问通常怎么处理？', score: 3 },
    ],
    pitfalls: [
      { t: '不读定义直接做题', bad: '跳过定义看第 (1) 问，凭感觉答', good: '先把定义拆成「对象 + 条件 + 关系」三行写下来',
        why: '新定义题的所有判断都要回到定义原文，跳过定义等于放弃。' },
      { t: '第 (1) 问算错', bad: '觉得第 (1) 问简单，心算代入', good: '第 (1) 问是送分的 2 分，必须写全过程再核对',
        why: '北京卷 28 题第 (1) 问是最容易拿的分，算错等于白送 2 分。' },
    ],
    motherId: 'q-newdef-1', variantIds: ['v-newdef-1', 'v-newdef-2', 'v-newdef-3'],
  },
  {
    id: 'm-boundary', chapter: 'ch-newdef', name: '边界与临界', tier: 'dist',
    signal: '题面出现「不超过」「至少」「恰好」「取值范围」，或要求求参数范围、最大最小值。',
    steps: [
      { label: '写出临界条件', ask: '什么时候取到边界？', score: 1 },
      { label: '判断是否含等号', ask: '「不超过」含等号吗？', score: 2 },
      { label: '分类讨论', ask: '按什么分类？', score: 2 },
      { label: '写出范围并验证端点', ask: '最后怎么检查？', score: 1 },
    ],
    pitfalls: [
      { t: '含等号判断错', bad: '「不超过」写成 $<$', good: '「不超过」是 $\\le$',
        why: '边界点是否包含会直接影响答案，这是最常丢分的地方。' },
      { t: '不验证端点', bad: '算出范围就写答案', good: '把端点代回原题验证',
        why: '端点可能不满足原条件，必须代回检验。' },
    ],
    motherId: 'q-bound-1', variantIds: ['v-bound-1', 'v-bound-2', 'v-bound-3'],
  },
  {
    id: 'm-model-4step', chapter: 'ch-design', name: '建模四步', tier: 'mid',
    signal: '题面出现实际情境（购物、行程、工程、方案比较），要求求最优方案或最大利润。',
    steps: [
      { label: '设变量', ask: '设哪个量为 $x$？', score: 1 },
      { label: '建立关系式', ask: '目标量怎么表示成 $x$ 的函数？', score: 2 },
      { label: '确定取值范围', ask: '$x$ 有什么限制？', score: 2 },
      { label: '求最值并回到实际', ask: '最后检查什么？', score: 1 },
    ],
    pitfalls: [
      { t: '忽略实际意义的限制', bad: '求出 $x=-3$ 也当答案', good: '人数、长度必须非负且为整数',
        why: '数学解可能不符合实际，必须检验并舍去。' },
      { t: '忘记写取值范围', bad: '只写函数式不写 $x$ 的范围', good: '写出 $x$ 的实际取值范围',
        why: '没有范围的函数最值可能取在实际不允许的位置。' },
    ],
    motherId: 'q-model-1', variantIds: ['v-model-1', 'v-model-2', 'v-model-3'],
  },
];
