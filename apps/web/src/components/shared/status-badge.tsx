import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  isActive: boolean;
};

export function StatusBadge({ isActive }: StatusBadgeProps) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>
      {isActive ? "Aktif" : "Nonaktif"}
    </Badge>
  );
}
