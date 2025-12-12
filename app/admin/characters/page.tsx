"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageCircle } from "lucide-react";

interface Character {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  greetingText: string;
  image: string;
}

export default function AdminCharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingCharacter, setViewingCharacter] = useState<Character | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrompt: "",
    greetingText: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const handleCreateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("basePrompt", formData.basePrompt);
      formDataToSend.append("greetingText", formData.greetingText);
      formDataToSend.append("image", selectedFile);

      const response = await fetch("/api/character", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const newCharacter = await response.json();
        setCharacters([...characters, newCharacter]);
        setFormData({
          name: "",
          description: "",
          basePrompt: "",
          greetingText: "",
        });
        setSelectedFile(null);
        setIsCreateDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description,
      basePrompt: character.basePrompt,
      greetingText: character.greetingText,
    });
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleViewCharacter = (character: Character) => {
    setViewingCharacter(character);
    setIsViewDialogOpen(true);
  };

  const handleUpdateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCharacter) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("basePrompt", formData.basePrompt);
      formDataToSend.append("greetingText", formData.greetingText);
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const response = await fetch(`/api/character/${editingCharacter.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        setCharacters(
          characters.map((char) =>
            char.id === editingCharacter.id ? updatedCharacter : char
          )
        );
        setFormData({
          name: "",
          description: "",
          basePrompt: "",
          greetingText: "",
        });
        setSelectedFile(null);
        setEditingCharacter(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update character:", error);
    }
  };
  

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Character Management</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Character</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Character</DialogTitle>
              <DialogDescription>
                Add a new character to the system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCharacter}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="basePrompt" className="text-right">
                    Base Prompt
                  </Label>
                  <Input
                    id="basePrompt"
                    name="basePrompt"
                    value={formData.basePrompt}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="greetingText" className="text-right">
                    Greeting Text
                  </Label>
                  <Input
                    id="greetingText"
                    name="greetingText"
                    value={formData.greetingText}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Image
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Character</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
            <DialogDescription>Update character information.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateCharacter}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-image" className="text-right">
                  Image
                </Label>
                <Input
                  id="edit-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="col-span-3"
                />
                <div className="col-span-4 text-sm text-muted-foreground">
                  Leave empty to keep current image
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-basePrompt" className="text-right">
                  Base Prompt
                </Label>
                <Input
                  id="edit-basePrompt"
                  name="basePrompt"
                  value={formData.basePrompt}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-greetingText" className="text-right">
                  Greeting Text
                </Label>
                <Input
                  id="edit-greetingText"
                  name="greetingText"
                  value={formData.greetingText}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Update Character</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>View Character</DialogTitle>
            <DialogDescription>Character details.</DialogDescription>
          </DialogHeader>
          {viewingCharacter && (
            <div className="grid gap-4 py-4">
              <div className="flex justify-center">
                <img
                  src={viewingCharacter.image}
                  alt={viewingCharacter.name}
                  className="w-24 h-24 object-cover rounded-full"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Name</Label>
                <span className="col-span-3">{viewingCharacter.name}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Description</Label>
                <span className="col-span-3">
                  {viewingCharacter.description}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Base Prompt</Label>
                <span className="col-span-3">
                  {viewingCharacter.basePrompt}
                </span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right font-medium">Greeting Text</Label>
                <span className="col-span-3">
                  {viewingCharacter.greetingText}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {characters.map((character) => (
          <Link href={`/profile/${character.id}`}>
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
                <CardAction>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/character/${character.id}`);
                    }}
                    className="transition-all hover:scale-110 hover:bg-primary text-gray-500 hover:text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2 transition-all text-gray-500 hover:text-white hover:rotate-12" />
                    Chat
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <CardDescription>{character.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
