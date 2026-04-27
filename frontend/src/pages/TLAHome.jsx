import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import api from "../helpers/api";
import {
  getMyTickets,
  getUnassigned,
  getSLABreaches,
  statusMeta,
  priorityMeta,
  timeAgo,
} from "../helpers/ticketHelpers";

const ACCENT = "#2ec8ff";
const PAPER = "#0f1f3a";
const PAPER2 = "#080f1e";
const BORDER = "rgba(143,162,192,0.12)";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getPriorityChipColor(priority) {
  const map = {
    urgent: "#ff6b6b",
    high: "#ffb547",
    medium: "#6fdcff",
    low: "#8fa2c0",
  };
  return map[priority] ?? "#8fa2c0";
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color, sub, subUp }) {
  return (
    <Card
      sx={{
        flex: 1,
        p: 2.5,
        bgcolor: PAPER,
        border: `1px solid ${BORDER}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          bgcolor: color,
        }}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1.5,
        }}
      >
        <Typography
          sx={{
            fontSize: 11,
            color: "#8fa2c0",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            display: "grid",
            placeItems: "center",
            bgcolor: `${color}15`,
            color,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            {icon}
          </span>
        </Box>
      </Box>
      <Typography
        sx={{
          fontFamily: '"Rubik", sans-serif',
          fontSize: 36,
          fontWeight: 700,
          color: "#e6edf7",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}>
          <span
            className="material-symbols-outlined"
            style={{ fontSize: 13, color: subUp ? "#2bd48f" : "#ff6b6b" }}
          >
            {subUp ? "trending_up" : "trending_down"}
          </span>
          <Typography sx={{ fontSize: 11.5, color: "#5b6d8a" }}>
            {sub}
          </Typography>
        </Box>
      )}
    </Card>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, count, active, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.75,
        px: 1.5,
        py: 0.6,
        borderRadius: 999,
        cursor: "pointer",
        border: `1px solid ${active ? ACCENT : BORDER}`,
        bgcolor: active ? "rgba(46,200,255,0.1)" : "transparent",
        transition: "all .15s",
        "&:hover": {
          border: `1px solid ${ACCENT}`,
          bgcolor: "rgba(46,200,255,0.07)",
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: active ? 700 : 500,
          color: active ? ACCENT : "#8fa2c0",
        }}
      >
        {label}
      </Typography>
      {count !== undefined && (
        <Box
          sx={{
            px: 0.75,
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 700,
            bgcolor: active ? ACCENT : "rgba(143,162,192,0.15)",
            color: active ? "#061224" : "#8fa2c0",
          }}
        >
          {count}
        </Box>
      )}
    </Box>
  );
}

// ─── Ticket row ───────────────────────────────────────────────────────────────

function TicketRow({ ticket, myId, onClaim, onUpdateStatus }) {
  const navigate = useNavigate();
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? "low");
  const isAssignedToMe = ticket.assignee_id === myId;
  const priorityColor = getPriorityChipColor(ticket.ticket_priority);
  const initials = getInitials(ticket.user_name ?? ticket.user_id ?? "??");

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${BORDER}`,
        position: "relative",
        "&:hover": { bgcolor: "rgba(46,200,255,0.02)" },
      }}
    >
      {/* Priority left bar */}
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: 2,
          bgcolor: pColor,
        }}
      />

      {/* Avatar */}
      <Avatar
        sx={{
          width: 36,
          height: 36,
          fontSize: 12,
          fontWeight: 700,
          bgcolor: `${pColor}22`,
          color: pColor,
          flexShrink: 0,
          ml: 0.5,
        }}
      >
        {initials}
      </Avatar>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Top row — chips + time */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 0.5,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "#5b8ec2",
              fontWeight: 600,
            }}
          >
            {ticket.ticket_id}
          </Typography>

          {/* Priority chip */}
          {ticket.ticket_priority && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 0.75,
                fontSize: 10,
                fontWeight: 700,
                bgcolor: `${priorityColor}20`,
                color: priorityColor,
                border: `1px solid ${priorityColor}44`,
              }}
            >
              {ticket.ticket_priority.toUpperCase()}
            </Box>
          )}

          {/* Status chip */}
          <Box
            sx={{
              px: 0.75,
              py: 0.1,
              borderRadius: 0.75,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: `${sColor}18`,
              color: sColor,
              border: `1px solid ${sColor}44`,
            }}
          >
            {sLabel.toUpperCase()}
          </Box>

          {/* Department */}
          {ticket.department_name && (
            <Box
              sx={{
                px: 0.75,
                py: 0.1,
                borderRadius: 0.75,
                fontSize: 10,
                fontWeight: 600,
                bgcolor: "rgba(46,200,255,0.1)",
                color: "#6fdcff",
                border: "1px solid rgba(46,200,255,0.2)",
              }}
            >
              · {ticket.department_name}
            </Box>
          )}

          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: "#5b6d8a" }}>
            {timeAgo(ticket.updated_at ?? ticket.created_at)}
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
          sx={{
            fontSize: 14,
            fontWeight: 700,
            color: "#e6edf7",
            mb: 0.4,
            cursor: "pointer",
            "&:hover": { color: ACCENT },
          }}
          noWrap
        >
          {ticket.ticket_title}
        </Typography>

        {/* Submitter */}
        <Typography sx={{ fontSize: 12, color: "#8fa2c0" }}>
          {ticket.user_id ?? "Unknown user"}
          {ticket.assignee_id && (
            <span>
              {" "}
              · <span style={{ color: "#6fdcff" }}>↗ {ticket.assignee_id}</span>
            </span>
          )}
          {!ticket.assignee_id && (
            <span style={{ color: "#ffb547" }}> · Unassigned</span>
          )}
        </Typography>
      </Box>

      {/* Action buttons */}
      <Box
        sx={{ display: "flex", gap: 1, flexShrink: 0, alignItems: "center" }}
      >
        {!ticket.assignee_id && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onClaim(ticket.ticket_id)}
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                person_add
              </span>
            }
            sx={{ fontSize: 11, py: 0.5, px: 1.5 }}
          >
            Claim
          </Button>
        )}
        {isAssignedToMe && ticket.ticket_status === "open" && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onUpdateStatus(ticket.ticket_id, "in_progress")}
            sx={{ fontSize: 11, py: 0.5 }}
          >
            Start
          </Button>
        )}
        {isAssignedToMe && ticket.ticket_status === "in_progress" && (
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => onUpdateStatus(ticket.ticket_id, "resolved")}
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 14 }}
              >
                check
              </span>
            }
            sx={{ fontSize: 11, py: 0.5 }}
          >
            Resolve
          </Button>
        )}
      </Box>
    </Box>
  );
}

