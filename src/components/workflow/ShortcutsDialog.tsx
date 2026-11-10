import { Dialog } from "@/components/ui/Dialog";
import { editorShortcutList } from "@/hooks/useEditorShortcuts";

export function ShortcutsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} title="Keyboard shortcuts">
      <dl className="flex flex-col divide-y divide-line">
        {editorShortcutList.map(([label, keys]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-2.5 text-sm"
          >
            <dt>{label}</dt>
            <dd className="rounded-sm border border-line bg-sunken px-1.5 py-0.5 font-mono text-xs whitespace-nowrap">
              {keys}
            </dd>
          </div>
        ))}
      </dl>
    </Dialog>
  );
}
