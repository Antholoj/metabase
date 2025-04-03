import { useState } from "react";
import { useDebounce } from "react-use";
import { t } from "ttag";

import { useSearchFieldValuesQuery } from "metabase/api";
import { Loader, MultiAutocomplete } from "metabase/ui";
import type { FieldId, FieldValue } from "metabase-types/api";

import { getFieldOptions } from "../utils";

import { SEARCH_DEBOUNCE, SEARCH_LIMIT } from "./constants";
import {
  getFilteredOptions,
  getNothingFoundMessage,
  shouldSearch,
} from "./utils";

interface SearchValuePickerProps {
  fieldId: FieldId;
  searchFieldId: FieldId;
  fieldValues: FieldValue[];
  selectedValues: string[];
  columnDisplayName: string;
  shouldCreate?: (query: string) => boolean;
  autoFocus?: boolean;
  onChange: (newValues: string[]) => void;
}

export function SearchValuePicker({
  fieldId,
  searchFieldId,
  fieldValues: initialFieldValues,
  selectedValues,
  columnDisplayName,
  shouldCreate,
  autoFocus,
  onChange,
}: SearchValuePickerProps) {
  const [searchValue, setSearchValue] = useState("");
  const [searchQuery, setSearchQuery] = useState(searchValue);
  const canSearch = searchQuery.length > 0;

  const {
    data: searchFieldValues = [],
    error: searchError,
    isFetching: isSearching,
  } = useSearchFieldValuesQuery(
    {
      fieldId,
      searchFieldId,
      value: searchQuery,
      limit: SEARCH_LIMIT,
    },
    {
      skip: !canSearch,
    },
  );

  const searchOptions = canSearch
    ? getFieldOptions(searchFieldValues)
    : getFieldOptions(initialFieldValues);
  const visibleOptions = getFilteredOptions(
    searchOptions,
    searchValue,
    selectedValues,
  );
  const nothingFoundMessage = getNothingFoundMessage(
    columnDisplayName,
    searchError,
    canSearch,
    isSearching,
  );

  const handleSearchChange = (newSearchValue: string) => {
    setSearchValue(newSearchValue);
    if (newSearchValue === "") {
      setSearchQuery(newSearchValue);
    }
  };

  const handleSearchTimeout = () => {
    if (shouldSearch(searchValue, searchQuery, searchFieldValues)) {
      setSearchQuery(searchValue);
    }
  };

  useDebounce(handleSearchTimeout, SEARCH_DEBOUNCE, [searchValue]);

  return (
    <MultiAutocomplete
      values={selectedValues}
      options={visibleOptions}
      shouldCreate={shouldCreate}
      placeholder={t`Search by ${columnDisplayName}`}
      autoFocus={autoFocus}
      rightSection={isSearching ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={nothingFoundMessage}
      onChange={onChange}
      onSearchChange={handleSearchChange}
    />
  );
}
