import {toast} from "sonner";
import {SignUpFormData} from "@/validation/signUpValidation";
import {LoginFormData} from "@/validation/loginValidation";
import {handleStep1} from "@/actions/(auth)/handleStep1";

export async function handleFormSubmitStep1(
  page: "signup" | "login",
  data: SignUpFormData | LoginFormData,
  setLoading: (loading: boolean) => void,
  setEmail: (email: string) => void,
  setCurrentStep: (step: number) => void,
  setIsNewUser: (isNewUser: boolean) => void,
  setTotalSteps: (steps: number) => void,
) {
  let toastId: string | number = "";
  try {
    setLoading(true);
    toastId = toast.loading(
      page === "signup" ? "Signing up..." : "Logging in...",
    );

    const response = await handleStep1({...data, page});

    if (response.error) {
      toast.error(
        `${page === "signup" ? "Signup" : "Login"} failed: ${response.error}`,
        {id: toastId},
      );
      return;
    }
    toast.success("OTP sent successfully!", {id: toastId});

    if (response.isNewUser === true) {
      console.log("New user");
      setIsNewUser(true);
      setTotalSteps(3);
    } else {
      console.log("Existing user");
      setIsNewUser(false);
      setTotalSteps(2);
    }

    setEmail(data.email);
    setCurrentStep(2);
  } catch (error) {
    toast.error(
      `${page === "signup" ? "Signup" : "Login"} failed. Please try again.`,
      {id: toastId},
    );
    setLoading(false);
    return;
  } finally {
    setLoading(false);
  }
}
