import type { CellContext, ColumnSizingState } from "@tanstack/react-table";
import cx from "classnames";
import type React from "react";
import {
  type Ref,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import _ from "underscore";

import ExplicitSize from "metabase/components/ExplicitSize";
import ExternalLink from "metabase/core/components/ExternalLink";
import { withMantineTheme } from "metabase/hoc/MantineTheme";
import {
  memoize,
  useMemoizedCallback,
} from "metabase/hooks/use-memoized-callback";
import { formatValue } from "metabase/lib/formatting";
import { useSelector } from "metabase/lib/redux";
import {
  getIsShowingRawTable,
  getQueryBuilderMode,
} from "metabase/query_builder/selectors";
import { getIsEmbeddingSdk } from "metabase/selectors/embed";
import {
  Table,
  useTableInstance,
} from "metabase/visualizations/components/Table";
import { ROW_ID_COLUMN_ID } from "metabase/visualizations/components/Table/constants";
import type {
  BodyCellVariant,
  ColumnOptions,
  RowIdColumnOptions,
} from "metabase/visualizations/components/Table/types";
import {
  getTableCellClickedObject,
  getTableClickedObjectRowData,
  getTableHeaderClickedObject,
} from "metabase/visualizations/lib/table";
import { getColumnExtent } from "metabase/visualizations/lib/utils";
import type {
  QueryClickActionsMode,
  VisualizationProps,
} from "metabase/visualizations/types";
import type { ClickObject, OrderByDirection } from "metabase-lib/types";
import type Question from "metabase-lib/v1/Question";
import { isFK, isPK } from "metabase-lib/v1/types/utils/isa";
import type {
  DatasetColumn,
  RowValue,
  RowValues,
  VisualizationSettings,
} from "metabase-types/api";

import S from "./TableInteractive.module.css";
import { HeaderCellWithColumnInfo } from "./cells/HeaderCellWithColumnInfo";
import { MiniBarCell } from "./cells/MiniBarCell";
import { useObjectDetail } from "./hooks/use-object-detail";

const getBodyCellVariant = (column: DatasetColumn): BodyCellVariant => {
  const isPill = isPK(column) || isFK(column);
  if (isPill) {
    return "pill";
  }

  return "text";
};

const getColumnIdFromPivotedColumnId = (pivotedColumnId: string) =>
  pivotedColumnId.split(":")[0];

interface TableProps extends VisualizationProps {
  onZoomRow?: (objectId: number | string) => void;
  rowIndexToPkMap?: Record<number, string>;
  getColumnSortDirection: (columnIndex: number) => OrderByDirection | undefined;
  onUpdateVisualizationSettings: (settings: VisualizationSettings) => void;
  getColumnTitle: any;
  isPivoted?: boolean;
  hasMetadataPopovers?: boolean;
  question: Question;
  mode: QueryClickActionsMode;
}

const getColumnOrder = (cols: DatasetColumn[], hasIndexColumn: boolean) => {
  const dataColumns = cols.map(col => col.name);
  if (!hasIndexColumn) {
    return dataColumns;
  }
  return [ROW_ID_COLUMN_ID, ...dataColumns];
};

const getColumnSizing = (
  cols: DatasetColumn[],
  widths: number[] = [],
): ColumnSizingState => {
  return cols.reduce((acc: ColumnSizingState, column, index) => {
    const width = widths[index];
    if (width != null) {
      acc[column.name] = width;
    }
    return acc;
  }, {});
};

export const TableInteractiveInner = forwardRef(function TableInteractiveInner(
  {
    className,
    data,
    series,
    height,
    settings,
    width,
    isPivoted = false,
    question,
    clicked,
    getColumnTitle,
    hasMetadataPopovers = true,
    mode,
    visualizationIsClickable,
    getColumnSortDirection,
    onVisualizationClick,
    onUpdateVisualizationSettings,
  }: TableProps,
  ref: Ref<HTMLDivElement>,
) {
  const queryBuilderMode = useSelector(getQueryBuilderMode);
  const isEmbeddingSdk = useSelector(getIsEmbeddingSdk);
  const isRawTable = useSelector(getIsShowingRawTable);

  const { rows, cols } = data;

  const prevColNamesRef = useRef<Set<string>>(
    new Set(cols.map(col => col.name)),
  );

  const columnOrder = useMemo(() => {
    return getColumnOrder(cols, settings["table.row_index"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, settings["table.row_index"]]);

  const columnSizing = useMemo(() => {
    return getColumnSizing(cols, settings["table.column_widths"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, settings["table.column_widths"]]);

  const onOpenObjectDetail = useObjectDetail(data);

  const getIsCellClickable = useMemoizedCallback(
    (clicked: ClickObject) => {
      return visualizationIsClickable(clicked);
    },
    [onVisualizationClick, visualizationIsClickable],
  );

  const getCellClickedObject = useMemoizedCallback(
    (datasetColumnIndex: number, rowIndex: number) => {
      const clickedRowData = getTableClickedObjectRowData(
        series as any,
        rowIndex,
        datasetColumnIndex,
        isPivoted,
        data,
      );

      const clicked = getTableCellClickedObject(
        data,
        settings,
        rowIndex,
        datasetColumnIndex,
        isPivoted,
        clickedRowData,
      );

      return clicked;
    },
    [series, isPivoted, data, settings],
  );

  const columnFormatters = useMemo(() => {
    return cols.map(col => {
      const columnSettings = settings.column?.(col);
      const columnIndex = cols.findIndex(c => c.name === col.name);

      return memoize((value, rowIndex) => {
        const clicked = getCellClickedObject(columnIndex, rowIndex);
        return formatValue(value, {
          ...columnSettings,
          type: "cell",
          jsx: true,
          rich: true,
          clicked,
        });
      });
    });
  }, [cols, settings, getCellClickedObject]);

  const handleBodyCellClick = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      rowIndex: number,
      columnId: string,
    ) => {
      if (isPivoted) {
        columnId = getColumnIdFromPivotedColumnId(columnId);
      }

      if (columnId === ROW_ID_COLUMN_ID) {
        onOpenObjectDetail(rowIndex);
        return;
      }

      const columnIndex = data.cols.findIndex(col => col.name === columnId);
      const formatter = columnFormatters[columnIndex];
      const formattedValue = formatter(
        data.rows[rowIndex][columnIndex],
        rowIndex,
      );
      const clicked = getCellClickedObject(columnIndex, rowIndex);

      const isLink = (formattedValue as any)?.type === ExternalLink;
      if (getIsCellClickable(clicked) && !isLink) {
        onVisualizationClick?.({
          ...clicked,
          element: event.currentTarget,
        });
      }
    },
    [
      data,
      isPivoted,
      columnFormatters,
      getIsCellClickable,
      getCellClickedObject,
      onOpenObjectDetail,
      onVisualizationClick,
    ],
  );

  const handleHeaderCellClick = useCallback(
    (
      event: React.MouseEvent<HTMLDivElement, MouseEvent>,
      columnId?: string,
    ) => {
      if (!columnId) {
        return;
      }

      if (isPivoted) {
        columnId = getColumnIdFromPivotedColumnId(columnId);
      }

      const columnIndex = data.cols.findIndex(col => col.name === columnId);
      if (columnIndex === -1) {
        return;
      }
      const clicked = getTableHeaderClickedObject(data, columnIndex, isPivoted);
      onVisualizationClick({ ...clicked, element: event.currentTarget });
    },
    [data, isPivoted, onVisualizationClick],
  );

  const handleColumnReordering = useCallback(
    (columnsOrder: string[]) => {
      const result = settings["table.columns"]?.slice() ?? [];

      const enabledIndices = result
        .map((col, index) => (col.enabled ? index : -1))
        .filter(index => index !== -1);

      columnsOrder.forEach((columnName, orderIndex) => {
        const sourceIndex = result.findIndex(col => col.name === columnName);
        if (sourceIndex !== -1) {
          const targetIndex = enabledIndices[orderIndex];

          const [column] = result.splice(sourceIndex, 1);
          result.splice(targetIndex, 0, column);

          if (sourceIndex > targetIndex) {
            for (let i = orderIndex + 1; i < enabledIndices.length; i++) {
              enabledIndices[i]++;
            }
          }
        }
      });

      const settingsUpdate = {
        "table.columns": result,
      };

      onUpdateVisualizationSettings(settingsUpdate);
    },
    [onUpdateVisualizationSettings, settings],
  );

  const handleAddColumnButtonClick = useMemo(() => {
    if (!question || !mode?.clickActions || !onVisualizationClick) {
      return undefined;
    }

    for (const action of mode.clickActions) {
      const res = action({
        question,
        clicked: {
          columnShortcuts: true,
          extraData: {
            isRawTable,
          },
        },
      });
      if (res?.length > 0) {
        return (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
          onVisualizationClick({
            columnShortcuts: true,
            element: e.currentTarget,
          });
        };
      }
    }
  }, [isRawTable, mode, onVisualizationClick, question]);

  const columnsOptions: ColumnOptions<RowValues, RowValue>[] = useMemo(() => {
    return cols.map((col, columnIndex) => {
      const columnSettings = settings.column?.(col) ?? {};

      const wrap = Boolean(columnSettings["text_wrapping"]);
      const isMinibar = columnSettings["show_mini_bar"];
      const cellVariant = getBodyCellVariant(col);
      const headerVariant = mode != null ? "light" : "outline";
      const getBackgroundColor = memoize((value: RowValue, rowIndex: number) =>
        settings["table._cell_background_getter"]?.(value, rowIndex, col.name),
      );

      const formatter = columnFormatters[columnIndex];
      const columnName = getColumnTitle(columnIndex);

      let align;
      let id;
      let sortDirection: "asc" | "desc" | undefined;
      if (isPivoted) {
        align = columnIndex === 0 ? "right" : columnSettings["text_align"];
        id = `${col.name}:${columnIndex}`;
      } else {
        align = columnSettings["text_align"];
        id = col.name;
        sortDirection = getColumnSortDirection(columnIndex);
      }

      const options: ColumnOptions<RowValues, RowValue> = {
        id,
        name: columnName,
        accessorFn: (row: RowValues) => row[columnIndex],
        cellVariant,
        header: () => {
          return (
            <HeaderCellWithColumnInfo
              infoPopoversDisabled={!hasMetadataPopovers}
              timezone={data.requested_timezone}
              question={question}
              column={col}
              name={columnName}
              align={align}
              sort={sortDirection}
              variant={headerVariant}
            />
          );
        },
        headerClickTargetSelector: "[data-header-click-target]",
        align,
        wrap,
        sortDirection,
        enableResizing: true,
        getBackgroundColor,
        formatter,
      };

      if (isMinibar) {
        options.cell = ({
          getValue,
          row,
        }: CellContext<RowValues, RowValue>) => {
          const value = getValue();
          const backgroundColor = getBackgroundColor(value, row?.index);
          const columnExtent = getColumnExtent(cols, rows, columnIndex);

          return (
            <MiniBarCell
              rowIndex={row.index}
              columnId={id}
              align={align}
              backgroundColor={backgroundColor}
              value={value}
              formatter={formatter}
              extent={columnExtent}
            />
          );
        };
      }

      return options;
    });
  }, [
    hasMetadataPopovers,
    data,
    question,
    mode,
    cols,
    getColumnSortDirection,
    getColumnTitle,
    columnFormatters,
    isPivoted,
    rows,
    settings,
  ]);

  const handleColumnResize = useCallback(
    (columnSizing: ColumnSizingState) => {
      const newWidths = cols.map(col => columnSizing[col.name] ?? 0);
      onUpdateVisualizationSettings({
        "table.column_widths": newWidths,
      });
    },
    [cols, onUpdateVisualizationSettings],
  );

  const rowId: RowIdColumnOptions | undefined = useMemo(() => {
    const getBackgroundColor = memoize((rowIndex: number) =>
      settings["table._cell_background_getter"]?.(null, rowIndex),
    );

    const hasAggregation = cols.some(column => column.source === "aggregation");
    const isNotebookPreview = queryBuilderMode === "notebook";
    const isModelEditor = queryBuilderMode === "dataset";
    const hasObjectDetail =
      !(isPivoted || hasAggregation || isNotebookPreview || isModelEditor) &&
      !isEmbeddingSdk;

    const shouldShowRowIndex =
      settings["table.row_index"] && !isNotebookPreview && !isModelEditor;
    if (!hasObjectDetail && !shouldShowRowIndex) {
      return undefined;
    }

    return {
      variant: shouldShowRowIndex ? "indexExpand" : "expandButton",
      getBackgroundColor,
    };
  }, [cols, isEmbeddingSdk, isPivoted, queryBuilderMode, settings]);

  const tableProps = useTableInstance({
    data: rows,
    rowId,
    columnOrder,
    columnSizing,
    columnsOptions,
    onColumnResize: handleColumnResize,
    onColumnReorder: handleColumnReordering,
  });

  useEffect(() => {
    const currentColNames = new Set(cols.map(col => col.name));
    const prevColNames = prevColNamesRef.current;

    const isSame =
      prevColNames.size === currentColNames.size &&
      [...prevColNames].every(name => currentColNames.has(name));

    if (!isSame) {
      prevColNamesRef.current = currentColNames;
      tableProps.measureColumnWidths();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols, tableProps.measureColumnWidths]);

  const handleScroll = useCallback(() => {
    if (clicked === null) {
      return;
    }

    onVisualizationClick(undefined);
  }, [clicked, onVisualizationClick]);

  if (!width || !height) {
    return <div ref={ref} className={className} />;
  }

  return (
    <div
      ref={ref}
      className={cx(S.root, className)}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <Table
        {...tableProps}
        onBodyCellClick={handleBodyCellClick}
        onAddColumnClick={handleAddColumnButtonClick}
        onHeaderCellClick={handleHeaderCellClick}
        onScroll={handleScroll}
      />
    </div>
  );
});

export const TableInteractive = _.compose(
  withMantineTheme,
  ExplicitSize({
    refreshMode: "throttle",
  }),
)(TableInteractiveInner);
