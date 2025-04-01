import {Button} from "@/components/shadcn/button";
import {X} from "lucide-react";
import Image from "next/image";
import React, {useState} from "react";
import {motion} from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/shadcn/tooltip";
import {User} from "@supabase/supabase-js";
import {cn} from "@/lib/utils";
import {removeUserProvider} from "@/actions/(auth)/removeUserProvider";
import {toast} from "sonner";
import {connectUserProvider} from "@/actions/(auth)/connectUserProvider";
import {useRouter} from "next/navigation";
const UserConnectedAccounts = ({user}: {user: User}) => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const userConnections =
    user?.identities?.map((identity) => ({
      id: identity.id,
      provider: identity.provider,
      name: identity?.identity_data?.name,
    })) || [];

  const removeConnection = async (provider: "google" | "github") => {
    setLoading(true);

    try {
      const response = await removeUserProvider(provider);
      if (response?.error) {
        toast.error(response.error);
        console.log("Error removing connection:", response.error);
        setLoading(false);
        return;
      }

      toast.success(response?.message);
      setLoading(false);
    } catch (error) {
      console.error("Error removing connection:", error);
      toast.error("Error removing connection");
      setLoading(false);
    }
  };

  const connectProvider = async (provider: "google" | "github") => {
    setLoading(true);

    try {
      const response = await connectUserProvider(provider);
      if (response?.error) {
        toast.error(response.error);
        console.log("Error adding connection:", response.error);
        setLoading(false);
        return;
      }

      if (response?.data) {
        router.push(response.data);
      } else {
        toast.success(response?.message);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error adding connection:", error);
      toast.error("Error adding connection");
      setLoading(false);
    }
  };

  const googleProvider = userConnections.find(
    (connection) => connection.provider === "google",
  );
  const githubProvider = userConnections.find(
    (connection) => connection.provider === "github",
  );

  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover="hover" initial="initial">
        <Button
          {...(!githubProvider && {asChild: true})}
          {...(!githubProvider && {onClick: () => connectProvider("github")})}
          size={"sm"}
          disabled={loading}
          className={cn(
            "rounded-[8px] h-[42px] bg-muted cursor-default",
            !githubProvider && "cursor-pointer",
          )}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image src="svg/github.svg" alt="Github" width={16} height={16} />
              {githubProvider ? githubProvider.name : "Connect Github"}
            </div>
            {githubProvider && (
              <motion.div
                variants={{
                  initial: {
                    width: 0,
                    opacity: 0,
                    marginLeft: 0,
                  },
                  hover: {width: "auto", opacity: 1},
                }}
                transition={{duration: 0.2}}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span
                      className="py-1 cursor-pointer"
                      onClick={() => removeConnection("github")}>
                      <X className="w-4 h-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">{`Disconnect from github`}</TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </div>
        </Button>
      </motion.div>
      <motion.div whileHover="hover" initial="initial">
        <Button
          {...(!googleProvider && {asChild: true})}
          {...(!googleProvider && {onClick: () => connectProvider("google")})}
          size={"sm"}
          disabled={loading}
          className={cn(
            "rounded-[8px] h-[42px] bg-destructive hover:bg-destructive/90 text-background hover:text-background cursor-default",
            !googleProvider && "cursor-pointer",
          )}>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Image src="svg/google.svg" alt="Google" width={16} height={16} />
              {googleProvider ? googleProvider.name : "Connect Google"}
            </div>
            {googleProvider && (
              <motion.div
                variants={{
                  initial: {
                    width: 0,
                    opacity: 0,
                    marginLeft: 0,
                  },
                  hover: {width: "auto", opacity: 1},
                }}
                transition={{duration: 0.2}}>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger asChild>
                    <span
                      className="py-1 cursor-pointer"
                      onClick={() => removeConnection("google")}>
                      <X className="w-4 h-4" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    Disconnect from google
                  </TooltipContent>
                </Tooltip>
              </motion.div>
            )}
          </div>
        </Button>
      </motion.div>
    </div>
  );
};

export default UserConnectedAccounts;
