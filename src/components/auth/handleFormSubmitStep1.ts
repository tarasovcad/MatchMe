import {toast} from "sonner";
import {handleStep1} from "@/actions/(auth)/handleStep1";
import {SignUpFormData} from "@/validation/signUpValidation";

export async function handleFormSubmitStep1(
  data: SignUpFormData,
  setLoading: (loading: boolean) => void,
  setEmail: (email: string) => void,
  setCurrentStep: (step: number) => void,
  setIsNewUser: (isNewUser: boolean) => void,
  setTotalSteps: (steps: number) => void,
) {
  let toastId: string | number = "";
  try {
    setLoading(true);
    toastId = toast.loading("Signing up...");
    const response = await handleStep1(data);
    console.log(response);
    if (response.error) {
      toast.error(`Signup failed: ${response.error}`, {id: toastId});
      return;
    }
    toast.success("OTP sent successfully!", {id: toastId});

    if (response.isNewUser) {
      setIsNewUser(true);
      setTotalSteps(3);
    } else {
      setTotalSteps(2);
    }

    setEmail(data.email);
    setCurrentStep(2);
  } catch (error) {
    toast.error("Signup failed. Please try again.", {id: toastId});
    setLoading(false);
    return;
  } finally {
    setLoading(false);
  }
}
