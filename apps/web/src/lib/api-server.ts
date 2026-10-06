import "server-only";

import { cookies } from "next/headers";
import { createApi } from "@/lib/api";

/**
 * Cliente da API para Server Components.
 *
 * O middleware espelha o token em um cookie justamente para que este lado
 * consiga autenticá-lo — Server Components não têm acesso a localStorage.
 */
export const api = createApi(async () => (await cookies()).get("crm_token")?.value ?? null);

export { ApiError, API_URL } from "@/lib/api";