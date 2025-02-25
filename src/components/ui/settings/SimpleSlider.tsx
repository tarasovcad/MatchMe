"use client";

import {useSliderWithInput} from "@/hooks/use-slider-with-input";
import {Input} from "@/components/shadcn/input";
import {Label} from "@/components/shadcn/label";
import {Slider} from "@/components/shadcn/slider";

export default function SimpleSlider() {
  const minValue = 0;
  const maxValue = 168;
  const initialValue = [0];

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({minValue, maxValue, initialValue});

  return (
    <div className="flex items-center gap-4">
      <Slider
        className="grow"
        value={sliderValue}
        onValueChange={handleSliderChange}
        min={minValue}
        max={maxValue}
        aria-label="Slider with input"
      />
      <Input
        className="h-8 w-12 px-2 py-1"
        type="text"
        inputMode="decimal"
        value={inputValues[0]}
        onChange={(e) => handleInputChange(e, 0)}
        onBlur={() => validateAndUpdateValue(inputValues[0], 0)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            validateAndUpdateValue(inputValues[0], 0);
          }
        }}
        aria-label="Enter value"
      />
    </div>
  );
}
