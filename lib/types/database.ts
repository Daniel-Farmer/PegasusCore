export type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  user_id: string;
  content: string;
  embedding: number[] | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type MatchResult = {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
};

export type IpWhitelistEntry = {
  id: string;
  ip_address: string;
  label: string;
  allowed_services: ("nextjs" | "bifrost" | "flowise")[];
  created_by: string | null;
  created_at: string;
};
