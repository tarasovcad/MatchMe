import MultipleSelector, {Option} from "@/components/shadcn/multiselect";
import {
  Controller,
  useFormContext,
  UseFormRegisterReturn,
} from "react-hook-form";

export default function Component({
  placeholder,
  name,
  className,
  tags,
}: {
  placeholder: string;
  name: string;
  className: string;
  tags: Option[] | undefined;
  register?: UseFormRegisterReturn<string>;
}) {
  const {
    control,

    formState: {errors},
  } = useFormContext();

  const tagsName = tags?.map((tag) => ({
    value: tag.value,
    label: tag.value,
  }));

  return (
    <Controller
      name={name}
      control={control}
      render={({field}) => (
        <MultipleSelector
          defaultOptions={tagsName}
          placeholder={placeholder}
          hideClearAllButton
          onChange={(selected) =>
            field.onChange(selected.map((option) => option.value))
          }
          value={
            (field.value as string[])?.map((skill) => ({
              label: skill,
              value: skill,
            })) || []
          }
          hidePlaceholderWhenSelected
          emptyIndicator={
            <p className="text-center text-sm">No results found</p>
          }
        />
      )}
    />
  );
}
