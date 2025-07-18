import React from "react";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {Project} from "@/types/projects/projects";
import {canMakePublic} from "@/functions/canMakePublic";
import FormSwitch from "../form/FormSwitch";

type MakePublicSwitchProps = {
  id: string;
  name: string;
  profile?: MatchMeUser;
  project?: Project;
};

const MakePublicSwitch = ({id, name, profile, project}: MakePublicSwitchProps) => {
  // Decide which entity we are dealing with based on the field name.
  const entity = name === "is_project_public" ? project : profile;

  const {canMakePublic: isEligible} = canMakePublic(entity);

  return (
    <FormSwitch
      id={id}
      name={name}
      visibleLabel="Visible"
      hiddenLabel="Hidden"
      customDisabledLogic={() => isEligible}
    />
  );
};

export default MakePublicSwitch;
