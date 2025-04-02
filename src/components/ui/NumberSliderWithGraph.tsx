"use client";

import {useId} from "react";

import {useSliderWithInput} from "@/hooks/use-slider-with-input";
import {Button} from "@/components/shadcn/button";
import {Input} from "@/components/shadcn/input";
import {Label} from "@/components/shadcn/label";
import {Slider} from "@/components/shadcn/slider";

const items = [
  {id: 0, hours: 0},
  {id: 1, hours: 80},
  {id: 1, hours: 80},
  {id: 2, hours: 95},
  {id: 3, hours: 110},
  {id: 4, hours: 125},
  {id: 5, hours: 130},
  {id: 6, hours: 140},
  {id: 7, hours: 145},
  {id: 8, hours: 150},
  {id: 9, hours: 155},
  {id: 10, hours: 168},
];

export default function NumberSliderWithGraph({label}: {label?: string}) {
  const id = useId();

  // Define the number of ticks
  const tick_count = 40;
  // Find the min and max values across all items
  const minValue = Math.min(...items.map((item) => item.hours));
  const maxValue = Math.max(...items.map((item) => item.hours));

  const {
    sliderValue,
    inputValues,
    validateAndUpdateValue,
    handleInputChange,
    handleSliderChange,
  } = useSliderWithInput({minValue, maxValue, initialValue: [0, 0]}); // set initialValue: [minValue, maxValue] to show all items by default

  // Calculate the hours step based on the min and max hours
  const hoursStep = (maxValue - minValue) / tick_count;

  // Calculate item counts for each hours range
  const itemCounts = Array(tick_count)
    .fill(0)
    .map((_, tick) => {
      const rangeMin = minValue + tick * hoursStep;
      const rangeMax = minValue + (tick + 1) * hoursStep;
      return items.filter(
        (item) => item.hours >= rangeMin && item.hours < rangeMax,
      ).length;
    });

  // Find maximum count for scaling
  const maxCount = Math.max(...itemCounts);

  const handleSliderValueChange = (values: number[]) => {
    handleSliderChange(values);
  };

  // Function to count items in the selected range
  const countItemsInRange = (min: number, max: number) => {
    return items.filter((item) => item.hours >= min && item.hours <= max)
      .length;
  };

  const isBarInSelectedRange = (
    index: number,
    minValue: number,
    hoursStep: number,
    sliderValue: number[],
  ) => {
    const rangeMin = minValue + index * hoursStep;
    const rangeMax = minValue + (index + 1) * hoursStep;
    return (
      countItemsInRange(sliderValue[0], sliderValue[1]) > 0 &&
      rangeMin <= sliderValue[1] &&
      rangeMax >= sliderValue[0]
    );
  };

  return (
    <div className="*:not-first:mt-4">
      {label && <Label>hours slider</Label>}
      <div>
        {/* Histogram bars */}
        <div className="flex items-end px-3 w-full h-12" aria-hidden="true">
          {itemCounts.map((count, i) => (
            <div
              key={i}
              className="flex flex-1 justify-center"
              style={{
                height: `${(count / maxCount) * 100}%`,
              }}>
              <span
                data-selected={isBarInSelectedRange(
                  i,
                  minValue,
                  hoursStep,
                  sliderValue,
                )}
                className="bg-primary/20 w-full h-full"></span>
            </div>
          ))}
        </div>
        <Slider
          value={sliderValue}
          onValueChange={handleSliderValueChange}
          min={minValue}
          max={maxValue}
          aria-label="Hours per week range"
        />
      </div>

      {/* Inputs */}
      <div className="flex justify-between items-center gap-4">
        <div className="*:not-first:mt-1">
          <p className="text-secondary text-sm">Min hours</p>
          <div className="relative">
            <Input
              id={`${id}-min`}
              className="w-full"
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
              aria-label="Enter minimum hours"
            />
          </div>
        </div>
        <div className="*:not-first:mt-1">
          <p className="text-secondary text-sm">Max hours</p>
          <div className="relative">
            <Input
              id={`${id}-max`}
              className="w-full"
              type="text"
              inputMode="decimal"
              value={inputValues[1]}
              onChange={(e) => handleInputChange(e, 1)}
              onBlur={() => validateAndUpdateValue(inputValues[1], 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  validateAndUpdateValue(inputValues[1], 1);
                }
              }}
              aria-label="Enter maximum hours"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
