import React from "react";
import SignUpDialog from "../ui/dialog/SignUpDialog";

const AuthGate = ({
  children,
  userSessionId,
}: {
  children: React.ReactNode;
  userSessionId: string | null | undefined;
}) => {
  if (userSessionId === null || !userSessionId) {
    return (
      <SignUpDialog>
        <div className="contents">{children}</div>
      </SignUpDialog>
    );
  } else {
    return <>{children}</>;
  }
};

export default AuthGate;
