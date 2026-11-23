/* ==========================================================
   P1 · 送分区章节题（60 题）
   覆盖卷面 1-16 题与 17-22 题的送分部分。
   每题单步（送分区选填天然单步），guided 模式答对即进结果。
   ========================================================== */

export const SEND_QUESTIONS = [
  {
    "id": "q-send-001",
    "chapter": "ch-real",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 1 型",
    "kind": "choice",
    "score": 2,
    "stem": "$-3$ 的绝对值是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$3$",
          "$-3$",
          "$\\dfrac{1}{3}$",
          "$-\\dfrac{1}{3}$"
        ],
        "key": 0,
        "score": 2,
        "hint": "$|-3|=3$，绝对值非负。",
        "why": "$|-3|=3$，绝对值非负。"
      }
    ]
  },
  {
    "id": "q-send-002",
    "chapter": "ch-real",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 2 型",
    "kind": "choice",
    "score": 2,
    "stem": "$2^{-2}$ 等于",
    "errorTags": [
      "concept",
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$4$",
          "$-4$",
          "$\\dfrac{1}{4}$",
          "$-\\dfrac{1}{4}$"
        ],
        "key": 2,
        "score": 2,
        "hint": "$2^{-2}=\\dfrac{1}{2^{2}}=\\dfrac14$，负指数取倒",
        "why": "$2^{-2}=\\dfrac{1}{2^{2}}=\\dfrac14$，负指数取倒数。"
      }
    ]
  },
  {
    "id": "q-send-003",
    "chapter": "ch-real",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 9 型",
    "kind": "fill",
    "score": 2,
    "stem": "将 $0.000025$ 用科学记数法表示为",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "2.5×10^{-5}"
        ],
        "answer": "2.5×10^{-5}",
        "score": 2,
        "hint": "小数点右移 5 位得 2.5，指数为 $-5$。",
        "why": "小数点右移 5 位得 2.5，指数为 $-5$。"
      }
    ]
  },
  {
    "id": "q-send-004",
    "chapter": "ch-real",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 17 题",
    "kind": "fill",
    "score": 2,
    "stem": "计算：$|-2|+\\sqrt{9}-(\\pi-3)^{0}$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "4",
          "=4"
        ],
        "answer": "4",
        "score": 2,
        "hint": "$|-2|=2$，$\\sqrt9=3$，$(\\pi-3)^0=1$。",
        "why": "$|-2|=2$，$\\sqrt9=3$，$(\\pi-3)^0=1$，故原式 $=2+3-1=4$。"
      }
    ]
  },
  {
    "id": "q-send-005",
    "chapter": "ch-real",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 2 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列各数中，是无理数的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$\\dfrac{22}{7}$",
          "$\\sqrt{9}$",
          "$\\pi$",
          "$0.\\dot{3}$"
        ],
        "key": 2,
        "score": 2,
        "hint": "$\\pi$ 是无限不循环小数。$\\dfrac{22}7$ 是分数，$\\sqrt9",
        "why": "$\\pi$ 是无限不循环小数。$\\dfrac{22}7$ 是分数，$\\sqrt9=3$，$0.\\dot3$ 是循环小数。"
      }
    ]
  },
  {
    "id": "q-send-006",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 3 型",
    "kind": "choice",
    "score": 2,
    "stem": "计算 $a^{2}\\cdot a^{3}$ 的结果是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$a^{5}$",
          "$a^{6}$",
          "$a^{8}$",
          "$2a^{5}$"
        ],
        "key": 0,
        "score": 2,
        "hint": "同底数幂相乘，指数相加：$2+3=5$。",
        "why": "同底数幂相乘，指数相加：$2+3=5$。"
      }
    ]
  },
  {
    "id": "q-send-007",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 3 型",
    "kind": "choice",
    "score": 2,
    "stem": "$(2a)^{3}$ 等于",
    "errorTags": [
      "concept",
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$2a^{3}$",
          "$6a^{3}$",
          "$8a^{3}$",
          "$8a$"
        ],
        "key": 2,
        "score": 2,
        "hint": "积的乘方，每个因式都乘方：$2^{3}a^{3}=8a^{3}$。",
        "why": "积的乘方，每个因式都乘方：$2^{3}a^{3}=8a^{3}$。"
      }
    ]
  },
  {
    "id": "q-send-008",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 10 型",
    "kind": "fill",
    "score": 2,
    "stem": "分解因式：$x^{2}-9=$",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "(x+3)(x-3)",
          "(x-3)(x+3)"
        ],
        "answer": "(x+3)(x-3)",
        "score": 2,
        "hint": "平方差：$x^{2}-3^{2}$。",
        "why": "平方差：$x^{2}-3^{2}$。"
      }
    ]
  },
  {
    "id": "q-send-009",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 10 型",
    "kind": "fill",
    "score": 2,
    "stem": "分解因式：$2x^{2}-8=$",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "2(x+2)(x-2)",
          "2(x-2)(x+2)"
        ],
        "answer": "2(x+2)(x-2)",
        "score": 2,
        "hint": "先提 2，再平方差。",
        "why": "先提 2，再平方差。"
      }
    ]
  },
  {
    "id": "q-send-010",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 18 题",
    "kind": "fill",
    "score": 2,
    "stem": "先化简，再求值：$(a+b)^{2}-(a+b)(a-b)$，其中 $a=1$，$b=2$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "12"
        ],
        "answer": "12",
        "score": 2,
        "hint": "先展开再代入。",
        "why": "$(a+b)^{2}-(a+b)(a-b)=(a^{2}+2ab+b^{2})-(a^{2}-b^{2})=2ab+2b^{2}$。代入 $a=1,b=2$ 得 $4+8=12$。"
      }
    ]
  },
  {
    "id": "q-send-011",
    "chapter": "ch-poly",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 3 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列因式分解正确的是",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$x^{2}-4=(x-2)^{2}$",
          "$x^{2}+2x+1=(x+1)^{2}$",
          "$x^{2}-1=x(x-1)$",
          "$x^{2}+x=x(x+1)+1$"
        ],
        "key": 1,
        "score": 2,
        "hint": "完全平方公式：$a^{2}+2ab+b^{2}=(a+b)^{2}$。",
        "why": "完全平方公式：$a^{2}+2ab+b^{2}=(a+b)^{2}$。"
      }
    ]
  },
  {
    "id": "q-send-012",
    "chapter": "ch-frac",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 4 型",
    "kind": "choice",
    "score": 2,
    "stem": "若分式 $\\dfrac{x-1}{x+2}$ 的值为 0，则 $x$ 等于",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$1$",
          "$-1$",
          "$2$",
          "$-2$"
        ],
        "key": 0,
        "score": 2,
        "hint": "分子为 0 得 $x=1$，此时分母 $3\\ne0$，成立。",
        "why": "分子为 0 得 $x=1$，此时分母 $3\\ne0$，成立。"
      }
    ]
  },
  {
    "id": "q-send-013",
    "chapter": "ch-frac",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 11 型",
    "kind": "fill",
    "score": 2,
    "stem": "使 $\\sqrt{x-2}$ 有意义的 $x$ 的取值范围是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "x≥2",
          "x>=2"
        ],
        "answer": "x≥2",
        "score": 2,
        "hint": "被开方数非负：$x-2\\ge0$。",
        "why": "被开方数非负：$x-2\\ge0$。"
      }
    ]
  },
  {
    "id": "q-send-014",
    "chapter": "ch-frac",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 18 题",
    "kind": "fill",
    "score": 2,
    "stem": "计算：$\\sqrt{8}-\\sqrt{2}$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "\\sqrt{2}",
          "√2"
        ],
        "answer": "\\sqrt{2}",
        "score": 2,
        "hint": "$\\sqrt8=2\\sqrt2$，$2\\sqrt2-\\sqrt2=\\sqrt2$",
        "why": "$\\sqrt8=2\\sqrt2$，$2\\sqrt2-\\sqrt2=\\sqrt2$。"
      }
    ]
  },
  {
    "id": "q-send-015",
    "chapter": "ch-frac",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 18 题",
    "kind": "fill",
    "score": 2,
    "stem": "化简：$\\dfrac{a^{2}-b^{2}}{a+b}$",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "a-b"
        ],
        "answer": "a-b",
        "score": 2,
        "hint": "分子平方差后约去 $a+b$。",
        "why": "分子平方差后约去 $a+b$。"
      }
    ]
  },
  {
    "id": "q-send-016",
    "chapter": "ch-frac",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 4 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列二次根式中，是最简二次根式的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$\\sqrt{8}$",
          "$\\sqrt{12}$",
          "$\\sqrt{15}$",
          "$\\sqrt{\\dfrac{1}{2}}$"
        ],
        "key": 2,
        "score": 2,
        "hint": "$15=3\\times5$，无完全平方因数，也无分母。",
        "why": "$15=3\\times5$，无完全平方因数，也无分母。"
      }
    ]
  },
  {
    "id": "q-send-017",
    "chapter": "ch-eq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 4 型",
    "kind": "choice",
    "score": 2,
    "stem": "方程 $x^{2}-4=0$ 的解是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$x=2$",
          "$x=-2$",
          "$x=\\pm2$",
          "$x=4$"
        ],
        "key": 2,
        "score": 2,
        "hint": "直接开方，$x=\\pm2$，两个解都要写。",
        "why": "直接开方，$x=\\pm2$，两个解都要写。"
      }
    ]
  },
  {
    "id": "q-send-018",
    "chapter": "ch-eq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 12 型",
    "kind": "fill",
    "score": 2,
    "stem": "若 $x=2$ 是方程 $2x+a=7$ 的解，则 $a=$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "3"
        ],
        "answer": "3",
        "score": 2,
        "hint": "代入：$4+a=7$，$a=3$。",
        "why": "代入：$4+a=7$，$a=3$。"
      }
    ]
  },
  {
    "id": "q-send-019",
    "chapter": "ch-eq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 19 题",
    "kind": "fill",
    "score": 2,
    "stem": "解方程组：$\\begin{cases}x+y=5\\\\x-y=1\\end{cases}$，则 $x=$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "3"
        ],
        "answer": "3",
        "score": 2,
        "hint": "相加得 $2x=6$，$x=3$。",
        "why": "相加得 $2x=6$，$x=3$。"
      }
    ]
  },
  {
    "id": "q-send-020",
    "chapter": "ch-eq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 4 型",
    "kind": "choice",
    "score": 2,
    "stem": "一元二次方程 $x^{2}-2x+1=0$ 的根的情况是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "两个不等实根",
          "两个相等实根",
          "无实根",
          "无法确定"
        ],
        "key": 1,
        "score": 2,
        "hint": "$\\Delta=4-4=0$，两个相等实根。",
        "why": "$\\Delta=4-4=0$，两个相等实根。"
      }
    ]
  },
  {
    "id": "q-send-021",
    "chapter": "ch-eq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 19 题",
    "kind": "fill",
    "score": 2,
    "stem": "解方程：$x^{2}-5x+6=0$，则 $x=$",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "2或3",
          "2,3"
        ],
        "answer": "2或3",
        "score": 2,
        "hint": "十字相乘：$(x-2)(x-3)=0$。",
        "why": "十字相乘：$(x-2)(x-3)=0$。"
      }
    ]
  },
  {
    "id": "q-send-022",
    "chapter": "ch-ineq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 5 型",
    "kind": "choice",
    "score": 2,
    "stem": "不等式 $-2x>6$ 的解集是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$x>3$",
          "$x<3$",
          "$x>-3$",
          "$x<-3$"
        ],
        "key": 3,
        "score": 2,
        "hint": "除以负数变号：$x<-3$。",
        "why": "除以负数变号：$x<-3$。"
      }
    ]
  },
  {
    "id": "q-send-023",
    "chapter": "ch-ineq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 13 型",
    "kind": "fill",
    "score": 2,
    "stem": "不等式 $2x-1\\le5$ 的解集是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "x≤3",
          "x<=3"
        ],
        "answer": "x≤3",
        "score": 2,
        "hint": "$2x\\le6$，$x\\le3$。",
        "why": "$2x\\le6$，$x\\le3$。"
      }
    ]
  },
  {
    "id": "q-send-024",
    "chapter": "ch-ineq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 19 题",
    "kind": "fill",
    "score": 2,
    "stem": "解不等式组 $\\begin{cases}x>1\\\\x<4\\end{cases}$，解集是",
    "errorTags": [
      "method"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "1<x<4"
        ],
        "answer": "1<x<4",
        "score": 2,
        "hint": "大小小大中间找。",
        "why": "大小小大中间找。"
      }
    ]
  },
  {
    "id": "q-send-025",
    "chapter": "ch-ineq",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 5 型",
    "kind": "choice",
    "score": 2,
    "stem": "不等式 $x-3<0$ 的正整数解有",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "1 个",
          "2 个",
          "3 个",
          "无数个"
        ],
        "key": 1,
        "score": 2,
        "hint": "$x<3$ 的正整数是 1、2，共 2 个。",
        "why": "$x<3$ 的正整数是 1、2，共 2 个。"
      }
    ]
  },
  {
    "id": "q-send-026",
    "chapter": "ch-linear",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 6 型",
    "kind": "choice",
    "score": 2,
    "stem": "一次函数 $y=-2x+3$ 中，$y$ 随 $x$ 增大而",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "增大",
          "减小",
          "不变",
          "无法确定"
        ],
        "key": 1,
        "score": 2,
        "hint": "$k=-2<0$，随 $x$ 增大而减小。",
        "why": "$k=-2<0$，随 $x$ 增大而减小。"
      }
    ]
  },
  {
    "id": "q-send-027",
    "chapter": "ch-linear",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 14 型",
    "kind": "fill",
    "score": 2,
    "stem": "一次函数 $y=2x+1$ 与 $y$ 轴的交点坐标是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "(0,1)",
          "0,1"
        ],
        "answer": "(0,1)",
        "score": 2,
        "hint": "令 $x=0$ 得 $y=1$。",
        "why": "令 $x=0$ 得 $y=1$。"
      }
    ]
  },
  {
    "id": "q-send-028",
    "chapter": "ch-linear",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 21 题",
    "kind": "choice",
    "score": 2,
    "stem": "反比例函数 $y=\\dfrac{6}{x}$ 的图象在第几象限",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "一、二",
          "一、三",
          "二、四",
          "三、四"
        ],
        "key": 1,
        "score": 2,
        "hint": "$k=6>0$，一三象限。",
        "why": "$k=6>0$，一三象限。"
      }
    ]
  },
  {
    "id": "q-send-029",
    "chapter": "ch-linear",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 21 题",
    "kind": "fill",
    "score": 2,
    "stem": "一次函数 $y=x+2$ 与 $y=-x+4$ 的交点坐标是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "(1,3)",
          "1,3"
        ],
        "answer": "(1,3)",
        "score": 2,
        "hint": "联立：$x+2=-x+4$，$x=1$，$y=3$。",
        "why": "联立：$x+2=-x+4$，$x=1$，$y=3$。"
      }
    ]
  },
  {
    "id": "q-send-030",
    "chapter": "ch-quad",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 7 型",
    "kind": "choice",
    "score": 2,
    "stem": "抛物线 $y=2(x-1)^{2}+3$ 的顶点坐标是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$(1,3)$",
          "$(-1,3)$",
          "$(1,-3)$",
          "$(-1,-3)$"
        ],
        "key": 0,
        "score": 2,
        "hint": "顶点式 $(h,k)$，$x-1$ 对应 $h=1$。",
        "why": "顶点式 $(h,k)$，$x-1$ 对应 $h=1$。"
      }
    ]
  },
  {
    "id": "q-send-031",
    "chapter": "ch-quad",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 15 型",
    "kind": "fill",
    "score": 2,
    "stem": "若 $y=x^{2}-4x+m$ 的图象与 $x$ 轴只有一个交点，则 $m=$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "4"
        ],
        "answer": "4",
        "score": 2,
        "hint": "$\\Delta=16-4m=0$，$m=4$。",
        "why": "$\\Delta=16-4m=0$，$m=4$。"
      }
    ]
  },
  {
    "id": "q-send-032",
    "chapter": "ch-quad",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 7 型",
    "kind": "choice",
    "score": 2,
    "stem": "抛物线 $y=-x^{2}+2x$ 的开口方向是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "向上",
          "向下",
          "不确定",
          "与 $x$ 轴平行"
        ],
        "key": 1,
        "score": 2,
        "hint": "$a=-1<0$，开口向下。",
        "why": "$a=-1<0$，开口向下。"
      }
    ]
  },
  {
    "id": "q-send-033",
    "chapter": "ch-quad",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 22 题",
    "kind": "fill",
    "score": 2,
    "stem": "将 $y=x^{2}$ 向右平移 2 个单位，所得解析式是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "y=(x-2)^2",
          "y=(x-2)²"
        ],
        "answer": "y=(x-2)^2",
        "score": 2,
        "hint": "右移是减。",
        "why": "右移是减。"
      }
    ]
  },
  {
    "id": "q-send-034",
    "chapter": "ch-triangle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "长度分别为 3、4、5 的三条线段能组成三角形吗",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "能",
          "不能",
          "无法确定",
          "只能组成直角三角形"
        ],
        "key": 0,
        "score": 2,
        "hint": "$3+4>5$，满足三边关系，且 $3^2+4^2=5^2$ 为直角三角形。",
        "why": "$3+4>5$，满足三边关系，且 $3^2+4^2=5^2$ 为直角三角形。"
      }
    ]
  },
  {
    "id": "q-send-035",
    "chapter": "ch-triangle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 16 型",
    "kind": "fill",
    "score": 2,
    "stem": "八边形的内角和是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "1080",
          "1080°"
        ],
        "answer": "1080",
        "score": 2,
        "hint": "$(8-2)\\times180=1080$。",
        "why": "$(8-2)\\times180=1080$。"
      }
    ]
  },
  {
    "id": "q-send-036",
    "chapter": "ch-triangle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 20 题",
    "kind": "fill",
    "score": 2,
    "stem": "在 Rt$\\triangle ABC$ 中，$\\angle C=90^{\\circ}$，$AC=3$，$BC=4$，则 $AB=$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "5"
        ],
        "answer": "5",
        "score": 2,
        "hint": "勾股定理：$\\sqrt{9+16}=5$。",
        "why": "勾股定理：$\\sqrt{9+16}=5$。"
      }
    ]
  },
  {
    "id": "q-send-037",
    "chapter": "ch-triangle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列条件能判定两个三角形全等的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "SSA",
          "AAA",
          "SAS",
          "两边及一边对角"
        ],
        "key": 2,
        "score": 2,
        "hint": "SAS 是标准判定。SSA、AAA 都不能判定全等。",
        "why": "SAS 是标准判定。SSA、AAA 都不能判定全等。"
      }
    ]
  },
  {
    "id": "q-send-038",
    "chapter": "ch-triangle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 16 型",
    "kind": "fill",
    "score": 2,
    "stem": "等腰三角形两边长为 3 和 7，则周长为",
    "errorTags": [
      "concept",
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "17"
        ],
        "answer": "17",
        "score": 2,
        "hint": "腰只能是 7（若腰为 3，$3+3<7$ 不成立），周长 $7+7+3=17$。",
        "why": "腰只能是 7（若腰为 3，$3+3<7$ 不成立），周长 $7+7+3=17$。"
      }
    ]
  },
  {
    "id": "q-send-039",
    "chapter": "ch-quadrilateral",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "平行四边形的对角线一定",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "相等",
          "垂直",
          "互相平分",
          "互相垂直且相等"
        ],
        "key": 2,
        "score": 2,
        "hint": "平行四边形对角线互相平分，但不一定相等或垂直。",
        "why": "平行四边形对角线互相平分，但不一定相等或垂直。"
      }
    ]
  },
  {
    "id": "q-send-040",
    "chapter": "ch-quadrilateral",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 16 型",
    "kind": "fill",
    "score": 2,
    "stem": "若一个多边形的内角和为 $1080^{\\circ}$，则它的边数是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "8"
        ],
        "answer": "8",
        "score": 2,
        "hint": "$(n-2)\\times180=1080$，$n=8$。",
        "why": "$(n-2)\\times180=1080$，$n=8$。"
      }
    ]
  },
  {
    "id": "q-send-041",
    "chapter": "ch-quadrilateral",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 20 题",
    "kind": "fill",
    "score": 2,
    "stem": "矩形的对角线长为 5，一边长为 3，则另一边长为",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "4"
        ],
        "answer": "4",
        "score": 2,
        "hint": "矩形对角线构成直角三角形：$\\sqrt{25-9}=4$。",
        "why": "矩形对角线构成直角三角形：$\\sqrt{25-9}=4$。"
      }
    ]
  },
  {
    "id": "q-send-042",
    "chapter": "ch-quadrilateral",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "对角线互相垂直平分的四边形是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "矩形",
          "菱形",
          "正方形",
          "梯形"
        ],
        "key": 1,
        "score": 2,
        "hint": "菱形对角线互相垂直平分。矩形对角线相等但不垂直。",
        "why": "菱形对角线互相垂直平分。矩形对角线相等但不垂直。"
      }
    ]
  },
  {
    "id": "q-send-043",
    "chapter": "ch-similar",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 22 题",
    "kind": "fill",
    "score": 2,
    "stem": "若 $\\triangle ABC\\sim\\triangle DEF$，相似比 $2:3$，则面积比是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "4:9",
          "4/9"
        ],
        "answer": "4:9",
        "score": 2,
        "hint": "面积比是相似比的平方。",
        "why": "面积比是相似比的平方。"
      }
    ]
  },
  {
    "id": "q-send-044",
    "chapter": "ch-similar",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列条件能判定两个三角形相似的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "两角对应相等",
          "两边对应相等",
          "一角对应相等",
          "周长相等"
        ],
        "key": 0,
        "score": 2,
        "hint": "AA 判定相似。",
        "why": "AA 判定相似。"
      }
    ]
  },
  {
    "id": "q-send-045",
    "chapter": "ch-circle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 15 型",
    "kind": "fill",
    "score": 2,
    "stem": "半径为 3 的圆中，$60^{\\circ}$ 圆心角所对的弧长是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "\\pi",
          "π"
        ],
        "answer": "\\pi",
        "score": 2,
        "hint": "$l=\\dfrac{60\\pi\\times3}{180}=\\pi$。",
        "why": "$l=\\dfrac{60\\pi\\times3}{180}=\\pi$。"
      }
    ]
  },
  {
    "id": "q-send-046",
    "chapter": "ch-circle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "直径所对的圆周角是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$60^{\\circ}$",
          "$90^{\\circ}$",
          "$120^{\\circ}$",
          "$180^{\\circ}$"
        ],
        "key": 1,
        "score": 2,
        "hint": "圆心角 $180^{\\circ}$，圆周角为其一半。",
        "why": "圆心角 $180^{\\circ}$，圆周角为其一半。"
      }
    ]
  },
  {
    "id": "q-send-047",
    "chapter": "ch-circle",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 23 题",
    "kind": "fill",
    "score": 2,
    "stem": "$\\odot O$ 半径为 5，弦 $AB=8$，则圆心到 $AB$ 的距离为",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "3"
        ],
        "answer": "3",
        "score": 2,
        "hint": "半弦 4，$\\sqrt{25-16}=3$。",
        "why": "半弦 4，$\\sqrt{25-16}=3$。"
      }
    ]
  },
  {
    "id": "q-send-048",
    "chapter": "ch-transform",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 16 型",
    "kind": "fill",
    "score": 2,
    "stem": "点 $(3,-2)$ 关于 $x$ 轴对称的点的坐标是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "(3,2)",
          "3,2"
        ],
        "answer": "(3,2)",
        "score": 2,
        "hint": "关于 $x$ 轴对称，纵坐标变相反数。",
        "why": "关于 $x$ 轴对称，纵坐标变相反数。"
      }
    ]
  },
  {
    "id": "q-send-049",
    "chapter": "ch-transform",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列图形中，既是轴对称又是中心对称图形的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "等边三角形",
          "平行四边形",
          "矩形",
          "等腰梯形"
        ],
        "key": 2,
        "score": 2,
        "hint": "矩形两者都是。平行四边形只中心对称，等边三角形和等腰梯形只轴对称。",
        "why": "矩形两者都是。平行四边形只中心对称，等边三角形和等腰梯形只轴对称。"
      }
    ]
  },
  {
    "id": "q-send-050",
    "chapter": "ch-trig",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 15 型",
    "kind": "fill",
    "score": 2,
    "stem": "$\\sin30^{\\circ}=$",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "1/2",
          "0.5"
        ],
        "answer": "1/2",
        "score": 2,
        "hint": "特殊角三角函数值。",
        "why": "特殊角三角函数值。"
      }
    ]
  },
  {
    "id": "q-send-051",
    "chapter": "ch-trig",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 21 题",
    "kind": "fill",
    "score": 2,
    "stem": "Rt$\\triangle ABC$ 中，$\\angle C=90^{\\circ}$，$\\angle A=30^{\\circ}$，$AB=6$，则 $BC=$",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "3"
        ],
        "answer": "3",
        "score": 2,
        "hint": "$BC=AB\\sin30^{\\circ}=6\\times\\dfrac12=3$。",
        "why": "$BC=AB\\sin30^{\\circ}=6\\times\\dfrac12=3$。"
      }
    ]
  },
  {
    "id": "q-send-052",
    "chapter": "ch-trig",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 8 型",
    "kind": "choice",
    "score": 2,
    "stem": "$\\tan45^{\\circ}$ 的值是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$\\dfrac{1}{2}$",
          "$\\dfrac{\\sqrt{2}}{2}$",
          "$1$",
          "$\\sqrt{3}$"
        ],
        "key": 2,
        "score": 2,
        "hint": "等腰直角三角形两直角边相等，正切为 1。",
        "why": "等腰直角三角形两直角边相等，正切为 1。"
      }
    ]
  },
  {
    "id": "q-send-053",
    "chapter": "ch-geo-aux",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 20 题",
    "kind": "choice",
    "score": 2,
    "stem": "三角形中位线等于第三边的",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "2 倍",
          "一半",
          "三分之一",
          "相等"
        ],
        "key": 1,
        "score": 2,
        "hint": "中位线定理：平行且等于第三边一半。",
        "why": "中位线定理：平行且等于第三边一半。"
      }
    ]
  },
  {
    "id": "q-send-054",
    "chapter": "ch-stat",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 14 型",
    "kind": "fill",
    "score": 2,
    "stem": "数据 $1,2,3,4,5$ 的平均数是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "3"
        ],
        "answer": "3",
        "score": 2,
        "hint": "$(1+2+3+4+5)\\div5=3$。",
        "why": "$(1+2+3+4+5)\\div5=3$。"
      }
    ]
  },
  {
    "id": "q-send-055",
    "chapter": "ch-stat",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 6 型",
    "kind": "choice",
    "score": 2,
    "stem": "一组数据 $2,3,3,5,7$ 的众数是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "$2$",
          "$3$",
          "$5$",
          "$7$"
        ],
        "key": 1,
        "score": 2,
        "hint": "$3$ 出现 2 次，最多。",
        "why": "$3$ 出现 2 次，最多。"
      }
    ]
  },
  {
    "id": "q-send-056",
    "chapter": "ch-stat",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 25 题",
    "kind": "choice",
    "score": 2,
    "stem": "甲组方差 2，乙组方差 5，哪组更稳定",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "甲",
          "乙",
          "一样",
          "无法判断"
        ],
        "key": 0,
        "score": 2,
        "hint": "方差越小越稳定。",
        "why": "方差越小越稳定。"
      }
    ]
  },
  {
    "id": "q-send-057",
    "chapter": "ch-prob",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 填 14 型",
    "kind": "fill",
    "score": 2,
    "stem": "掷一枚均匀骰子，出现偶数的概率是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "1/2",
          "0.5"
        ],
        "answer": "1/2",
        "score": 2,
        "hint": "偶数 2、4、6 共 3 个，$3/6=1/2$。",
        "why": "偶数 2、4、6 共 3 个，$3/6=1/2$。"
      }
    ]
  },
  {
    "id": "q-send-058",
    "chapter": "ch-prob",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 选 6 型",
    "kind": "choice",
    "score": 2,
    "stem": "下列事件中，是必然事件的是",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "掷骰子出现 7",
          "太阳从东边升起",
          "明天会下雨",
          "抛硬币正面朝上"
        ],
        "key": 1,
        "score": 2,
        "hint": "一定发生的是必然事件。",
        "why": "一定发生的是必然事件。"
      }
    ]
  },
  {
    "id": "q-send-059",
    "chapter": "ch-newdef",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 16 型",
    "kind": "choice",
    "score": 2,
    "stem": "若 $|x|+|y|=2$，则称 $(x,y)$ 为「方形点」。点 $(1,1)$ 是方形点吗",
    "errorTags": [
      "concept"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "choice",
        "options": [
          "是",
          "不是",
          "无法判断",
          "只在第一象限是"
        ],
        "key": 0,
        "score": 2,
        "hint": "$|1|+|1|=2$，满足定义。",
        "why": "$|1|+|1|=2$，满足定义。"
      }
    ]
  },
  {
    "id": "q-send-060",
    "chapter": "ch-design",
    "method": null,
    "tier": "send",
    "tierName": "送分区 · 22 题",
    "kind": "fill",
    "score": 2,
    "stem": "某商品进价 30 元，售价 50 元，则单件利润是",
    "errorTags": [
      "calc"
    ],
    "steps": [
      {
        "label": "直接作答",
        "ask": "答案是？",
        "type": "fill",
        "accept": [
          "20"
        ],
        "answer": "20",
        "score": 2,
        "hint": "$50-30=20$。",
        "why": "$50-30=20$。"
      }
    ]
  }
];
