"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadFile, listFiles, deleteFile } from "@/lib/storage";
import { FileUpload } from "@/components/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface FileItem {
  name: string;
  created_at: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const items = await listFiles(user.id);
        setFiles(items as FileItem[]);
      }
      setLoading(false);
    }
    init();
  }, []);

  async function handleUpload(file: File) {
    if (!userId) return;
    await uploadFile(file, userId);
    const items = await listFiles(userId);
    setFiles(items as FileItem[]);
  }

  async function handleDelete(name: string) {
    if (!userId) return;
    await deleteFile(`${userId}/${name}`);
    const items = await listFiles(userId);
    setFiles(items as FileItem[]);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Files</h1>
        <p className="mt-2 text-muted-foreground">
          Upload and manage files — demonstrates Supabase Storage.
        </p>
      </div>

      <FileUpload onUpload={handleUpload} />

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : files.length === 0 ? (
        <p className="text-muted-foreground">No files yet. Upload one above.</p>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <Card key={file.name}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(file.name)}
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
