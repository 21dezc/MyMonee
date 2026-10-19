import { cache } from "react";
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";  // login ด้วย GitHub
import Credentials from "next-auth/providers/credentials";  // login ด้วย user/pass
import { PrismaAdapter } from "@auth/prisma-adapter";  // เชื่อม NextAuth กับ DB
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";     // เปรียบ password

export const { handlers, signIn, signOut, auth } = NextAuth({  // ให้ NextAuth เก็บ session ลง DB
  adapter: PrismaAdapter(prisma),  
  //จัดการ APIระบบAuthentication เช่น การเรียก Callback จาก GitHub
  //auth ตรวจสอบ Session ข้อมูลผู้ใช้ที่ผ่านการยืนยันตัวตนแล้ว


  session: {
    strategy: "jwt",     // ใช้ JWT เก็บ session (ไม่เก็บใน DB)
  },

  // แสดง error การ login (เช่น เมลซ้ำ) ที่หน้าlogin
  pages: {
    error: "/login",    
  },

  
  providers: [
    // login ด้วย GitHub OAuth
    GitHub({   
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    // login ด้วย userpass
    Credentials({
      credentials: {
        username: {},
        password: {},
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;     // หา user จาก DB ด้วย username
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username as string,
          },      
        });

        if (!user || !user.password) {
          return null;    //เช็คว่า user มีอยู่ไหม
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password      // เทียบ pass ด้วย bcrypt
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
        };
      },
    }),
  ],

    callbacks: {
      async jwt({ token, user }) {   // jwt() เพิ่มid เข้าtoken ตอนlogin
        if (user) {
          token.id = user.id;
          token.picture = user.image;
        }

        return token;
      },

      async session({ session, token }) {   //ดึงข้อมูลuser จากDB แล้วแปะลงsession
        if (session.user && token.id) {
          const dbUser = await prisma.user.findUnique({
            where: {
              id: token.id as string,
            },
          });

          if (dbUser) {
            session.user.id = dbUser.id;
            session.user.name = dbUser.name ?? dbUser.username ?? "";
            session.user.email = dbUser.email ?? "";
            session.user.image = dbUser.image ?? "";
          }
        }

        return session;
      },
    },
});

// getSession → ใช้ใน Server Component แทน auth()
// cache() ป้องกันยิง DB ซ้ำใน request เดียวกัน
export const getSession = cache(auth);
