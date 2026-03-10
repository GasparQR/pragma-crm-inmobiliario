import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useWorkspace } from "@/components/context/WorkspaceContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ArrowLeft, UserPlus, Users, Trash2, Crown, User, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";

export default function MiembrosWorkspace() {
  const { workspace } = useWorkspace();
  const queryClient = useQueryClient();
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);

  // Obtener usuario actual
  const { data: currentUser } = useQuery({
    queryKey: ["current-user"],
    queryFn: () => base44.auth.me(),
  });

  // Obtener miembros del workspace
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["workspace-members", workspace?.id],
    queryFn: () => workspace
      ? base44.entities.WorkspaceMember.filter({ workspace_id: workspace.id })
      : [],
    enabled: !!workspace,
  });

  const currentMember = members.find((m) => m.user_id === currentUser?.email);
  const isAdmin = currentMember?.role === "admin";

  const deleteMutation = useMutation({
    mutationFn: (memberId) => base44.entities.WorkspaceMember.delete(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspace?.id] });
      toast.success("Miembro eliminado");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) => base44.entities.WorkspaceMember.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspace?.id] });
      toast.success("Rol actualizado");
    },
  });

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Ingresá un email válido");
      return;
    }
    // Check not already a member
    if (members.some((m) => m.user_id === inviteEmail.trim())) {
      toast.error("Ese usuario ya es miembro del workspace");
      return;
    }

    setInviting(true);
    try {
      // Invitar al usuario a la app
      await base44.users.inviteUser(inviteEmail.trim(), inviteRole === "admin" ? "admin" : "user");

      // Crear registro de membresía para que el usuario tenga acceso al workspace
      await base44.entities.WorkspaceMember.create({
        workspace_id: workspace.id,
        user_id: inviteEmail.trim(),
        role: inviteRole,
      });

      queryClient.invalidateQueries({ queryKey: ["workspace-members", workspace?.id] });
      toast.success(`Invitación enviada a ${inviteEmail}`);
      setInviteEmail("");
      setInviteRole("member");
      setShowInviteDialog(false);
    } catch (err) {
      toast.error("Error al invitar: " + err.message);
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to={createPageUrl("Ajustes")}>
            <Button variant="ghost" className="gap-2 mb-2 -ml-2">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Miembros del Workspace</h1>
              <p className="text-slate-500 mt-1">
                {workspace?.name || "Mi Workspace"} ·{" "}
                {members.length} miembro{members.length !== 1 ? "s" : ""}
              </p>
            </div>
            {isAdmin && (
              <Button onClick={() => setShowInviteDialog(true)} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Invitar
              </Button>
            )}
          </div>
        </div>

        {/* Members list */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" />
              Miembros activos
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              </div>
            ) : members.length === 0 ? (
              <p className="text-slate-400 text-sm py-8 text-center px-6">No hay miembros aún.</p>
            ) : (
              members.map((member) => {
                const isSelf = member.user_id === currentUser?.email;
                const isOwner = member.user_id === workspace?.owner_user_id;

                return (
                  <div key={member.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                        {isOwner
                          ? <Crown className="w-4 h-4 text-amber-500" />
                          : <User className="w-4 h-4 text-slate-500" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{member.user_id}</p>
                        <p className="text-xs text-slate-400">
                          {isSelf && "Vos"}
                          {isOwner && " · Propietario"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAdmin && !isSelf ? (
                        <>
                          <Select
                            value={member.role}
                            onValueChange={(val) =>
                              updateRoleMutation.mutate({ id: member.id, role: val })
                            }
                          >
                            <SelectTrigger className="w-28 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Miembro</SelectItem>
                            </SelectContent>
                          </Select>
                          {!isOwner && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                              onClick={() => deleteMutation.mutate(member.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      ) : (
                        <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                          {member.role === "admin" ? "Admin" : "Miembro"}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {!isAdmin && (
          <p className="text-sm text-slate-400 text-center">
            Solo los administradores pueden invitar o gestionar miembros.
          </p>
        )}

        {/* Invite Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Invitar miembro
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Email del usuario</Label>
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nombre@email.com"
                  type="email"
                  onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                />
              </div>
              <div className="space-y-2">
                <Label>Rol en el workspace</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      Miembro — puede usar el CRM
                    </SelectItem>
                    <SelectItem value="admin">
                      Admin — puede gestionar configuraciones e invitar
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <p className="text-xs text-slate-400">
                El usuario recibirá un email de invitación y al ingresar verá este workspace automáticamente.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleInvite} disabled={inviting} className="gap-2">
                {inviting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <UserPlus className="w-4 h-4" />
                }
                Enviar invitación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}