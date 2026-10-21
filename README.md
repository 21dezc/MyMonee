# 💰 MyMonee

**MyMonee** คือ Web Application สำหรับจัดการรายรับ–รายจ่ายส่วนบุคคล (Personal Finance Management)

ผู้ใช้สามารถบันทึก แก้ไข ค้นหา และดูสรุปข้อมูลทางการเงินของตัวเองได้ในที่เดียว พร้อมฟีเจอร์จัดการงบประมาณและรายการรายรับ–รายจ่ายที่เกิดขึ้นเป็นประจำ (Recurring Transactions)

> 🎓 Final Project — Computer and Information Science (CIS)

---

## ✨ Features

- 🔐 **Authentication** — สมัครสมาชิกและเข้าสู่ระบบด้วย Username / Password และ GitHub
- 💰 **Transaction Management** — เพิ่ม แก้ไข ลบ และดูรายการรายรับ–รายจ่าย
- 📊 **Financial Summary** — ดูสรุปรายรับ รายจ่าย และข้อมูลทางการเงิน
- 🗂️ **Category Management** — จัดหมวดหมู่รายการทางการเงิน
- 🔎 **Search & Filter** — ค้นหาและกรองรายการตามรายละเอียด ประเภท หมวดหมู่ และเดือน
- 💵 **Budget Management** — จัดการงบประมาณส่วนบุคคล
- 🔁 **Recurring Transactions** — ตั้งค่ารายการรายรับ–รายจ่ายที่เกิดขึ้นเป็นประจำ
- 📤 **Export Transactions** — ส่งออกข้อมูลรายการทางการเงิน
- 👤 **Profile Management** — จัดการข้อมูลส่วนตัว
- 🌙 **Light Mode / Dark Mode** — รองรับธีมสว่างและธีมมืด
- 📱 **Responsive Design** — รองรับการใช้งานบนอุปกรณ์หลายขนาดหน้าจอ
- 🔒 **Password Hashing** — เข้ารหัสแบบ Hash สำหรับจัดเก็บรหัสผ่านอย่างปลอดภัย

---

## 📋 System Requirements

### 1. CRUD Operations

ระบบรองรับการจัดการข้อมูลรายรับ–รายจ่ายครบทั้ง 4 ขั้นตอน (CRUD)

- **Create** — เพิ่มรายการรายรับ–รายจ่าย
- **Read** — ดึงข้อมูลและแสดงรายการ
- **Update** — แก้ไขข้อมูลที่มีอยู่
- **Delete** — ลบรายการที่ไม่ต้องการ

### 2. Data Validation

ระบบมีการตรวจสอบข้อมูล (Validation) ก่อนบันทึกลง Database เพื่อช่วยป้องกันข้อมูลที่ไม่ถูกต้อง

- ตรวจสอบ Username และ Password
- ตรวจสอบจำนวนเงิน (Amount)
- ตรวจสอบประเภทรายการ (Transaction Type)
- ตรวจสอบหมวดหมู่ (Category)
- ตรวจสอบรายละเอียด (Description)
- ตรวจสอบวันที่ (Date)
- ตรวจสอบเงื่อนไขของ Recurring Transactions

### 3. Authentication & Authorization

ระบบใช้ **Auth.js** สำหรับ Authentication หรือการยืนยันตัวตนของผู้ใช้

รองรับการเข้าสู่ระบบผ่าน:
- Username / Password
- GitHub OAuth

นอกจากนี้ยังมีการตรวจสอบ Session ก่อนเข้าถึง API ที่ต้องเข้าสู่ระบบ และตรวจสอบสิทธิ์การเข้าถึงข้อมูล เพื่อให้ผู้ใช้สามารถจัดการข้อมูลทางการเงินของตัวเองได้เท่านั้น

### 4. Search & Filter

ผู้ใช้สามารถค้นหาและกรองรายการรายรับ–รายจ่ายได้ตามเงื่อนไขต่าง ๆ

- **Description** — ค้นหาจากรายละเอียดรายการ
- **Transaction Type** — กรองตามประเภท Income / Expense
- **Category** — กรองตามหมวดหมู่
- **Month** — เลือกดูข้อมูลตามเดือน

### 5. REST API

