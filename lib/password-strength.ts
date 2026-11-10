import { normalizePhone } from "./registration";

export type PasswordAssessment = { score: number; advice: string };
type Estimator = { check: (password: string, inputs: string[]) => { score: number } };
let estimatorPromise: Promise<Estimator> | undefined;

// Load local, bundled dictionaries only when needed. Never send password data to a service.
export function loadPasswordEstimator(): Promise<Estimator> {
  if (!estimatorPromise) {
    estimatorPromise = Promise.all([
      import("@zxcvbn-ts/core"),
      import("@zxcvbn-ts/language-common"),
      import("@zxcvbn-ts/language-en"),
    ]).then(([core, common, english]) => new core.ZxcvbnFactory({
      dictionary: { ...common.dictionary, ...english.dictionary },
      graphs: common.adjacencyGraphs,
      maxLength: 128,
    })).catch(error => { estimatorPromise = undefined; throw error; });
  }
  return estimatorPromise;
}

export function assessPassword(estimator: Estimator, password: string, phone: string): PasswordAssessment {
  if (!password) return { score: 0, advice: "ใช้หลายคำที่ไม่เกี่ยวกัน และอย่าใช้เบอร์โทรหรือข้อมูลส่วนตัว" };
  const normalized = normalizePhone(phone);
  const personal = ["snake168", "snake1168", "รหัสผ่าน", "พาสเวิร์ด", "หนึ่งสองสาม", normalized, normalized.slice(1)].filter(value => value.length >= 4);
  // Bound estimation cost without truncating or changing the password that gets submitted.
  const result = estimator.check(password.slice(0, 128), personal);
  const score = password.length < 6 ? 0 : result.score;
  const advice = password.length < 6 ? "ยังไม่ผ่านขั้นต่ำ: ต้องมีอย่างน้อย 6 ตัวอักษร" :
    normalized.length === 10 && password.includes(normalized) ? "หลีกเลี่ยงการใช้เบอร์โทรเป็นส่วนหนึ่งของรหัสผ่าน" :
    score <= 1 ? "หลีกเลี่ยงคำยอดนิยม ตัวซ้ำ และตัวเลขเรียง ลองใช้หลายคำที่ไม่เกี่ยวกัน" :
    score === 2 ? "เพิ่มความยาวด้วยคำที่ไม่เกี่ยวกัน เพื่อให้คาดเดายากขึ้น" :
    "ใช้รหัสนี้กับบัญชีนี้เท่านั้น และอย่าแชร์ให้ผู้อื่น";
  return { score, advice: password.length > 128 ? `${advice} (ประเมินเฉพาะ 128 ตัวแรก)` : advice };
}
