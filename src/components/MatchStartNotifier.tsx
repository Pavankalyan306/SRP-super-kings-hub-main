import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { fetchMatchById } from "@/lib/matches";
import { isMedianApp, requestMedianPushRegistration } from "@/lib/median";
import { supabase } from "@/lib/supabase";

const PUBLIC_ROUTES = ["/", "/matches", "/match", "/players", "/news", "/photos", "/about"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

async function showMatchNotification(title: string, body: string) {
  if (isMedianApp()) {
    // Median/OneSignal background pushes must be sent from a backend.
    // Foreground app users still get the in-app toast below.
    return;
  }

  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission === "granted") {
    new Notification(title, { body });
  }
}

export default function MatchStartNotifier() {
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const isOnPublicPage = isPublicRoute(location.pathname) && !location.pathname.startsWith("/admin");

  useEffect(() => {
    requestMedianPushRegistration();
  }, []);

  useEffect(() => {
    if (!isOnPublicPage) return;

    const channel = supabase
      .channel("public-match-start-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "matches",
        },
        async (payload) => {
          const oldStatus = String(payload.old?.status || "");
          const newStatus = String(payload.new?.status || "");

          if (oldStatus === "live" || newStatus !== "live" || !payload.new?.id) {
            return;
          }

          await queryClient.invalidateQueries({ queryKey: ["matches"] });

          const matchResponse = await fetchMatchById(String(payload.new.id));
          const match = matchResponse.data?.[0];
          const title = "Match started";
          const body = match
            ? `${match.teamA} vs ${match.teamB} is live now${match.venue ? ` at ${match.venue}` : ""}.`
            : "A match is live now. Open the app for scores.";

          toast({
            title,
            description: body,
            onClick: () => navigate(match ? `/match/${match.id}` : "/matches"),
          });

          await showMatchNotification(title, body);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnPublicPage, navigate, queryClient]);

  return null;
}
