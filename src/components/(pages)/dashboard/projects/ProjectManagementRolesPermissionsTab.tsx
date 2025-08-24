"use client";

import {Project} from "@/types/projects/projects";
import {User} from "@supabase/supabase-js";
import React, {useEffect, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {motion} from "framer-motion";
import {
  containerVariants,
  itemVariants,
  bottomSectionButtonsVariants,
} from "@/utils/other/variants";
import FormMainButtons from "@/components/ui/form/FormMainButtons";
import PermissionManagement from "./PermissionManagement";
import {toast} from "sonner";
import {updateProjectRoles} from "@/actions/projects/updateProjectRoles";
import type {UpdatableRole} from "@/actions/projects/updateProjectRoles";

const ProjectManagementRolesPermissionsTab = ({user, project}: {user: User; project: Project}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(true);
  const [changedRoles, setChangedRoles] = useState<UpdatableRole[]>([]);
  const [resetRolesSignal, setResetRolesSignal] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    setIsSaveDisabled(changedRoles.length === 0);
  }, [changedRoles]);

  const onSubmit = async () => {
    if (changedRoles.length === 0) return;

    setIsLoading(true);
    const toastId = toast.loading("Saving changes…");

    const rolesResponse = await updateProjectRoles(project.id, changedRoles);

    if (rolesResponse.error) {
      toast.error(rolesResponse.message, {id: toastId});
      setIsLoading(false);
      return;
    }

    await queryClient.invalidateQueries({queryKey: ["project-roles", project.id]});

    toast.success("Changes saved successfully", {id: toastId});

    setChangedRoles([]);
    setIsLoading(false);
  };

  const handleSave = () => onSubmit();

  const handleCancel = () => {
    setChangedRoles([]);
    setResetRolesSignal((prev) => !prev);
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} className={`flex flex-col gap-4.5`}>
        <motion.div variants={containerVariants} className="flex flex-col gap-6">
          <PermissionManagement
            projectId={project.id}
            onRolesChange={setChangedRoles}
            resetSignal={resetRolesSignal}
          />
        </motion.div>
      </motion.div>

      {/* Bottom action buttons */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={bottomSectionButtonsVariants}
        className="right-0 bottom-0 left-0 z-[5] fixed flex justify-end items-center gap-[10px] bg-sidebar-background shadow-lg p-6 border-t border-border">
        <FormMainButtons
          isLoading={isLoading}
          handleSave={handleSave}
          handleCancel={handleCancel}
          isSaveDisabled={isSaveDisabled}
          isClearDisabled={changedRoles.length === 0}
        />
      </motion.div>
    </motion.div>
  );
};

export default ProjectManagementRolesPermissionsTab;
