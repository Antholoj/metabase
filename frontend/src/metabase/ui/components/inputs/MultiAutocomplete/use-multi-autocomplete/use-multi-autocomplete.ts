import { type ComboboxItem, useCombobox } from "@mantine/core";
import { parse } from "csv-parse/browser/esm/sync";
import {
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
  type MouseEvent,
  useMemo,
  useState,
} from "react";

const DELIMITERS = [",", "\t", "\n"];
const QUOTE_CHAR = '"';
const ESCAPE_CHAR = "\\";
const QUOTED_CHARS = /["\\,]/;
const ESCAPED_CHARS = /["\\]/g;
const FIELD_PLACEHOLDER = null;

type UseMultiAutocompleteProps = {
  values: string[];
  options: ComboboxItem[];
  onCreate?: (rawValue: string) => string | null;
  onChange: (newValues: string[]) => void;
  onSearchChange?: (newValue: string) => void;
};

type FieldState = {
  fieldValue: string;
  fieldSelection?: FieldSelection;
  fieldMinWidth?: number;
};

type FieldSelection = {
  index: number;
  length: number;
};

export function useMultiAutocomplete({
  values,
  options,
  onCreate = defaultCreate,
  onChange,
  onSearchChange,
}: UseMultiAutocompleteProps) {
  const combobox = useCombobox({
    onDropdownClose: () => combobox.resetSelectedOption(),
  });
  const [fieldValue, setFieldValue] = useState("");
  const [_fieldSelection, setFieldSelection] = useState<FieldSelection>();
  const [fieldMinWidth, setFieldMinWidth] = useState<number>();
  const fieldSelection = _fieldSelection ?? { index: values.length, length: 0 };
  const searchValue = useMemo(() => getSearchValue(fieldValue), [fieldValue]);
  const optionByValue = useMemo(() => getOptionByValue(options), [options]);

  const setFieldState = ({
    fieldValue,
    fieldSelection,
    fieldMinWidth,
  }: FieldState) => {
    setFieldValue(fieldValue);
    setFieldSelection(fieldSelection);
    setFieldMinWidth(fieldMinWidth);

    const newSearchValue = getSearchValue(fieldValue);
    onSearchChange?.(newSearchValue);
  };

  const resetFieldState = () => {
    setFieldState({ fieldValue: "" });
  };

  const handleFieldInput = (
    newFieldValue: string,
    newParsedValues: string[],
  ) => {
    const newFieldValues = getFieldValuesWithoutDuplicates(
      values,
      newParsedValues.map(onCreate).filter(isNotNullish),
      fieldSelection,
    );
    const newValues = getValuesAfterChange(
      values,
      newFieldValues,
      fieldSelection,
    );
    onChange(newValues);
    const newFieldState = getFieldStateAfterChange(
      newFieldValue,
      newParsedValues,
      newFieldValues,
      fieldSelection,
    );
    setFieldState(newFieldState);
    combobox.openDropdown();
  };

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newFieldValue = event.target.value;
    const newParsedValues = parseCsv(newFieldValue);
    handleFieldInput(newFieldValue, newParsedValues);
  };

  const handleFieldPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const { selectionStart, selectionEnd } = event.currentTarget;
    const clipboardData = event.clipboardData.getData("text");
    const newParsedValues = parseCsv(clipboardData);

    if (newParsedValues.length > 1) {
      event.preventDefault();
      const newFieldValue = "";
      const newParsedValuesWithFieldValue =
        getParsedValuesCombinedWithFieldValue(
          fieldValue,
          newParsedValues,
          selectionStart,
          selectionEnd,
        );
      handleFieldInput(newFieldValue, newParsedValuesWithFieldValue);
    }
  };

  const handleFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      event.key === "Enter" &&
      combobox.selectedOptionIndex < 0 &&
      fieldSelection.length > 0
    ) {
      event.preventDefault();
      resetFieldState();
    }

    if (
      event.key === "Backspace" &&
      fieldValue.length === 0 &&
      fieldSelection.index > 0 &&
      fieldSelection.length === 0
    ) {
      const newValues = [...values];
      newValues.splice(fieldSelection.index - 1, 1);
      onChange(newValues);
      setFieldState({
        fieldValue: "",
        fieldSelection: {
          index: fieldSelection.index - 1,
          length: 0,
        },
      });
    }
  };

  const handleFieldFocus = () => {
    combobox.openDropdown();
  };

  const handleFieldBlur = () => {
    resetFieldState();
    combobox.closeDropdown();
  };

  const handlePillClick = (
    event: MouseEvent<HTMLDivElement>,
    valueIndex: number,
  ) => {
    const selectedValue = values[valueIndex];
    const selectedOption = optionByValue[selectedValue];
    const pillRect = event.currentTarget.getBoundingClientRect();

    setFieldState({
      fieldValue: escapeCsv(selectedOption?.label ?? selectedValue),
      fieldSelection: { index: valueIndex, length: 1 },
      fieldMinWidth: pillRect.width,
    });
  };

  const handlePillRemoveClick = (valueIndex: number) => {
    const newValues = [...values];
    newValues.splice(valueIndex, 1);
    onChange(newValues);
    resetFieldState();
  };

  const handlePillGroupClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      resetFieldState();
    }
  };

  const handlePillsInputClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      resetFieldState();
    }
    combobox.openDropdown();
  };

  const handleOptionSubmit = (value: string) => {
    const newFieldValues = getFieldValuesWithoutDuplicates(
      values,
      [value],
      fieldSelection,
    );
    const newValues = getValuesAfterChange(
      values,
      newFieldValues,
      fieldSelection,
    );
    onChange(newValues);
    setFieldState({
      fieldValue: "",
      fieldSelection: {
        index: fieldSelection.index + newFieldValues.length,
        length: 0,
      },
    });
    combobox.closeDropdown();
    combobox.resetSelectedOption();
  };

  return {
    combobox,
    pillValues: getPillValues(values, optionByValue, fieldSelection),
    filteredOptions: getOptionsWithoutDuplicates(
      values,
      options,
      fieldSelection,
    ),
    fieldValue,
    fieldMinWidth,
    searchValue,
    handleFieldChange,
    handleFieldPaste,
    handleFieldKeyDown,
    handleFieldFocus,
    handleFieldBlur,
    handlePillClick,
    handlePillRemoveClick,
    handlePillGroupClick,
    handlePillsInputClick,
    handleOptionSubmit,
  };
}

