import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  Button,
  Avatar,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import api from "../helpers/api";
import {
  priorityMeta,
  timeAgo,
  getMyTickets,
  getUnassigned,
  getSLABreaches,
} from "../helpers/ticketHelpers";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const ACCENT = "#2ec8ff";
const PAPER  = "#0f1f3a";
const BORDER = "rgba(143,162,192,0.12)";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name = "") {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

function firstName(fullName) {
  if (!fullName) return "?";
  return fullName.split(" ")[0];
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color, sub, subUp }) {
  return (
    <Card sx={{ flex: 1, p: 2, bgcolor: PAPER, border: `1px solid ${BORDER}`, borderTop: `3px solid ${color}` }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography sx={{ fontSize: 11, color: "#5b6d8a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{label}</Typography>
        <span className="material-symbols-outlined" style={{ fontSize: 18, color }}>{icon}</span>
      </Box>
      <Typography sx={{ fontSize: 28, fontWeight: 700, color, fontFamily: '"Rubik", sans-serif', lineHeight: 1 }}>{value}</Typography>
      {sub && <Typography sx={{ fontSize: 11, color: subUp ? "#2bd48f" : "#8fa2c0", mt: 0.75 }}>{sub}</Typography>}
    </Card>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────
function FilterChip({ label, count, active, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex", alignItems: "center", gap: 0.75,
        px: 1.25, py: 0.5, borderRadius: 999, cursor: "pointer",
        border: `1px solid ${active ? ACCENT : BORDER}`,
        bgcolor: active ? "rgba(46,200,255,0.08)" : "transparent",
        transition: "all .15s",
        "&:hover": { borderColor: ACCENT + "88" },
      }}
    >
      <Typography sx={{ fontSize: 12, fontWeight: active ? 700 : 500, color: active ? ACCENT : "#8fa2c0" }}>{label}</Typography>
      <Box sx={{ px: 0.6, py: 0.05, borderRadius: 999, bgcolor: active ? ACCENT : "#1a2d4a", fontSize: 10.5, fontWeight: 700, color: active ? "#0a1628" : "#5b6d8a" }}>{count}</Box>
    </Box>
  );
}

// ─── Resolution Dialog ────────────────────────────────────────────────────────
function ResolutionDialog({ open, onConfirm, onCancel }) {
  const [notes, setNotes] = useState("");
  const handleConfirm = () => { onConfirm(notes); setNotes(""); };
  const handleCancel  = () => { onCancel();        setNotes(""); };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        sx: { bgcolor: "#0f1f3a", border: "1px solid rgba(143,162,192,0.2)", borderRadius: 2, minWidth: 420 },
      }}
    >
      <DialogTitle sx={{ color: "#e6edf7", fontWeight: 700, pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <span className="material-symbols-outlined" style={{ color: "#2bd48f", fontSize: 20 }}>check_circle</span>
          Resolve Ticket
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "#8fa2c0", fontSize: 13, mb: 2 }}>
          Please provide resolution notes before marking this task as resolved.
        </Typography>
        <TextField
          autoFocus multiline rows={4} fullWidth
          placeholder="Describe how the issue was resolved..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "#e6edf7", fontSize: 13,
              "& fieldset": { borderColor: "rgba(143,162,192,0.2)" },
              "&:hover fieldset": { borderColor: "rgba(143,162,192,0.4)" },
              "&.Mui-focused fieldset": { borderColor: "#2bd48f" },
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button onClick={handleCancel} variant="outlined" sx={{ color: "#8fa2c0", borderColor: "rgba(143,162,192,0.2)" }}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          disabled={!notes.trim()}
          variant="contained"
          color="success"
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>check</span>}
        >
          Resolve
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Ticket Row ───────────────────────────────────────────────────────────────
function TicketRow({ ticket, myId, onClaim, onUpdateStatus, onResolveClick }) {
  const navigate = useNavigate();
  const { color: pColor, label: pLabel } = priorityMeta(ticket.ticket_priority ?? "low");

  // support both field names
  const assignedUserId = ticket.assigned_user_id ?? ticket.assignee_id;
  const isAssignedToMe = assignedUserId === myId;
  const isResolved     = ticket.ticket_status === "resolved";
  const isClaimed      = !!assignedUserId;

  return (
    <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 2, alignItems: "flex-start", "&:last-child": { borderBottom: "none" } }}>
      {/* Priority bar */}
      <Box sx={{ width: 3, alignSelf: "stretch", borderRadius: 999, bgcolor: pColor, flexShrink: 0, mt: 0.25 }} />

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.4 }}>
          <Box sx={{ px: 0.75, py: 0.1, borderRadius: 0.5, fontSize: 10, fontWeight: 700, bgcolor: `${pColor}18`, color: pColor, border: `1px solid ${pColor}33` }}>
            {pLabel.toUpperCase()}
          </Box>
          <Typography sx={{ fontFamily: "monospace", fontSize: 10.5, color: "#3a4f6a" }}>
            #{ticket.ticket_id}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: "#3a4f6a", ml: "auto" }}>
            {timeAgo(ticket.updated_at ?? ticket.created_at)}
          </Typography>
        </Box>

        <Typography
          onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
          sx={{ fontSize: 14, fontWeight: 700, color: "#e6edf7", mb: 0.4, cursor: "pointer", "&:hover": { color: ACCENT } }}
          noWrap
        >
          {ticket.ticket_title}
        </Typography>

        {/* Submitter + assignee first name */}
        <Typography sx={{ fontSize: 12, color: "#8fa2c0" }}>
          {ticket.user_name ?? ticket.user_id ?? "Unknown user"}
          {ticket.assignee_name ? (
            <span> · <span style={{ color: "#6fdcff" }}>↗ {firstName(ticket.assignee_name)}</span></span>
          ) : assignedUserId ? (
            <span> · <span style={{ color: "#6fdcff" }}>↗ {assignedUserId}</span></span>
          ) : (
            <span style={{ color: "#ffb547" }}> · Unassigned</span>
          )}
        </Typography>
      </Box>

      {/* Actions */}
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}>
        {/* Claim — only if unclaimed and not resolved */}
        {!isClaimed && !isResolved && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onClaim(ticket.ticket_id)}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>person_add</span>}
            sx={{ fontSize: 11, py: 0.5, px: 1.5 }}
          >
            Claim
          </Button>
        )}
        {/* Start — only if mine and open */}
        {isAssignedToMe && ticket.ticket_status === "open" && (
          <Button size="small" variant="outlined" onClick={() => onUpdateStatus(ticket.ticket_id, "in_progress")} sx={{ fontSize: 11, py: 0.5 }}>
            Start
          </Button>
        )}
        {/* Resolve — only if mine and in_progress */}
        {isAssignedToMe && ticket.ticket_status === "in_progress" && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => onResolveClick(ticket)}
            startIcon={<span className="material-symbols-outlined" style={{ fontSize: 14 }}>check</span>}
            sx={{ fontSize: 11, py: 0.5 }}
          >
            Resolve
          </Button>
        )}
        {/* Resolved lock indicator */}
        {isResolved && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, px: 1, py: 0.4, borderRadius: 1, bgcolor: "rgba(43,212,143,0.08)", border: "1px solid rgba(43,212,143,0.2)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: 13, color: "#2bd48f" }}>lock</span>
            <Typography sx={{ fontSize: 11, color: "#2bd48f", fontWeight: 600 }}>Resolved</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── Team Pulse Item ──────────────────────────────────────────────────────────
function PulseItem({ ticket }) {
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? "low");
  const fullName   = ticket.assignee_name ?? ticket.assigned_user_id ?? "A TLA";
  const first      = firstName(fullName);
  const initials   = getInitials(fullName);
  const action =
    ticket.ticket_status === "in_progress" ? "is working on"
    : ticket.ticket_status === "resolved"  ? "resolved"
    : "claimed";

  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
      <Avatar sx={{ width: 32, height: 32, fontSize: 11, fontWeight: 700, flexShrink: 0, bgcolor: `${pColor}20`, color: pColor }}>
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: "#e6edf7", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700 }}>{first}</span>{" "}
          {action}{" "}
          <span style={{ fontFamily: "monospace", color: "#5b8ec2", fontSize: 11 }}>
            #{ticket.ticket_id}
          </span>
          {" · "}
          <span style={{ color: "#c8d8ee" }} title={ticket.ticket_title}>
            {ticket.ticket_title?.length > 30 ? ticket.ticket_title.slice(0, 30) + "…" : ticket.ticket_title}
          </span>
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#3a4f6a", mt: 0.25 }}>
          {timeAgo(ticket.updated_at ?? ticket.created_at)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Filters ──────────────────────────────────────────────────────────────────
const FILTERS = [
  { key: "all",        label: "All active"     },
  { key: "mine",       label: "Assigned to me" },
  { key: "unassigned", label: "Unassigned"     },
  { key: "sla",        label: "SLA breach"     },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TLAHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("tf_user") ?? "null");

  const [tickets,       setTickets]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [filter,        setFilter]        = useState("all");
  const [snack,         setSnack]         = useState({ open: false, message: "" });
  const [resolveDialog, setResolveDialog] = useState({ open: false, ticket: null });

  const fetchTickets = async () => {
    try {
      const res     = await api.get("/api/tickets");
      const myDeptId = user?.department_id;
      const filtered = res.data.filter((t) =>
        myDeptId ? t.department_id === myDeptId : true
      );
      setTickets(filtered);
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClaim = async (id) => {
    try {
      await api.patch(`/api/tickets/${id}`, { assignee_id: user.id });
      setSnack({ open: true, message: `Task #${id} claimed successfully!` });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to claim.");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/api/tickets/${id}`, { ticket_status: status });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to update.");
    }
  };

  const handleResolveClick  = (ticket) => setResolveDialog({ open: true, ticket });
  const handleResolveCancel = ()        => setResolveDialog({ open: false, ticket: null });
  const handleResolveConfirm = async (notes) => {
    const { ticket } = resolveDialog;
    setResolveDialog({ open: false, ticket: null });
    try {
      await api.patch(`/api/tickets/${ticket.ticket_id}`, { ticket_status: "resolved", resolution_notes: notes });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to resolve.");
    }
  };

  // Derived
  const active       = tickets.filter((t) => !["resolved", "closed"].includes(t.ticket_status));
  const myTickets    = tickets.filter((t) => (t.assigned_user_id ?? t.assignee_id) === user?.id);
  const unassigned   = getUnassigned(tickets);
  const slaBreaches  = getSLABreaches(tickets);
  const resolvedToday = tickets.filter((t) =>
    t.ticket_status === "resolved" &&
    new Date(t.updated_at).toDateString() === new Date().toDateString()
  );

  // Team pulse — claimed tickets sorted by recency
  const teamPulse = [...tickets]
    .filter((t) => t.assigned_user_id ?? t.assignee_id)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 8);

  const displayed =
    filter === "mine"       ? myTickets
    : filter === "unassigned" ? unassigned
    : filter === "sla"        ? slaBreaches
    : active;

  const filterCounts = {
    all:        active.length,
    mine:       myTickets.length,
    unassigned: unassigned.length,
    sla:        slaBreaches.length,
  };

  const hour     = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 11, color: "#5b6d8a", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", mb: 0.25 }}>
            {greeting}, {user?.name?.split(" ")[0]}
          </Typography>
          <Typography variant="h4" sx={{ color: "#e6edf7", fontFamily: '"Rubik", sans-serif', fontWeight: 700 }}>
            Live operations
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={() => navigate("/tla/board")}
          startIcon={<span className="material-symbols-outlined" style={{ fontSize: 16 }}>view_kanban</span>}
          sx={{ color: "#8fa2c0", borderColor: BORDER, fontSize: 13 }}
        >
          Board
        </Button>
      </Box>

      {/* KPI row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <KpiCard label="Open"           value={active.length}        icon="confirmation_number" color={ACCENT}   sub={`${myTickets.length} assigned to me`} subUp />
        <KpiCard label="Resolved today" value={resolvedToday.length} icon="check_circle"        color="#2bd48f" sub="Today" subUp />
        <KpiCard label="Avg. resolution" value="—"                   icon="timer"               color="#ffb547" sub="No data yet" subUp={false} />
        <KpiCard label="Overdue"        value={slaBreaches.length}   icon="warning"             color="#ff6b6b" sub={slaBreaches.length > 0 ? "Needs attention" : "All on track"} subUp={slaBreaches.length === 0} />
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {/* Main layout */}
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 2.5, alignItems: "start" }}>

        {/* Ticket feed */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}` }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.6, px: 1, py: 0.35, borderRadius: 999, border: "1px solid rgba(43,212,143,0.3)", bgcolor: "rgba(43,212,143,0.07)" }}>
                <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#2bd48f", "@keyframes pulse": { "0%,100%": { boxShadow: "0 0 0 0 rgba(43,212,143,0.4)" }, "50%": { boxShadow: "0 0 0 5px rgba(43,212,143,0)" } }, animation: "pulse 2s ease-in-out infinite" }} />
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#2bd48f" }}>LIVE</Typography>
              </Box>
              <Typography sx={{ fontSize: 10.5, color: "#5b6d8a", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600 }}>Real-time stream</Typography>
            </Box>
            <Typography variant="h6" sx={{ color: "#e6edf7", mb: 1.5 }}>Task feed</Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <FilterChip key={f.key} label={f.label} count={filterCounts[f.key]} active={filter === f.key} onClick={() => setFilter(f.key)} />
              ))}
            </Box>
          </Box>

          {loading && <Box sx={{ p: 6, textAlign: "center" }}><CircularProgress size={28} sx={{ color: ACCENT }} /></Box>}
          {!loading && displayed.length === 0 && (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography sx={{ color: "#2bd48f", fontWeight: 600 }}>✓ All clear</Typography>
              <Typography sx={{ color: "#8fa2c0", fontSize: 13, mt: 0.5 }}>No tasks in this queue.</Typography>
            </Box>
          )}
          {!loading && displayed.map((t) => (
            <TicketRow
              key={t.ticket_id}
              ticket={t}
              myId={user?.id}
              onClaim={handleClaim}
              onUpdateStatus={handleUpdateStatus}
              onResolveClick={handleResolveClick}
            />
          ))}
        </Card>

        {/* Team pulse */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontSize: 10.5, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, mb: 0.25 }}>Activity</Typography>
              <Typography variant="h6" sx={{ color: "#e6edf7" }}>Team pulse</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "#c084fc" }} />
              <Typography sx={{ fontSize: 10.5, color: "#c084fc", fontWeight: 700 }}>LIVE</Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            {loading && <CircularProgress size={20} sx={{ color: "#c084fc" }} />}
            {!loading && teamPulse.length === 0 && (
              <Typography sx={{ color: "#5b6d8a", fontSize: 13 }}>No activity yet.</Typography>
            )}
            {!loading && teamPulse.map((t) => (
              <PulseItem key={t.ticket_id} ticket={t} />
            ))}
          </Box>
        </Card>
      </Box>

      {/* Resolution dialog */}
      <ResolutionDialog
        open={resolveDialog.open}
        onConfirm={handleResolveConfirm}
        onCancel={handleResolveCancel}
      />

      {/* Success snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ open: false, message: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={() => setSnack({ open: false, message: "" })}
          severity="success"
          variant="filled"
          sx={{ bgcolor: "#2bd48f", color: "#0a1628", fontWeight: 700 }}
        >
          {snack.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}