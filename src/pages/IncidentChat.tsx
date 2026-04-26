import { useParams } from "react-router-dom";
import { ChatInterface } from "@/components/ChatInterface";

const buildIncidentPrompt = (eventId: string) =>
  `🚨 New Zabbix Alert detected!

Incident ID: ${eventId}

Please analyze this incident and help me understand what happened and how to fix it.`;

const IncidentChat = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const safeId = eventId?.trim() ?? "";

  return (
    <div className="flex min-h-full flex-col">
      <ChatInterface
        autoMessage={safeId ? buildIncidentPrompt(safeId) : undefined}
        autoMessageKey={safeId}
      />
    </div>
  );
};

export default IncidentChat;