// ─── Team pulse item ──────────────────────────────────────────────────────────

function PulseItem({ ticket, tlaName }) {
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? "low");
  const initials = getInitials(tlaName ?? ticket.assignee_id ?? "??");
  const action =
    ticket.ticket_status === "in_progress"
      ? "is working on"
      : ticket.ticket_status === "resolved"
        ? "resolved"
        : "claimed";

  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 2 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          bgcolor: `${pColor}20`,
          color: pColor,
        }}
      >
        {initials}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 12.5, color: "#e6edf7", lineHeight: 1.5 }}>
          <span style={{ fontWeight: 700 }}>
            {tlaName ?? ticket.assignee_id ?? "A TLA"}
          </span>{" "}
          {action}{" "}
          <span
            style={{ fontFamily: "monospace", color: "#5b8ec2", fontSize: 11 }}
          >
            {ticket.ticket_id}
          </span>
          {" · "}
          <span style={{ color: "#c8d8ee" }} title={ticket.ticket_title}>
            {ticket.ticket_title?.length > 30
              ? ticket.ticket_title.slice(0, 30) + "…"
              : ticket.ticket_title}
          </span>
        </Typography>
        <Typography sx={{ fontSize: 11, color: "#3a4f6a", mt: 0.25 }}>
          {timeAgo(ticket.updated_at ?? ticket.created_at)}
        </Typography>
      </Box>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all", label: "All active" },
  { key: "mine", label: "Assigned to me" },
  { key: "unassigned", label: "Unassigned" },
  { key: "sla", label: "SLA breach" },
];

