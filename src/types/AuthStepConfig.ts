export type AuthStepConfig = {
  [key: number]: {
    title: string;
    subtitle: string;
    buttonText: string;
    bottomSubTitle?: string;
    bottomSubTitleLinkText?: string;
    bottomSubTitleHfref?: string;
  };
};
