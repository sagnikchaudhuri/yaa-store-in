"use client";

import { useState } from "react";
import {
  Shield, Clock, Key, AlertTriangle, CheckCircle,
  Plus, Edit2, Trash2, Lock,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useToast } from "@/lib/toast";
import { useAuth, ROLE_HIERARCHY } from "@/lib/auth";
import ConfirmModal from "@/components/dashboard/ConfirmModal";
import type { AdminMember, AdminRole } from "@/lib/store";

// ─── Role config ──────────────────────────────────────────────────
// `protected` = preset system role that cannot be renamed or deleted.
// Only Super Admin can create/assign the "admin" role.
const ROLE_CONFIG: Record<AdminRole, {
  label: string; desc: string; color: string; bg: string; perms: string[];
  protected: boolean; // cannot be renamed/deleted — enforced visually and logically
}> = {
  "super-admin": {
    label: "Super Admin",
    desc: "Full access to all features, settings, and admin management",
    color: "oklch(0.47 0.22 22)",
    bg: "oklch(0.47 0.22 22 / 0.10)",
    perms: ["All listings", "All drops", "All support", "Admin management", "Security settings", "API keys"],
    protected: true,
  },
  "admin": {
    label: "Admin",
    desc: "Manage listings, drops, and support. Cannot modify Super Admin or peer Admins.",
    color: "oklch(0.68 0.19 44)",
    bg: "oklch(0.68 0.19 44 / 0.10)",
    perms: ["All listings", "All drops", "All support", "Community", "Analytics"],
    protected: true,
  },
  "support": {
    label: "Support Staff",
    desc: "Handle customer support tickets only",
    color: "oklch(0.55 0.22 280)",
    bg: "oklch(0.55 0.22 280 / 0.10)",
    perms: ["View listings", "Support inbox", "Ticket replies"],
    protected: false,
  },
  "content": {
    label: "Content Manager",
    desc: "Create and edit listings, manage drops — no financial or support access",
    color: "oklch(0.64 0.14 160)",
    bg: "oklch(0.64 0.14 160 / 0.10)",
    perms: ["Listings CRUD", "Drops management", "Community", "Analytics"],
    protected: false,
  },
};

