import {Input} from "@/components/shadcn/input";
import {Label} from "@/components/shadcn/label";
import {useId} from "react";

const SimpleInput = () => {
  const id = useId();
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Simple input</Label>
      <Input id={id} placeholder="Email" type="email" />
    </div>
  );
};

export default SimpleInput;
