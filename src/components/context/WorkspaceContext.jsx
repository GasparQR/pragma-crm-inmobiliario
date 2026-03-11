import { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null);
  const [workspaceMember, setWorkspaceMember] = useState(null);
  const [workspaceLoading, setWorkspaceLoading] = useState(true);

  useEffect(() => {
    bootstrapWorkspace();
  }, []);

  const bootstrapWorkspace = async () => {
    try {
      const user = await base44.auth.me();
      if (!user) {
        setWorkspaceLoading(false);
        return;
      }

      // Buscar membresías del usuario
      const members = await base44.entities.WorkspaceMember.filter({ user_id: user.email });

      if (members.length > 0) {
        // Preferir el workspace donde el usuario es admin
        const adminMembership = members.find((m) => m.role === "admin") || members[0];
        const workspaces = await base44.entities.Workspace.filter({ id: adminMembership.workspace_id });

        if (workspaces.length > 0) {
          const ws = workspaces[0];
          setWorkspace(ws);
          setWorkspaceMember(adminMembership);

          return;
        }
      }

      // Usuario sin workspace → crear uno y redirigir a onboarding
      const newWorkspace = await base44.entities.Workspace.create({
        name: user.full_name ? `Workspace de ${user.full_name}` : "Mi Workspace",
        owner_user_id: user.email,
        onboarding_completed: false,
      });
      const newMember = await base44.entities.WorkspaceMember.create({
        workspace_id: newWorkspace.id,
        user_id: user.email,
        role: "admin",
      });

      setWorkspace(newWorkspace);
      setWorkspaceMember(newMember);

      // Auto-inicializar con template inmobiliario
      try {
        await base44.functions.invoke("initializeWorkspaceTemplate", {});
      } catch (e) {
        console.warn("Error al inicializar template:", e);
      }
    } catch (err) {
      console.error("Error bootstrapping workspace:", err);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  if (workspaceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Cargando workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaceMember,
        workspaceLoading,
        isAdmin: workspaceMember?.role === "admin",
        refetchWorkspace: bootstrapWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  return useContext(WorkspaceContext);
}