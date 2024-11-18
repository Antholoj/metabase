import { useDisclosure } from "@mantine/hooks";
import { useMemo, useState } from "react";
import { match } from "ts-pattern";

import { MultiStepPopover } from "embedding-sdk/components/private/util/MultiStepPopover";
import { AggregationPicker } from "metabase/common/components/AggregationPicker";
import type { UpdateQueryHookProps } from "metabase/query_builder/hooks/types";
import {
  type AggregationItem,
  getAggregationItems,
} from "metabase/query_builder/utils/get-aggregation-items";
import * as Lib from "metabase-lib";

import { useInteractiveQuestionContext } from "../../context";
import S from "../Picker.module.css";
import { BadgeList } from "../util/BadgeList";
import { ToolbarButton } from "../util/ToolbarButton";

export const SummarizeInner = ({
  query,
  onQueryChange,
  stageIndex,
}: UpdateQueryHookProps) => {
  const aggregationItems = useMemo(
    () => getAggregationItems({ query, stageIndex }),
    [query, stageIndex],
  );

  const handleRemove = (aggregation: Lib.AggregationClause) => {
    const nextQuery = Lib.removeClause(query, stageIndex, aggregation);
    onQueryChange(nextQuery);
  };

  const label = match(aggregationItems.length)
    .with(0, () => `Summarize`)
    .with(1, () => `1 summary`)
    .otherwise(value => `${value} summaries`);

  const [selectedAggregationItem, setSelectedAggregationItem] =
    useState<AggregationItem>();

  const [step, setStep] = useState<"picker" | "list">("picker");
  const [opened, { close, toggle }] = useDisclosure(false, {
    onOpen: () => setStep(aggregationItems.length === 0 ? "picker" : "list"),
  });

  const onSelectBadge = (item?: AggregationItem) => {
    setSelectedAggregationItem(item);
    setStep("picker");
  };

  const onRemoveBadge = (item: AggregationItem) => {
    handleRemove(item.aggregation);

    if (aggregationItems.length === 1) {
      close();
    }
  };

  return (
    <MultiStepPopover currentStep={step} opened={opened} onClose={close}>
      <MultiStepPopover.Target>
        <ToolbarButton
          label={label}
          icon={"sum"}
          isHighlighted={aggregationItems.length > 0}
          onClick={toggle}
        />
      </MultiStepPopover.Target>
      <MultiStepPopover.Step value="picker">
        <AggregationPicker
          className={S.PickerContainer}
          query={query}
          stageIndex={stageIndex}
          clause={selectedAggregationItem?.aggregation}
          clauseIndex={selectedAggregationItem?.aggregationIndex}
          operators={
            selectedAggregationItem?.operators ??
            Lib.availableAggregationOperators(query, stageIndex)
          }
          allowTemporalComparisons
          onQueryChange={onQueryChange}
          /* Called when a new aggregation is selected */
          onClose={() => setStep("list")}
          /* Called when the back button is clicked */
          onBack={() => setStep("list")}
        />
      </MultiStepPopover.Step>
      <MultiStepPopover.Step value="list">
        <BadgeList
          items={aggregationItems.map(item => ({
            name: item.displayName,
            item,
          }))}
          onSelectItem={onSelectBadge}
          onAddItem={onSelectBadge}
          onRemoveItem={onRemoveBadge}
          addButtonLabel={"Add grouping"}
        />
      </MultiStepPopover.Step>
    </MultiStepPopover>
  );
};

export const Summarize = () => {
  const { question, updateQuestion } = useInteractiveQuestionContext();

  if (!question) {
    return null;
  }

  const query = question.query();

  const onQueryChange = (newQuery: Lib.Query) => {
    updateQuestion(question.setQuery(newQuery), { run: true });
  };

  return (
    <SummarizeInner
      query={query}
      onQueryChange={onQueryChange}
      stageIndex={-1}
    />
  );
};