function getOptionByValue(options: ComboboxItem[]) {
  return Object.fromEntries(options.map((option) => [option.value, option]));
}

function getSearchValue(fieldValue: string) {
  const parsedValues = parseCsv(fieldValue);
  return parsedValues.length === 1 ? parsedValues[0] : fieldValue;
}

function getPillValues(
  values: string[],
  optionByValue: Record<string, ComboboxItem>,
  fieldSelection: FieldSelection,
) {
  const mappedValues = values.map(
    (value) => optionByValue[value]?.label ?? value,
  );
  return getValuesAfterChange(
    mappedValues,
    [FIELD_PLACEHOLDER],
    fieldSelection,
  );
}

function getValuesNotInSelection(
  values: string[],
  fieldSelection: FieldSelection,
) {
  const startValues = values.slice(0, fieldSelection.index);
  const endValues = values.slice(fieldSelection.index + fieldSelection.length);
  return [...startValues, ...endValues];
}

function getOptionsWithoutDuplicates(
  values: string[],
  options: ComboboxItem[],
  fieldSelection: FieldSelection,
) {
  const usedValues = new Set(getValuesNotInSelection(values, fieldSelection));
  return options.reduce((options: ComboboxItem[], option) => {
    if (!usedValues.has(option.value)) {
      options.push(option);
      usedValues.add(option.value);
    }
    return options;
  }, []);
}

function getFieldValuesWithoutDuplicates(
  values: string[],
  fieldValues: string[],
  fieldSelection: FieldSelection,
) {
  const usedValues = new Set(getValuesNotInSelection(values, fieldSelection));
  return fieldValues.reduce((fieldValues: string[], value) => {
    if (!usedValues.has(value)) {
      fieldValues.push(value);
      usedValues.add(value);
    }
    return fieldValues;
  }, []);
}

function getValuesAfterChange<T>(
  values: T[],
  fieldValues: T[],
  fieldSelection: FieldSelection,
) {
  const startValues = values.slice(0, fieldSelection.index);
  const endValues = values.slice(fieldSelection.index + fieldSelection.length);
  return [...startValues, ...fieldValues, ...endValues];
}

function getFieldStateAfterChange(
  fieldValue: string,
  parsedValues: string[],
  fieldValues: string[], // `parsedValues` with duplicates and invalid values removed
  fieldSelection: FieldSelection,
) {
  const isDelimiter = DELIMITERS.some((delimiter) =>
    fieldValue.endsWith(delimiter),
  );

  // Reset the input state when there is a delimiter and some parsed values,
  // even if all of them are rejected by validation. Parsed values are taken
  // into account to allow entering values when the delimiter is escaped; in
  // this case it will be an empty array until there is a closing quote.
  //
  // When the new input value contains multiple values, we reset the input state
  // immediately. It can happen both with copy-pasting and regular input. With
  // regular input, the user can enter "abc" and then "ab,c"; in this case "abc"
  // will be replaced by the 2 new values.
  if ((isDelimiter && parsedValues.length > 0) || parsedValues.length > 1) {
    return {
      fieldValue: "",
      fieldSelection: {
        index: fieldSelection.index + fieldValues.length,
        length: 0,
      },
    };
  } else {
    return {
      fieldValue,
      fieldSelection: {
        index: fieldSelection.index,
        length: fieldValues.length > 0 ? 1 : 0,
      },
    };
  }
}

// When pasting, we want to combine the values from the clipboard with the
// existing input value, taking the current selection into account. For example,
// if the input value is "ab<caret>c" and the user pastes "d,e,f", the
// new values should be "abd,e,fc".
function getParsedValuesCombinedWithFieldValue(
  fieldValue: string,
  parsedValues: string[],
  selectionStart: number | null,
  selectionEnd: number | null,
) {
  const prefix =
    selectionStart != null && selectionStart > 0
      ? fieldValue.substring(0, selectionStart)
      : "";
  const suffix =
    selectionEnd != null && selectionEnd < fieldValue.length
      ? fieldValue.substring(selectionEnd)
      : "";

  return [
    `${prefix}${parsedValues[0]}`,
    ...parsedValues.slice(1, parsedValues.length - 1),
    `${parsedValues[parsedValues.length - 1]}${suffix}`,
  ];
}

function parseCsv(rawValue: string): string[] {
  try {
    return parse(rawValue, {
      delimiter: DELIMITERS,
      skip_empty_lines: true,
      relax_column_count: true,
      relax_quotes: true,
      trim: true,
      quote: QUOTE_CHAR,
      escape: ESCAPE_CHAR,
    }).flat();
  } catch (err) {
    return [];
  }
}

function escapeCsv(value: string): string {
  if (QUOTED_CHARS.test(value)) {
    return `${QUOTE_CHAR}${value.replaceAll(ESCAPED_CHARS, (s) => `${ESCAPE_CHAR}${s}`)}${QUOTE_CHAR}`;
  }
  return value;
}

function defaultCreate(value: string) {
  return value.trim().length > 0 ? value : null;
}

function isNotNullish<T>(value: T | null): value is T {
  return value != null;
}
