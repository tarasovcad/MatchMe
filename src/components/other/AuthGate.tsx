import React from "react";
import SignUpDialog from "../ui/dialog/SignUpDialog";

const AuthGate = ({
  children,
  userSessionId,
}: {
  children: React.ReactNode;
  userSessionId: string | null | undefined;
}) => {
  console.log("AuthGate userSessionId:", userSessionId, "for:", children);
  if (userSessionId === null || !userSessionId) {
    return <SignUpDialog>{children}</SignUpDialog>;
  } else {
    return <>{children}</>;
  }
};

export default AuthGate;
