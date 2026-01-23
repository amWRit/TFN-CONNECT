import { useSession } from "next-auth/react";

export function useUserEmail() {
  const { data: session } = useSession();
  return session?.user?.email || null;
}
