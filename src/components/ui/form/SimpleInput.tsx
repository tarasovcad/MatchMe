import {Label} from "@/components/shadcn/label";
import {CircleCheck, Mail, Search, TriangleAlert} from "lucide-react";
import {cn} from "@/lib/utils";
import {AnimatePresence, motion} from "framer-motion";
import LoadingButtonCirlce from "../LoadingButtonCirlce";
import {SimpleInputProps} from "@/types/simpleInputProps";
import FormErrorLabel from "../FormErrorLabel";

const SimpleInput = ({
  mail,
  label,
  placeholder = "undefined",
  type,
  id,
  register,
  className,
  name,
  error,
  loading,
  readOnly,
  isUsernameAvailable,
  search,
  ...props
}: SimpleInputProps) => {
  return (
    <div className="space-y-2 w-full">
      <div className="flex flex-col gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative w-full">
          <input
            className={cn(
              "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 read-only:bg-muted ",
              type === "search" &&
                "[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none [&::-webkit-search-results-button]:appearance-none [&::-webkit-search-results-decoration]:appearance-none",
              type === "file" &&
                "p-0 pr-3 italic text-muted-foreground/70 file:me-3 file:h-full file:border-0 file:border-r file:border-solid file:border-input file:bg-transparent file:px-3 file:text-sm file:font-medium file:not-italic file:text-foreground",
              mail && "peer ps-9",
              search && "peer ps-9",
              loading && "peer pe-9",
              error &&
                "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
              isUsernameAvailable === false &&
                !error &&
                "border-destructive/80 text-destructive focus-visible:border-destructive/80 focus-visible:ring-destructive/20",
              isUsernameAvailable === true &&
                !error &&
                "border-success/80 text-success focus-visible:border-success/80 focus-visible:ring-success/20",
              className,
            )}
            readOnly={readOnly}
            type={type}
            id={id}
            placeholder={placeholder}
            name={name}
            {...register}
            {...props}
          />
          {mail && (
            <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
              <Mail size={16} strokeWidth={2} aria-hidden="true" />
            </div>
          )}
          {search && (
            <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 ps-3 text-muted-foreground/80 pointer-events-none start-0">
              <Search size={16} strokeWidth={2} aria-hidden="true" />
            </div>
          )}
          {loading && (
            <div className="absolute inset-y-0 flex justify-center items-center peer-disabled:opacity-50 pe-3 text-muted-foreground/80 pointer-events-none end-0">
              <LoadingButtonCirlce size={16} />
            </div>
          )}
        </div>
      </div>
      <FormErrorLabel error={error} />
      <AnimatePresence>
        {isUsernameAvailable === false && !error && (
          <motion.div
            className="flex items-center gap-1.5 text-destructive text-xs"
            layout
            initial={{opacity: 0, height: 0, marginTop: 0}}
            animate={{opacity: 1, height: "auto", marginTop: 8}}
            exit={{opacity: 0, height: 0, marginTop: 0}}
            transition={{duration: 0.1, ease: "easeInOut"}}>
            <TriangleAlert
              className="inline-flex -mt-0.5"
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
            {name === "slug" ? "Slug" : "Username"} is already taken
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isUsernameAvailable === true && !error && (
          <motion.div
            className="flex items-center gap-1.5 text-success text-xs"
            layout
            initial={{opacity: 0, height: 0, marginTop: 0}}
            animate={{opacity: 1, height: "auto", marginTop: 8}}
            exit={{opacity: 0, height: 0, marginTop: 0}}
            transition={{duration: 0.1, ease: "easeInOut"}}>
            <CircleCheck
              className="inline-flex -mt-0.5"
              size={14}
              strokeWidth={2}
              aria-hidden="true"
            />
            {name === "slug" ? "Slug" : "Username"} is available
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SimpleInput;
