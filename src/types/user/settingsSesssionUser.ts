export interface SettingsSessionUser {
  account: {
    username?: string;
    name?: string;
    image?: string;
  };
  security: {
    email?: string;
  };
}
