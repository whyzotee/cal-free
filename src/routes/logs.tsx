import { createFileRoute } from "@tanstack/react-router";
import { Logs } from "../components/Logs";

export const Route = createFileRoute("/logs")({
  component: LogsPage
});

function LogsPage() {
  return <Logs />;
}
