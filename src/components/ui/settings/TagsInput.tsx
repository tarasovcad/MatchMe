"use client";

import {Tag, TagInput} from "emblor";
import {useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import {X} from "lucide-react";
import {Controller, useFormContext} from "react-hook-form";
export default function TagsInput({
  placeholder,
  name,
}: {
  placeholder: string;
  name: string;
}) {
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const {control} = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({field, fieldState: {error}}) => {
        const tags = (field.value || []).map((text: string) => ({
          id: text,
          text: text,
        }));

        const customTagRenderer = (tag: Tag, isActiveTag: boolean) => {
          return (
            <motion.div
              key={tag.id}
              initial={{opacity: 0, scale: 0.8}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.8}}
              transition={{duration: 0.2}}
              className={`h-7 relative ${error ? "bg-destructive/10" : "bg-tag"} border ${
                error ? "border-destructive/50" : "border-input"
              } rounded-[6px] font-medium text-sm ps-2 pe-7 flex items-center ${
                error ? "text-destructive" : "text-foreground"
              } ${isActiveTag ? `ring-2 ring-${error ? "destructive/30" : "ring/50"}` : ""} `}>
              {tag.text}
              <motion.button
                className="absolute -inset-y-px flex p-0 focus-visible:border-ring rounded-e-md outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] size-7 text-muted-foreground/80 hover:text-foreground transition-colors -end-px"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  const currentTags = field.value || [];
                  const updatedTags = currentTags.filter(
                    (text: string) => text !== tag.text,
                  );
                  field.onChange(updatedTags);
                }}>
                <X className="m-auto size-4" />
              </motion.button>
            </motion.div>
          );
        };

        return (
          <div className="space-y-2">
            <TagInput
              tags={tags}
              setTags={(newTags) => {
                if (error) {
                  return;
                }

                const tagArray = Array.isArray(newTags) ? newTags : [];
                const values = tagArray.map(
                  (tag: Tag) =>
                    tag.text.charAt(0).toUpperCase() + tag.text.slice(1),
                );
                field.onChange(values);
              }}
              placeholder={placeholder}
              customTagRenderer={customTagRenderer}
              styleClasses={{
                inlineTagsContainer: `flex w-full rounded-lg border ${
                  error ? "border-destructive/80" : "border-input"
                } bg-background text-sm ${
                  error ? "text-destructive" : "text-foreground"
                } shadow-xs shadow-black/5 transition-shadow focus-within:outline-hidden focus-within:ring-[3px] ${
                  error
                    ? "focus-within:border-destructive/80 focus-within:ring-destructive/20"
                    : "focus-within:border-ring focus-within:ring-ring/20"
                } gap-1 px-2 transition-[color,box-shadow]`,
                input: `w-full shadow-none outline-none border-none px-1 bg-transparent text-sm ${
                  error
                    ? "text-destructive placeholder:text-destructive"
                    : "placeholder:-muted-foreground/70"
                }`,
              }}
              activeTagIndex={activeTagIndex}
              setActiveTagIndex={setActiveTagIndex}
              maxTags={15}
              maxLength={30}
              minLength={2}
            />
            <AnimatePresence>
              {error && (
                <motion.p
                  className="text-destructive text-xs"
                  layout
                  initial={{opacity: 0, height: 0, marginTop: 0}}
                  animate={{opacity: 1, height: "auto", marginTop: 8}}
                  exit={{opacity: 0, height: 0, marginTop: 0}}
                  transition={{duration: 0.1, ease: "easeInOut"}}>
                  {Array.isArray(error)
                    ? error.find(Boolean)?.message || JSON.stringify(error)
                    : error.message || JSON.stringify(error)}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        );
      }}
    />
  );
}
