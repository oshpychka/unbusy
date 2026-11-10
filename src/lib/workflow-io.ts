import type { Workflow } from "@/lib/engine/types";
import { validateDraft, type WorkflowDraft } from "@/lib/engine/validate";

const format = "unbusy-workflow";
export const maxImportBytes = 200 * 1024;

export function toDraft(workflow: Workflow): WorkflowDraft {
  const { name, description, trigger, steps, settings } = workflow;
  return { name, description, trigger, steps, settings };
}

export function serializeWorkflow(workflow: Workflow) {
  return JSON.stringify(
    { format, version: 1, workflow: toDraft(workflow) },
    null,
    2,
  );
}

export function parseWorkflowFile(content: string) {
  if (content.length > maxImportBytes)
    return { ok: false as const, error: "The file is larger than 200 KB" };
  let data: unknown;
  try {
    data = JSON.parse(content);
  } catch {
    return { ok: false as const, error: "The file is not valid JSON" };
  }
  if (
    typeof data !== "object" ||
    data === null ||
    (data as { format?: unknown }).format !== format
  ) {
    return { ok: false as const, error: "This is not an Unbusy workflow file" };
  }
  return validateDraft((data as { workflow?: unknown }).workflow);
}

function toBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const binary = atob(value.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function pipe(
  bytes: Uint8Array,
  stream: CompressionStream | DecompressionStream,
) {
  const response = new Response(
    new Blob([bytes as BlobPart]).stream().pipeThrough(stream),
  );
  return new Uint8Array(await response.arrayBuffer());
}

export async function encodeShare(workflow: Workflow) {
  const json = new TextEncoder().encode(JSON.stringify(toDraft(workflow)));
  return toBase64Url(await pipe(json, new CompressionStream("deflate-raw")));
}

export async function decodeShare(value: string) {
  if (!value || value.length > maxImportBytes)
    return { ok: false as const, error: "The link is empty or too long" };
  try {
    const bytes = await pipe(
      fromBase64Url(value),
      new DecompressionStream("deflate-raw"),
    );
    return validateDraft(JSON.parse(new TextDecoder().decode(bytes)));
  } catch {
    return { ok: false as const, error: "The link is broken or was cut off" };
  }
}
