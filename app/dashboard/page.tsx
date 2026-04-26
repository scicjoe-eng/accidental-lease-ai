import { redirect } from "next/navigation"

export default function DashboardPage() {
  // Dashboard/account UI removed — product uses one-time unlock flow.
  redirect("/audit")
}
