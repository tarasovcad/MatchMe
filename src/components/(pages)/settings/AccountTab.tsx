import SettingsFormField from "@/components/form/SettingsFormField";
import {accountSettingsFormFields} from "@/data/forms/(settings)/accountSettingsFormFields";
import React from "react";

const AccountTab = () => {
  return (
    <div className=" gap-6 flex flex-col">
      {accountSettingsFormFields.map((formFields, index) => {
        return (
          <div
            key={formFields.formTitle}
            className={`flex flex-col gap-9 max-[990px]:gap-8 ${index !== 0 && "border-t border-border pt-6"}`}>
            <h4 className="text-xl font-semibold text-foreground">
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
