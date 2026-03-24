"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MatchResult } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [docContent, setDocContent] = useState("");
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [storing, setStoring] = useState(false);
  const [message, setMessage] = useState("");

  async function handleStore(e: React.FormEvent) {
    e.preventDefault();
    if (!docContent.trim()) return;

    setStoring(true);
    setMessage("");
    try {
      const res = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: docContent }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessage(`Error: ${err.error}`);
      } else {
        setMessage("Document stored with embedding.");
        setDocContent("");
      }
    } catch {
      setMessage("Failed to store document.");
    } finally {
      setStoring(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setResults([]);
    try {
      // Generate query embedding
      const embedRes = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: query, metadata: { _query: true } }),
      });

      // For search, we need the embedding directly — call the API to get it,
      // then use rpc for similarity search
      // Simpler approach: use the API endpoint and let server handle it
      // For now, do a basic content search as a fallback
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Use rpc to call match_documents (requires embedding)
      // First, get the embedding for our query
      const bifrostRes = await fetch("/api/embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: query,
          metadata: { _searchQuery: true },
        }),
      });

      if (!bifrostRes.ok) {
        setMessage("Failed to generate search embedding.");
        return;
      }

      // The embedding was stored — now search using rpc
      const { data } = await supabase.rpc("match_documents", {
        query_embedding: query,
        match_threshold: 0.3,
        match_count: 10,
        filter_user_id: user.id,
      });

      setResults((data as MatchResult[]) ?? []);
    } catch {
      setMessage("Search failed.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Semantic Search</h1>
        <p className="mt-2 text-muted-foreground">
          Store documents as embeddings and search by meaning — powered by
          pgvector.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Store a Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleStore} className="space-y-3">
            <Textarea
              placeholder="Paste text to store as a vector embedding..."
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              rows={4}
              required
            />
            <Button type="submit" disabled={storing}>
              {storing ? "Storing..." : "Store Document"}
            </Button>
          </form>
          {message && (
            <p className="mt-3 text-sm text-muted-foreground">{message}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-3">
            <Input
              placeholder="Search by meaning..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <Button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Results</h2>
          {results.map((result) => (
            <Card key={result.id}>
              <CardContent className="pt-6">
                <p>{result.content}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Similarity: {(result.similarity * 100).toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
