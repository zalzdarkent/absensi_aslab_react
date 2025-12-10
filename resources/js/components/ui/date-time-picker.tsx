import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateTimePickerProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    minDate?: Date;
    disabled?: boolean;
    className?: string;
}

export function DateTimePicker({
    value,
    onChange,
    placeholder = "Pilih tanggal dan waktu",
    minDate = new Date(),
    disabled = false,
    className,
}: DateTimePickerProps) {
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );
    const [time, setTime] = React.useState<string>(
        value ? format(new Date(value), "HH:mm") : "00:00"
    );
    const [isOpen, setIsOpen] = React.useState(false);

    // Update local state when value prop changes
    React.useEffect(() => {
        if (value) {
            const newDate = new Date(value);
            setDate(newDate);
            setTime(format(newDate, "HH:mm"));
        }
    }, [value]);

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;

        const [hours, minutes] = time.split(":");
        selectedDate.setHours(parseInt(hours), parseInt(minutes));
        setDate(selectedDate);

        // Convert to ISO format suitable for datetime-local input (YYYY-MM-DDTHH:MM)
        const isoString = format(selectedDate, "yyyy-MM-dd'T'HH:mm");
        onChange?.(isoString);
    };

    const handleTimeChange = (newTime: string) => {
        setTime(newTime);

        if (date) {
            const [hours, minutes] = newTime.split(":");
            const newDate = new Date(date);
            newDate.setHours(parseInt(hours), parseInt(minutes));
            setDate(newDate);

            // Convert to ISO format
            const isoString = format(newDate, "yyyy-MM-dd'T'HH:mm");
            onChange?.(isoString);
        }
    };

    const handleClear = () => {
        setDate(undefined);
        setTime("00:00");
        onChange?.("");
        setIsOpen(false);
    };

    const displayValue = date
        ? `${format(date, "dd/MM/yyyy")} - ${time}`
        : placeholder;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground",
                        className
                    )}
                    disabled={disabled}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {displayValue}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <div className="flex flex-col gap-4 p-4">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={handleDateSelect}
                        disabled={(date) => date < minDate}
                        initialFocus
                        className="[--cell-size:2.75rem]"
                    />
                    <div className="border-t pt-4 space-y-2">
                        <Label className="text-base font-medium">Waktu</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => handleTimeChange(e.target.value)}
                            className="w-full h-11 text-base"
                        />
                    </div>
                    <div className="flex gap-2 border-t pt-4">
                        <Button
                            variant="outline"
                            size="default"
                            onClick={handleClear}
                            className="flex-1"
                        >
                            Clear
                        </Button>
                        <Button
                            size="default"
                            onClick={() => setIsOpen(false)}
                            className="flex-1"
                        >
                            OK
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
