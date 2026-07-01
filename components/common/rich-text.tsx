import { Fragment } from "react";

import { parseRichBlocks, inlineSegments } from "@/lib/domain";
import { cn } from "@/lib/utils";

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineSegments(text).map((seg, i) =>
        seg.bold ? (
          <strong key={i} className="font-semibold text-foreground">
            {seg.text}
          </strong>
        ) : (
          <Fragment key={i}>{seg.text}</Fragment>
        ),
      )}
    </>
  );
}

/** Renderiza o corpo de uma seção com bom espaçamento: parágrafos, subtítulos e listas. */
export function RichText({ body, className }: { body: string; className?: string }) {
  const blocks = parseRichBlocks(body);
  return (
    <div className={cn("space-y-3.5", className)}>
      {blocks.map((b, i) => {
        if (b.type === "heading") {
          return (
            <p key={i} className="pt-1 text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              <Inline text={b.text} />
            </p>
          );
        }
        if (b.type === "list") {
          return (
            <ul key={i} className="grid gap-2">
              {b.items.map((it, j) => (
                <li key={j} className="flex items-start gap-2.5 text-[15.5px] leading-[1.6] text-foreground/85">
                  <span className="mt-[3px] size-1.5 shrink-0 rounded-full bg-gold" />
                  <span><Inline text={it} /></span>
                </li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-[16px] leading-[1.75] text-foreground/90">
            <Inline text={b.text} />
          </p>
        );
      })}
    </div>
  );
}
