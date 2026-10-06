import { api, API_URL } from "@/lib/api-server";
import { EmptyState, ErrorState } from "@/components/ui";

/**
 * Lista de usuários. Restrita a admin — o middleware redireciona corretores
 * para a 404 e a API responde 403 mesmo que o middleware seja contornado.
 */
export default async function UsuariosPage() {
  let usuarios;
  try {
    usuarios = await api.users.list();
  } catch (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <ErrorState
          message={`${error instanceof Error ? error.message : "Erro"} - API em ${API_URL}`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="mt-1 text-sm text-slate-700">
          Contas com acesso ao sistema. Apenas administradores visualizam esta tela.
        </p>
      </div>

      {usuarios.length === 0 ? (
        <EmptyState message="Nenhum usuário cadastrado." />
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-500 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-500 bg-slate-50 text-left text-xs uppercase text-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">Nome</th>
                <th scope="col" className="px-4 py-3">E-mail</th>
                <th scope="col" className="px-4 py-3">Perfil</th>
                <th scope="col" className="px-4 py-3">Criado em</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {usuarios.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-3 font-medium text-slate-900">{user.nome}</td>
                  <td className="px-4 py-3 text-slate-700">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        user.role === "admin"
                          ? "inline-block rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-900"
                          : "inline-block rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-800"
                      }
                    >
                      {user.role === "admin" ? "Administrador" : "Corretor"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}