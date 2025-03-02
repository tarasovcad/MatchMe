import MultipleSelector, {Option} from "@/components/shadcn/multiselect";

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
}) {
  return (
    <div className="">
      <MultipleSelector
        // commandProps={{
        //   label: "Select frameworks",
        // }}
        defaultOptions={tags}
        placeholder={placeholder}
        hideClearAllButton
        hidePlaceholderWhenSelected
        emptyIndicator={<p className="text-center text-sm">No results found</p>}
      />
    </div>
  );
}
