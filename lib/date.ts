// ประเทศไทยใช้เวลา UTC+7 และไม่มี Daylight Saving
// ใช้ฟังก์ชันพวกนี้แทน getMonth()/getFullYear() เพื่อให้ผลตรงกันทั้งบนเครื่องเรา (เวลาไทย) และบน Vercel (UTC)
const OFFSET_MS = 7 * 60 * 60 * 1000;

export const TIME_ZONE = "Asia/Bangkok";

// ปี / เดือน (1-12) / วัน ตามเวลาไทย
export function bangkokParts(date: Date) {
  const d = new Date(date.getTime() + OFFSET_MS);

  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
  };
}

// ช่วงเวลาของทั้งเดือนตามเวลาไทย (start รวม, end ไม่รวม)
export function monthRange(year: number, month: number) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1) - OFFSET_MS),
    end: new Date(Date.UTC(year, month, 1) - OFFSET_MS),
  };
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// "2026-10"
export function ymKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function parseYm(ym: string) {
  const [year, month] = ym.split("-").map(Number);
  return { year, month };
}

export function prevYm(year: number, month: number) {
  return month === 1 ? ymKey(year - 1, 12) : ymKey(year, month - 1);
}

export function nextYm(ym: string) {
  const { year, month } = parseYm(ym);
  return month === 12 ? ymKey(year + 1, 1) : ymKey(year, month + 1);
}

// "2026-10-19" ตามเวลาไทย
export function formatYmd(date: Date) {
  const { year, month, day } = bangkokParts(date);

  return `${ymKey(year, month)}-${String(day).padStart(2, "0")}`;
}

// ตัดเวลาทิ้ง เหลือ 00:00 UTC ของ "วันที่ตามเวลาไทย" (ใช้เก็บ/เทียบวันที่ของรายการประจำ)
export function bangkokDateOnly(date: Date) {
  const { year, month, day } = bangkokParts(date);

  return new Date(Date.UTC(year, month - 1, day));
}

// วันนี้ (เวลาไทย) ในรูป 00:00 UTC
export function todayBangkok() {
  return bangkokDateOnly(new Date());
}

// "2026-10-19" -> Date (00:00 UTC) ถ้ารูปแบบหรือวันที่ไม่ถูกต้องคืน null
export function parseYmd(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const valid =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return valid ? date : null;
}
