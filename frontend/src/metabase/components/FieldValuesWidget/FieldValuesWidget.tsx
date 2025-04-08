import cx from "classnames";
import type { StyleHTMLAttributes } from "react";
import { forwardRef, useEffect, useRef, useState } from "react";
import { useMount, usePrevious, useUnmount } from "react-use";
import { t } from "ttag";
import _ from "underscore";

import ErrorBoundary from "metabase/ErrorBoundary";
import { ListField } from "metabase/components/ListField";
import LoadingSpinner from "metabase/components/LoadingSpinner";
import SingleSelectListField from "metabase/components/SingleSelectListField";
import ValueComponent from "metabase/components/Value";
import CS from "metabase/css/core/index.css";
import Fields from "metabase/entities/fields";
import { parseNumber } from "metabase/lib/number";
import { defer } from "metabase/lib/promise";
import { connect, useDispatch } from "metabase/lib/redux";
import { isNotNull } from "metabase/lib/types";
import {
  fetchCardParameterValues,
  fetchDashboardParameterValues,
  fetchParameterValues,
} from "metabase/parameters/actions";
import { addRemappings } from "metabase/redux/metadata";
import { Loader, MultiAutocomplete } from "metabase/ui";
import type Question from "metabase-lib/v1/Question";
import type Field from "metabase-lib/v1/metadata/Field";
import type {
  Dashboard,
  FieldValue,
  Parameter,
  RowValue,
} from "metabase-types/api";
import type { State } from "metabase-types/store";

import ExplicitSize from "../ExplicitSize";

import type { LoadingStateType, ValuesMode } from "./types";
import {
  canUseCardEndpoints,
  canUseDashboardEndpoints,
  canUseParameterEndpoints,
  dedupeValues,
  getLabel,
  getNonVirtualFields,
  getTokenFieldPlaceholder,
  getValue,
  getValuesMode,
  hasList,
  isExtensionOfPreviousSearch,
  isNumeric,
  searchFieldValues,
  shouldList,
  showRemapping,
} from "./utils";

const MAX_SEARCH_RESULTS = 100;

function mapStateToProps(state: State, { fields = [] }: { fields: Field[] }) {
  return {
    fields: fields.map(
      (field) =>
        Fields.selectors.getObject(state, { entityId: field.id }) || field,
    ),
  };
}

export interface IFieldValuesWidgetProps {
  color?: "brand";
  maxResults?: number;
  style?: StyleHTMLAttributes<HTMLDivElement>;
  formatOptions?: Record<string, any>;

  containerWidth?: number | string;
  maxWidth?: number | null;
  minWidth?: number | null;
  width?: number | null;

  disableList?: boolean;
  disableSearch?: boolean;
  disablePKRemappingForSearch?: boolean;
  alwaysShowOptions?: boolean;
  showOptionsInPopover?: boolean;

  parameter?: Parameter;
  parameters?: Parameter[];
  fields: Field[];
  dashboard?: Dashboard | null;
  question?: Question;

  value: RowValue[];
  onChange: (value: RowValue[]) => void;

  multi?: boolean;
  autoFocus?: boolean;
  className?: string;
  placeholder?: string;
  checkedColor?: string;

  optionRenderer?: (option: FieldValue) => JSX.Element;
}

export const FieldValuesWidgetInner = forwardRef<
  HTMLDivElement,
  IFieldValuesWidgetProps
