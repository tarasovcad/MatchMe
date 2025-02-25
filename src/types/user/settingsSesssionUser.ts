import {MatchMeUser} from "./matchMeUser";

export interface SettingsSessionUser {
  account: {
    profile?: MatchMeUser;
  };
  security: {
    profile?: MatchMeUser;
  };
}
