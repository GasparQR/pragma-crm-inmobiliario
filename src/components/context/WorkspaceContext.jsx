import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setWorkspaceLoading(false);
        return;
      }

      const { data: wid, error: rpcErr } = await supabase.rpc("ensure_workspace");
      if (rpcErr) throw rpcErr;

      const { data: ws, error: wsErr } = await supabase.from("workspaces").select("*").eq("id", wid).single();
      if (wsErr) throw wsErr;
      setWorkspace(ws);

      const { data: mem } = await supabase
        .from("workspace_members")
        .select("*")
        .eq("workspace_id", wid)
        .eq("user_id", user.id)
        .maybeSingle();
      setWorkspaceMember(mem || null);
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
