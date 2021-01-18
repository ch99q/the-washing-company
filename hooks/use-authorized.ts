import { useRouter } from "next/router";
import { useEffect } from "react";

import { useAuth } from "./use-auth";

export function useAuthorized() {
  const router = useRouter();
  const { exists } = useAuth();

  useEffect(() => {
    if (!exists) router.back();
  }, []);

  return exists;
}
