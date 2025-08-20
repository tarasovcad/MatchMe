import ProfileOtherButton from "@/components/(pages)/profiles/ProfileOtherButton";
import ProfileSocialLinks from "@/components/(pages)/profiles/ProfileSocialLinks";
import FollowUserButton from "@/components/follows/FollowUserButton";
import AuthGate from "@/components/other/AuthGate";
import {Button} from "@/components/shadcn/button";
import MainGradient from "@/components/ui/Text";
import {formatNumber} from "@/functions/formatNumber";
import {cn} from "@/lib/utils";
import ImageViewer from "@/components/ui/ImageViewer";
import {Messages2} from "iconsax-react";
import Image from "next/image";
import React from "react";
import {ChevronDownIcon, Plus} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/dropdown-menu";
import {Project} from "@/types/projects/projects";
import {projectFormFields} from "@/data/forms/projects/projectFormFields";
import SidebarProvider from "@/providers/SidebarProvider";
import ProjectOtherButton from "@/components/(pages)/projects/ProjectOtherButton";
import {getProjectBundle} from "@/actions/projects/singleProject";
import {createClient} from "@/utils/supabase/server";
import {notFound} from "next/navigation";
import FollowProjectButton from "@/components/follows/FollowProjectButton";
import ProjectFormField from "@/components/(pages)/projects/ProjectFormField";
import ProjectImageSlider from "@/components/(pages)/projects/ProjectImageSlider";
import ProjectTabs from "@/components/(pages)/projects/ProjectTabs";
import ContentShareSection from "@/components/(pages)/other/ContentShareSection";

