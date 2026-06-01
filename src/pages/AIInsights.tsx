import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ChatInterface, type IncidentContext } from "@/components/ChatInterface";

const AIInsights = () => {
  const [params] = useSearchParams();

  const incidentContext = useMemo<IncidentContext | undefined>(() => {
    const eventId = params.get("event");
    if (!eventId) return undefined;
    return {
      eventId,
      host: params.get("host") ?? "unknown",
      trigger: params.get("trigger") ?? "unknown trigger",
      severity: params.get("severity") ?? "n/a",
      opdata: params.get("opdata") ?? undefined,
      triggeredAt: params.get("at") ?? undefined,
    };
  }, [params]);

  return (
    <div className="flex min-h-full flex-col">
      <ChatInterface
        incidentContext={incidentContext}
        autoMessageKey={incidentContext?.eventId}
        autoMessage={
          incidentContext
            ? `Investigate incident #${incidentContext.eventId} on ${incidentContext.host}.`
            : undefined
        }
      />
    </div>
  );
};

export default AIInsights;
