import { format } from "date-fns";
import { CalendarIcon, MapPin, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ACCESS_OPTIONS, HOME_SIZE_OPTIONS, type Access, type HomeSize } from "@/lib/estimate";
import { CityInput } from "./CityInput";
import { FieldError, SectionCard } from "./SectionCard";
import type { FieldErrors, MoveDetails } from "./types";

const fieldClass = "h-12 bg-card text-base";

export function MoveDetailsSection({
  value,
  onChange,
  errors,
}: {
  value: MoveDetails;
  onChange: (patch: Partial<MoveDetails>) => void;
  errors: FieldErrors;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <SectionCard
      id="move-details"
      step={1}
      title="Move details"
      subtitle="Where, when and how big — the basics behind every estimate."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="from" className="mb-2 block font-semibold">
            Moving From
          </Label>
          <CityInput
            id="from"
            icon={MapPin}
            placeholder="City, State (e.g. Austin, TX)"
            className={fieldClass}
            value={value.from}
            onChange={(from) => onChange({ from })}
            invalid={!!errors.from}
          />
          <FieldError message={errors.from} />
        </div>

        <div>
          <Label htmlFor="to" className="mb-2 block font-semibold">
            Moving To
          </Label>
          <CityInput
            id="to"
            icon={Navigation}
            placeholder="City, State (e.g. Denver, CO)"
            className={fieldClass}
            value={value.to}
            onChange={(to) => onChange({ to })}
            invalid={!!errors.to}
          />
          <FieldError message={errors.to} />
        </div>

        <div>
          <Label className="mb-2 block font-semibold">Move Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                aria-label="Move Date"
                className={cn(
                  fieldClass,
                  "w-full justify-start border-input text-left font-normal",
                  !value.date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="text-muted-foreground" />
                {value.date ? format(value.date, "EEEE, MMMM d, yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value.date}
                onSelect={(d) => onChange({ date: d })}
                disabled={{ before: today }}
                initialFocus
                className="pointer-events-auto p-3"
              />
            </PopoverContent>
          </Popover>
          <FieldError message={errors.date} />
        </div>

        <div>
          <Label className="mb-2 block font-semibold">Home Size</Label>
          <Select
            value={value.homeSize ?? ""}
            onValueChange={(v) => onChange({ homeSize: v as HomeSize })}
          >
            <SelectTrigger className={cn(fieldClass, "w-full")} aria-label="Home Size">
              <SelectValue placeholder="Select home size" />
            </SelectTrigger>
            <SelectContent>
              {HOME_SIZE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {value.homeSize === "sqft" && (
            <div className="relative mt-3">
              <Input
                type="number"
                inputMode="numeric"
                min={100}
                placeholder="e.g. 1,800"
                className={cn(fieldClass, "pr-14")}
                value={value.sqft}
                onChange={(e) => onChange({ sqft: e.target.value })}
                aria-label="Square footage"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                sq ft
              </span>
            </div>
          )}
          <FieldError message={errors.homeSize} />
        </div>

        <AccessSelect
          label="Stairs/Elevator at current place?"
          value={value.originAccess}
          onChange={(v) => onChange({ originAccess: v })}
          error={errors.originAccess}
        />
        <AccessSelect
          label="Stairs/Elevator at new place?"
          value={value.destinationAccess}
          onChange={(v) => onChange({ destinationAccess: v })}
          error={errors.destinationAccess}
        />
      </div>
    </SectionCard>
  );
}

function AccessSelect({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value?: Access | undefined;
  onChange: (v: Access) => void;
  error?: string | undefined;
}) {
  return (
    <div>
      <Label className="mb-2 block font-semibold">{label}</Label>
      <Select value={value ?? ""} onValueChange={(v) => onChange(v as Access)}>
        <SelectTrigger className={cn(fieldClass, "w-full")} aria-label={label}>
          <SelectValue placeholder="Select access" />
        </SelectTrigger>
        <SelectContent>
          {ACCESS_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError message={error} />
    </div>
  );
}
