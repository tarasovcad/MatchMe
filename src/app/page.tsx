import {createClient} from "@/utils/supabase/server";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();
  console.log(user);
  if (!user) {
    return <div>User not logged in</div>;
  }

  return (
    <>
      <div>User logged in</div>
      <div>Email: {user.email}</div>
      <div>Name: {user.user_metadata.name}</div>
      <div>Username: {user.user_metadata.username}</div>
    </>
  );
}
