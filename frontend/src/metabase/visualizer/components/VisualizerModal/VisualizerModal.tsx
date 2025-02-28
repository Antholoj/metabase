import { useCallback, useEffect } from "react";
import { usePrevious } from "react-use";
import { t } from "ttag";

import { useConfirmation } from "metabase/hooks/use-confirmation";
import { useModalOpen } from "metabase/hooks/use-modal-open";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { Modal } from "metabase/ui";
import { getIsDirty } from "metabase/visualizer/selectors";
import { initializeVisualizer } from "metabase/visualizer/visualizer.slice";
import type {
  VisualizerDataSourceId,
  VisualizerHistoryItem,
} from "metabase-types/store/visualizer";

import { Visualizer } from "../Visualizer";

import S from "./VisualizerModal.module.css";

interface VisualizerModalProps {
  initialState?: {
    state?: Partial<VisualizerHistoryItem>;
    extraDataSources?: VisualizerDataSourceId[];
  };
  onSave: (visualization: VisualizerHistoryItem) => void;
  onClose: () => void;
  saveLabel?: string;
}

export function VisualizerModal({
  initialState,
  onSave,
  onClose,
  saveLabel,
}: VisualizerModalProps) {
  const { open } = useModalOpen();
  const wasOpen = usePrevious(open);
  const dispatch = useDispatch();

  const { modalContent, show: askConfirmation } = useConfirmation();

  const isDirty = useSelector(getIsDirty);

  const onModalClose = useCallback(() => {
    if (!isDirty) {
      onClose();
      return;
    }

    askConfirmation({
      title: t`Are you sure you want to leave?`,
      message: t`Any unsaved changes will be lost.`,
      confirmButtonText: t`Close`,
      onConfirm: onClose,
    });
  }, [askConfirmation, isDirty, onClose]);

  useEffect(() => {
    if (open && !wasOpen && initialState) {
      dispatch(initializeVisualizer(initialState));
    }
  }, [open, wasOpen, initialState, dispatch]);

  return (
    <>
      <Modal
        opened={open}
        title={t`Visualize`}
        size="100%"
        transitionProps={{ transition: "fade", duration: 200 }}
        onClose={onModalClose}
      >
        <Visualizer
          className={S.VisualizerRoot}
          onSave={onSave}
          saveLabel={saveLabel}
        />
      </Modal>
      {modalContent}
    </>
  );
}
