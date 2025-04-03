import {
  Combobox,
  type ComboboxItem,
  OptionsDropdown,
  Pill,
  PillsInput,
  Text,
  Tooltip,
} from "@mantine/core";
import type { ReactNode } from "react";
import { t } from "ttag";

import { Icon } from "../../icons";

import { useMultiAutocomplete } from "./use-multi-autocomplete";

export type MultiAutocompleteProps = {
  values: string[];
  options: ComboboxItem[];
  placeholder?: string;
  shouldCreate?: (value: string) => boolean;
  autoFocus?: boolean;
  rightSection?: ReactNode;
  nothingFoundMessage?: ReactNode;
  "aria-label"?: string;
  onChange: (newValues: string[]) => void;
  onSearchChange?: (newValue: string) => void;
};

export function MultiAutocomplete({
  values,
  options,
  placeholder,
  shouldCreate,
  autoFocus,
  rightSection,
  nothingFoundMessage,
  "aria-label": ariaLabel,
  onChange,
  onSearchChange,
}: MultiAutocompleteProps) {
  const {
    combobox,
    pillValues,
    fieldValue,
    handleFieldChange,
    handleFieldPaste,
    handleFieldKeyDown,
    handleFieldFocus,
    handleFieldBlur,
    handlePillDoubleClick,
    handlePillRemoveClick,
    handleOptionSubmit,
  } = useMultiAutocomplete({
    values,
    shouldCreate,
    onChange,
    onSearchChange,
  });

  const infoIcon = (
    <Tooltip
      label={
        <Text c="inherit" maw="20rem">
          {t`Separate values with commas, tabs, or newlines. Use double quotes if what you’re searching for has commas — and if it itself includes quotes, use backslashes like this: “searching, you see, is a \\“simple\\” thing.”`}
        </Text>
      }
    >
      <Icon c="text-light" name="info_filled" />
    </Tooltip>
  );

  return (
    <>
      <Combobox
        store={combobox}
        withinPortal={false}
        floatingStrategy="fixed"
        onOptionSubmit={handleOptionSubmit}
      >
        <Combobox.DropdownTarget>
          <PillsInput rightSection={rightSection ?? infoIcon}>
            <Pill.Group>
              {pillValues.map((value, valueIndex) =>
                value !== null ? (
                  <Pill
                    key={valueIndex}
                    withRemoveButton
                    onDoubleClick={() => handlePillDoubleClick(valueIndex)}
                    onRemove={() => handlePillRemoveClick(valueIndex)}
                  >
                    {value}
                  </Pill>
                ) : (
                  <Combobox.EventsTarget key="field">
                    <PillsInput.Field
                      value={fieldValue}
                      placeholder={placeholder}
                      role="combobox"
                      autoFocus={autoFocus}
                      aria-label={ariaLabel}
                      onChange={handleFieldChange}
                      onPaste={handleFieldPaste}
                      onKeyDown={handleFieldKeyDown}
                      onFocus={handleFieldFocus}
                      onBlur={handleFieldBlur}
                    />
                  </Combobox.EventsTarget>
                ),
              )}
            </Pill.Group>
          </PillsInput>
        </Combobox.DropdownTarget>
        <OptionsDropdown
          data={options}
          search={fieldValue}
          nothingFoundMessage={nothingFoundMessage}
          hiddenWhenEmpty={!nothingFoundMessage}
          filter={undefined}
          limit={undefined}
          maxDropdownHeight={undefined}
          unstyled={false}
          labelId={undefined}
          withScrollArea={undefined}
          scrollAreaProps={undefined}
          aria-label={undefined}
        />
      </Combobox>
      <Combobox.HiddenInput value={values} />
    </>
  );
}
