// ตรรกะคำนวณงวดของรายการประจำ (ไม่ยุ่งกับ DB ใช้ได้ทั้งฝั่ง server และ client)
// วันที่ทุกตัวในไฟล์นี้คือ "วันที่ตามเวลาไทย" ที่เก็บเป็น 00:00 UTC
import { formatYmd } from "./date";

export type Frequency = "WEEKLY" | "MONTHLY" | "YEARLY";

export const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: "WEEKLY", label: "ทุกสัปดาห์" },
  { value: "MONTHLY", label: "ทุกเดือน" },
  { value: "YEARLY", label: "ทุกปี" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SKIP = 5000;

const WEEKDAYS = [
  "อาทิตย์",
  "จันทร์",
  "อังคาร",
  "พุธ",
  "พฤหัสบดี",
  "ศุกร์",
  "เสาร์",
];

const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

function lastDayOf(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// เลื่อนไป 1 งวด โดยยึดวันที่ของ anchor (วันเริ่ม) เสมอ
// เช่น เริ่ม 31 ม.ค. -> 28 ก.พ. -> 31 มี.ค. (ไม่เพี้ยนเป็น 28 ไปตลอด)
export function advanceDate(
  current: Date,
  anchor: Date,
  frequency: Frequency
): Date {
  if (frequency === "WEEKLY") {
    return new Date(current.getTime() + 7 * DAY_MS);
  }

  const anchorDay = anchor.getUTCDate();
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth() + 1;

  if (frequency === "MONTHLY") {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;

    return new Date(
      Date.UTC(
        nextYear,
        nextMonth - 1,
        Math.min(anchorDay, lastDayOf(nextYear, nextMonth))
      )
    );
  }

  // YEARLY (เช่น 29 ก.พ. -> 28 ก.พ. ปีที่ไม่ใช่ปีอธิกสุรทิน)
  const nextYear = year + 1;

  return new Date(
    Date.UTC(
      nextYear,
      month - 1,
      Math.min(anchorDay, lastDayOf(nextYear, month))
    )
  );
}

// ข้ามงวดที่ผ่านมาแล้วไปจนถึงงวดแรกที่ >= target (ใช้ตอนเปิดรายการที่เคยปิดไว้ / ปักหมุดจากรายการเก่า)
export function skipToDate(
  next: Date,
  anchor: Date,
  frequency: Frequency,
  target: Date
): Date {
  let result = next;

  for (let i = 0; i < MAX_SKIP && result < target; i++) {
    result = advanceDate(result, anchor, frequency);
  }

  return result;
}

// วันเริ่มที่แนะนำตอนปักหมุดจากรายการที่มีอยู่แล้ว:
// งวดถัดจากวันที่ของรายการนั้น (ถ้าผ่านมาแล้วก็เลื่อนไปงวดที่ยังไม่ถึง) จะได้ไม่ซ้ำกับรายการต้นทาง
export function suggestStartDate(
  transactionDate: Date,
  frequency: Frequency,
  today: Date
): Date {
  const first = advanceDate(transactionDate, transactionDate, frequency);

  return skipToDate(first, transactionDate, frequency, today);
}

// ยอดเทียบเป็นรายเดือน (รายสัปดาห์ x52/12, รายปี /12)
export function monthlyEquivalent(amount: number, frequency: Frequency) {
  if (frequency === "WEEKLY") return (amount * 52) / 12;
  if (frequency === "YEARLY") return amount / 12;

  return amount;
}

export function frequencyLabel(frequency: Frequency, startDate: Date) {
  if (frequency === "WEEKLY") {
    return `ทุกสัปดาห์ วัน${WEEKDAYS[startDate.getUTCDay()]}`;
  }

  if (frequency === "YEARLY") {
    return `ทุกปี ${startDate.getUTCDate()} ${MONTHS[startDate.getUTCMonth()]}`;
  }

  return `ทุกเดือน วันที่ ${startDate.getUTCDate()}`;
}

// "27 ต.ค. 2569"
export function formatThaiDate(date: Date) {
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

// "วันนี้" / "พรุ่งนี้" / "อีก 5 วัน"
export function relativeDays(date: Date, today: Date) {
  const days = Math.round((date.getTime() - today.getTime()) / DAY_MS);

  if (days <= 0) return "วันนี้";
  if (days === 1) return "พรุ่งนี้";

  return `อีก ${days} วัน`;
}

// สำหรับ <input type="date">
export function toDateInput(date: Date) {
  return formatYmd(date);
}
