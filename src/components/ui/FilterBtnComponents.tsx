import React, {useEffect, useMemo, useState} from "react";
import SimpleInput from "./form/SimpleInput";
import {Checkbox} from "../shadcn/checkbox";
import {CommandGroup, CommandItem} from "@/components/shadcn/command";
import LoadingButtonCircle from "./LoadingButtonCirlce";
import {getSkillsForFilterBtn} from "@/actions/profiles/getSkillsForFilterBtn";
import {useSkillsStore} from "@/store/skillsCache";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/shadcn/tabs";
import {Slider} from "../shadcn/slider";
import {useSliderWithInput} from "@/hooks/use-slider-with-input";
import {Input} from "../shadcn/input";
import {useCountries} from "@/hooks/useCountries";
import {Button} from "../shadcn/button";
import {cn} from "@/lib/utils";
import {FilterOption} from "@/store/filterStore";

export const MultiSelect = ({
  title,
  options,
  searchQuery,
  initialSelectedOptions = [],
  onApply,
  onCancel,
  onClosePopover,
}: {
  title?: string;
  options?: Array<FilterOption>;
  searchQuery: string;
  initialSelectedOptions?: string[];
  onApply: (selectedOptions: string[]) => void;
  onCancel: () => void;
  onClosePopover: () => void;
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(initialSelectedOptions);

  useEffect(() => {
    setSelectedOptions(initialSelectedOptions);
  }, [initialSelectedOptions]);

  if (!options && title === "Location") {
    const {countries} = useCountries(true);
    options = countries;
  }

  const filteredOptions = options?.filter((opt) =>
    opt.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Sort the options to display selected ones at the top
  const sortedOptions = useMemo(() => {
    if (!filteredOptions) return [];

    return [...filteredOptions].sort((a, b) => {
      const aKey = a.value ?? a.title;
      const bKey = b.value ?? b.title;
      const aSelected = initialSelectedOptions.includes(aKey);
      const bSelected = initialSelectedOptions.includes(bKey);

      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return 0;
    });
  }, [filteredOptions, initialSelectedOptions]);

  const hasChanges = useMemo(() => {
    // Check if arrays have different lengths
    if (selectedOptions.length !== initialSelectedOptions.length) return true;

    // Check if arrays have different items
    return (
      selectedOptions.some((option) => !initialSelectedOptions.includes(option)) ||
      initialSelectedOptions.some((option) => !selectedOptions.includes(option))
    );
  }, [selectedOptions, initialSelectedOptions]);

  // Toggle selection when an option is clicked
  const handleOptionToggle = (optionTitle: string, optionValue?: string) => {
    const key = optionValue ?? optionTitle;
    setSelectedOptions((prev) => {
      // Remove if already selected, add if not
      if (prev.includes(key)) {
        return prev.filter((title) => title !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Handle Apply button click
  const handleApply = () => {
    onClosePopover();
    setTimeout(() => {
      onApply(selectedOptions);
    }, 200);
  };

  // Handle Cancel button click
  const handleCancel = () => {
    setSelectedOptions([]);
    onCancel();
  };

  return (
    <CommandGroup className="py-1 px-1">
      {sortedOptions && sortedOptions.length > 0 ? (
        <div className="relative flex flex-col max-h-[300px]">
          <div className="overflow-y-auto">
            {sortedOptions.map((opt) => (
              <CommandItem
                key={(opt.value ?? opt.title) + opt.title}
                className="w-full flex items-center gap-2 px-2 py-[5px] rounded-[5px] text-sm transition-colors duration-300 ease-in-out cursor-pointer hover:bg-muted"
                onSelect={() => handleOptionToggle(opt.title, opt.value)}>
                <Checkbox
                  checked={selectedOptions.includes(opt.value ?? opt.title)}
                  className={cn(
                    "shadow-xs rounded-[4px] transition-opacity duration-100 ease-in-out cursor-pointer",
                    selectedOptions.includes(opt.value ?? opt.title) ? "opacity-100" : "opacity-0",
                  )}
                  onClick={() => handleOptionToggle(opt.title, opt.value)}
                  onCheckedChange={() => handleOptionToggle(opt.title, opt.value)}
                />
                <span className="flex-1 whitespace-nowrap text-foreground/90">{opt.title}</span>
              </CommandItem>
            ))}
            {sortedOptions.length > 20 && title === "Tags" && (
              <div className="px-2 py-2 text-muted-foreground text-sm text-center">
                Enter a specific skill to find relevant results
              </div>
            )}
          </div>

          <div className="bottom-0 z-10 sticky flex items-center gap-2 bg-background p-2 border-t">
            <Button
              variant="outline"
              size="xs"
              className="h-[35px]"
              onClick={handleCancel}
              disabled={!hasChanges}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              size="xs"
              className="w-full h-[35px]"
              onClick={handleApply}
              disabled={!hasChanges}>
              Apply
            </Button>
          </div>
        </div>
      ) : (
        <div className="px-2 py-2 text-muted-foreground text-sm">No results found</div>
      )}
    </CommandGroup>
  );
};

export const TagsSearch = ({
  inputRef,
  searchQuery,
  initialSelectedOptions = [],
  onApply,
  onCancel,
  onClosePopover,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  initialSelectedOptions?: string[];
  onApply: (selectedOptions: string[]) => void;
  onCancel: () => void;
  onClosePopover: () => void;
}) => {
  const [loading, setLoading] = useState(true);
  const {skills, lastSearchQuery, setSkills} = useSkillsStore();
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setSkills([], "");
      setLoading(true);

      try {
        const response = await getSkillsForFilterBtn(searchQuery);
        setSkills(response, searchQuery);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
        setHasFetchedOnce(true);
      }
    };
    if (searchQuery !== lastSearchQuery) {
      setSkills([], "");
      setLoading(true);
    }

    if (skills.length > 0 && searchQuery === lastSearchQuery) {
      setLoading(false);
    } else {
      const debounceTimer = setTimeout(fetchSkills, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef]);

  return (
    <>
      {loading && (
        <div className="flex justify-around px-2 py-2 text-sm">
          <LoadingButtonCircle size={20} />
        </div>
      )}
      {!loading && skills.length > 0 && (
        <MultiSelect
          title="Tags"
          options={skills}
          searchQuery={searchQuery}
          initialSelectedOptions={initialSelectedOptions}
          onApply={onApply}
          onCancel={onCancel}
          onClosePopover={onClosePopover}
        />
      )}
      {!loading && hasFetchedOnce && skills.length === 0 && (
        <div className="px-2 py-2 text-muted-foreground text-sm">No results found</div>
      )}
    </>
  );
};

export const SearchInput = ({
  inputRef,
  onApply,
  defaultValue,
}: {
  inputRef: React.RefObject<HTMLInputElement>;
  onApply: (value: string) => void;
  defaultValue?: string;
}) => {
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.value = defaultValue || "";
    }
  }, [inputRef, defaultValue]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputRef.current?.value) {
      onApply(inputRef.current.value);
    }
  };
  return (
    <div className="px-2 py-1.5">
      <SimpleInput
        placeholder="Search..."
        type="search"
        id="search"
        ref={inputRef}
        onKeyDown={handleKeyDown}
        defaultValue={defaultValue}
      />
    </div>
  );
};

export const NumberSelect = ({
  maxValue = 100,
  minValue = 0,
  onApply,
  onCancel,
  onClosePopover,
  initialValues = {single: 0, range: [0, 0]},
}: {
  maxValue?: number;
  minValue?: number;
  onApply: (value: number | number[]) => void;
  onCancel: () => void;
  onClosePopover: () => void;
  initialValues?: {single: number; range: number[]};
}) => {
  const hasRangeValues = initialValues.range[0] !== 0 || initialValues.range[1] !== 0;
  const defaultTab = hasRangeValues ? "tab-2" : "tab-1";
  const [mode, setMode] = useState<"single" | "range">(hasRangeValues ? "range" : "single");

  const singleSlider = useSliderWithInput({
    minValue,
    maxValue,
    initialValue: [initialValues.single],
    defaultValue: [0],
  });

  const rangeSlider = useSliderWithInput({
    minValue,
    maxValue,
    initialValue: initialValues.range,
    defaultValue: [0, 0],
  });

  const {
    sliderValue: singleValue,
    inputValues: singleInputs,
    handleInputChange: handleSingleInput,
    handleSliderChange: handleSingleSlider,
    validateAndUpdateValue: validateSingle,
    resetToDefault: resetSingle,
  } = singleSlider;

  const {
    sliderValue: rangeValue,
    inputValues: rangeInputs,
    handleInputChange: handleRangeInput,
    handleSliderChange: handleRangeSlider,
    validateAndUpdateValue: validateRange,
    resetToDefault: resetRange,
  } = rangeSlider;

  const handleApply = () => {
    onClosePopover();
    setTimeout(() => {
      if (mode === "single") {
        onApply(singleValue[0]);
      } else {
        onApply(rangeValue);
      }
    }, 200);
  };

  const handleCancel = () => {
    resetSingle();
    resetRange();
    onCancel();
  };

  return (
    <div>
      <Tabs
        defaultValue={defaultTab}
        className="items-center gap-6 p-3"
        onValueChange={(value) => {
          if (value === "tab-1") {
            setMode("single");
          } else if (value === "tab-2") {
            setMode("range");
          }
        }}>
        <TabsList className="p-1 rounded-full w-full">
          <TabsTrigger value="tab-1" className="p-1 rounded-full w-full">
            Single
          </TabsTrigger>
          <TabsTrigger value="tab-2" className="py-1 rounded-full w-full">
            Range
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab-1" className="flex w-full">
          <div className="flex flex-col items-center gap-4">
            <Slider
              className="grow"
              value={singleValue}
              onValueChange={handleSingleSlider}
              min={minValue}
              max={maxValue}
              aria-label="Slider with input"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">Value</span>
              <Input
                className="px-2 py-1 w-full h-8"
                type="text"
                inputMode="decimal"
                value={singleInputs[0]}
                onChange={(e) => handleSingleInput(e, 0)}
                onBlur={() => validateSingle(singleInputs[0], 0)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    validateSingle(singleInputs[0], 0);
                  }
                }}
                aria-label="Enter value"
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tab-2" className="flex w-full">
          <div className="flex flex-col items-center gap-4 w-full">
            <Slider
              className="grow"
              value={rangeValue}
              onValueChange={handleRangeSlider}
              min={minValue}
              max={maxValue}
              aria-label="Dual range slider with input"
            />
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">Min</span>
                <Input
                  className="px-2 py-1 w-full h-8"
                  type="text"
                  inputMode="decimal"
                  value={rangeInputs[0]}
                  onChange={(e) => handleRangeInput(e, 0)}
                  onBlur={() => validateRange(rangeInputs[0], 0)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      validateRange(rangeInputs[0], 0);
                    }
                  }}
                  aria-label="Enter minimum value"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Max</span>
                <Input
                  className="px-2 py-1 w-full h-8"
                  type="text"
                  inputMode="decimal"
                  value={rangeInputs[1]}
                  onChange={(e) => handleRangeInput(e, 1)}
                  onBlur={() => validateRange(rangeInputs[1], 1)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      validateRange(rangeInputs[1], 1);
                    }
                  }}
                  aria-label="Enter maximum value"
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex items-center gap-2 bg-background p-2 border-t">
        <Button variant="outline" size="xs" className="h-[35px]" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="secondary" size="xs" className="w-full h-[35px]" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  );
};
