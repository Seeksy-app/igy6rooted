import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays } from "lucide-react";

interface DateRangeSelectorProps {
  value: number;
  onChange: (days: number) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <Select value={value.toString()} onValueChange={(v) => onChange(parseInt(v))}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select date range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">Last 7 days</SelectItem>
          <SelectItem value="14">Last 14 days</SelectItem>
          <SelectItem value="30">Last 30 days</SelectItem>
          <SelectItem value="60">Last 60 days</SelectItem>
          <SelectItem value="90">Last 90 days</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
