import { useEffect, useRef } from "react";
import * as signalR from "@microsoft/signalr";

export function useNotificationHub(onNotify: (message: string) => void) {
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7057/notificationhub", {
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          return Math.min(10000, 2000 * (retryContext.previousRetryCount + 1));
        },
      })
      .build();

    connectionRef.current = connection;

    connection.off("ReceiveNotification");
    connection.on("ReceiveNotification", (message: string) => {
      console.log("[SignalR] Received notification:", message);
      onNotify(message);
    });

    let isCancelled = false;

    async function startConnection() {
      try {
        await connection.start();
        if (isCancelled) {
          await connection.stop();
          return;
        }
        console.log("[SignalR] Connection started successfully.");
      } catch (err) {
        if (!isCancelled) {
          console.error("[SignalR] Connection error:", err);
        }
      }
    }

    startConnection();

    return () => {
      isCancelled = true;
      connection.off("ReceiveNotification");
      connection
        .stop()
        .then(() => console.log("[SignalR] Connection stopped."))
        .catch((err) =>
          console.error("[SignalR] Error stopping connection:", err)
        );
    };
  }, [onNotify]);
}
