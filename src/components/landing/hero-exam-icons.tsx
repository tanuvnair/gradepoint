import ClipboardList from "lucide-solid/icons/clipboard-list";
import FileText from "lucide-solid/icons/file-text";
import PenLine from "lucide-solid/icons/pen-line";
import CircleCheck from "lucide-solid/icons/circle-check";
import Clock from "lucide-solid/icons/clock";
import { cn } from "~/lib/utils";

const ICON_CLASS = cn(
  "absolute text-primary/10 select-none pointer-events-none",
  "blur-[2px] sm:blur-[3px]"
);

const ICONS = [
  { Icon: ClipboardList, position: "top-[12%] left-[8%] size-16 sm:size-24 md:size-28" },
  { Icon: FileText, position: "top-[18%] right-[10%] size-14 sm:size-20 md:size-24" },
  { Icon: PenLine, position: "bottom-[25%] left-[5%] size-12 sm:size-16 md:size-20" },
  { Icon: CircleCheck, position: "bottom-[20%] right-[12%] size-16 sm:size-24 md:size-28" },
  { Icon: Clock, position: "top-[45%] left-[2%] size-14 sm:size-20" },
  { Icon: FileText, position: "top-[55%] right-[5%] size-12 sm:size-16" },
  { Icon: ClipboardList, position: "bottom-[35%] right-[3%] size-14 sm:size-16" },
  { Icon: PenLine, position: "top-[28%] right-[20%] size-10 sm:size-14" },
  { Icon: CircleCheck, position: "bottom-[45%] left-[15%] size-12 sm:size-16" },
  { Icon: Clock, position: "top-[70%] left-[12%] size-12 sm:size-14" },
] as const;

export default function HeroExamIcons() {
  return (
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {ICONS.map(({ Icon, position }) => (
        <Icon class={cn(ICON_CLASS, position)} aria-hidden />
      ))}
    </div>
  );
}
