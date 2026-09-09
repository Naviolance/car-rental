"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretDown, Check } from "@phosphor-icons/react";
import { inputClassName } from "@/lib/formStyles";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// A native <select>'s open dropdown is OS-rendered chrome — Chrome/Windows
// gives no CSS or JS hook to animate it at all, which is why it can never
// be made to feel "smooth" no matter how the closed control is styled.
// This trades that native panel for a real DOM element (button + an
// absolutely-positioned list), which is what makes an actual open/close
// animation possible — at the cost of reimplementing the keyboard/ARIA
// behavior a <select> gets for free. It still participates in a plain
// HTML form the same way: a hidden input carries `name`/`value`, so a
// server receiving this <form>'s GET/POST sees no difference.
export function Dropdown({
  name,
  options,
  value,
  onChange,
  ariaLabel,
  placeholder = "Select…",
  className = "",
}: {
  name: string;
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const idPrefix = useId();
  const optionId = (index: number) => `${idPrefix}-option-${index}`;

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex >= 0 ? options[selectedIndex] : null;

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  // Seeding the highlighted option is a direct response to the open/close
  // click itself, not a reaction to `open` changing for some other
  // reason — doing it here (rather than in the effect above) keeps that
  // effect a pure "subscribe to outside clicks" subscription.
  function openDropdown() {
    setHighlighted(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector(`[data-index="${highlighted}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [open, highlighted]);

  function commit(index: number) {
    const option = options[index];
    if (!option || option.disabled) return;
    onChange(option.value);
    setOpen(false);
  }

  function moveHighlight(delta: number) {
    setHighlighted((current) => {
      let next = current;
      for (let step = 0; step < options.length; step++) {
        next = (next + delta + options.length) % options.length;
        if (!options[next]?.disabled) break;
      }
      return next;
    });
  }

  // A native <select> jumps to the first/last option on Home/End —
  // scanning forward/backward for the nearest enabled one keeps that
  // working the same way ours does for Arrow keys, skipping disabled
  // options (e.g. past time slots) rather than landing on one.
  function moveToEdge(edge: "first" | "last") {
    const range =
      edge === "first"
        ? options.map((_, index) => index)
        : options.map((_, index) => index).reverse();
    const target = range.find((index) => !options[index]?.disabled);
    if (target !== undefined) setHighlighted(target);
  }

  function handleButtonKeyDown(event: React.KeyboardEvent) {
    if (["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      if (!open) {
        openDropdown();
      } else if (event.key === "ArrowDown") {
        moveHighlight(1);
      } else if (event.key === "ArrowUp") {
        moveHighlight(-1);
      } else if (event.key === "Home") {
        moveToEdge("first");
      } else if (event.key === "End") {
        moveToEdge("last");
      } else {
        commit(highlighted);
      }
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openDropdown())}
        onKeyDown={handleButtonKeyDown}
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? `${idPrefix}-listbox` : undefined}
        aria-activedescendant={open ? optionId(highlighted) : undefined}
        aria-label={ariaLabel}
        className={`flex w-full items-center justify-between gap-2 text-left ${inputClassName}`}
      >
        <span className={`truncate ${selected ? "" : "text-gray-500"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <CaretDown
          size={14}
          aria-hidden="true"
          className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            ref={listRef}
            id={`${idPrefix}-listbox`}
            role="listbox"
            aria-label={ariaLabel}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-20 mt-1 max-h-60 w-full min-w-max overflow-auto rounded border border-mist bg-white py-1 shadow-lg"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                id={optionId(index)}
                data-index={index}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
                onMouseEnter={() => setHighlighted(index)}
                onClick={() => commit(index)}
                className={`flex items-center justify-between gap-3 px-3 py-1.5 text-sm ${
                  option.disabled
                    ? "cursor-not-allowed text-gray-300"
                    : "cursor-pointer text-charcoal"
                } ${index === highlighted && !option.disabled ? "bg-cream" : ""} ${
                  option.value === value ? "font-medium text-rust" : ""
                }`}
              >
                {option.label}
                {option.value === value && (
                  <Check size={14} weight="bold" aria-hidden="true" />
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
