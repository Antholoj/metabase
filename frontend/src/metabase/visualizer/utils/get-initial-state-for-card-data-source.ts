import { isNotNull } from "metabase/lib/types";
import { getColumnVizSettings } from "metabase/visualizations";
import type { Card, DatasetColumn, RawSeries } from "metabase-types/api";
import type {
  VisualizerColumnReference,
  VisualizerDataSource,
  VisualizerHistoryItem,
} from "metabase-types/store/visualizer";

import {
  copyColumn,
  createVisualizerColumnReference,
  extractReferencedColumns,
} from "./column";
import { createDataSource } from "./data-source";

type ColumnInfo = {
  columnRef: VisualizerColumnReference;
  column: DatasetColumn;
};

function mapColumnVizSettings(
  card: Card,
  columnInfos: ColumnInfo[],
): Record<string, string | string[]> {
  const entries = getColumnVizSettings(card.display)
    .map(setting => {
      const originalValue = card.visualization_settings[setting];

      if (!originalValue) {
        return null;
      }

      if (Array.isArray(originalValue)) {
        const mappedColumns = originalValue
          .map(originalColumnName => {
            const columnInfo = columnInfos.find(
              info => info.columnRef.originalName === originalColumnName,
            );
            return columnInfo?.columnRef.name;
          })
          .filter(isNotNull);

        return mappedColumns.length > 0 ? [setting, mappedColumns] : null;
      } else {
        const columnInfo = columnInfos.find(
          info => info.columnRef.originalName === originalValue,
        );
        return columnInfo?.columnRef.name
          ? [setting, columnInfo.columnRef.name]
          : null;
      }
    })
    .filter(isNotNull);

  return Object.fromEntries(entries);
}

function processColumnsForDataSource(
  dataSource: VisualizerDataSource,
  columns: DatasetColumn[],
  state: VisualizerHistoryItem,
): ColumnInfo[] {
  const columnInfos: ColumnInfo[] = [];

  columns.forEach(column => {
    const columnRef = createVisualizerColumnReference(
      dataSource,
      column,
      extractReferencedColumns(state.columnValuesMapping),
    );

    const processedColumn = copyColumn(
      columnRef.name,
      column,
      dataSource.name,
      state.columns,
    );

    state.columns.push(processedColumn);
    state.columnValuesMapping[columnRef.name] = [columnRef];

    columnInfos.push({
      columnRef,
      column: processedColumn,
    });
  });

  return columnInfos;
}

export function getInitialStateForCardDataSource(
  card: Card,
  columns: DatasetColumn[],
): VisualizerHistoryItem {
  const state: VisualizerHistoryItem = {
    display: card.display,
    columns: [],
    columnValuesMapping: {},
    settings: {},
  };

  const dataSource = createDataSource("card", card.id, card.name);
  const columnInfos = processColumnsForDataSource(dataSource, columns, state);
  const mappedSettings = mapColumnVizSettings(card, columnInfos);

  state.settings = {
    ...card.visualization_settings,
    ...mappedSettings,
    "card.title": card.name,
  };

  return state;
}

export function getInitialVisualizerStateForMultipleSeries(
  rawSeries: RawSeries,
): VisualizerHistoryItem {
  const mainCard = rawSeries[0].card;

  const state: VisualizerHistoryItem = {
    display: mainCard.display,
    columns: [],
    columnValuesMapping: {},
    settings: {},
  };

  const dataSources = rawSeries.map(({ card }) =>
    createDataSource("card", card.id, card.name),
  );

  const allColumnInfos: ColumnInfo[][] = rawSeries.map(
    (series, seriesIndex) => {
      return processColumnsForDataSource(
        dataSources[seriesIndex],
        series.data.cols,
        state,
      );
    },
  );

  const settingsFromAllCards = rawSeries.map((series, seriesIndex) =>
    mapColumnVizSettings(series.card, allColumnInfos[seriesIndex]),
  );

  const mergedSettings = settingsFromAllCards.reduce<
    Record<string, string | string[]>
  >((acc, settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      if (acc[key] == null) {
        acc[key] = value;
      } else if (Array.isArray(acc[key]) && Array.isArray(value)) {
        acc[key].push(...value);
      }
    });
    return acc;
  }, {});

  state.settings = {
    ...mainCard.visualization_settings,
    ...mergedSettings,
    "card.title": mainCard.name,
  };

  return state;
}
