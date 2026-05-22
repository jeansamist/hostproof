"use client";

import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { ComponentProps, FunctionComponent, ReactNode, useState } from "react";

import { cn } from "@packages/functions";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Select } from "./select";

export const SelectWithSearch: FunctionComponent<
  ComponentProps<typeof Select> & {
    items: { value: string; label: ReactNode }[];
    placeholder?: string;
    searchPLaceholder?: string;
  }
> = ({ items, placeholder, searchPLaceholder, ...props }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [value, setValue] = useState<string>(props.value || "");

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="bg-transparent dark:bg-input/30 dark:hover:bg-input/30 hover:bg-transparent border-input w-full justify-between px-3 font-normal outline-offset-0 outline-none focus-visible:outline-[3px]"
          >
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {value
                ? items.find((items) => items.value === value)?.label
                : placeholder || "Select an item"}
            </span>
            <ChevronDownIcon
              size={16}
              className="text-muted-foreground/80 shrink-0"
              aria-hidden="true"
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="border-input w-full min-w-[var(--radix-popper-anchor-width)] p-0"
          align="start"
        >
          <Command>
            <CommandInput
              placeholder={(searchPLaceholder || "Search for an item") + "..."}
            />
            <CommandList>
              <CommandEmpty>Not found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    key={item.value}
                    value={item.value}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? "" : currentValue);
                      props.onValueChange &&
                        props.onValueChange(
                          currentValue === value ? "" : currentValue,
                        );
                      setOpen(false);
                    }}
                  >
                    {item.label}
                    {value === item.value && (
                      <CheckIcon size={16} className="ml-auto" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
