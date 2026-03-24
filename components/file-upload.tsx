"use client";

import { useCallback, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FileUploadProps {
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        await onUpload(file);
      } finally {
        setUploading(false);
      }
    },
    [onUpload]
  );

  return (
    <Card
      className={`border-2 border-dashed transition-colors ${
        dragging ? "border-primary bg-muted/50" : "border-muted-foreground/25"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
    >
      <CardContent className="flex flex-col items-center justify-center py-10">
        {uploading ? (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Drag and drop a file here, or{" "}
              <label className="cursor-pointer text-primary underline">
                browse
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
