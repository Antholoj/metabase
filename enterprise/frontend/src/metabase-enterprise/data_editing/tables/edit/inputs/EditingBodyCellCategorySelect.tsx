import { useCallback, useEffect, useMemo, useState } from "react";
import { t } from "ttag";

import { useSearchFieldValuesQuery } from "metabase/api";
import { useDebouncedValue } from "metabase/hooks/use-debounced-value";
import { getFieldOptions } from "metabase/querying/filters/components/FilterValuePicker/utils";
import {
  Box,
  Combobox,
  Icon,
  Input,
  Loader,
  type SelectOption,
  TextInput,
  useCombobox,
} from "metabase/ui";
import type { FieldValue } from "metabase-types/api";

import type { EditingBodyPrimitiveProps } from "./types";

type EditingBodyCellCategorySelectProps = EditingBodyPrimitiveProps & {
  withCreateNew?: boolean;
  getDropdownLabelText?: (item: SelectOption) => string;
  getSelectedLabelText?: (item: SelectOption) => string;
};

const DefaultItemLabelTextGetter = (item: SelectOption) => item.label;
const DefaultSelectedLabelTextGetter = (item: SelectOption) => item.value;

export const EditingBodyCellCategorySelect = ({
  autoFocus,
  inputProps,
  initialValue,
  datasetColumn,
  withCreateNew = true,
  classNames,
  getDropdownLabelText = DefaultItemLabelTextGetter,
  getSelectedLabelText = DefaultSelectedLabelTextGetter,
  onSubmit,
  onChangeValue,
  onCancel,
}: EditingBodyCellCategorySelectProps) => {
  const [value, setValue] = useState(initialValue?.toString() ?? "");
  const [search, setSearch] = useState("");

  const combobox = useCombobox({
    defaultOpened: autoFocus,
    onDropdownClose: onCancel,
  });

  const { options, isLoading, isFetching } = useCategorySelectSearchOptions({
    search,
    fieldId: datasetColumn?.id,
    // Mostly used for FKs, e.g. an ID is remapped to a name
    searchFieldId: datasetColumn.remapped_to_column?.id ?? datasetColumn.id,
    getDropdownLabelText,
  });

  const handleOptionSubmit = useCallback(
    (value: string) => {
      setValue(value);
      onSubmit(value);
      onChangeValue?.(value);
      combobox.toggleDropdown();
    },
    [onSubmit, setValue, onChangeValue, combobox],
  );

  const optionValueToOptionMap = useMemo(
    () =>
      options.reduce(
        (map, item) => ({
          ...map,
          [item.value]: item,
        }),
        {} as Record<string, SelectOption>,
      ),
    [options],
  );

  const inputLabel = useMemo(() => {
    if (isLoading) {
      return (
        <Input.Placeholder c="text-light">{t`Loading...`}</Input.Placeholder>
      );
    }

    if (!value && inputProps?.placeholder) {
      return (
        <Input.Placeholder c="text-light">
          {inputProps.placeholder}
        </Input.Placeholder>
      );
    }

    if (value) {
      // Type safety, should always be present
      if (value in optionValueToOptionMap) {
        return getSelectedLabelText(optionValueToOptionMap[value]);
      }

      return value;
    }

    return null;
  }, [
    isLoading,
    value,
    optionValueToOptionMap,
    inputProps?.placeholder,
    getSelectedLabelText,
  ]);

  return (
    <Combobox
      store={combobox}
      position="bottom-start"
      onOptionSubmit={handleOptionSubmit}
    >
      <Combobox.Target>
        <Input
          component="button"
          type="button"
          pointer
          onClick={() => combobox.openDropdown()}
          {...inputProps}
          classNames={{
            wrapper: classNames?.wrapper,
            input: classNames?.selectTextInputElement,
          }}
        >
          {inputLabel}
        </Input>
      </Combobox.Target>

      <Combobox.Dropdown mah="none" miw={250}>
        <Box p="0.5rem" pb="0" bg="white" pos="sticky" top={0}>
          <TextInput
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={t`Search the list`}
            leftSection={<Icon name="search" />}
            rightSection={isFetching ? <Loader size="xs" /> : undefined}
            autoFocus
          />
        </Box>

        <Combobox.Options p="0.5rem">
          {options.length > 0 ? (
            options.map((item) => (
              <Combobox.Option
                selected={value === item.value}
                value={item.value}
                key={item.value}
              >
                {getDropdownLabelText(item)}
              </Combobox.Option>
            ))
          ) : isLoading ? (
            <Combobox.Empty>{t`Loading values...`}</Combobox.Empty>
          ) : withCreateNew ? (
            <Combobox.Option value={search}>
              {t`Add option:`} <strong>{search}</strong>
            </Combobox.Option>
          ) : (
            <Combobox.Empty>{t`Nothing found`}</Combobox.Empty>
          )}
        </Combobox.Options>
      </Combobox.Dropdown>
    </Combobox>
  );
};

const SEARCH_LIMIT_DEFAULT = 20;
const SEARCH_DEBOUNCE = 500;

type UseCategorySelectSearchOptionsProps = {
  search: string;
  fieldId?: number;
  searchFieldId?: number;
  limit?: number;
  getDropdownLabelText: (item: SelectOption) => string;
};

function useCategorySelectSearchOptions({
  search,
  fieldId,
  searchFieldId,
  limit = SEARCH_LIMIT_DEFAULT,
  getDropdownLabelText,
}: UseCategorySelectSearchOptionsProps) {
  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE);
  const [searchValueToFetch, setSearchValueToFetch] = useState(debouncedSearch);

  // Values that are fetched without search value (all values with some limit)
  const [initialFieldValues, setInitialFieldValues] = useState<
    FieldValue[] | undefined
  >(undefined);

  // Local search is performed if there are less than `limit` initial values
  const shouldPerformLocalSearch =
    initialFieldValues && initialFieldValues.length < limit;

  // Update the search value to fetch on every debounced search value change
  // if the local search is disabled
  useEffect(() => {
    if (!shouldPerformLocalSearch) {
      setSearchValueToFetch(debouncedSearch);
    }
  }, [debouncedSearch, shouldPerformLocalSearch]);

  const {
    data: fieldValues,
    isLoading,
    isFetching,
  } = useSearchFieldValuesQuery(
    {
      fieldId: fieldId ?? -1, // type guard
      searchFieldId: searchFieldId ?? -1, // type guard
      // empty string is invalid from the API perspective
      value: searchValueToFetch === "" ? undefined : searchValueToFetch,
      limit: SEARCH_LIMIT_DEFAULT,
    },
    { skip: fieldId === undefined },
  );

  useEffect(() => {
    if (!initialFieldValues && fieldValues) {
      setInitialFieldValues(fieldValues);
    }
  }, [initialFieldValues, fieldValues]);

  const options = useMemo(() => {
    if (fieldValues) {
      const options = getFieldOptions(fieldValues);

      if (shouldPerformLocalSearch) {
        return options.filter((item) =>
          getDropdownLabelText(item)
            .toLowerCase()
            .includes(search.toLowerCase().trim()),
        );
      }

      return options;
    }

    return [];
  }, [shouldPerformLocalSearch, fieldValues, search, getDropdownLabelText]);

  return {
    options,
    isLoading,
    isFetching:
      (isFetching || search !== debouncedSearch) && !shouldPerformLocalSearch,
  };
}
