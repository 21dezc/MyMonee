import type { Prisma } from "@/app/generated/prisma/client";
import { monthRange } from "@/lib/date";

export const PAGE_SIZE = 20;

export type TransactionFilterValues = {
  q: string;
  type: "ALL" | "INCOME" | "EXPENSE";
  categoryId: string;
  month: string; // "YYYY-MM" หรือ ""
};

type RawParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// อ่านและตรวจค่าจาก URL (ค่าที่ไม่ถูกต้องจะถูกทิ้ง)
export function parseFilters(params: RawParams): TransactionFilterValues {
  const q = (first(params.q) ?? "").trim().slice(0, 100);

  const rawType = first(params.type);
  const type =
    rawType === "INCOME" || rawType === "EXPENSE" ? rawType : "ALL";

  const categoryId = (first(params.categoryId) ?? "").slice(0, 50);

  const rawMonth = first(params.month) ?? "";
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(rawMonth) ? rawMonth : "";

  return { q, type, categoryId, month };
}

export function parsePage(params: RawParams) {
  const page = Number(first(params.page));

  return Number.isInteger(page) && page >= 1 ? page : 1;
}

export function buildWhere(
  userId: string,
  filters: TransactionFilterValues
): Prisma.TransactionWhereInput {
  const where: Prisma.TransactionWhereInput = { userId };

  if (filters.q) {
    where.description = { contains: filters.q, mode: "insensitive" };
  }

  if (filters.type !== "ALL") {
    where.type = filters.type;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.month) {
    const [year, month] = filters.month.split("-").map(Number);
    const { start, end } = monthRange(year, month);

    where.date = { gte: start, lt: end };
  }

  return where;
}

// สร้าง query string จากตัวกรอง (ข้ามค่าเริ่มต้น)
export function buildQuery(filters: TransactionFilterValues, page?: number) {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.type !== "ALL") params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.month) params.set("month", filters.month);
  if (page && page > 1) params.set("page", String(page));

  return params.toString();
}
