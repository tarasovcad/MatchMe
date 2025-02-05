import {createClient} from "@/utils/superbase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();
  console.log(user);
  if (!user) {
    return <div>User not logged in</div>;
  }

  return <div>User logged in: {user.email}</div>;
}
