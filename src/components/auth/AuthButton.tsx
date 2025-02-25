import React from "react";
import {Button} from "../shadcn/button";
import {LoaderCircle} from "lucide-react";
import LoadingButtonCirlce from "../ui/LoadingButtonCirlce";

interface AuthButtonProps {
  text: string;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

const AuthButton = ({
  text,
  disabled,
  loading,
  onClick,
  ...props
}: AuthButtonProps) => {
  return (
    <Button
      type="submit"
      disabled={disabled || loading}
      variant={"default"}
      size={"default"}
      onClick={onClick}
      {...props}
      className="relative transition-all duration-300 ease-in-out w-full 
      bg-purplegradient 
      hover:before:opacity-100
      dark:text-white 
      overflow-hidden 
      before:content-[''] 
      before:absolute 
      before:inset-0 
      before:bg-hoverpurplegradient 
      before:opacity-0 
      before:transition-opacity 
      before:duration-300
      disabled:opacity-50 
      disabled:cursor-not-allowed
      disabled:hover:before:opacity-0">
      {loading ? (
        <LoadingButtonCirlce />
      ) : (
        <span className="relative z-10">{text}</span>
      )}
    </Button>
  );
};

export default AuthButton;
