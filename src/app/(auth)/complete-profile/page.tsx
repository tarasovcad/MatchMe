import CompleteProfileClient from "@/components/(pages)/other/CompleteProfileClient";
import React, {Suspense} from "react";

const CompleteProfile = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CompleteProfileClient />
    </Suspense>
  );
};

export default CompleteProfile;
