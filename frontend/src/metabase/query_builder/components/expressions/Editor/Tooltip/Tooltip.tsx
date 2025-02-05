import { currentCompletions } from "@codemirror/autocomplete";
import type { EditorState } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Popover } from "metabase/ui";
import type * as Lib from "metabase-lib";
import type Metadata from "metabase-lib/v1/metadata/Metadata";

import { HelpText } from "../HelpText";
import { Listbox } from "../Listbox";
import { enclosingFunction } from "../util";

import S from "./Tooltip.module.css";

const HEIGHT_THRESHOLD = 320;

export function Tooltip({
  query,
  stageIndex,
  metadata,
  reportTimezone,
  tooltipRef,

  state,
  view,
}: {
  query: Lib.Query;
  stageIndex: number;
  metadata: Metadata;
  reportTimezone?: string;

  // from tooltip extension
  tooltipRef: React.RefObject<HTMLDivElement>;
  state: EditorState;
  view: EditorView;
}) {
  const doc = state.doc.toString();

  const enclosingFn = useMemo(
    () => enclosingFunction(doc, state.selection.main.head),
    [doc, state.selection.main.head],
  );

  const completions = useMemo(() => currentCompletions(state), [state]);

  const maxHeight = usePopoverHeight(tooltipRef);
  const canShowBoth = maxHeight > HEIGHT_THRESHOLD;

  const [isHelpTextOpen, setIsHelpTextOpen] = useState(false);
  const handleToggleHelpText = useCallback(
    () => setIsHelpTextOpen(open => !open),
    [],
  );

  useEffect(() => {
    if (!canShowBoth && enclosingFn && completions.length > 0) {
      setIsHelpTextOpen(false);
      return;
    }
    if (canShowBoth || completions.length === 0) {
      setIsHelpTextOpen(true);
      return;
    }
  }, [canShowBoth, enclosingFn, completions.length]);

  return (
    <Popover
      opened
      position="bottom-start"
      returnFocus
      closeOnEscape
      middlewares={{ shift: false, flip: false }}
      positionDependencies={[
        doc,
        state.selection.main.head,
        completions.length,
      ]}
    >
      <Popover.Target>
        <div />
      </Popover.Target>
      <Popover.Dropdown
        data-testid="custom-expression-editor-suggestions"
        className={S.dropdown}
        mah={350}
      >
        <div className={S.tooltip} ref={tooltipRef}>
          <HelpText
            enclosingFunction={enclosingFn}
            query={query}
            metadata={metadata}
            reportTimezone={reportTimezone}
            open={isHelpTextOpen}
            onToggle={handleToggleHelpText}
          />
          {(canShowBoth || !isHelpTextOpen) && (
            <Listbox
              state={state}
              view={view}
              query={query}
              stageIndex={stageIndex}
            />
          )}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}

function usePopoverHeight(ref: React.RefObject<HTMLDivElement>) {
  const [maxHeight, setMaxHeight] = useState(0);
  useEffect(() => {
    const px = ref.current?.parentElement?.style.maxHeight ?? "0";
    const parsed = parseInt(px, 10);
    if (!Number.isNaN(parsed)) {
      setMaxHeight(parsed);
    }
  }, [ref]);
  return maxHeight;
}
