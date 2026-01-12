import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default async function Home() {
  const { data } = await supabase.auth.getUser()

  if (data.user) {
    redirect("/dashboard")
  } else {
    redirect("/sign-in")
  }
}