const ProjectSinglePage = async ({params}: {params: Promise<{slug: string}>}) => {
  const {slug} = await params;
  let bundle;
  let userSessionId: string | undefined;

  try {
    const supabase = await createClient();
    const {data: userSession} = await supabase.auth.getUser();
    userSessionId = userSession?.user?.id;

    bundle = await getProjectBundle(slug, userSessionId, supabase);
  } catch (e) {
    if (e instanceof Error && e.message === "RATE_LIMITED") {
      return (
        <div className="mx-auto p-4 container">
          <h1 className="font-bold text-xl">Too many requests</h1>
          <p>Please wait a minute and try again.</p>
        </div>
      );
    }
    console.error("Error rendering project:", e);
    return (
      <div className="mx-auto p-4 container">
        <h1 className="font-bold text-xl">Something went wrong</h1>
        <p>We encountered an error while loading this project. Please try again later.</p>
      </div>
    );
  }

  // Handle project not found outside of try-catch to allow notFound() to work
  if (!bundle) {
    notFound();
  }

  const {project, isFollowing, isFavorite, stats} = bundle;
  const {followers, members, openRoles, skills} = stats;
  // Get project image URL
  const projectImageUrl =
    Array.isArray(project.project_image) && project.project_image[0]?.url
      ? project.project_image[0].url
      : undefined;

  // Get background image URL
  const backgroundImageUrl =
    Array.isArray(project.background_image) && project.background_image[0]?.url
      ? project.background_image[0].url
      : undefined;

  return (
    <SidebarProvider removePadding>
      {/* Background Image */}
      <div
        className={cn("bg-gray-200 dark:bg-gray-900 rounded-[6px] rounded-t-none w-full", {
          "bg-cover bg-center": backgroundImageUrl,
        })}
        style={{
          width: "100%",
          height: "clamp(130px, 20vw, 156px)",
          backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : undefined,
        }}></div>

      <div className="@container flex flex-col gap-3 max-[950px]:gap-6 p-6 pt-0">
        <div className="flex flex-col gap-6">
          <div className="relative flex justify-between gap-28 max-[1130px]:gap-16">
            <ProjectButtons
              className="@max-[620px]:hidden top-0 right-0 absolute pt-[15px]"
              isFavorite={isFavorite}
              userSessionId={userSessionId}
              projectTitle={project.name}
              projectId={project.id}
              isFollowing={isFollowing}
            />
            <div className="flex max-[1130px]:flex-col gap-3 min-[1130px]:pt-[15px]">
              {/* Project Image/Avatar */}
              {projectImageUrl && (
                <Image
                  src={projectImageUrl}
                  alt={project.name}
                  width={46}
                  height={46}
                  quality={100}
                  unoptimized={true}
                  className="h-[46px] w-[46px] object-cover rounded"
                />
              )}

              <div className="flex flex-col gap-3 ">
                {/* Project name and info */}
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-2">
                    <MainGradient as="h1" className="font-semibold text-[26px] leading-[26px]">
                      {project.name}
                    </MainGradient>
                    {/* <Image
                      src="/svg/verified.svg"
                      alt="Verified"
                      width={18}
                      height={18}
                      className="w-4.5 h-auto shrink-0"
                      style={{width: "auto", height: "auto"}}
                    /> */}
                  </div>
                  <p className="text-secondary text-sm">{project.tagline}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-[30px] max-[1130px]:gap-[45px]">
              <ProjectNumbers
                className="max-[950px]:hidden pt-[75px] pr-[47px]"
                followers={followers}
                members={members}
                posts={openRoles}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <ProjectButtons
              className="@min-[620px]:hidden w-full"
              isFavorite={isFavorite}
              userSessionId={userSessionId}
              projectTitle={project.name}
              isFollowing={isFollowing}
              projectId={project.id}
            />
            <ProjectNumbers
              className="min-[950px]:hidden justify-between"
              followers={followers}
              members={members}
              posts={openRoles}
            />
          </div>
        </div>
        {/* Main content section */}
        <div>
          <div className="flex flex-col gap-8 max-[990px]:gap-10">
            {project?.demo?.length > 0 && (
              <ProjectImageSlider demo={project.demo.map((item) => item.url)} />
            )}
            {projectFormFields.map((formField) => (
              <ProjectFormField
                key={formField.fieldTitle}
                formField={formField}
                project={project}
                skills={skills}
              />
            ))}
            <ProjectTabs projectId={project.id} userSessionId={userSessionId} />
            {/* <KeywordTagList tags={tags} type="projects" /> */}
            <ContentShareSection
              contentType="project"
              contentUrl={`https://matchme.me/projects/${project.slug}`}
              contentName={project.name}
              contentTagline={project.tagline}
              excludeProjectId={project.id}
            />
            {/* <ProjectSimilarSection /> */}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const ProjectButtons = ({
  className,
  userSessionId,
  isFavorite,
  projectTitle,
  projectId,
  isFollowing,
}: {
  className?: string;
  userSessionId: string | undefined;
  isFavorite: boolean;
  projectTitle: string;
  projectId: string;
  isFollowing: boolean;
}) => {
  return (
    <div className={cn("flex items-center gap-3 max-[620px] max-[360px]:gap-1", className)}>
      <AuthGate userSessionId={userSessionId}>
        <ProjectOtherButton
          userId={userSessionId}
          projectId={projectId}
          isFavorite={isFavorite}
          buttonClassName="@max-[620px]:order-2"
        />
      </AuthGate>

      <div className="flex items-center gap-[10px] max-[360px]:gap-1 @max-[620px]:w-full">
        <AuthGate userSessionId={userSessionId}>
          <Button size={"default"} className="@max-[620px]:order-2 @max-[620px]:w-full">
            <Messages2
              size="18"
              color="currentColor"
              strokeWidth={2}
              className="max-[450px]:hidden stroke-2"
            />
            Message
          </Button>
        </AuthGate>
        <AuthGate userSessionId={userSessionId}>
          <FollowProjectButton
            projectId={projectId}
            isFollowing={isFollowing}
            userSessionId={userSessionId}
            projectTitle={projectTitle}
            buttonClassName="@max-[620px]:w-full"
          />
        </AuthGate>
      </div>
    </div>
  );
};

const ProjectNumbers = ({
  className,
  followers,
  members,
  posts,
}: {
  className?: string;
  followers: number;
  members: number;
  posts: number;
}) => {
  return (
    <div className={cn("flex items-center gap-12", className)}>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Followers</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(followers)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Members</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(members)}
        </MainGradient>
      </div>
      <div>
        <span className="text-[13px] text-secondary leading-[16px]">Open roles</span>
        <MainGradient as="h3" className="font-semibold text-[26px] text-secondary leading-[34px]">
          {formatNumber(posts)}
        </MainGradient>
      </div>
    </div>
  );
};

export default ProjectSinglePage;
