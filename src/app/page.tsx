import SignOutButton from "@/components/auth/SignOutButton";
import {Button} from "@/components/shadcn/button";
import {createClient} from "@/utils/supabase/server";
import Link from "next/link";
import Image from "next/image";
import ThemeToggle from "@/components/other/ThemeToggle";
import SidebarProvider from "@/providers/SidebarProvider";

export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  console.log(user);
  if (!user) {
    return (
      <div className="flex flex-col gap-4 p-10">
        <ThemeToggle />
        <div>User not logged in</div>
        <div className="flex flex-col gap-4 max-w-[200px]">
          <Button asChild variant={"default"}>
            <Link href="/signup">Sign Up</Link>
          </Button>
          <Button asChild variant={"default"}>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="p-10">
        <ThemeToggle />
        <div>User logged in</div>
        <div>Email: {user.email}</div>
        <div>Name: {user.user_metadata.name}</div>
        <div>Username: {user.user_metadata.username}</div>
        <div>Image: </div>
        {user.user_metadata.image && (
          <Image
            src={user.user_metadata.image}
            alt="User Image"
            width={100}
            height={100}
            className="pb-5"
          />
        )}

        <SignOutButton />
      </div>
    </SidebarProvider>
  );
}
