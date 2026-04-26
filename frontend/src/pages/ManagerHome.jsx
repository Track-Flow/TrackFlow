import { useState, useEffect } from "react";
import { Box, Card, Typography, CircularProgress, Alert } from "@mui/material";
import api from "../helpers/api";
import {
  countByStatus,
  getSLABreaches,
  getResolvedToday,
  statusMeta,
  priorityMeta,
  timeAgo,
} from "../helpers/ticketHelpers";
import { useNavigate } from "react-router-dom";

const ACCENT = "#ff9bd0";
const PAPER = "#0f1f3a";
const BORDER = "rgba(143,162,192,0.12)";

function KpiCard({ label, value, color, sub }) {
  return (
    <Card
      sx={{
        p: 2.5,
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
          mb: 0.75,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Rubik", sans-serif',
          fontSize: 34,
          fontWeight: 700,
          color: "#e6edf7",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: 11.5, color: "#5b6d8a",
         mt: 0.5 }}>
          {sub}
        </Typography>
      )}
    </Card>
  );
}

function TicketRow({ ticket }) {
  const { label: sLabel, color: sColor } = statusMeta(ticket.ticket_status);
  const { color: pColor } = priorityMeta(ticket.ticket_priority ?? "low");
  const navigate = useNavigate();

  return (
    <Box
      onClick={() => navigate(`/tickets/${ticket.ticket_id}`)}
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderBottom: `1px solid ${BORDER}`,
        "&:hover": { bgcolor: "rgba(255,155,208,0.03)" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
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
        <Typography sx={{ fontSize: 12, color: "#8fa2c0" }}>
          {ticket.assignee_id
            ? `Assigned · ${ticket.assignee_id}`
            : "Unassigned"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function ManagerHome() {
  const user = JSON.parse(localStorage.getItem("tf_user") ?? "null");
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/api/tickets")
      .then((res) => setTickets(res.data))
      .catch((err) => setError(err.response?.data?.error ?? "Failed to load."))
      .finally(() => setLoading(false));
  }, []);

  const counts = countByStatus(tickets);
  const breaches = getSLABreaches(tickets);
  const resolvedToday = getResolvedToday(tickets);

  return (
    <Box sx={{ p: 3 }}>
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
          MSS Operations
        </Typography>
        <Typography
          variant="h4"
          sx={{ color: "#e6edf7", fontFamily: '"Rubik", sans-serif' }}
        >
          University-wide overview
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <KpiCard label="Open" value={counts.open ?? 0} color="#2ec8ff" />
        <KpiCard
          label="In progress"
          value={counts.in_progress ?? 0}
          color="#ffb547"
        />
        <KpiCard
          label="Resolved today"
          value={resolvedToday.length}
          color="#2bd48f"
        />
        <KpiCard
          label="SLA breaches"
          value={breaches.length}
          color="#ff6b6b"
          sub={breaches.length > 0 ? "Needs attention" : "All on track"}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

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
                fontSize: 11,
                color: ACCENT,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              All tickets
            </Typography>
            <Typography variant="h6" sx={{ color: "#e6edf7" }}>
              Live feed
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 12, color: "#5b6d8a" }}>
            {tickets.length} total
          </Typography>
        </Box>
        {loading && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <CircularProgress size={28} sx={{ color: ACCENT }} />
          </Box>
        )}
        {!loading && tickets.length === 0 && (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography sx={{ color: "#8fa2c0" }}>No tickets found.</Typography>
          </Box>
        )}
        {!loading &&
          tickets.map((t) => <TicketRow key={t.ticket_id} ticket={t} />)}
      </Card>
    </Box>
  );
}
