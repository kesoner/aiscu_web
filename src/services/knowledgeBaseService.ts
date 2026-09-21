import { apiJson } from "./apiClient";

export type KnowledgeBaseEntry = {
  id: number;
  category: string;
  title: string;
  content: string;
  updatedAt: string;
};

type KnowledgeBaseResponse = {
  entries: KnowledgeBaseEntry[];
  persisted?: boolean;
};

export type KnowledgeBaseSaveResponse = {
  success: boolean;
  entries: KnowledgeBaseEntry[];
  indexStatus: "updated" | "pending";
  indexedChunks?: number;
  indexError?: string;
};

export function loadKnowledgeBase() {
  return apiJson<KnowledgeBaseResponse>("/api/admin/knowledge-base");
}

export function saveKnowledgeBase(entries: KnowledgeBaseEntry[]) {
  return apiJson<KnowledgeBaseSaveResponse>("/api/admin/knowledge-base", {
    method: "PUT",
    body: JSON.stringify({ entries }),
  });
}
