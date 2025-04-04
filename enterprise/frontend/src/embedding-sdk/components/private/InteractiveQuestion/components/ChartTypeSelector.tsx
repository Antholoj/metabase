import { useQuestionVisualization } from "embedding-sdk/components/private/InteractiveQuestion/hooks/use-question-visualization";
import CS from "metabase/css/core/index.css";
import { ChartTypeSettings } from "metabase/query_builder/components/chart-type-selector";
import type { StackProps } from "metabase/ui";

import { useSensibleVisualizations } from "../hooks/use-sensible-visualizations";

/**
 * @remarks
 * Uses [Mantine Stack props](https://v7.mantine.dev/core/stack/?t=props) under the hood
 */
export type InteractiveQuestionChartTypeSelectorProps = StackProps;

export const ChartTypeSelector = (
  stackProps: InteractiveQuestionChartTypeSelectorProps,
) => {
  const { sensibleVisualizations, nonSensibleVisualizations } =
    useSensibleVisualizations();

  const { selectedVisualization, updateQuestionVisualization } =
    useQuestionVisualization();

  return (
    <ChartTypeSettings
      w="20rem"
      p="xl"
      h="100%"
      className={CS.overflowYScroll}
      {...stackProps}
      sensibleVisualizations={sensibleVisualizations}
      nonSensibleVisualizations={nonSensibleVisualizations}
      selectedVisualization={selectedVisualization}
      onSelectVisualization={updateQuestionVisualization}
    />
  );
};
