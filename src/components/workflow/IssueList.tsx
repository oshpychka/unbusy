import { Icon } from "@/components/ui/Icon";
import type { Issue } from "@/lib/engine/lint";
import { cn } from "@/lib/cn";

type IssueListProps = {
  issues: Issue[];
  titleOf?: (target: string) => string;
  onPick?: (target: string) => void;
};

export function IssueList({ issues, titleOf, onPick }: IssueListProps) {
  const sorted = [...issues].sort((a, b) =>
    a.severity === b.severity ? 0 : a.severity === "error" ? -1 : 1,
  );
  return (
    <ul className="flex flex-col gap-1.5">
      {sorted.map((issue, index) => {
        const content = (
          <>
            <Icon
              name="alert"
              size={16}
              className={cn(
                "mt-0.5 shrink-0",
                issue.severity === "error" ? "text-danger" : "text-warning",
              )}
            />
            <span className="flex flex-col">
              {titleOf && (
                <span className="text-xs text-muted">
                  {titleOf(issue.target)}
                </span>
              )}
              <span>{issue.message}</span>
            </span>
          </>
        );
        return (
          <li key={`${issue.target}-${index}`}>
            {onPick ? (
              <button
                type="button"
                onClick={() => onPick(issue.target)}
                className="flex min-h-11 w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-sunken"
              >
                {content}
              </button>
            ) : (
              <div className="flex items-start gap-2 text-sm">{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
