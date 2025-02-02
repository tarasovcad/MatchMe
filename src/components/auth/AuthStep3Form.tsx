import React from "react";
import SimpleInput from "../ui/SimpleInput";

const AuthStep3Form = () => {
  return (
    <div className="flex flex-col gap-3">
      <SimpleInput
        label="Full Name"
        placeholder="Joe Doe"
        type="name"
        id="name"
        name="name"
      />
      <SimpleInput
        label="Username"
        placeholder="joedoe"
        type="username"
        id="username"
        name="username"
      />
    </div>
  );
};

export default AuthStep3Form;
