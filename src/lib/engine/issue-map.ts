import type { Issue } from "./lint";

export function issueMap(issues: Issue[]) {
  const map = new Map<string, "error" | "warning">();
  for (const issue of issues) {
    if (map.get(issue.target) !== "error")
      map.set(issue.target, issue.severity);
  }
  return map;
}
