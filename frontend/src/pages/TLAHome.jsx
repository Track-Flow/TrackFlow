import { useState, useEffect } from "react";
import {
  Box,
  Card,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import api from "../helpers/api";
import {
  getMyTickets,
  getUnassigned,
  statusMeta,
  priorityMeta,
  timeAgo,
} from "../helpers/ticketHelpers";

const ACCENT = "#2ec8ff";
const PAPER = "#0f1f3a";
const BORDER = "rgba(143,162,192,0.12)";

function KpiCard({ label, value, color = ACCENT }) {
  return (
    <Card
      sx={{
        p: 2,
        flex: 1,
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
      <Typography
        sx={{
          fontSize: 11,
          color: "#8fa2c0",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          fontWeight: 600,
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Rubik", sans-serif',
          fontSize: 30,
          fontWeight: 700,
          color: "#e6edf7",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
    </Card>
  );
}



function TicketRow({ ticket, myId, onClaim, onUpdateStatus }) {
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? "low");
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  const isAssignedToMe = ticket.assignee_id === myId;

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${BORDER}`,
        "&:hover": { bgcolor: "rgba(46,200,255,0.03)" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          left: 0,
          top: 8,
          bottom: 8,
          width: 3,
          borderRadius: 2,
          bgcolor: pColor,
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0, pl: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.25,
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{ fontFamily: "monospace", fontSize: 11, color: "#5b8ec2" }}
          >
            {ticket.ticket_id}
          </Typography>
          <Box
            sx={{
              px: 0.75,
              py: 0.15,
              borderRadius: 0.75,
              fontSize: 10,
              fontWeight: 700,
              bgcolor: `${sColor}18`,
              color: sColor,
              border: `1px solid ${sColor}44`,
            }}
          >
            {sLabel}
          </Box>
          <Box sx={{ flex: 1 }} />
          <Typography sx={{ fontSize: 11, color: "#5b6d8a" }}>
            {timeAgo(ticket.updated_at)}
          </Typography>
        </Box>
        <Typography
          sx={{ fontSize: 13.5, fontWeight: 600, color: "#e6edf7" }}
          noWrap
        >
          {ticket.ticket_title}
        </Typography>
       <Typography sx={{ fontSize: 12, color: '#8fa2c0' }}>
  {ticket.assignee_id ? `Assigned · ${ticket.assignee_id}` : 'Unassigned'}
</Typography>

      </Box>
      <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
        {!ticket.assignee_id && (
          <Button
            size="small"
            variant="contained"
            onClick={() => onClaim(ticket.ticket_id)}
            sx={{ fontSize: 11, py: 0.4 }}
          >
            Claim
          </Button>
        )}
        {isAssignedToMe && ticket.ticket_status === "open" && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onUpdateStatus(ticket.ticket_id, "in_progress")}
            sx={{ fontSize: 11, py: 0.4 }}
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
            sx={{ fontSize: 11, py: 0.4 }}
          >
            Resolve
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default function TLAHome() {
  const user = JSON.parse(localStorage.getItem("tf_user") ?? "null");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("unassigned");
  const API_BASE = "http://localhost:3000";

  const fetchTickets = async () => {
    try {
      const res = await api.get(`${API_BASE}/api/tickets`);
      setTickets(res.data);
      console.log("Fetched tickets:", res.data); // add this line to log the fetched tickets
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 30000); // refresh every 30s
    return () => clearInterval(interval); // cleanup on unmount
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/api/tickets/${id}`, { ticket_status: status });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to update.");
    }
  };

  const handleClaim = async (id) => {
  try { await api.patch(`/api/tickets/${id}`, { assignee_id: user.id }); fetchTickets(); }
  catch (err) { setError(err.response?.data?.error ?? 'Failed to claim.'); }
};

  const myTickets = getMyTickets(tickets, user?.id);
  const unassignedTickets = getUnassigned(tickets);
  const displayed = tab === "mine" ? myTickets : unassignedTickets;

  return (
    <Box sx={{ p: 3 }}>
      {/* Greeting */}
      <Box sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontSize: 11,
            color: ACCENT,
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          TLA Workspace
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: "#e6edf7", fontFamily: '"Rubik", sans-serif' }}
        >
          Good morning, {user?.name?.split(" ")[0]}
        </Typography>
      </Box>
      <Box sx={{ p: 3 }}>
        {/* Greeting */}
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: 11,
              color: ACCENT,
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              mb: 0.5,
            }}
          >
            TLA Workspace
          </Typography>
          
        </Box>

        {/* KPIs */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <KpiCard
            label="Assigned to me"
            value={myTickets.length}
            color={ACCENT}
          />
          <KpiCard
            label="Unassigned"
            value={unassignedTickets.length}
            color="#ffb547"
          />
          <KpiCard
            label="In progress"
            value={
              myTickets.filter((t) => t.ticket_status === "in_progress").length
            }
            color="#c084fc"
          />
          <KpiCard
            label="Resolved"
            value={
              myTickets.filter((t) => t.ticket_status === "resolved").length
            }
            color="#2bd48f"
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Queue card — Card wraps everything */}
        <Card sx={{ bgcolor: PAPER, border: `1px solid ${BORDER}` }}>
          {/* Tabs + live badge */}
          <Box sx={{ display: "flex", borderBottom: `1px solid ${BORDER}` }}>
            {[
                {
                key: "unassigned",
                label: `Unassigned (${unassignedTickets.length})`,
              },
              { key: "mine", label: `My queue (${myTickets.length})` },
              
            ].map((t) => (
              <Box
                key={t.key}
                onClick={() => setTab(t.key)}
                sx={{
                  px: 2.5,
                  py: 1.5,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  color: tab === t.key ? ACCENT : "#8fa2c0",
                  borderBottom: `2px solid ${tab === t.key ? ACCENT : "transparent"}`,
                  transition: "all .15s",
                  "&:hover": { color: "#e6edf7" },
                }}
              >
                {t.label}
              </Box>
            ))}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: "flex", alignItems: "center", pr: 2 }}>
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 999,
                  border: "1px solid rgba(43,212,143,0.3)",
                  background: "rgba(43,212,143,0.07)",
                }}
              >
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: "#2bd48f",
                    "@keyframes pulse": {
                      "0%, 100%": {
                        boxShadow: "0 0 0 0px rgba(43,212,143,0.4)",
                      },
                      "50%": { boxShadow: "0 0 0 5px rgba(43,212,143,0)" },
                    },
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <Typography
                  sx={{ fontSize: 10.5, color: "#2bd48f", fontWeight: 700 }}
                >
                  LIVE
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Ticket rows */}
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
      </Box>
    </Box>
  );
}
