import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "./use-auth";

export default function useAuthorized(
  redirectUrl = "/"
): ReturnType<typeof useAuth> {
  const auth = useAuth();
  const { asPath, replace } = useRouter();

  useEffect(() => {
    if (!auth.user) replace(redirectUrl);
  }, [auth, asPath]);

  return auth;
}
