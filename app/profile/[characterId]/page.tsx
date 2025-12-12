"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, MessageCircle } from "lucide-react";

interface Character {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  greetingText: string;
  image: string;
}

export default function CharacterProfilePage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.characterId as string;

  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    basePrompt: "",
    greetingText: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCharacter();
  }, [characterId]);

  const fetchCharacter = async () => {
    try {
      const response = await fetch(`/api/character/${characterId}`);
      if (response.ok) {
        const data = await response.json();
        setCharacter(data);
        setFormData({
          name: data.name,
          description: data.description,
          basePrompt: data.basePrompt,
          greetingText: data.greetingText,
        });
      }
    } catch (error) {
      console.error("Failed to fetch character:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!character) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("basePrompt", formData.basePrompt);
      formDataToSend.append("greetingText", formData.greetingText);
      if (selectedFile) {
        formDataToSend.append("image", selectedFile);
      }

      const response = await fetch(`/api/character/${character.id}`, {
        method: "PUT",
        body: formDataToSend,
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        setCharacter(updatedCharacter);
        setFormData({
          name: updatedCharacter.name,
          description: updatedCharacter.description,
          basePrompt: updatedCharacter.basePrompt,
          greetingText: updatedCharacter.greetingText,
        });
        setSelectedFile(null);
        setIsEditDialogOpen(false);
      }
    } catch (error) {
      console.error("Failed to update character:", error);
    }
  };

  const handleDeleteCharacter = async () => {
    if (!character) return;

    try {
      const response = await fetch(`/api/character/${character.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/admin/characters");
      }
    } catch (error) {
      console.error("Failed to delete character:", error);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!character) {
    return <div className="p-6">Character not found</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Character Profile</h1>
      </div>

      <div className="space-y-6 flex flex-col items-center">
        <div className="flex justify-center w-full h-50 flex items-center rounded-xl">
          <img
            src={character.image}
            alt={character.name}
            className="w-32 h-32 object-cover rounded-full"
          />
        </div>

        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Character</DialogTitle>
                <DialogDescription>
                  Update character information.
                </DialogDescription>
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
                      onChange={(e) =>
                        setSelectedFile(e.target.files?.[0] || null)
                      }
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

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Character</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete "{character.name}"? This
                  action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteCharacter}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Link href={`/character/${character.id}`}>
            <Button className="text-gray-500 hover:text-white">
              <MessageCircle className="h-4 w-4 mr-2 text-gray-500 hover:text-white" />
              Chat
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 mt-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Name</Label>
            <span className="col-span-3">{character.name}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Description</Label>
            <span className="col-span-3">{character.description}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">Greeting Text</Label>
            <span className="col-span-3">{character.greetingText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
