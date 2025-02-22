import {Input} from "@/components/shadcn/input";
import {SocialOption} from "@/types/settingsFieldsTypes";

export default function SocialLinksInput({
  id,
  placeholder,
  name,
  socials,
}: {
  id: string;
  placeholder: string;
  name: string;
  socials: SocialOption[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {socials.map((social) => {
        return (
          <div className="flex rounded-lg shadow-xs" key={social.value}>
            <span className="border-input bg-background text-muted-foreground  inline-flex items-center rounded-s-lg border px-3 text-sm ">
              {social.value}
            </span>
            <Input
              id={id}
              className="-ms-px rounded-s-none shadow-none"
              placeholder={placeholder}
              type="text"
              name={name}
            />
          </div>
        );
      })}
    </div>
  );
}
