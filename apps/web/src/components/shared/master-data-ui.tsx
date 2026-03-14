import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MasterDetailField = {
  label: string;
  value: ReactNode;
};

export const MASTER_LIST_SHELL_CLASSNAME =
  "space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6";

export const MASTER_TOOLBAR_CLASSNAME =
  "flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between";

export const MASTER_TOOLBAR_GROUP_CLASSNAME =
  "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end";

export const MASTER_TOOLBAR_META_CLASSNAME =
  "text-sm font-medium text-muted-foreground";

export const MASTER_TOOLBAR_INPUT_CLASSNAME =
  "h-10 w-full rounded-lg text-sm sm:w-80";

export const MASTER_TOOLBAR_SELECT_CLASSNAME =
  "h-10 rounded-lg text-sm";

export const MASTER_ACTION_BUTTON_CLASSNAME =
  "h-10 rounded-lg px-4 text-sm";

export const MASTER_PAGINATION_BUTTON_CLASSNAME =
  "h-10 rounded-lg px-4 text-sm";

export const MASTER_FORM_ACTIONS_CLASSNAME =
  "flex justify-end gap-3 border-t pt-4";

export const MASTER_DETAIL_SECTION_CLASSNAME =
  "space-y-3 rounded-xl border bg-card p-5 shadow-sm";

export function MasterDetailTable({
  fields,
  className,
}: {
  fields: MasterDetailField[];
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background", className)}>
      <table className="w-full border-collapse text-sm">
        <tbody>
          {fields.map((field) => (
            <tr key={field.label} className="border-b last:border-b-0">
              <td className="w-1/3 bg-muted/60 px-4 py-3 font-medium text-muted-foreground">
                {field.label}
              </td>
              <td className="px-4 py-3 text-foreground">{field.value ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MasterDetailSection({
  title,
  description,
  fields,
  children,
  className,
}: {
  title: string;
  description?: string;
  fields?: MasterDetailField[];
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn(MASTER_DETAIL_SECTION_CLASSNAME, className)}>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {fields ? <MasterDetailTable fields={fields} /> : children}
    </section>
  );
}

export function MasterFormActions({
  onCancel,
  cancelLabel = "Batal",
  submitLabel,
  submittingLabel = "Menyimpan...",
  isPending = false,
}: {
  onCancel: () => void;
  cancelLabel?: string;
  submitLabel: string;
  submittingLabel?: string;
  isPending?: boolean;
}) {
  return (
    <div className={MASTER_FORM_ACTIONS_CLASSNAME}>
      <Button
        type="button"
        variant="outline"
        className={MASTER_ACTION_BUTTON_CLASSNAME}
        onClick={onCancel}
        disabled={isPending}
      >
        {cancelLabel}
      </Button>
      <Button type="submit" className={MASTER_ACTION_BUTTON_CLASSNAME} disabled={isPending}>
        {isPending ? submittingLabel : submitLabel}
      </Button>
    </div>
  );
}
