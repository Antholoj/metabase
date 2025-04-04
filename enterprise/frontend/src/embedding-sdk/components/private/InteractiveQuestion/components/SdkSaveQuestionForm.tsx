import { useTranslatedCollectionId } from "embedding-sdk/hooks/private/use-translated-collection-id";
import {
  SaveQuestionForm,
  SaveQuestionTitle,
} from "metabase/components/SaveQuestionForm";
import { SaveQuestionProvider } from "metabase/components/SaveQuestionForm/context";
import { Stack, Title } from "metabase/ui";

import { useInteractiveQuestionContext } from "../context";

/**
 * @interface
 */
export type InteractiveQuestionSaveQuestionFormProps = {
  /**
   * Callback function executed when save is cancelled
   */
  onCancel?: () => void;
};

export const SdkSaveQuestionForm = ({
  onCancel,
}: InteractiveQuestionSaveQuestionFormProps) => {
  const { question, originalQuestion, onSave, onCreate, targetCollection } =
    useInteractiveQuestionContext();

  const { id, isLoading } = useTranslatedCollectionId({
    id: targetCollection,
  });

  if (!question || isLoading) {
    return null;
  }

  return (
    <SaveQuestionProvider
      question={question}
      originalQuestion={originalQuestion ?? null}
      onCreate={onCreate}
      onSave={onSave}
      multiStep={false}
      targetCollection={id}
    >
      <Stack p="md">
        <Title>
          <SaveQuestionTitle />
        </Title>
        <SaveQuestionForm onCancel={() => onCancel?.()} />
      </Stack>
    </SaveQuestionProvider>
  );
};
