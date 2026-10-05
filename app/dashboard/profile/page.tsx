import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import { redirect } from "next/navigation";
import EditNameButton from "./EditNameButton";
import EditEmailButton from "./EditEmailButton";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-4xl">

        <div>
          <h1 className="text-2xl font-semibold">
            โปรไฟล์
          </h1>

          <p className="mt-1 text-xs text-muted">
            ข้อมูลบัญชีของคุณ
          </p>
        </div>

        <div className="mt-8 card p-6">

          <div className="flex items-center gap-4">

            {session.user.image ? (
              <img
                src={session.user.image}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-paper text-xl font-semibold">
                {(session.user.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold">
                {session.user.name || "ผู้ใช้งาน"}
              </h2>

              <p className="text-sm text-muted">
                ข้อมูลบัญชีของคุณ
              </p>
            </div>

          </div>

          <div className="mt-8 space-y-5">

            {/* ชื่อผู้ใช้ */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">
                  ชื่อผู้ใช้
                </p>

                <p className="mt-1 font-medium">
                  {session.user.name || "ยังไม่มีข้อมูล"}
                </p>
              </div>

              <EditNameButton
                  currentName={session.user.name || ""}
                />
            </div>

            {/* อีเมล */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted">
                  อีเมล
                </p>

                <p className="mt-1 font-medium">
                  {session.user.email || "ยังไม่ได้เพิ่มอีเมล"}
                </p>
              </div>

              <EditEmailButton
                currentEmail={session.user.email || ""}
              />
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