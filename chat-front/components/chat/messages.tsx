import { ChatContext } from "@/app/chat/page";
import { useContext, useEffect, useState } from "react";
import ChatMessage from "./message";

export default function ChatMessages() {
  const { socket, client } = useContext(ChatContext);
  const [messages, setMessages] = useState<
    { clientId: string; username: string; text: string }[]
  >([]);

  useEffect(() => {
    // Listen for messages history
    socket?.once("chat-messages-history", (messages) => {
      console.log(messages);
      
      setMessages(messages);
    });
    // Listen for incoming messages
    socket?.on("chat-message", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Clean up
    return () => {
      socket?.off("chat-message");
    };
  }, [socket]);

  return (
    <div className="flex flex-col h-full overflow-x-auto mb-4">
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-12 gap-y-2">
          {messages.map((message, index) =>
            client != null ? (
              <ChatMessage
                key={client?.clientId ?? "" + message + index}
                client={client}
                message={message}
              />
            ) : null
          )}
        </div>
      </div>
    </div>
  );
}
