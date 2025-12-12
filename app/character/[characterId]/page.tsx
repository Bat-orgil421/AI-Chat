"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

interface Message {
  id: string;
  content: string;
  role: "user" | "model";
  createdAt: string;
}

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function CharacterChatPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/signin");
      return;
    }
  }, [router]);

  useEffect(() => {
    fetchCharacter();
    fetchMessages();
  }, [characterId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCharacter = async () => {
    try {
      const response = await fetch("/api/character");
      if (response.ok) {
        const characters = await response.json();
        const char = characters.find((c: Character) => c.id === characterId);
        setCharacter(char || null);
      }
    } catch (error) {
      console.error("Failed to fetch character:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/character/${characterId}/message`, {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const msgs = await response.json();
        setMessages(msgs);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const messageToSend = inputMessage;
    setInputMessage(""); // Clear input immediately
    setIsLoading(true);

    try {
      const response = await fetch(`/api/character/${characterId}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ content: messageToSend }),
      });

      if (response.ok) {
        // Refetch messages to get the updated conversation
        await fetchMessages();
      } else {
        // If failed, restore the message
        setInputMessage(messageToSend);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // If failed, restore the message
      setInputMessage(messageToSend);
    } finally {
      setIsLoading(false);
    }
  };

  if (!character) {
    return <div className="p-6">Loading character...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/admin/characters">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Characters
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <img
              src={character.image}
              alt={character.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <h1 className="text-xl font-semibold">{character.name}</h1>
              <p className="text-sm text-muted-foreground">
                {character.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        <Card className="h-[calc(100vh-200px)] flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Chat with {character.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto pr-4 mb-4">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg break-words ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <form
              onSubmit={sendMessage}
              className="flex items-end gap-3 flex-shrink-0 p-4 border-t bg-background/50"
            >
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={isLoading ? "Sending..." : "Message..."}
                  disabled={isLoading}
                  className="w-full min-h-[44px] max-h-32 resize-none rounded-2xl border border-input bg-background px-4 py-3 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && inputMessage.trim()) {
                        sendMessage(e as any);
                      }
                    }
                  }}
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                size="sm"
                className="h-10 w-10 rounded-full p-0 shrink-0"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="text-current"
                  >
                    <path
                      d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                      fill="currentColor"
                    />
                  </svg>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
