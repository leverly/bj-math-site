/* ==========================================================
   数据汇总入口
   所有页面与构建脚本只从这里取数据，避免多处 import 散乱。
   ========================================================== */
import { CHAPTERS, EXAM_STRUCTURE, TIERS } from './data-chapters.js';
import { METHODS } from './data-methods.js';
import { METHODS_2 } from './data-methods2.js';
import { CONCEPTS, CONCEPTS_2 } from './data-concepts.js';
import { QUESTIONS, QUESTIONS_2, QUESTIONS_3, QUESTIONS_4 } from './data-questions.js';
import { SEND_QUESTIONS } from './data-send.js';
import { SEND_QUESTIONS_2 } from './data-send2.js';
import { QUESTIONS_5, QUESTIONS_6 } from './data-questions2.js';
import { QUESTIONS as P0_QUESTIONS } from './data-sample.js';

/* 方法卡配套题：P1 三批 + P0 样张里 3 张卡的题 */
export const ALL_METHODS = [...METHODS, ...METHODS_2];

export const ALL_QUESTIONS = [
  ...QUESTIONS,
  ...QUESTIONS_2,
  ...QUESTIONS_3,
  ...QUESTIONS_4,
  ...QUESTIONS_5,
  ...QUESTIONS_6,
  ...SEND_QUESTIONS,
  ...SEND_QUESTIONS_2,
  ...P0_QUESTIONS,
];

export const ALL_CONCEPTS = [...CONCEPTS, ...CONCEPTS_2];
export { CHAPTERS, EXAM_STRUCTURE, TIERS };
/* 兼容旧引用：METHODS 现在是合并后的全量 */
export { ALL_METHODS as METHODS };

/* ---------------- 派生索引 ---------------- */
export const CH_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));
export const M_BY_ID = new Map(ALL_METHODS.map((m) => [m.id, m]));
export const Q_BY_ID = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export const Q_BY_METHOD = new Map();
export const Q_BY_CHAPTER = new Map();
export const C_BY_CHAPTER = new Map();

ALL_QUESTIONS.forEach((q) => {
  if (!Q_BY_METHOD.has(q.method)) Q_BY_METHOD.set(q.method, []);
  Q_BY_METHOD.get(q.method).push(q);
  if (!Q_BY_CHAPTER.has(q.chapter)) Q_BY_CHAPTER.set(q.chapter, []);
  Q_BY_CHAPTER.get(q.chapter).push(q);
});

ALL_CONCEPTS.forEach((c) => {
  if (!C_BY_CHAPTER.has(c.chapter)) C_BY_CHAPTER.set(c.chapter, []);
  C_BY_CHAPTER.get(c.chapter).push(c);
});

/* ---------------- 统计 ---------------- */
export const STATS = {
  chapters: CHAPTERS.length,
  methods: ALL_METHODS.length,
  questions: ALL_QUESTIONS.length,
  concepts: ALL_CONCEPTS.length,
  conceptTests: ALL_CONCEPTS.reduce((a, c) => a + c.tests.length, 0),
  steps: ALL_QUESTIONS.reduce((a, q) => a + (q.steps || []).length, 0),
  byTier: {
    send: ALL_QUESTIONS.filter((q) => q.tier === 'send').length,
    mid: ALL_QUESTIONS.filter((q) => q.tier === 'mid').length,
    dist: ALL_QUESTIONS.filter((q) => q.tier === 'dist').length,
  },
  byTierMethods: {
    send: ALL_METHODS.filter((m) => m.tier === 'send').length,
    mid: ALL_METHODS.filter((m) => m.tier === 'mid').length,
    dist: ALL_METHODS.filter((m) => m.tier === 'dist').length,
  },
};
