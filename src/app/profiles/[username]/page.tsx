import ProfileAboutMe from "@/components/(pages)/profiles/ExpandedDescription";
import ProfileFormField from "@/components/(pages)/profiles/ProfileFormField";
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
                <div className="flex items-center gap-1">
                  <Button size={"icon"} className="p-[5px]">
                    <Image
                      src="/social_links/github.svg"
                      alt="github"
                      width={24}
                      height={24}
                      className="shrink-0"
                    />
                  </Button>
                  <Button size={"icon"} className="p-[5px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="28"
                      height="28"
                      viewBox="0 0 48 48">
                      <path
                        fill="#29b6f6"
                        d="M24 4A20 20 0 1 0 24 44A20 20 0 1 0 24 4Z"></path>
                      <path
                        fill="#fff"
                        d="M33.95,15l-3.746,19.126c0,0-0.161,0.874-1.245,0.874c-0.576,0-0.873-0.274-0.873-0.274l-8.114-6.733 l-3.97-2.001l-5.095-1.355c0,0-0.907-0.262-0.907-1.012c0-0.625,0.933-0.923,0.933-0.923l21.316-8.468 c-0.001-0.001,0.651-0.235,1.126-0.234C33.667,14,34,14.125,34,14.5C34,14.75,33.95,15,33.95,15z"></path>
                      <path
                        fill="#b0bec5"
                        d="M23,30.505l-3.426,3.374c0,0-0.149,0.115-0.348,0.12c-0.069,0.002-0.143-0.009-0.219-0.043 l0.964-5.965L23,30.505z"></path>
                      <path
                        fill="#cfd8dc"
                        d="M29.897,18.196c-0.169-0.22-0.481-0.26-0.701-0.093L16,26c0,0,2.106,5.892,2.427,6.912 c0.322,1.021,0.58,1.045,0.58,1.045l0.964-5.965l9.832-9.096C30.023,18.729,30.064,18.416,29.897,18.196z"></path>
                    </svg>
                  </Button>
                  <Button size={"icon"} className="p-[5px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      x="0px"
                      y="0px"
                      width="30"
                      height="30"
                      viewBox="0 0 48 48">
                      <radialGradient
                        id="yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1"
                        cx="19.38"
                        cy="42.035"
                        r="44.899"
                        gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#fd5"></stop>
                        <stop offset=".328" stopColor="#ff543f"></stop>
                        <stop offset=".348" stopColor="#fc5245"></stop>
                        <stop offset=".504" stopColor="#e64771"></stop>
                        <stop offset=".643" stopColor="#d53e91"></stop>
                        <stop offset=".761" stopColor="#cc39a4"></stop>
                        <stop offset=".841" stopColor="#c837ab"></stop>
                      </radialGradient>
                      <path
                        fill="url(#yOrnnhliCrdS2gy~4tD8ma_Xy10Jcu1L2Su_gr1)"
                        d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"></path>
                      <radialGradient
                        id="yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2"
                        cx="11.786"
                        cy="5.54"
                        r="29.813"
                        gradientTransform="matrix(1 0 0 .6663 0 1.849)"
                        gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#4168c9"></stop>
                        <stop
                          offset=".999"
                          stopColor="#4168c9"
                          stopOpacity="0"></stop>
                      </radialGradient>
                      <path
                        fill="url(#yOrnnhliCrdS2gy~4tD8mb_Xy10Jcu1L2Su_gr2)"
                        d="M34.017,41.99l-20,0.019c-4.4,0.004-8.003-3.592-8.008-7.992l-0.019-20	c-0.004-4.4,3.592-8.003,7.992-8.008l20-0.019c4.4-0.004,8.003,3.592,8.008,7.992l0.019,20	C42.014,38.383,38.417,41.986,34.017,41.99z"></path>
                      <path
                        fill="#fff"
                        d="M24,31c-3.859,0-7-3.14-7-7s3.141-7,7-7s7,3.14,7,7S27.859,31,24,31z M24,19c-2.757,0-5,2.243-5,5	s2.243,5,5,5s5-2.243,5-5S26.757,19,24,19z"></path>
                      <circle cx="31.5" cy="16.5" r="1.5" fill="#fff"></circle>
                      <path
                        fill="#fff"
                        d="M30,37H18c-3.859,0-7-3.14-7-7V18c0-3.86,3.141-7,7-7h12c3.859,0,7,3.14,7,7v12	C37,33.86,33.859,37,30,37z M18,13c-2.757,0-5,2.243-5,5v12c0,2.757,2.243,5,5,5h12c2.757,0,5-2.243,5-5V18c0-2.757-2.243-5-5-5H18z"></path>
                    </svg>
                  </Button>
                </div>
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
          <div className="flex flex-col gap-6 max-[990px]:gap-10">
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
