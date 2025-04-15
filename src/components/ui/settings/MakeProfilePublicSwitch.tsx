import React from "react";
import {MatchMeUser} from "@/types/user/matchMeUser";
import {canUserMakeProfilePublic} from "@/functions/canUserMakeProfilePublic";
import FormSwitch from "../form/FormSwitch";

const MakeProfilePublicSwitch = ({
  id,
  name,
  profile,
}: {
  id: string;
  name: string;
  profile?: MatchMeUser;
}) => {
  const {canMakeProfilePublic} = canUserMakeProfilePublic(profile as MatchMeUser);

  return (
    <FormSwitch
      id={id}
      name={name}
      visibleLabel="Visible"
      hiddenLabel="Hidden"
      customDisabledLogic={() => canMakeProfilePublic}
    />
  );
};

export default MakeProfilePublicSwitch;
