# 💰 MyMonee

**MyMonee** เว็บแอปพลิเคชันสำหรับจัดการรายรับ–รายจ่ายส่วนบุคคล

> 🎓 Final Project — CIS

---

##  Features

* 🔐 Sign Up & Login
* 👤 Username / Password Login
* 🐙 GitHub Login
* 💰 Track Income & Expenses
* 📊 Financial Summary
* 🗂️ Transaction Categories
* 🌙 Light & Dark Mode
* 📱 Responsive Design
* 🔒 Password ถูก Hash ก่อนจัดเก็บในฐานข้อมูล
---

## 🛠️ Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend

* Next.js API Routes
* Auth.js
* Prisma ORM

### Database

* PostgreSQL

### Authentication

* Username / Password
* GitHub OAuth

### Tools

* Git
* GitHub
* VS Code

---

## 🏗️ Project Structure

```text
MyMonee/
├── app/
│   ├── api/
│   │   └── register/
│   ├── dashboard/
│   ├── login/
│   ├── register/
│   ├── generated/
│   └── ...
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
├── prisma7.config.ts
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/21dezc/MyMonee.git
cd MyMonee
```

### 2. Install Dependencies

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

หากต้องการเปิด Prisma Studio:

```bash
npx prisma studio
```

### 5. Run Development Server

```bash
npm run dev
```

จากนั้นเปิด:

```text
http://localhost:3000
```

---

## 🔐 Authentication

MyMonee รองรับการเข้าสู่ระบบ 2 รูปแบบ

### Username / Password

ผู้ใช้สามารถสมัครบัญชีด้วย Username และ Password

เงื่อนไข Username:

* 3–30 ตัวอักษร
* ต้องขึ้นต้นด้วยตัวอักษรภาษาอังกฤษ
* รองรับตัวอักษรภาษาอังกฤษ ตัวเลข `_` และ `-`

เงื่อนไข Password:

* 6 ตัวอักษรขึ้นไป
* รองรับภาษาอังกฤษ ตัวเลข และสัญลักษณ์

Password จะถูก Hash ก่อนจัดเก็บลงฐานข้อมูล

### GitHub Login

สามารถเข้าสู่ระบบผ่าน GitHub OAuth ได้

---

## 📊 Database

โปรเจกต์ใช้ **PostgreSQL** ร่วมกับ **Prisma ORM**

โครงสร้างหลักประกอบด้วย:

* `User` — ข้อมูลผู้ใช้
* `Account` — ข้อมูล OAuth Account
* `Category` — หมวดหมู่รายรับ/รายจ่าย
* `Transaction` — รายการธุรกรรม

---

## 🎨 Design

MyMonee เน้นการออกแบบที่เรียบง่ายและใช้งานง่าย

* Clean UI
* Rounded Cards
* Soft Shadows
* Light / Dark Mode
* Responsive Layout
* เน้นสีที่อ่านง่ายและสบายตา

---

## 📌 Project Status

🚧 **In Development**

ฟีเจอร์และ UI บางส่วนยังอยู่ระหว่างการพัฒนา

---

## 👩‍💻 Developer

**21dezc**

Computer and Information Science (CIS)

---

## 📄 License

This project is developed for educational purposes.

````