export default function TLAHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("tf_user") ?? "null");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const fetchTickets = async () => {
    try {
      const res = await api.get("/api/tickets");
      const myDeptId = user?.department_id;
      console.log("Fetched tickets:", res.data);
      const filtered = res.data.filter((t) =>
        myDeptId ? t.department_id === myDeptId : true,
      );
      console.log("Filtered tickets for department_id", myDeptId, ":", filtered);
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

  // Derived data
  const active = tickets.filter(
    (t) => !["resolved", "closed"].includes(t.ticket_status),
  );
  const myTickets = getMyTickets(tickets, user?.id);
  const unassigned = getUnassigned(tickets);
  const slaBreaches = getSLABreaches(tickets);
  const resolvedToday = tickets.filter((t) => {
    if (t.ticket_status !== "resolved") return false;
    return new Date(t.updated_at).toDateString() === new Date().toDateString();
  });

  // Team pulse — assigned tickets sorted by updated_at
  const teamPulse = [...tickets]
    .filter((t) => t.assignee_id)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .slice(0, 6);

  // Filtered display
  const displayed =
    filter === "mine"
      ? myTickets
      : filter === "unassigned"
        ? unassigned
        : filter === "sla"
          ? slaBreaches
          : active;

  const filterCounts = {
    all: active.length,
    mine: myTickets.length,
    unassigned: unassigned.length,
    sla: slaBreaches.length,
  };

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 11,
              color: "#5b6d8a",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 0.25,
            }}
          >
            {greeting}, {user?.name?.split(" ")[0]}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: "#e6edf7",
              fontFamily: '"Rubik", sans-serif',
              fontWeight: 700,
            }}
          >
            Live operations
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/tla/board")}
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 16 }}
              >
                view_kanban
              </span>
            }
            sx={{ color: "#8fa2c0", borderColor: BORDER, fontSize: 13 }}
          >
            Board
          </Button>
        </Box>
      </Box>

      {/* KPI row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <KpiCard
          label="Open"
          value={active.length}
          icon="confirmation_number"
          color={ACCENT}
          sub={`${myTickets.length} assigned to me`}
          subUp
        />
        <KpiCard
          label="Resolved today"
          value={resolvedToday.length}
          icon="check_circle"
          color="#2bd48f"
          sub="Today"
          subUp
        />
        <KpiCard
          label="Avg. resolution"
          value="—"
          icon="timer"
          color="#ffb547"
          sub="No data yet"
          subUp={false}
        />
        <KpiCard
          label="Overdue"
          value={slaBreaches.length}
          icon="warning"
          color="#ff6b6b"
          sub={slaBreaches.length > 0 ? "Needs attention" : "All on track"}
          subUp={slaBreaches.length === 0}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main two-column layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 320px",
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Left — Ticket feed */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          {/* Feed header */}
          <Box sx={{ p: 2, borderBottom: `1px solid ${BORDER}` }}>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}
            >
              {/* Live dot */}
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  border: "1px solid rgba(43,212,143,0.3)",
                  bgcolor: "rgba(43,212,143,0.07)",
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#2bd48f",
                    "@keyframes pulse": {
                      "0%,100%": { boxShadow: "0 0 0 0 rgba(43,212,143,0.4)" },
                      "50%": { boxShadow: "0 0 0 5px rgba(43,212,143,0)" },
                    },
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <Typography
                  sx={{ fontSize: 10, fontWeight: 700, color: "#2bd48f" }}
                >
                  LIVE
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#5b6d8a",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                }}
              >
                Real-time stream
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: "#e6edf7", mb: 1.5 }}>
              Ticket feed
            </Typography>

            {/* Filter chips */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              {FILTERS.map((f) => (
                <FilterChip
                  key={f.key}
                  label={f.label}
                  count={filterCounts[f.key]}
                  active={filter === f.key}
                  onClick={() => setFilter(f.key)}
                />
              ))}
            </Box>
          </Box>

          {/* Ticket list */}
          {loading && (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <CircularProgress size={28} sx={{ color: ACCENT }} />
            </Box>
          )}
          {!loading && displayed.length === 0 && (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Typography sx={{ color: "#2bd48f", fontWeight: 600 }}>
                ✓ All clear
              </Typography>
              <Typography sx={{ color: "#8fa2c0", fontSize: 13, mt: 0.5 }}>
                No tickets in this queue.
              </Typography>
            </Box>
          )}
          {!loading &&
            displayed.map((t) => (
              <TicketRow
                key={t.ticket_id}
                ticket={t}
                myId={user?.id}
                onClaim={handleClaim}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
        </Card>

        {/* Right — Team pulse */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          <Box
            sx={{
              p: 2,
              borderBottom: `1px solid ${BORDER}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 10.5,
                  color: "#c084fc",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  mb: 0.25,
                }}
              >
                Activity
              </Typography>
              <Typography variant="h6" sx={{ color: "#e6edf7" }}>
                Team pulse
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#c084fc",
                }}
              />
              <Typography
                sx={{ fontSize: 10.5, color: "#c084fc", fontWeight: 700 }}
              >
                LIVE
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 2 }}>
            {loading && (
              <CircularProgress size={20} sx={{ color: "#c084fc" }} />
            )}
            {!loading && teamPulse.length === 0 && (
              <Typography sx={{ color: "#5b6d8a", fontSize: 13 }}>
                No activity yet.
              </Typography>
            )}
            {!loading &&
              teamPulse.map((t) => (
                <PulseItem
                  key={t.ticket_id}
                  ticket={t}
                  tlaName={t.assignee_id}
                />
              ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
