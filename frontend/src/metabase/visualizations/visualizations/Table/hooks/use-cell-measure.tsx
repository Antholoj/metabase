import { useCallback, useMemo, useRef } from "react";

import { BodyCell } from "../cell/BodyCell";
import { HeaderCell } from "../cell/HeaderCell";

export type CellMeasurer = (content: string, width?: number) => CellSize;

export interface CellSize {
  width: number;
  height: number;
}

export const useCellMeasure = (
  cell: React.ReactNode,
  contentNodeSelector: string,
) => {
  const rootRef = useRef<HTMLDivElement>(null);

  const measureRoot = useMemo(() => {
    return (
      <div
        ref={rootRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -999,
        }}
      >
        {cell}
      </div>
    );
  }, [cell]);

  const measureDimensions: CellMeasurer = useCallback(
    (content: string, containerWidth?: number) => {
      const rootEl = rootRef.current;
      const contentCell = rootEl?.querySelector(contentNodeSelector);
      if (!rootEl || !contentCell) {
        throw new Error(
          `Trying to measure content "${content}" before measure root mounted`,
        );
      }

      rootEl.style.width =
        containerWidth != null ? `${containerWidth}px` : "auto";
      contentCell.textContent = content;
      const boundingRect = rootEl.getBoundingClientRect();
      return {
        width: boundingRect.width,
        height: boundingRect.height,
      };
    },
    [contentNodeSelector],
  );

  return {
    measureRoot,
    measureDimensions,
  };
};

export const useTableCellsMeasure = () => {
  const bodyCellToMeasure = useMemo(
    () => <BodyCell wrap={true} value="" />,
    [],
  );
  const {
    measureDimensions: measureBodyCellDimensions,
    measureRoot: measureBodyCellRoot,
  } = useCellMeasure(bodyCellToMeasure, "[data-grid-cell-content]");

  const headerCellToMeasure = useMemo(() => <HeaderCell name="" />, []);
  const {
    measureDimensions: measureHeaderCellDimensions,
    measureRoot: measureHeaderCellRoot,
  } = useCellMeasure(headerCellToMeasure, "[data-grid-header-cell-content]");

  const measureRoot = useMemo(
    () => (
      <>
        {measureBodyCellRoot}
        {measureHeaderCellRoot}
      </>
    ),
    [measureBodyCellRoot, measureHeaderCellRoot],
  );

  return {
    measureBodyCellDimensions,
    measureHeaderCellDimensions,
    measureRoot,
  };
};
