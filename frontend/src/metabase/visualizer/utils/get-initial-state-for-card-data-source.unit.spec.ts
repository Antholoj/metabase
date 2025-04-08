import { registerVisualization } from "metabase/visualizations";
import { BarChart } from "metabase/visualizations/visualizations/BarChart/BarChart";
import Table from "metabase/visualizations/visualizations/Table/Table";
import {
  createMockCard,
  createMockColumn,
  createMockDashboardCard,
  createMockDataset,
  createMockDatasetData,
} from "metabase-types/api/mocks";

import { getInitialStateForCardDataSource } from "./get-initial-state-for-card-data-source";

// Not registering all visualizations here for perf reasons
// @ts-expect-error -- TODO fix this error?
registerVisualization(Table);
// @ts-expect-error -- TODO fix this error?
registerVisualization(BarChart);

describe("getInitialStateForCardDataSource", () => {
  const dashCard = createMockDashboardCard({
    card: createMockCard({
      display: "smartscalar",
      name: "ScalarMcSmartface",
      visualization_settings: {
        "scalar.compact_primary_number": true,
      },
    }),
  });

  const dataset = createMockDataset({
    data: createMockDatasetData({
      cols: [
        createMockColumn({ name: "Foo" }),
        createMockColumn({ name: "Bar" }),
      ],
    }),
  });

  it("should not try to replace unknown columns in the settings", () => {
    const initialState = getInitialStateForCardDataSource(
      dashCard.card,
      dataset,
    );

    expect(initialState.columns).toHaveLength(2);
    expect(initialState.columnValuesMapping).toEqual({
      COLUMN_1: [
        {
          name: "COLUMN_1",
          originalName: "Foo",
          sourceId: "card:1",
        },
      ],
      COLUMN_2: [
        {
          name: "COLUMN_2",
          originalName: "Bar",
          sourceId: "card:1",
        },
      ],
    });

    expect(initialState.settings).toEqual({
      "card.title": "ScalarMcSmartface",
      "scalar.compact_primary_number": true,
    });
  });

  it("should pick the proper display if it is not supported by the visualizer", () => {
    const initialState = getInitialStateForCardDataSource(
      dashCard.card,
      dataset,
    );

    expect(initialState.display).toEqual("bar");
  });

  it("should compute default viz settings when card's viz type isn't supported by the visualizer", () => {
    const dataset = createMockDataset({
      data: createMockDatasetData({
        cols: [
          createMockColumn({
            name: "CREATED_AT",
            base_type: "type/DateTime",
            effective_type: "type/DateTime",
            semantic_type: null,
            unit: "month",
          }),
          createMockColumn({
            name: "SOME_METRIC",
            base_type: "type/Integer",
            effective_type: "type/Integer",
            semantic_type: null,
          }),
        ],
      }),
    });

    const state = getInitialStateForCardDataSource(dashCard.card, dataset);

    expect(state.columnValuesMapping).toEqual({
      COLUMN_1: [
        {
          name: "COLUMN_1",
          originalName: "CREATED_AT",
          sourceId: "card:1",
        },
      ],
      COLUMN_2: [
        {
          name: "COLUMN_2",
          originalName: "SOME_METRIC",
          sourceId: "card:1",
        },
      ],
    });

    expect(state.settings).toEqual({
      "card.title": "ScalarMcSmartface",
      "graph.dimensions": ["COLUMN_1"],
      "graph.metrics": ["COLUMN_2"],
      "scalar.compact_primary_number": true,
    });
  });
});
