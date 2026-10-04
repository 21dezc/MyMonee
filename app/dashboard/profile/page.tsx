import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-4xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              👤 โปรไฟล์
            </h1>

            <p className="mt-2 text-gray-500">
              ข้อมูลบัญชีของคุณ
            </p>
          </div>

          
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow">

          <h2 className="text-xl font-bold">
            ข้อมูลบัญชี
          </h2>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-sm text-gray-500">
                ชื่อผู้ใช้
              </p>

              <p className="mt-1 font-medium">
                {session.user.name || "ยังไม่มีข้อมูล"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                อีเมล
              </p>

              <p className="mt-1 font-medium">
                {session.user.email || "ยังไม่มีข้อมูล"}
              </p>
            </div>
            <div className="mt-8 border-t pt-6">
                <LogoutButton />
            </div>

          </div>

        </div>

      </div>

      
    </main>

          
  );
}