"use client";

import ChatClients from "@/components/chat/clients";
import ChatForm from "@/components/chat/form";
import ChatMessages from "@/components/chat/messages";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

export const ChatContext = createContext<{
  client: {
    clientId: string;
    username: string | null;
  } | null;
  setClient: Dispatch<
    SetStateAction<{
      clientId: string;
      username: string | null;
    } | null>
  >;
  socket: Socket | null;
}>({ client: null, setClient: () => {}, socket: null });

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [username, setUsername] = useState<string>("");
  const [client, setClient] = useState<{
    clientId: string;
    username: string | null;
  } | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    setSocket(socket);

    return () => {
      socket.close();
      setSocket(null);
    };
  }, []);

  return (
    <ChatContext.Provider value={{ client, setClient, socket }}>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden p-6 gap-6">
          <ChatClients />
          <div className="flex flex-col flex-auto h-full">
            <div className={client == null ? "space-y-4" : "hidden"}>
              <h1 className="text-2xl font-bold">Connect toi</h1>
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  socket?.emit(
                    "chat-client",
                    username,
                    (
                      value:
                        | { clientId: string; username: string | null }
                        | boolean
                    ) => {
                      if (value && value != true) {
                        console.log(value);

                        setClient(value);
                      } else {
                        alert("Username already taken");
                      }
                    }
                  );
                }}
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                />
                <button
                  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                  type="submit"
                >
                  Send
                </button>
              </form>
            </div>
            <div
              className={
                client == null
                  ? "hidden"
                  : "flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4"
              }
            >
              <ChatMessages />
              <ChatForm />
            </div>
          </div>
        </div>
      </div>
    </ChatContext.Provider>
  );
}