>(function FieldValuesWidgetInner(
  {
    maxResults = MAX_SEARCH_RESULTS,
    formatOptions = {},
    containerWidth,
    maxWidth = 500,
    minWidth,
    width,
    disableList = false,
    disableSearch = false,
    disablePKRemappingForSearch,
    parameter,
    parameters,
    fields,
    dashboard,
    question,
    value,
    onChange,
    multi,
    autoFocus,
    className,
    placeholder,
    checkedColor,
    optionRenderer,
  },
  ref,
) {
  const [options, setOptions] = useState<FieldValue[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingStateType>("INIT");
  const [lastValue, setLastValue] = useState<string>("");
  const [valuesMode, setValuesMode] = useState<ValuesMode>(
    getValuesMode({
      parameter,
      fields,
      disableSearch,
      disablePKRemappingForSearch,
    }),
  );
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();

  const previousWidth = usePrevious(width);

  useMount(() => {
    if (shouldList({ parameter, fields, disableSearch })) {
      fetchValues();
    }
  });

  useEffect(() => {
    if (
      typeof width === "number" &&
      typeof previousWidth === "number" &&
      width > previousWidth
    ) {
      setIsExpanded(true);
    }
  }, [width, previousWidth]);

  const _cancel = useRef<null | (() => void)>(null);

  useUnmount(() => {
    _cancel?.current?.();
  });

  const fetchValues = async (query?: string) => {
    setLoadingState("LOADING");
    setOptions([]);

    let newOptions: FieldValue[] = [];
    let newValuesMode = valuesMode;
    try {
      if (canUseDashboardEndpoints(dashboard)) {
        const { values, has_more_values } =
          await dispatchFetchDashboardParameterValues(query);
        newOptions = values;
        newValuesMode = has_more_values ? "search" : newValuesMode;
      } else if (canUseCardEndpoints(question)) {
        const { values, has_more_values } =
          await dispatchFetchCardParameterValues(query);
        newOptions = values;
        newValuesMode = has_more_values ? "search" : newValuesMode;
      } else if (canUseParameterEndpoints(parameter)) {
        const { values, has_more_values } =
          await dispatchFetchParameterValues(query);
        newOptions = values;
        newValuesMode = has_more_values ? "search" : newValuesMode;
      } else {
        newOptions = await fetchFieldValues(query);

        newValuesMode = getValuesMode({
          parameter,
          fields,
          disableSearch,
          disablePKRemappingForSearch,
        });
      }
    } finally {
      updateRemappings(newOptions);

      setOptions(newOptions);
      setLoadingState("LOADED");
      setValuesMode(newValuesMode);
    }
  };

  const fetchFieldValues = async (query?: string): Promise<FieldValue[]> => {
    if (query == null) {
      const nonVirtualFields = getNonVirtualFields(fields);

      const results = await Promise.all(
        nonVirtualFields.map((field) =>
          dispatch(Fields.objectActions.fetchFieldValues(field)),
        ),
      );

      // extract the field values from the API response(s)
      // the entity loader has inconsistent return structure, so we have to handle both
      const fieldValues: FieldValue[][] = nonVirtualFields.map(
        (field, index) =>
          results[index]?.payload?.values ??
          Fields.selectors.getFieldValues(results[index]?.payload, {
            entityId: field.getUniqueId(),
          }),
      );

      return dedupeValues(fieldValues);
    } else {
      const cancelDeferred = defer();
      const cancelled: Promise<unknown> = cancelDeferred.promise;
      _cancel.current = () => {
        _cancel.current = null;
        cancelDeferred.resolve();
      };

      const options = await searchFieldValues(
        {
          value: query,
          fields,
          disablePKRemappingForSearch,
          maxResults,
        },
        cancelled,
      );

      _cancel.current = null;
      return options;
    }
  };

  const dispatchFetchParameterValues = async (query?: string) => {
    if (!parameter) {
      return { has_more_values: false, values: [] };
    }

    return dispatch(
      fetchParameterValues({
        parameter,
        query,
      }),
    );
  };

  const dispatchFetchCardParameterValues = async (query?: string) => {
    const cardId = question?.id();

    if (!isNotNull(cardId) || !parameter) {
      return { has_more_values: false, values: [] };
    }

    return dispatch(
      fetchCardParameterValues({
        cardId,
        parameter,
        query,
      }),
    );
  };

  const dispatchFetchDashboardParameterValues = async (query?: string) => {
    const dashboardId = dashboard?.id;

    if (!isNotNull(dashboardId) || !parameter || !parameters) {
      return { has_more_values: false, values: [] };
    }

    return dispatch(
      fetchDashboardParameterValues({
        dashboardId,
        parameter,
        parameters,
        query,
      }),
    );
  };

  // ? this may rely on field mutations
  const updateRemappings = (options: FieldValue[]) => {
    if (showRemapping(fields)) {
      const [field] = fields;
      if (
        field.remappedField() === field.searchField(disablePKRemappingForSearch)
      ) {
        dispatch(addRemappings(field.id, options));
      }
    }
  };

  const onInputChange = (value: string) => {
    let localValuesMode = valuesMode;

    // override "search" mode when searching is unnecessary
    localValuesMode = isExtensionOfPreviousSearch(
      value,
      lastValue,
      options,
      maxResults,
    )
      ? "list"
      : localValuesMode;

    if (localValuesMode === "search") {
      _search(value);
    }

    return value;
  };

  const search = useRef(
    _.debounce(async (value: string) => {
      if (!value) {
        setLoadingState("INIT");
        return;
      }

      await fetchValues(value);

      setLastValue(value);
    }, 500),
  );

  const _search = (value: string) => {
    if (_cancel.current) {
      _cancel.current();
    }

    search.current(value);
  };

  if (!optionRenderer) {
    optionRenderer = (option: FieldValue) =>
      renderValue({
        fields,
        formatOptions,
        value: option[0],
        autoLoad: false,
        displayValue: option[1],
      });
  }

  const tokenFieldPlaceholder = getTokenFieldPlaceholder({
    fields,
    parameter,
    disableSearch,
    placeholder,
    disablePKRemappingForSearch,
    options,
    valuesMode,
  });

  const isListMode =
    !disableList &&
    shouldList({ parameter, fields, disableSearch }) &&
    valuesMode === "list";
  const isLoading = loadingState === "LOADING";
  const isLoaded = loadingState === "LOADED";
  const hasListValues = hasList({
    parameter,
    fields,
    disableSearch,
    options,
  });
  const isNumericParameter = isNumeric(fields[0], parameter);

  return (
    <ErrorBoundary ref={ref}>
      <div
        data-testid="field-values-widget"
        style={{
          width: (isExpanded ? maxWidth : containerWidth) ?? undefined,
          minWidth: minWidth ?? undefined,
          maxWidth: maxWidth ?? undefined,
        }}
        ref={ref}
      >
        {isListMode && isLoading ? (
          <LoadingState />
        ) : isListMode && hasListValues && multi ? (
          <ListField
            isDashboardFilter={!!parameter}
            placeholder={tokenFieldPlaceholder}
            value={value?.filter((v: RowValue) => v != null)}
            onChange={onChange}
            options={options}
            optionRenderer={optionRenderer}
            checkedColor={checkedColor}
          />
        ) : isListMode && hasListValues && !multi ? (
          <SingleSelectListField
            isDashboardFilter={!!parameter}
            placeholder={tokenFieldPlaceholder}
            value={value.filter((v) => v != null)}
            onChange={onChange}
            options={options}
            optionRenderer={optionRenderer}
            checkedColor={checkedColor}
          />
        ) : (
          <MultiAutocomplete
            className={className}
            values={value
              .filter((value) => value != null)
              .map((value) => String(value))}
            options={options
              .filter((option) => getValue(option) != null)
              .map((option) => ({
                value: String(getValue(option)),
                label: String(getLabel(option) ?? getValue(option)),
              }))}
            placeholder={tokenFieldPlaceholder}
            rightSection={isLoading ? <Loader size="xs" /> : undefined}
            nothingFoundMessage={
              isLoaded ? getNothingFoundMessage(fields) : undefined
            }
            autoFocus={autoFocus}
            onCreate={(value) => {
              if (isNumericParameter) {
                const number = parseNumber(value);
                return number != null ? String(number) : null;
              } else {
                const string = value.trim();
                return string.length > 0 ? string : null;
              }
            }}
            onChange={(values) => {
              if (isNumericParameter) {
                onChange(
                  values.map((value) => {
                    const number = parseNumber(value);
                    return typeof number === "bigint" ? String(number) : number;
                  }),
                );
              } else {
                onChange(values);
              }
            }}
            onSearchChange={onInputChange}
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

export const FieldValuesWidget = ExplicitSize<IFieldValuesWidgetProps>()(
  FieldValuesWidgetInner,
);

// eslint-disable-next-line import/no-default-export
export default connect(mapStateToProps, null, null, { forwardRef: true })(
  FieldValuesWidget,
);

const LoadingState = () => (
  <div
    className={cx(CS.flex, CS.layoutCentered, CS.alignCenter)}
    style={{ minHeight: 82 }}
  >
    <LoadingSpinner size={16} />
  </div>
);

function getNothingFoundMessage(fields: (Field | null)[]) {
  if (fields.length === 1 && fields[0] != null) {
    return t`No matching ${fields[0]?.display_name} found.`;
  } else {
    return t`No matching result`;
  }
}

function renderValue({
  fields,
  formatOptions,
  value,
  autoLoad,
  compact,
  displayValue,
}: {
  fields: Field[];
  formatOptions: Record<string, any>;
  value: RowValue;
  autoLoad?: boolean;
  compact?: boolean;
  displayValue?: string;
}) {
  return (
    <ValueComponent
      value={value}
      column={fields[0]}
      maximumFractionDigits={20}
      remap={displayValue || showRemapping(fields)}
      displayValue={displayValue}
      {...formatOptions}
      autoLoad={autoLoad}
      compact={compact}
    />
  );
}
