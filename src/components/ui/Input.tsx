import { cn } from "@/lib/cn";
import { controlClass } from "./Field";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean;
};

export function Input({ className, mono, ...props }: InputProps) {
  return (
    <input
      className={cn(
        controlClass,
        "h-11 md:h-10",
        mono && "font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
}

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  mono?: boolean;
};

export function Textarea({ className, mono, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        controlClass,
        "min-h-28 resize-none py-2.5 leading-normal",
        mono && "font-mono text-sm",
        className,
      )}
      {...props}
    />
  );
}
