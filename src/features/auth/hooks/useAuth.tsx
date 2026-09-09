import { useAuthContext } from "@/contexts/AuthContext";
import type { EstadoAuth } from "../types";

export const SUPER_ADMIN_EMAIL = "meridiantech.co@gmail.com";

export function useAuth(): EstadoAuth {
  return useAuthContext();
}
