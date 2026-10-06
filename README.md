# 💰 MyMonee

**MyMonee** คือ Web Application สำหรับจัดการ **รายรับ–รายจ่ายส่วนบุคคล (Personal Finance)**

ผู้ใช้สามารถบันทึก จัดการ ค้นหา และดูสรุปข้อมูลทางการเงินของตัวเองได้ในที่เดียว

> 🎓 Final Project — CIS

---

## ✨ Features

* 🔐 สมัครสมาชิกและเข้าสู่ระบบ (Sign Up & Login)
* 👤 Login ด้วย Username / Password
* 🐙 Login ด้วย GitHub
* 💰 บันทึกรายรับและรายจ่าย (Income & Expenses)
* 📊 ดูสรุปข้อมูลทางการเงิน (Financial Summary)
* 🗂️ จัดหมวดหมู่รายการ (Transaction Categories)
* 🔎 ค้นหาและ Filter รายการ
* ✏️ แก้ไขและลบรายการ
* 💵 จัดการงบประมาณ (Budget)
* 👤 จัดการข้อมูล Profile
* 🌙 Light Mode / Dark Mode
* 📱 Responsive Design
* 🔒 Password Hashing เพื่อความปลอดภัย

---

## 📋 คุณสมบัติของระบบ

### 1. CRUD

ระบบสามารถจัดการข้อมูลรายรับ–รายจ่ายได้ครบทั้ง **CRUD**

* **Create** — เพิ่มรายการ
* **Read** — แสดงรายการ
* **Update** — แก้ไขรายการ
* **Delete** — ลบรายการ

---

### 2. Data Validation

ระบบมีการ **Validation ข้อมูล** ก่อนบันทึก เพื่อป้องกันข้อมูลที่ไม่ถูกต้อง เช่น

* ตรวจสอบ Username
* ตรวจสอบ Password
* ตรวจสอบจำนวนเงิน
* ตรวจสอบประเภทของรายการ
* ตรวจสอบหมวดหมู่
* ตรวจสอบรายละเอียด
* ตรวจสอบวันที่

---

### 3. Authentication

ระบบมี **Authentication (การยืนยันตัวตน)** เพื่อควบคุมการเข้าถึงข้อมูล

รองรับ:

* Username / Password
* GitHub Login
* ตรวจสอบ Session ก่อนเข้าถึงข้อมูลที่ต้อง Login

ผู้ใช้แต่ละคนสามารถจัดการข้อมูลของตัวเองได้

---

### 4. Search & Filter

สามารถ **ค้นหาและ Filter รายการรายรับ–รายจ่าย** ได้จาก

* 🔎 รายละเอียดรายการ (Description)
* 💰 ประเภทรายการ (Income / Expense)
* 🗂️ หมวดหมู่ (Category)
* 📅 เดือน (Month)

---

### 5. REST API

ระบบมี **API** สำหรับจัดการข้อมูล โดยรองรับ HTTP Methods หลัก ได้แก่

| Method   | การทำงาน               |
| -------- | ---------------------- |
| `GET`    | ดึงข้อมูล / แสดงข้อมูล |
| `POST`   | เพิ่มข้อมูล            |
| `PUT`    | แก้ไขข้อมูล            |
| `DELETE` | ลบข้อมูล               |

---

## 🛠️ Tech Stack

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Tailwind CSS**

### Backend

* **Next.js API Routes**
* **Auth.js**
* **Prisma ORM**

### Database

* **PostgreSQL**

---

## 🏗️ Project Structure

```text
MyMonee/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   ├── budgets/
│   │   ├── categories/
│   │   ├── profile/
│   │   ├── register/
│   │   └── transactions/
│   │
│   ├── dashboard/
│   │   ├── add/
│   │   ├── budget/
│   │   ├── profile/
│   │   └── transactions/
│   │
│   ├── login/
│   └── register/
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   └── schema.prisma
│
├── public/
│
├── auth.ts
├── package.json
└── README.md
```

---

## 🚀 วิธีติดตั้งและ Run Project

### 1. Clone Repository

```bash
git clone https://github.com/21dezc/MyMonee.git
cd MyMonee
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ในโฟลเดอร์หลักของโปรเจกต์

```env
DATABASE_URL="your_postgresql_database_url"

AUTH_SECRET="your_auth_secret"

AUTH_GITHUB_ID="your_github_client_id"
AUTH_GITHUB_SECRET="your_github_client_secret"
```

### 4. เตรียม Database

```bash
npx prisma migrate dev
```

หากต้องการดูข้อมูลใน Database สามารถใช้:

```bash
npx prisma studio
```

### 5. Run Project

```bash
npm run dev
```

จากนั้นเปิดเว็บไซต์ที่

```text
http://localhost:3000
```

---

## 🗄️ Database

MyMonee ใช้ **PostgreSQL** เป็น Database และใช้ **Prisma ORM** ในการจัดการข้อมูล

Model หลักของระบบ ได้แก่

* `User` — ข้อมูลผู้ใช้
* `Account` — ข้อมูลบัญชีที่ใช้ Login ผ่าน OAuth
* `Session` — ข้อมูล Session
* `Category` — หมวดหมู่รายรับและรายจ่าย
* `Transaction` — รายการรายรับ–รายจ่าย
* `Budget` — งบประมาณของผู้ใช้

---

## 🔒 Security

ระบบมีการรักษาความปลอดภัย เช่น

* 🔐 Hash Password ก่อนจัดเก็บใน Database
* 🛡️ ตรวจสอบ Authentication ก่อนเข้าถึงข้อมูล
* 👤 จำกัดการเข้าถึง Transaction ตาม User
* ✅ Validation ข้อมูลก่อนบันทึก
* 🔑 เก็บข้อมูลสำคัญผ่าน Environment Variables

---

## 🎨 Design

MyMonee เน้นการออกแบบที่ **Clean และใช้งานง่าย**

* UI เรียบง่าย ไม่ซับซ้อน
* Rounded Cards และ Buttons
* Light Mode / Dark Mode
* Responsive Design
* แยกสีสำหรับรายรับและรายจ่ายให้ดูง่าย

---

## 📌 Project Status

🚧 **อยู่ระหว่างการพัฒนา (In Development)**

โปรเจกต์นี้จัดทำขึ้นเพื่อเป็น **Final Project**
ของสาขา **Computer and Information Science (CIS)**

---

## 👩‍💻 Developer

**21dezc**

Computer and Information Science (CIS)

---

