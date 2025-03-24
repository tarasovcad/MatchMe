import {UseFormRegisterReturn} from "react-hook-form";

export interface SimpleInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  mail?: boolean;
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  register?: UseFormRegisterReturn<string>;
  name?: string;
  readOnly?: boolean;

  loading?: boolean;
  error?: {message?: string} | undefined;
  isUsernameAvailable?: boolean | null;
  search?: boolean;
}
