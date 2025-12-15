"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
}

export default function Home() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch("/api/character");
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error("Failed to fetch characters:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading characters...</div>
      </div>
    );
  }

  if (characters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">
            Welcome to AI Character Chat
          </h1>
          <p className="text-gray-600 mb-8">
            No characters available yet. Please contact an administrator to
            create characters.
          </p>
          <Link href="/admin/characters">
            <Button>Go to Admin</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Character Chat
          </h1>
          <p className="text-xl text-gray-600">
            Choose a character to start chatting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((character) => (
            <Card
              key={character.id}
              className="transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 cursor-pointer border-2 hover:border-primary/50"
            >
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <img
                    src={character.image}
                    alt={character.name}
                    className="w-16 h-16 object-cover rounded-full"
                  />
                  <div>
                    <CardTitle>{character.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">
                  {character.description}
                </CardDescription>
                <Button
                  onClick={() => router.push(`/character/${character.id}`)}
                  className="w-full"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with {character.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/admin/characters">
            <Button variant="outline">Manage Characters (Admin)</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
