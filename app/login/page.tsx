import { redirect } from "next/navigation"

export default function LoginPage() {
  // Auth is intentionally disabled for this product.
  // Route kept for backwards compatibility; send users to one-time Pro flow.
  redirect("/upgrade?redirectTo=/audit#redeem")
}
