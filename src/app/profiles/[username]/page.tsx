import ProfileFormField from "@/components/(pages)/profiles/ProfileFormField";
import ProfileSocialLinks from "@/components/(pages)/profiles/ProfileSocialLinks";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {profileFormFields} from "@/data/forms/profile/profileFormFields";
import {cn} from "@/lib/utils";
import SidebarProvider from "@/providers/SidebarProvider";
import {createClient} from "@/utils/supabase/server";
import {Messages2} from "iconsax-react";
import {Ellipsis, UserRoundPlus} from "lucide-react";
import Image from "next/image";
import React from "react";

const UserSinglePage = async ({
  params,
}: {
  params: Promise<{username: string}>;
}) => {
  const supabase = await createClient();
  const {username} = await params;

  const {data: user, error} = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (error || !user) {
    console.error("Error fetching user:", error);
    return <div>User not found.</div>;
  }

  const {data: skills, error: skillsError} = await supabase
    .from("skills")
    .select("name, image_url")
    .in("name", user.skills);

  if (skillsError) {
    console.error("Error fetching skills:", skillsError);
    return <div>Error fetching skills.</div>;
  }
  return (
    <SidebarProvider removePadding>
      <Image
        src={"/test.png"}
        unoptimized
        alt={user.name}
        width={0}
        height={0}
        sizes="100vw"
        className="rounded-[6px] rounded-t-none w-full"
        style={{width: "100%", height: "156px"}}
      />
      <div className="flex flex-col gap-9 p-6 pt-0 responsive-container">
        <div className="flex flex-col gap-6">
          <div className="relative flex justify-between gap-3">
            <UserButtons className="max-[620px]:hidden top-0 right-0 absolute pt-[15px]" />
            <div className="flex max-[1130px]:flex-col gap-3">
              <Image
                src={user.image}
                alt={user.name}
                width={125}
                height={125}
                className="-mt-9 border-4 border-background rounded-full shrink-0"
                style={{
                  width: "clamp(100px, 10vw, 125px)",
                  height: "clamp(100px, 10vw, 125px)",
                }}
                unoptimized
              />
              <div className="flex flex-col gap-3 min-[1130px]:pt-[15px]">
                {/* name and verified */}
                <div>
                  <div className="flex items-center gap-2">
                    <MainGradient as="h1" className="font-semibold text-2xl">
                      {user.name}
                    </MainGradient>
                    <Image
                      src="/svg/verified.svg"
                      alt="Verified"
                      width={18}
                      height={18}
                      className="shrink-0"
                    />
                  </div>
                  <p className="text-secondary text-sm">{user.tagline}</p>
                </div>
                {/* social links */}
                <ProfileSocialLinks user={user} />
              </div>
            </div>
            <div className="flex flex-col items-end gap-[30px] max-[1130px]:gap-[45px]">
              <UserNumbers className="max-[950px]:hidden pt-[75px] pr-[47px]" />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <UserButtons className="min-[620px]:hidden w-full" />
            <UserNumbers className="min-[950px]:hidden justify-between" />
          </div>
        </div>
        {/* main section */}
        <div>
          <div className="flex flex-col gap-8 max-[990px]:gap-10">
            {profileFormFields.map((formField) => (
              <div key={formField.fieldTitle}>
                <ProfileFormField
                  formField={formField}
                  user={user}
                  skills={skills}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const UserButtons = ({className}: {className?: string}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 max-[620px] max-[360px]:gap-1",
        className,
      )}>
      <Button size={"icon"} className="max-[620px]:order-2 h-[38px]">
        <Ellipsis size={18} strokeWidth={2} />
      </Button>
      <div className="flex items-center gap-[10px] max-[360px]:gap-1 max-[620px]:w-full">
        <Button
          size={"default"}
          className="max-[620px]:order-2 max-[620px]:w-full">
          <Messages2
            size="18"
            color="currentColor"
            strokeWidth={2}
            className="max-[450px]:hidden stroke-2"
          />
          Message
        </Button>
        <Button
          size={"default"}
          variant={"default"}
          className="max-[620px]:w-full">
          <UserRoundPlus
            size="18"
            color="currentColor"
            strokeWidth={2}
            className="max-[450px]:hidden stroke-2"
          />
          Follow
        </Button>
      </div>
    </div>
  );
};

const UserNumbers = ({className}: {className?: string}) => {
  return (
    <div className={cn("flex items-center gap-12 ", className)}>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">
          Followers
        </span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          12,420
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">
          Following
        </span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          410
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Posts</span>
        <MainGradient
          as="h3"
          className="font-semibold text-[26px] text-secondary leading-[34px]">
          5
        </MainGradient>
      </div>
    </div>
  );
};

export default UserSinglePage;
