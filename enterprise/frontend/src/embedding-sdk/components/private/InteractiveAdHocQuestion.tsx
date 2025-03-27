import { type ReactNode, useMemo } from "react";

import type { MetabasePluginsConfig } from "embedding-sdk";
import type { SdkQuestionTitleProps } from "embedding-sdk/types/question";
import * as Urls from "metabase/lib/urls";
import { deserializeCard, parseHash } from "metabase/query_builder/actions";
import type Question from "metabase-lib/v1/Question";

import {
  InteractiveQuestionProvider,
  type QuestionMockLocationParameters,
} from "./InteractiveQuestion/context";
import { InteractiveQuestionDefaultView } from "./InteractiveQuestionDefaultView";

interface InteractiveAdHocQuestionProps {
  questionPath: string; // route path to load a question, e.g. /question/140-best-selling-products - for saved, or /question/xxxxxxx for ad-hoc encoded question config
  onNavigateBack: () => void;
  onQuestionChanged?: (question: Question) => void;
  title: SdkQuestionTitleProps;
  height?: number;
  plugins?: MetabasePluginsConfig;
  children?: ReactNode;
}

export const InteractiveAdHocQuestion = ({
  questionPath,
  onNavigateBack,
  title = true,
  height,
  plugins,
  children,
  onQuestionChanged,
}: InteractiveAdHocQuestionProps) => {
  const { location, params } = useMemo(
    () => getQuestionParameters(questionPath),
    [questionPath],
  );

  // If we cannot extract an entity ID from the slug, assume we are creating a new question.
  const questionId = Urls.extractEntityId(params.slug) ?? null;

  const { deserializedCard, options } = useMemo(() => {
    const { options, serializedCard } = parseHash(location.hash);

    return {
      deserializedCard: serializedCard && deserializeCard(serializedCard),
      options,
    };
  }, [location.hash]);

  return (
    <InteractiveQuestionProvider
      questionId={questionId}
      options={options}
      deserializedCard={deserializedCard}
      componentPlugins={plugins}
      onNavigateBack={onNavigateBack}
      onQuestionChanged={onQuestionChanged}
    >
      {children ?? (
        <InteractiveQuestionDefaultView
          height={height}
          title={title}
          withChartTypeSelector
        />
      )}
    </InteractiveQuestionProvider>
  );
};

/**
 * This generates route parameters based on the provided URL path
 * to load the interactive questions. See [use-load-question.ts]
 */
export const getQuestionParameters = (
  questionPath: string,
): QuestionMockLocationParameters => {
  const url = new URL(questionPath, "http://metabase.com"); // we use a dummy host name to fill-in full URL
  const pathSections = questionPath.split("/").slice(1); // remove first empty section
  const entityId = pathSections.length > 1 ? pathSections[1] : null; // extract possible question id if it is a saved question URL

  return {
    location: {
      search: url.search,
      hash: url.hash,
      pathname: url.pathname,
    },
    params: entityId ? { slug: entityId } : {},
  };
};
