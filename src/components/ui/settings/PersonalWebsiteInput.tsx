import {Input} from "@/components/shadcn/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/shadcn/select";

export default function PersonalWebsiteInput({
  id,
  placeholder,
  name,
}: {
  id: string;
  placeholder: string;
  name: string;
}) {
  return (
    <div className="">
      <div className="flex rounded-lg">
        <div className="relative">
          <Select defaultValue="1">
            <SelectTrigger
              id={id}
              className="appearance-none items-center rounded-none rounded-s-lg border text-sm transition-shadow focus:z-10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 text-muted-foreground">
              <SelectValue placeholder="https://" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">https://</SelectItem>
              <SelectItem value="2">http://</SelectItem>
              <SelectItem value="3">ftp://</SelectItem>
              <SelectItem value="4">sftp://</SelectItem>
              <SelectItem value="5">ws://</SelectItem>
              <SelectItem value="6">wss://</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Input
          id={id}
          className="-ms-px rounded-s-none shadow-none focus-visible:z-10"
          placeholder={placeholder}
          type="text"
          name={name}
        />
      </div>
    </div>
  );
}
