import { env } from "@/lib/env";

export type DocumentStatus =
  | "DRAFT"
  | "PENDING"
  | "COMPLETED"
  | "DECLINED"
  | "EXPIRED";

export type SignerRole = "SIGNER" | "APPROVER" | "CC" | "VIEWER";

export interface Signer {
  id?: number;
  name: string;
  email: string;
  role: SignerRole;
  signingStatus?: "NOT_SIGNED" | "SIGNED" | "REJECTED";
}

export interface Document {
  id: number;
  title: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  signers?: Signer[];
}

export interface CreateDocumentResponse {
  uploadUrl: string;
  documentId: number;
}

export interface ListDocumentsResponse {
  documents: Document[];
  totalPages: number;
}

function getConfig(): { apiKey: string; apiUrl: string } {
  const apiKey = env.DOCUMENSO_API_TOKEN;
  const apiUrl = env.DOCUMENSO_API_URL;

  if (!apiKey) {
    throw new Error("DOCUMENSO_API_TOKEN environment variable is not set");
  }

  return { apiKey, apiUrl };
}

async function documensoFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiKey, apiUrl } = getConfig();

  const res = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(
      `Documenso API error ${res.status} on ${path}: ${text}`
    );
  }

  return res.json() as Promise<T>;
}

/**
 * Create a document in Documenso from a base64-encoded PDF.
 * Returns the new document ID.
 */
export async function createDocument(
  name: string,
  base64Pdf: string
): Promise<number> {
  const data = await documensoFetch<CreateDocumentResponse>("/documents", {
    method: "POST",
    body: JSON.stringify({
      title: name,
      documentDataId: base64Pdf,
    }),
  });
  return data.documentId;
}

/**
 * Send an existing document out for signatures.
 */
export async function sendDocument(
  docId: number,
  signers: { name: string; email: string; role: SignerRole }[]
): Promise<Document> {
  return documensoFetch<Document>(`/documents/${docId}/send`, {
    method: "POST",
    body: JSON.stringify({ signers }),
  });
}

/**
 * Get a single document by ID.
 */
export async function getDocument(docId: number): Promise<Document> {
  return documensoFetch<Document>(`/documents/${docId}`);
}

/**
 * List all documents in the account.
 */
export async function listDocuments(
  page = 1,
  perPage = 50
): Promise<ListDocumentsResponse> {
  return documensoFetch<ListDocumentsResponse>(
    `/documents?page=${page}&perPage=${perPage}`
  );
}
