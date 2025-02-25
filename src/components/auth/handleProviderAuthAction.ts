import {toast} from "sonner";
import {handleProviderAuth} from "@/actions/(auth)/handleProviderAuth";

export async function handleProviderAuthAction(
  provider: string,
  setGoogleProviderLoading: (loading: boolean) => void,
  setGithubProviderLoading: (loading: boolean) => void,
  router: {push: (url: string) => void},
) {
  if (provider === "google") {
    setGoogleProviderLoading(true);
  } else {
    setGithubProviderLoading(true);
  }

  const response = await handleProviderAuth(provider);

  if (response.error) {
    console.error(response.error);
    toast.error(response.error);
    if (provider === "google") {
      setGoogleProviderLoading(false);
    } else {
      setGithubProviderLoading(false);
    }
    return;
  }

  if (response.link) {
    router.push(response.link);
  }
}
