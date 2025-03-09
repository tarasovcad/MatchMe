import SettingsFormField from "@/components/form/SettingsFormField";
import {
  accountSettingsFormFields,
  accountSettingsFormFieldsTop,
} from "@/data/forms/(settings)/accountSettingsFormFields";

import {cn} from "@/lib/utils";
import React from "react";

const AccountTab = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border rounded-[8px]">
        {accountSettingsFormFieldsTop.map((formField, index) => {
          return (
            <div
              key={formField.fieldTitle}
              className={cn(
                "px-[18px] py-3",
                index !== 0 && "border-t border-border",
              )}>
              <SettingsFormField formField={formField} />
            </div>
          );
        })}
      </div>
      {accountSettingsFormFields.map((formFields, index) => {
        return (
          <div
            key={formFields.formTitle}
            className={`flex flex-col gap-9 max-[990px]:gap-8 ${index !== 0 && "border-t border-border pt-6"}`}>
            <h4 className="font-semibold text-foreground text-xl">
              {formFields.formTitle}
            </h4>
            <div className="flex flex-col gap-6">
              {formFields.formData.map((formField) => {
                return (
                  <SettingsFormField
                    formField={formField}
                    key={formField.fieldTitle}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AccountTab;