ระบบใช้ API สำหรับรับส่งข้อมูลระหว่าง Frontend, Backend และ Database โดยรองรับ HTTP Methods หลัก ดังนี้

| Method | การทำงาน |
|---|---|
| `GET` | ดึงข้อมูล (Read) |
| `POST` | เพิ่มข้อมูล (Create) |
| `PUT` | แก้ไขข้อมูล (Update) |
| `PATCH` | แก้ไขข้อมูลบางส่วน เช่น สถานะของรายการ |
| `DELETE` | ลบข้อมูล (Delete) |

แต่ละ API Endpoint จะรองรับ Method ตามการทำงานที่กำหนดไว้

---

## 🛠️ Tech Stack

### Frontend
- **Next.js** — Framework สำหรับพัฒนา Web Application
- **React** — Library สำหรับสร้าง User Interface
- **TypeScript** — เพิ่ม Type Safety ให้กับโค้ด
- **Tailwind CSS** — ใช้จัดการ Styling ของหน้าเว็บไซต์

### Backend
- **Next.js App Router & Route Handlers** — จัดการ Routing และ API
- **Auth.js** — จัดการ Authentication และ Session
- **Prisma ORM** — เชื่อมต่อและจัดการข้อมูลใน Database

### Database
- **PostgreSQL** — Relational Database สำหรับจัดเก็บข้อมูล

### Security
- **bcryptjs** — ใช้ Hash Password ก่อนจัดเก็บ
- **GitHub OAuth** — รองรับการ Login ผ่าน GitHub
- **JWT** — ใช้จัดการ Session ตามการตั้งค่าของระบบ

### Development & Deployment
- **Git & GitHub** — จัดการ Source Code และ Version Control
- **Vercel** — Deploy Web Application
- **Prisma Migrate** — จัดการ Database Migrations
- **Prisma Studio** — ดูและจัดการข้อมูลใน Database ระหว่างพัฒนา

---

## 🗄️ Database

MyMonee ใช้ **PostgreSQL** เป็น Database และใช้ **Prisma ORM** ในการจัดการข้อมูลระหว่าง Application กับ Database

Model หลักของระบบประกอบด้วย

| Model | รายละเอียด |
|---|---|
| `User` | ข้อมูลบัญชีผู้ใช้ |
| `Account` | ข้อมูลบัญชีที่เชื่อมต่อผ่าน OAuth |
| `Transaction` | ข้อมูลรายรับ–รายจ่าย |
| `Category` | หมวดหมู่ของรายการ |
| `Budget` | ข้อมูลงบประมาณ |
| `RecurringTransaction` | กฎสำหรับสร้างรายการที่เกิดขึ้นเป็นประจำ |

ชื่อ Model ควรตรงกับที่กำหนดไว้ใน `prisma/schema.prisma`

---

## 🔒 Security

ระบบมีการจัดการด้าน Security เพื่อช่วยปกป้องข้อมูลของผู้ใช้ ได้แก่

- 🔐 **Password Hashing** — Hash รหัสผ่านก่อนจัดเก็บใน Database
- 🛡️ **Authentication** — ตรวจสอบตัวตนก่อนเข้าถึงข้อมูลที่ต้อง Login
- 👤 **Authorization** — จำกัดการเข้าถึงข้อมูลตามสิทธิ์ของผู้ใช้
- ✅ **Data Validation** — ตรวจสอบข้อมูลก่อนดำเนินการ
- 🔑 **Environment Variables** — ใช้จัดเก็บ Configuration และ Credentials ที่สำคัญ
- 🔒 **Server-side Validation** — ตรวจสอบข้อมูลฝั่ง Server ก่อนดำเนินการกับ Database

---

## 📁 Project Structure

```text
MyMonee/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── profile/
│   │   ├── recurring/
│   │   ├── register/
│   │   └── transactions/
│   │       └── export/
│   ├── dashboard/
│   │   ├── add/
│   │   ├── budget/
│   │   ├── profile/
│   │   ├── recurring/
│   │   └── transactions/
│   ├── login/
│   └── register/
├── lib/
│   ├── date.ts
│   ├── prisma.ts
│   ├── recurring.ts
│   └── transactionFilters.ts
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── auth.ts
├── package.json
└── README.md
```

---



