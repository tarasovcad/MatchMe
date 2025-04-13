import {toast} from "sonner";
import {handleStep2} from "@/actions/(auth)/handleStep2";

export async function handleFormSubmitStep2(
  page: "signup" | "login",
  email: string,
  otp: string,
  isNewUser: boolean,
  setLoading: (loading: boolean) => void,
  router: {push: (url: string) => void},
  redirectPath: string = "/profiles",
) {
  let toastId: string | number = "";
  try {
    toastId = toast.loading("Verifying OTP...");
    setLoading(true);
    const response = await handleStep2({email, otp});
    if (response?.error) {
      toast.error(response.error, {id: toastId});
      return;
    }
    toast.success(response?.message, {id: toastId});
    if (isNewUser) {
      router.push(`/complete-profile?from=/${page}`);
    } else {
      router.push(redirectPath);
    }
  } catch (error) {
    toast.error("Signup failed. Please try again.", {id: toastId});
  } finally {
    setLoading(false);
  }
}
