import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-4xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              โปรไฟล์
            </h1>

            <p className="mt-1 text-xs text-muted">
              ข้อมูลบัญชีของคุณ
            </p>
          </div>

          
        </div>

        <div className="mt-8 card p-6">

          <h2 className="text-lg font-semibold">
            ข้อมูลบัญชี
          </h2>

          <div className="mt-6 space-y-4">

            <div>
              <p className="text-sm text-muted">
                ชื่อผู้ใช้
              </p>

              <p className="mt-1 font-medium">
                {session.user.name || "ยังไม่มีข้อมูล"}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted">
                อีเมล
              </p>

              <p className="mt-1 font-medium">
                {session.user.email || "ยังไม่มีข้อมูล"}
              </p>
            </div>
            <div className="mt-8 border-t border-line pt-6">
                <LogoutButton />
            </div>

          </div>

        </div>

      </div>

      
    </main>

          
  );
}