function RoleBadge({ role }: { role: AdminRole }) {
  const cfg = ROLE_CONFIG[role];
  return (
    <span className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

// ─── Add admin modal ──────────────────────────────────────────────
// Role dropdown is filtered to only show roles the current user has
// authority to assign (canManageRole).  Super Admin sees all four;
// Admin sees support + content only.
function AddAdminModal({ onClose, onSave }: { onClose: () => void; onSave: (m: AdminMember) => void }) {
  const { canManageRole } = useAuth();

  // Build the list of assignable roles for this user, respecting hierarchy.
  const assignableRoles = (Object.entries(ROLE_CONFIG) as Array<[AdminRole, typeof ROLE_CONFIG[AdminRole]]>)
    .filter(([key]) => canManageRole(key as AdminRole));

  // Default to the highest role the current user can assign
  const defaultRole = (assignableRoles[0]?.[0] ?? "support") as AdminRole;

  const [form, setForm] = useState({ name: "", email: "", role: defaultRole });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({
      id: `a${Date.now()}`,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: "active",
      joinedAt: "Just now",
      lastSeen: "Just now",
      avatar: form.name.trim()[0].toUpperCase(),
    });
  }

  const inputClass = "w-full border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm border overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
        <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
          <h2 className="font-heading font-black text-lg text-foreground">Add Admin Member</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-muted-foreground">✕</button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Full Name *</label>
            <input className={inputClass} style={{ borderColor: errors.name ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)" }} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Amira D." />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Email *</label>
            <input type="email" className={inputClass} style={{ borderColor: errors.email ? "oklch(0.47 0.22 22)" : "oklch(0.88 0.015 80)" }} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="name@yaa-store.com" />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1.5">Role</label>
            {assignableRoles.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">No assignable roles available for your permission level.</p>
            ) : (
              <>
                <select className={`${inputClass} bg-white`} style={{ borderColor: "oklch(0.88 0.015 80)" }} value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value as AdminRole }))}>
                  {assignableRoles.map(([key, cfg]) => (
                    <option key={key} value={key}>{cfg.label}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1.5">{ROLE_CONFIG[form.role]?.desc}</p>
              </>
            )}
          </div>
        </div>
        <div className="px-6 py-4 flex gap-3 justify-end" style={{ borderTop: "1px solid oklch(0.92 0.015 80)", background: "oklch(0.98 0.006 78)" }}>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-semibold border hover:bg-gray-50" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Cancel</button>
          <button onClick={handleSubmit} disabled={assignableRoles.length === 0} className="px-5 py-2 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: "oklch(0.68 0.19 44)" }}>Add Member</button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────
export default function SecurityPage() {
  const { state, dispatch } = useStore();
  const { addToast }        = useToast();
  const { can, canManageRole, currentUser } = useAuth();
  const canManageAdmins = can("manage_admins"); // super-admin only
  const { admins, activityLog, sessionTimeout } = state;

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [confirmRemove,   setConfirmRemove]   = useState<string | null>(null);
  const [editRoleId,      setEditRoleId]      = useState<string | null>(null);
  const [timeout,         setTimeout_]        = useState(sessionTimeout);
  const [timeoutSaved,    setTimeoutSaved]    = useState(false);
  const [logPage,         setLogPage]         = useState(0);
  // Mock password change
  const [showPwChange,    setShowPwChange]    = useState(false);
  const [pwForm,          setPwForm]          = useState({ current: "", next: "", confirm: "" });
  const [pwError,         setPwError]         = useState("");
  const LOG_PER_PAGE = 8;

  function handleAddAdmin(member: AdminMember) {
    dispatch({ type: "ADMIN_CREATE", payload: member });
    dispatch({ type: "LOG_ADD", payload: { action: "Admin added", details: `${member.name} invited as ${ROLE_CONFIG[member.role].label}`, time: "Just now", severity: "info" } });
    addToast(`${member.name} added as ${ROLE_CONFIG[member.role].label}`, "success");
    setShowAddModal(false);
  }

  function handleRoleChange(id: string, role: AdminRole) {
    const admin = admins.find(a => a.id === id);
    dispatch({ type: "ADMIN_UPDATE_ROLE", payload: { id, role } });
    dispatch({ type: "LOG_ADD", payload: { action: "Role changed", details: `${admin?.name} → ${ROLE_CONFIG[role].label}`, time: "Just now", severity: "info" } });
    addToast(`${admin?.name}'s role updated to ${ROLE_CONFIG[role].label}`, "success");
    setEditRoleId(null);
  }

  function handleStatusToggle(id: string) {
    const admin = admins.find(a => a.id === id);
    if (!admin) return;
    const newStatus = admin.status === "active" ? "inactive" : "active";
    dispatch({ type: "ADMIN_UPDATE_STATUS", payload: { id, status: newStatus } });
    dispatch({ type: "LOG_ADD", payload: { action: "Admin status changed", details: `${admin.name} → ${newStatus}`, time: "Just now", severity: newStatus === "inactive" ? "warning" : "info" } });
    addToast(`${admin.name} ${newStatus === "active" ? "re-activated" : "deactivated"}`, newStatus === "active" ? "success" : "warning");
  }

  function handleRemove(id: string) {
    const admin = admins.find(a => a.id === id);
    dispatch({ type: "LOG_ADD", payload: { action: "Admin removed", details: `${admin?.name} removed from team`, time: "Just now", severity: "warning" } });
    dispatch({ type: "ADMIN_DELETE", payload: id });
    addToast(`${admin?.name} has been removed`, "warning");
    setConfirmRemove(null);
  }

  function handlePasswordChange() {
    setPwError("");
    if (!pwForm.current.trim()) { setPwError("Current password required"); return; }
    if (pwForm.next.length < 6) { setPwError("New password must be at least 6 characters"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Passwords do not match"); return; }
    dispatch({ type: "LOG_ADD", payload: { action: "Password changed", details: `${currentUser?.name} updated their credentials`, time: "Just now", severity: "info" } });
    addToast("Password updated successfully", "success");
    setPwForm({ current: "", next: "", confirm: "" });
    setShowPwChange(false);
  }

  function handleSaveTimeout() {
    dispatch({ type: "SESSION_TIMEOUT_SET", payload: timeout });
    dispatch({ type: "LOG_ADD", payload: { action: "Session timeout changed", details: `Set to ${timeout} minutes`, time: "Just now", severity: "info" } });
    addToast(`Session timeout set to ${timeout} minutes`, "success");
    setTimeoutSaved(true);
    setTimeout(() => setTimeoutSaved(false), 2500);
  }

  const paginatedLog = activityLog.slice(logPage * LOG_PER_PAGE, (logPage + 1) * LOG_PER_PAGE);
  const totalLogPages = Math.ceil(activityLog.length / LOG_PER_PAGE);

  const SEVERITY_CONFIG = {
    info:     { bg: "oklch(0.64 0.14 160 / 0.10)", color: "oklch(0.40 0.12 160)", dot: "bg-green-400"  },
    warning:  { bg: "oklch(0.68 0.19 44 / 0.10)",  color: "oklch(0.52 0.20 38)",  dot: "bg-amber-400"  },
    critical: { bg: "oklch(0.47 0.22 22 / 0.10)",  color: "oklch(0.47 0.22 22)",  dot: "bg-red-400"    },
  };

  return (
    <>
      {showAddModal && <AddAdminModal onClose={() => setShowAddModal(false)} onSave={handleAddAdmin} />}
      {confirmRemove && (
        <ConfirmModal
          title="Remove admin member?"
          message="This member will lose access to the dashboard immediately. This action is logged."
          confirmLabel="Remove Access"
          danger
          onConfirm={() => handleRemove(confirmRemove)}
          onCancel={() => setConfirmRemove(null)}
        />
      )}

      <div className="p-6 lg:p-8 max-w-[1400px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.68 0.19 44)" }}>Access Control</p>
            <h1 className="font-heading font-black text-3xl md:text-4xl text-foreground mt-0.5 leading-tight">Security</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {admins.filter(a => a.status === "active").length} active members · session timeout {sessionTimeout}m
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl" style={{ background: "oklch(0.64 0.14 160 / 0.10)", color: "oklch(0.40 0.12 160)" }}>
            <Shield className="h-4 w-4" />
            Security active
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-4">
          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Admin members */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Admin Members</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{admins.length} members · {admins.filter(a => a.status === "active").length} active</p>
                </div>
                {canManageAdmins && (
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90 transition-opacity"
                    style={{ background: "oklch(0.68 0.19 44)" }}
                  >
                    <Plus className="h-3.5 w-3.5" />Add Member
                  </button>
                )}
              </div>

              <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
                {admins.map(admin => (
                  <div key={admin.id} className="flex items-center gap-4 px-6 py-4">
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                      style={{ background: admin.status === "active" ? "oklch(0.68 0.19 44)" : "oklch(0.80 0.03 260)" }}
                    >
                      {admin.avatar}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-bold text-foreground">{admin.name}</p>
                        {admin.status === "inactive" && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "oklch(0.75 0.04 260 / 0.15)", color: "oklch(0.52 0.05 260)" }}>Inactive</span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">{admin.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-muted-foreground">Joined {admin.joinedAt} · Last seen {admin.lastSeen}</p>
                      </div>
                    </div>
                    {/* Role selector or badge */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {editRoleId === admin.id ? (
                        <select
                          autoFocus
                          className="border rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
                          style={{ borderColor: "oklch(0.88 0.015 80)" }}
                          value={admin.role}
                          onChange={e => handleRoleChange(admin.id, e.target.value as AdminRole)}
                          onBlur={() => setEditRoleId(null)}
                        >
                          {/* Only show roles the current user has authority to assign,
                              plus the member's current role so the dropdown isn't blank */}
                          {(Object.entries(ROLE_CONFIG) as Array<[AdminRole, typeof ROLE_CONFIG[AdminRole]]>)
                            .filter(([key]) => canManageRole(key as AdminRole) || key === admin.role)
                            .map(([key, cfg]) => (
                              <option key={key} value={key}>{cfg.label}{cfg.protected ? " 🔒" : ""}</option>
                            ))}
                        </select>
                      ) : (
                        <RoleBadge role={admin.role} />
                      )}

                      {/* Controls — shown only when current user outranks the member */}
                      {canManageRole(admin.role) ? (
                        <>
                          <button
                            onClick={() => setEditRoleId(editRoleId === admin.id ? null : admin.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground"
                            title="Change role"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusToggle(admin.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                            title={admin.status === "active" ? "Deactivate" : "Re-activate"}
                            style={{ color: admin.status === "active" ? "oklch(0.40 0.12 160)" : "oklch(0.52 0.05 260)" }}
                          >
                            {admin.status === "active" ? <CheckCircle className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
                          </button>
                          <button
                            onClick={() => setConfirmRemove(admin.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-red-400"
                            title="Remove member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        /* Member is at or above current user's level — show lock */
                        <div
                          className="p-1.5 rounded-lg cursor-default"
                          title={ROLE_CONFIG[admin.role].protected
                            ? "Protected role — only Super Admin can modify"
                            : "You cannot manage members at or above your own level"}
                        >
                          <Lock className="h-3.5 w-3.5 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Role permissions reference */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Role Permissions</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">🔒 Protected roles cannot be renamed or deleted</p>
                </div>
              </div>
              <div className="p-4 grid sm:grid-cols-2 gap-3">
                {(Object.entries(ROLE_CONFIG) as Array<[AdminRole, typeof ROLE_CONFIG[AdminRole]]>).map(([key, cfg]) => (
                  <div key={key} className="p-4 rounded-xl border relative" style={{ borderColor: "oklch(0.90 0.012 80)", background: cfg.bg }}>
                    {/* Protected badge */}
                    {cfg.protected && (
                      <div
                        className="absolute top-3 right-3 flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full"
                        style={{ background: cfg.color + "20", color: cfg.color }}
                      >
                        <Lock className="h-2.5 w-2.5" />
                        Protected
                      </div>
                    )}
                    <p className="text-sm font-black pr-16" style={{ color: cfg.color }}>{cfg.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 mb-2.5">{cfg.desc}</p>
                    <ul className="space-y-1">
                      {cfg.perms.map(p => (
                        <li key={p} className="text-[11px] flex items-center gap-1.5" style={{ color: "oklch(0.40 0.05 260)" }}>
                          <CheckCircle className="h-3 w-3 flex-shrink-0" style={{ color: cfg.color }} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity log */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Activity Log</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{activityLog.length} entries recorded</p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "oklch(0.64 0.14 160 / 0.10)", color: "oklch(0.40 0.12 160)" }}>
                  Live
                </span>
              </div>
              <div className="divide-y" style={{ borderColor: "oklch(0.94 0.010 78)" }}>
                {paginatedLog.map(entry => {
                  const cfg = SEVERITY_CONFIG[entry.severity];
                  return (
                    <div key={entry.id} className="flex items-start gap-3 px-6 py-3.5" style={{ background: cfg.bg }}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${cfg.dot}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: cfg.color }}>{entry.action}</p>
                        <p className="text-[11px] text-foreground mt-0.5">{entry.details}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{entry.time}</span>
                    </div>
                  );
                })}
              </div>
              {totalLogPages > 1 && (
                <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid oklch(0.92 0.015 80)" }}>
                  <p className="text-xs text-muted-foreground">{logPage * LOG_PER_PAGE + 1}–{Math.min((logPage + 1) * LOG_PER_PAGE, activityLog.length)} of {activityLog.length}</p>
                  <div className="flex gap-2">
                    <button disabled={logPage === 0} onClick={() => setLogPage(p => p - 1)} className="text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Prev</button>
                    <button disabled={logPage === totalLogPages - 1} onClick={() => setLogPage(p => p + 1)} className="text-xs font-bold px-3 py-1.5 rounded-lg border disabled:opacity-40 hover:bg-gray-50" style={{ borderColor: "oklch(0.88 0.015 80)" }}>Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Session timeout */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Session Timeout</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Automatically log out inactive admin sessions after the specified period. Shorter timeouts are more secure.
                </p>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-foreground">Timeout duration</label>
                    <span className="text-sm font-black" style={{ color: "oklch(0.68 0.19 44)" }}>{timeout} min</span>
                  </div>
                  <input
                    type="range" min="15" max="480" step="15"
                    value={timeout}
                    onChange={e => setTimeout_(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>15m</span><span>1h</span><span>2h</span><span>4h</span><span>8h</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[30, 60, 120].map(t => (
                    <button key={t} onClick={() => setTimeout_(t)}
                      className="py-2 rounded-xl border text-xs font-bold transition-all"
                      style={{ borderColor: timeout === t ? "oklch(0.68 0.19 44)" : "oklch(0.88 0.015 80)", background: timeout === t ? "oklch(0.68 0.19 44 / 0.08)" : "transparent", color: timeout === t ? "oklch(0.52 0.20 38)" : "oklch(0.48 0.05 260)" }}
                    >
                      {t < 60 ? `${t}m` : `${t / 60}h`}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSaveTimeout}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: timeoutSaved ? "oklch(0.40 0.12 160)" : "oklch(0.68 0.19 44)" }}
                >
                  {timeoutSaved ? <><CheckCircle className="h-4 w-4" />Saved!</> : "Save Timeout Setting"}
                </button>
              </div>
            </div>

            {/* My credentials (mock password change) */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">My Credentials</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: "oklch(0.68 0.19 44)" }}
                  >
                    {currentUser?.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{currentUser?.name}</p>
                    <p className="text-[11px] text-muted-foreground">{currentUser?.email}</p>
                  </div>
                </div>
                {showPwChange ? (
                  <div className="space-y-2.5 pt-1">
                    {pwError && (
                      <p className="text-xs text-red-500 font-medium px-3 py-2 rounded-lg bg-red-50">{pwError}</p>
                    )}
                    {(["current", "next", "confirm"] as const).map((field) => (
                      <div key={field}>
                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground block mb-1">
                          {field === "current" ? "Current password" : field === "next" ? "New password" : "Confirm new password"}
                        </label>
                        <input
                          type="password"
                          className="w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          style={{ borderColor: "oklch(0.88 0.015 80)" }}
                          placeholder={field === "current" ? "Any value (demo mode)" : "Min 6 characters"}
                          value={pwForm[field]}
                          onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                        />
                      </div>
                    ))}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={handlePasswordChange}
                        className="flex-1 py-2 rounded-xl text-xs font-bold text-white hover:opacity-90"
                        style={{ background: "oklch(0.68 0.19 44)" }}
                      >Update Password</button>
                      <button
                        onClick={() => { setShowPwChange(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); }}
                        className="flex-1 py-2 rounded-xl text-xs font-bold border hover:bg-gray-50"
                        style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
                      >Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPwChange(true)}
                    className="w-full py-2.5 rounded-xl text-xs font-bold border hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    style={{ borderColor: "oklch(0.88 0.015 80)", color: "oklch(0.48 0.05 260)" }}
                  >
                    <Key className="h-3.5 w-3.5" />
                    Change Password
                  </button>
                )}
              </div>
            </div>

            {/* Security summary */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: "oklch(0.88 0.015 80)" }}>
              <div className="px-5 py-4" style={{ borderBottom: "1px solid oklch(0.92 0.015 80)" }}>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-muted-foreground">Security Health</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Admin accounts",     value: `${admins.filter(a => a.status === "active").length} active`,    good: true  },
                  { label: "Session timeout",    value: `${sessionTimeout}m`,                                             good: sessionTimeout <= 120 },
                  { label: "Activity logging",   value: "Enabled",                                                        good: true  },
                  { label: "API key status",     value: "Valid · Expiring in 31d",                                        good: false },
                  { label: "Two-factor auth",    value: "Supabase auth (coming soon)",                                    good: false },
                ].map(({ label, value, good }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <span className="text-xs font-bold flex items-center gap-1.5" style={{ color: good ? "oklch(0.40 0.12 160)" : "oklch(0.52 0.20 38)" }}>
                      {good ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
