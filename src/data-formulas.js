/* ==========================================================
   P1 · 公式定理库（90 条）
   每条三列：公式 / 适用条件 / 常见误用。
   第三列是理科版词库的差异点——理科失分多数不是记不住公式，
   而是条件不满足还硬套。
   ========================================================== */

export const FORMULAS = [
  /* ==================== 数与式 ==================== */
  { name: '绝对值', tex: '$|a|=\\begin{cases}a & a\\ge0\\\\-a & a<0\\end{cases}$', cond: '对任意实数 $a$', misuse: '把 $|a|$ 直接写成 $a$（$a<0$ 时错）', chapter: 'ch-real' },
  { name: '平方根性质', tex: '$(\\sqrt{a})^{2}=a$', cond: '$a\\ge0$', misuse: '在 $a<0$ 时使用（无意义）', chapter: 'ch-real' },
  { name: '算术平方根', tex: '$\\sqrt{a^{2}}=|a|$', cond: '对任意实数 $a$', misuse: '写成 $\\sqrt{a^{2}}=a$（漏绝对值）', chapter: 'ch-real' },
  { name: '立方根', tex: '$\\sqrt[3]{-a}=-\\sqrt[3]{a}$', cond: '对任意实数 $a$', misuse: '认为负数没有立方根', chapter: 'ch-real' },
  { name: '零指数幂', tex: '$a^{0}=1$', cond: '$a\\ne0$', misuse: '写成 $0^{0}=1$', chapter: 'ch-real' },
  { name: '负整数指数幂', tex: '$a^{-n}=\\dfrac{1}{a^{n}}$', cond: '$a\\ne0$，$n$ 为正整数', misuse: '把 $(-2)^{-2}$ 算成负数', chapter: 'ch-real' },
  { name: '科学记数法', tex: '$a\\times10^{n}$', cond: '$1\\le|a|<10$，$n$ 为整数', misuse: '系数不在 $[1,10)$ 区间', chapter: 'ch-real' },
  { name: '同底数幂乘法', tex: '$a^{m}\\cdot a^{n}=a^{m+n}$', cond: '同底数', misuse: '与幂的乘方混淆，写成 $a^{mn}$', chapter: 'ch-poly' },
  { name: '幂的乘方', tex: '$(a^{m})^{n}=a^{mn}$', cond: '同底数', misuse: '写成 $a^{m+n}$', chapter: 'ch-poly' },
  { name: '积的乘方', tex: '$(ab)^{n}=a^{n}b^{n}$', cond: '$n$ 为正整数', misuse: '只给字母乘方，漏掉系数', chapter: 'ch-poly' },
  { name: '同底数幂除法', tex: '$a^{m}\\div a^{n}=a^{m-n}$', cond: '$a\\ne0$', misuse: '忽略 $a\\ne0$ 的前提', chapter: 'ch-poly' },
  { name: '平方差公式', tex: '$(a+b)(a-b)=a^{2}-b^{2}$', cond: '两项、一加一减', misuse: '用于 $(a+b)(a+b)$ 这种同号情形', chapter: 'ch-poly' },
  { name: '完全平方公式', tex: '$(a\\pm b)^{2}=a^{2}\\pm2ab+b^{2}$', cond: '两项和或差的平方', misuse: '漏掉中间项 $2ab$', chapter: 'ch-poly' },
  { name: '完全平方和变形', tex: '$a^{2}+b^{2}=(a+b)^{2}-2ab$', cond: '已知 $a+b$ 与 $ab$', misuse: '与 $(a+b)^{2}$ 混淆', chapter: 'ch-poly' },
  { name: '十字相乘', tex: '$x^{2}+(p+q)x+pq=(x+p)(x+q)$', cond: '二次项系数为 1', misuse: '常数项符号判断错', chapter: 'ch-poly' },
  { name: '分式有意义', tex: '$\\dfrac{A}{B}$ 有意义', cond: '$B\\ne0$', misuse: '只看分子，忽略分母', chapter: 'ch-frac' },
  { name: '分式值为零', tex: '$\\dfrac{A}{B}=0$', cond: '$A=0$ 且 $B\\ne0$', misuse: '只解 $A=0$，不检验分母', chapter: 'ch-frac' },
  { name: '分式基本性质', tex: '$\\dfrac{A}{B}=\\dfrac{AC}{BC}$', cond: '$C\\ne0$', misuse: '用于加减（$\\dfrac{A+1}{B+1}\\ne\\dfrac AB$）', chapter: 'ch-frac' },
  { name: '二次根式有意义', tex: '$\\sqrt{A}$ 有意义', cond: '$A\\ge0$', misuse: '忽略被开方数非负', chapter: 'ch-frac' },
  { name: '二次根式乘法', tex: '$\\sqrt{a}\\cdot\\sqrt{b}=\\sqrt{ab}$', cond: '$a\\ge0$，$b\\ge0$', misuse: '用于负数（无意义）', chapter: 'ch-frac' },
  { name: '分母有理化', tex: '$\\dfrac{1}{\\sqrt{a}}=\\dfrac{\\sqrt{a}}{a}$', cond: '$a>0$', misuse: '分子忘了同乘', chapter: 'ch-frac' },

  /* ==================== 方程与不等式 ==================== */
  { name: '一元二次求根公式', tex: '$x=\\dfrac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}$', cond: '$a\\ne0$ 且 $\\Delta\\ge0$', misuse: '$\\Delta<0$ 时仍套用', chapter: 'ch-eq' },
  { name: '判别式', tex: '$\\Delta=b^{2}-4ac$', cond: '仅对 $ax^{2}+bx+c=0\\ (a\\ne0)$', misuse: '把 $\\Delta=0$ 当成「无解」', chapter: 'ch-eq' },
  { name: '韦达定理', tex: '$x_1+x_2=-\\dfrac{b}{a},\\ x_1x_2=\\dfrac{c}{a}$', cond: '$\\Delta\\ge0$ 且 $a\\ne0$', misuse: '在 $\\Delta<0$ 时使用', chapter: 'ch-eq' },
  { name: '两根都为正的条件', tex: '$\\Delta\\ge0,\\ x_1+x_2>0,\\ x_1x_2>0$', cond: '一元二次方程', misuse: '只验证 $\\Delta\\ge0$', chapter: 'ch-eq' },
  { name: '增长率模型', tex: '$a(1+x)^{n}=b$', cond: '$x$ 为平均增长率', misuse: '把两次 10% 当成总增长 20%', chapter: 'ch-eq' },
  { name: '不等式性质（乘除负数）', tex: '若 $a>b$，$c<0$，则 $ac<bc$', cond: '$c<0$', misuse: '乘除负数不变号', chapter: 'ch-ineq' },
  { name: '不等式组：同大取大', tex: '$\\begin{cases}x>a\\\\x>b\\end{cases}$', cond: '$a<b$', misuse: '取成 $x>a$', chapter: 'ch-ineq' },
  { name: '不等式组：大小小大', tex: '$\\begin{cases}x>a\\\\x<b\\end{cases}$', cond: '$a<b$', misuse: '写成 $b<x<a$', chapter: 'ch-ineq' },
  { name: '不等式组：大大小小', tex: '$\\begin{cases}x<a\\\\x>b\\end{cases}$', cond: '$a<b$', misuse: '硬写出解集（实际无解）', chapter: 'ch-ineq' },

  /* ==================== 函数 ==================== */
  { name: '一次函数', tex: '$y=kx+b$', cond: '$k\\ne0$', misuse: '把 $k=0$ 的情形当一次函数', chapter: 'ch-linear' },
  { name: '正比例函数', tex: '$y=kx$', cond: '$k\\ne0$', misuse: '与一次函数混为一谈（正比例是特例）', chapter: 'ch-linear' },
  { name: '反比例函数', tex: '$y=\\dfrac{k}{x}$', cond: '$k\\ne0$', misuse: '把 $k=0$ 当反比例函数', chapter: 'ch-linear' },
  { name: '反比例 k 的几何意义', tex: '$S_{\\text{矩形}}=|k|$', cond: '过图象上一点作两坐标轴垂线', misuse: '写成 $S=k$（$k<0$ 时面积为负）', chapter: 'ch-linear' },
  { name: '反比例三角形面积', tex: '$S_{\\triangle}=\\dfrac{1}{2}|k|$', cond: '过原点与图象上一点', misuse: '与矩形面积混淆', chapter: 'ch-linear' },
  { name: '二次函数一般式', tex: '$y=ax^{2}+bx+c$', cond: '$a\\ne0$', misuse: '$a=0$ 时仍当二次函数', chapter: 'ch-quad' },
  { name: '二次函数顶点式', tex: '$y=a(x-h)^{2}+k$', cond: '$a\\ne0$', misuse: '把 $x+h$ 的 $h$ 当顶点横坐标', chapter: 'ch-quad' },
  { name: '二次函数交点式', tex: '$y=a(x-x_1)(x-x_2)$', cond: '$\\Delta>0$（有两个交点）', misuse: '$\\Delta<0$ 时使用', chapter: 'ch-quad' },
  { name: '对称轴', tex: '$x=-\\dfrac{b}{2a}$', cond: '$a\\ne0$', misuse: '符号写错成 $\\dfrac{b}{2a}$', chapter: 'ch-quad' },
  { name: '顶点纵坐标', tex: '$y=\\dfrac{4ac-b^{2}}{4a}$', cond: '$a\\ne0$', misuse: '漏掉负号或分母', chapter: 'ch-quad' },
  { name: '二次函数平移', tex: '左加右减、上加下减', cond: '$y=a(x-h)^{2}+k$', misuse: '左右平移符号反了', chapter: 'ch-quad' },
  { name: '二次函数最值', tex: '$a>0$ 时 $y_{\\min}=\\dfrac{4ac-b^{2}}{4a}$', cond: '顶点在定义域内', misuse: '顶点不在区间内时仍用顶点值', chapter: 'ch-quad' },
  { name: '区间最值三分类', tex: '对称轴在左 / 内 / 右', cond: '给定区间 $[m,n]$', misuse: '只讨论两类', chapter: 'ch-quad' },

  /* ==================== 三角形 ==================== */
  { name: '三角形内角和', tex: '$\\angle A+\\angle B+\\angle C=180^{\\circ}$', cond: '任意三角形', misuse: '用于四边形（四边形是 $360^{\\circ}$）', chapter: 'ch-triangle' },
  { name: '三角形外角', tex: '$\\angle ACD=\\angle A+\\angle B$', cond: '$ACD$ 是 $\\triangle ABC$ 的外角', misuse: '与相邻内角相加（应为互补）', chapter: 'ch-triangle' },
  { name: '三边关系', tex: '$a+b>c$', cond: '任意两边，$c$ 为第三边', misuse: '只验证一组', chapter: 'ch-triangle' },
  { name: '勾股定理', tex: '$a^{2}+b^{2}=c^{2}$', cond: '直角三角形，$c$ 为斜边', misuse: '未确认直角就套用', chapter: 'ch-triangle' },
  { name: '勾股定理逆定理', tex: '若 $a^{2}+b^{2}=c^{2}$ 则 $\\angle C=90^{\\circ}$', cond: '$c$ 为最长边', misuse: '把最长边当直角边', chapter: 'ch-triangle' },
  { name: '直角三角形斜边中线', tex: '$CD=\\dfrac{1}{2}AB$', cond: '$\\angle ACB=90^{\\circ}$，$D$ 为 $AB$ 中点', misuse: '在非直角三角形中套用', chapter: 'ch-triangle' },
  { name: '三角形中位线', tex: '$DE\\parallel BC,\\ DE=\\dfrac{1}{2}BC$', cond: '$D,E$ 分别是两边中点', misuse: '把中线当中位线', chapter: 'ch-triangle' },
  { name: '等腰三角形三线合一', tex: '底边中线 $=$ 底边高 $=$ 顶角平分线', cond: '等腰三角形，且是底边上的线', misuse: '用于非等腰三角形', chapter: 'ch-triangle' },
  { name: '等边对等角', tex: '$AB=AC\\Rightarrow\\angle B=\\angle C$', cond: '同一三角形内', misuse: '跨三角形使用', chapter: 'ch-triangle' },
  { name: '角平分线性质', tex: '角平分线上的点到两边距离相等', cond: '点在角平分线上', misuse: '用于非角平分线', chapter: 'ch-triangle' },

  /* ==================== 四边形 ==================== */
  { name: '多边形内角和', tex: '$(n-2)\\times180^{\\circ}$', cond: '$n\\ge3$', misuse: '漏减 2', chapter: 'ch-quadrilateral' },
  { name: '多边形外角和', tex: '$360^{\\circ}$', cond: '任意凸多边形', misuse: '以为随边数变化', chapter: 'ch-quadrilateral' },
  { name: '正多边形内角', tex: '$\\dfrac{(n-2)\\times180^{\\circ}}{n}$', cond: '正 $n$ 边形', misuse: '用于非正多边形', chapter: 'ch-quadrilateral' },
  { name: '平行四边形性质', tex: '对边平行且相等，对角相等，对角线互相平分', cond: '平行四边形', misuse: '以为对角线相等（那是矩形）', chapter: 'ch-quadrilateral' },
  { name: '平行四边形判定', tex: '一组对边平行且相等', cond: '同一组对边', misuse: '「一组平行、另一组相等」不是平行四边形', chapter: 'ch-quadrilateral' },
  { name: '矩形判定', tex: '对角线相等的平行四边形', cond: '前提是平行四边形', misuse: '漏掉前提（等腰梯形对角线也相等）', chapter: 'ch-quadrilateral' },
  { name: '菱形判定', tex: '对角线互相垂直的平行四边形', cond: '前提是平行四边形', misuse: '漏掉前提', chapter: 'ch-quadrilateral' },
  { name: '中点四边形', tex: '任意四边形的中点四边形是平行四边形', cond: '取各边中点连线', misuse: '以为一定是菱形', chapter: 'ch-quadrilateral' },

  /* ==================== 相似 ==================== */
  { name: '相似判定 AA', tex: '两组角对应相等', cond: '两个三角形', misuse: '用 AAA 判全等', chapter: 'ch-similar' },
  { name: '相似判定 SAS', tex: '两边成比例且夹角相等', cond: '夹角必须相等', misuse: '用 SSA（不一定相似）', chapter: 'ch-similar' },
  { name: '相似周长比', tex: '$C_1:C_2=k$', cond: '$k$ 为相似比', misuse: '写成 $k^{2}$', chapter: 'ch-similar' },
  { name: '相似面积比', tex: '$S_1:S_2=k^{2}$', cond: '$k$ 为相似比', misuse: '写成 $k$', chapter: 'ch-similar' },
  { name: '相似对应线段比', tex: '高、中线、角平分线之比 $=k$', cond: '$k$ 为相似比', misuse: '写成 $k^{2}$', chapter: 'ch-similar' },
  { name: '平行线分线段成比例', tex: '$\\dfrac{AB}{BC}=\\dfrac{DE}{EF}$', cond: '三条平行线截两条直线', misuse: '用于不平行情形', chapter: 'ch-similar' },
  { name: '射影定理', tex: '$h^{2}=pq$', cond: '直角三角形斜边上的高', misuse: '用于非直角三角形', chapter: 'ch-similar' },

  /* ==================== 圆 ==================== */
  { name: '垂径定理', tex: '垂直于弦的直径平分弦及弦所对的弧', cond: '直径垂直于弦', misuse: '反过来用（平分弦不一定垂直）', chapter: 'ch-circle' },
  { name: '圆周角定理', tex: '$\\angle=\\dfrac{1}{2}\\angle_{\\text{圆心}}$', cond: '同弧所对', misuse: '圆周角当成圆心角', chapter: 'ch-circle' },
  { name: '直径所对圆周角', tex: '$\\angle ACB=90^{\\circ}$', cond: '$AB$ 是直径', misuse: '以为任意弦都成立', chapter: 'ch-circle' },
  { name: '圆内接四边形', tex: '对角互补', cond: '四边形内接于圆', misuse: '用于一般四边形', chapter: 'ch-circle' },
  { name: '切线判定', tex: '经过半径外端且垂直于半径', cond: '点在圆上', misuse: '垂直于任意半径就判切线', chapter: 'ch-circle' },
  { name: '切线性质', tex: '切线 $\\perp$ 过切点的半径', cond: '已知切线', misuse: '以为垂直于所有半径', chapter: 'ch-circle' },
  { name: '切线长定理', tex: '$PA=PB$', cond: '从圆外一点引两条切线', misuse: '以为与切线长度无关', chapter: 'ch-circle' },
  { name: '弧长公式', tex: '$l=\\dfrac{n\\pi r}{180}$', cond: '圆心角为 $n^{\\circ}$', misuse: '分母写成 $360$', chapter: 'ch-circle' },
  { name: '扇形面积', tex: '$S=\\dfrac{n\\pi r^{2}}{360}=\\dfrac{1}{2}lr$', cond: '圆心角为 $n^{\\circ}$', misuse: '用整圆面积 $\\pi r^{2}$', chapter: 'ch-circle' },
  { name: '弦切角', tex: '弦切角 $=$ 所夹弧对的圆周角', cond: '切线与弦的夹角', misuse: '等于圆心角', chapter: 'ch-circle' },

  /* ==================== 三角函数 ==================== */
  { name: '正弦', tex: '$\\sin A=\\dfrac{\\text{对边}}{\\text{斜边}}$', cond: '直角三角形', misuse: '分母写成邻边', chapter: 'ch-trig' },
  { name: '余弦', tex: '$\\cos A=\\dfrac{\\text{邻边}}{\\text{斜边}}$', cond: '直角三角形', misuse: '与正弦的分子搞反', chapter: 'ch-trig' },
  { name: '正切', tex: '$\\tan A=\\dfrac{\\text{对边}}{\\text{邻边}}$', cond: '直角三角形', misuse: '分母写成斜边', chapter: 'ch-trig' },
  { name: '同角平方关系', tex: '$\\sin^{2}A+\\cos^{2}A=1$', cond: '同一锐角', misuse: '写成 $\\sin A+\\cos A=1$', chapter: 'ch-trig' },
  { name: '特殊角 $30^{\\circ}$', tex: '$\\sin30^{\\circ}=\\dfrac{1}{2},\\ \\cos30^{\\circ}=\\dfrac{\\sqrt{3}}{2},\\ \\tan30^{\\circ}=\\dfrac{\\sqrt{3}}{3}$', cond: '锐角三角', misuse: '与 $60^{\\circ}$ 混淆', chapter: 'ch-trig' },
  { name: '特殊角 $45^{\\circ}$', tex: '$\\sin45^{\\circ}=\\cos45^{\\circ}=\\dfrac{\\sqrt{2}}{2},\\ \\tan45^{\\circ}=1$', cond: '锐角三角', misuse: '记成 $\\dfrac{1}{2}$', chapter: 'ch-trig' },
  { name: '特殊角 $60^{\\circ}$', tex: '$\\sin60^{\\circ}=\\dfrac{\\sqrt{3}}{2},\\ \\cos60^{\\circ}=\\dfrac{1}{2},\\ \\tan60^{\\circ}=\\sqrt{3}$', cond: '锐角三角', misuse: '与 $30^{\\circ}$ 混淆', chapter: 'ch-trig' },
  { name: '坡度', tex: '$i=\\dfrac{h}{l}=\\tan\\alpha$', cond: '$\\alpha$ 为坡角', misuse: '用 $\\sin\\alpha$ 或 $\\cos\\alpha$', chapter: 'ch-trig' },

  /* ==================== 统计概率 ==================== */
  { name: '平均数', tex: '$\\bar{x}=\\dfrac{x_1+x_2+\\cdots+x_n}{n}$', cond: '算术平均数', misuse: '受极端值影响大时仍用', chapter: 'ch-stat' },
  { name: '中位数', tex: '排序后中间位置的数', cond: '必须先排序', misuse: '不排序直接取中间', chapter: 'ch-stat' },
  { name: '众数', tex: '出现次数最多的数', cond: '可以不唯一', misuse: '以为一定唯一', chapter: 'ch-stat' },
  { name: '方差', tex: '$s^{2}=\\dfrac{1}{n}\\sum(x_i-\\bar{x})^{2}$', cond: '衡量波动大小', misuse: '以为方差大更稳定', chapter: 'ch-stat' },
  { name: '频率', tex: '$f=\\dfrac{\\text{频数}}{\\text{总数}}$', cond: '各组频率和为 1', misuse: '与频数混淆', chapter: 'ch-stat' },
  { name: '等可能概率', tex: '$P(A)=\\dfrac{\\text{有利结果数}}{\\text{总结果数}}$', cond: '各结果等可能', misuse: '不等可能时仍用', chapter: 'ch-prob' },
  { name: '对立事件概率', tex: '$P(A)+P(\\bar{A})=1$', cond: '互斥且必有一个发生', misuse: '把互斥事件当对立事件', chapter: 'ch-prob' },
  { name: '独立事件相乘', tex: '$P(AB)=P(A)P(B)$', cond: '$A$、$B$ 相互独立', misuse: '用于不独立情形（如不放回）', chapter: 'ch-prob' },
];
