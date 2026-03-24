"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Note } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  async function fetchNotes() {
    const { data } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });
    setNotes(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("notes")
      .insert({ title, content, user_id: user.id });

    setTitle("");
    setContent("");
    fetchNotes();
  }

  async function handleDelete(id: string) {
    await supabase.from("notes").delete().eq("id", id);
    fetchNotes();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notes</h1>
        <p className="mt-2 text-muted-foreground">
          Create and manage notes — demonstrates Supabase CRUD with RLS.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Note</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-3">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Content (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <Button type="submit">Create Note</Button>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-muted-foreground">No notes yet. Create one above.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="flex items-start justify-between pt-6">
                <div>
                  <h3 className="font-semibold">{note.title}</h3>
                  {note.content && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {note.content}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(note.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
