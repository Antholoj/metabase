import { useDisclosure } from "@mantine/hooks";
import cx from "classnames";
import type { LocationDescriptor } from "history";
import { useCallback, useMemo } from "react";
import { t } from "ttag";

import { cardApi } from "metabase/api";
import CS from "metabase/css/core/index.css";
import { replaceCardWithVisualization } from "metabase/dashboard/actions";
import { useClickBehaviorData } from "metabase/dashboard/hooks";
import { getDashcardData } from "metabase/dashboard/selectors";
import {
  getVirtualCardType,
  isQuestionCard,
  isVirtualDashCard,
} from "metabase/dashboard/utils";
import { useDispatch, useSelector } from "metabase/lib/redux";
import { isJWT } from "metabase/lib/utils";
import { isUuid } from "metabase/lib/uuid";
import { getMetadata } from "metabase/selectors/metadata";
import { Flex, type IconName, type IconProps, Title } from "metabase/ui";
import { getVisualizationRaw } from "metabase/visualizations";
import Visualization from "metabase/visualizations/components/Visualization";
import type { ClickActionModeGetter } from "metabase/visualizations/types";
import { VisualizerModal } from "metabase/visualizer/components/VisualizerModal";
import {
  createDataSource,
  dashboardCardSupportsVisualizer,
  isVisualizerDashboardCard,
  mergeVisualizerData,
} from "metabase/visualizer/utils";
import Question from "metabase-lib/v1/Question";
import type {
  DashCardId,
  Dashboard,
  DashboardCard,
  Dataset,
  RawSeries,
  Series,
  VirtualCardDisplay,
  VisualizationSettings,
} from "metabase-types/api";
import type { VisualizerHistoryItem } from "metabase-types/store/visualizer";

import { ClickBehaviorSidebarOverlay } from "./ClickBehaviorSidebarOverlay/ClickBehaviorSidebarOverlay";
import { DashCardMenu } from "./DashCardMenu/DashCardMenu";
import { DashCardParameterMapper } from "./DashCardParameterMapper/DashCardParameterMapper";
import S from "./DashCardVisualization.module.css";
import type {
  CardSlownessStatus,
  DashCardOnChangeCardAndRunHandler,
} from "./types";
import { shouldShowParameterMapper } from "./utils";

interface DashCardVisualizationProps {
  dashboard: Dashboard;
  dashcard: DashboardCard;
  series: Series;
  getClickActionMode?: ClickActionModeGetter;
  getHref?: () => string | undefined;

  gridSize: {
    width: number;
    height: number;
  };
  gridItemWidth: number;
  totalNumGridCols: number;

  expectedDuration: number;
  isSlow: CardSlownessStatus;

  isAction: boolean;
  isPreviewing: boolean;
  isClickBehaviorSidebarOpen: boolean;
  isEditingDashCardClickBehavior: boolean;
  isEditingDashboardLayout: boolean;
  isEditing?: boolean;
  isEditingParameter?: boolean;
  isFullscreen?: boolean;
  isMobile?: boolean;
  isNightMode?: boolean;
  /** If public sharing or static/public embed */
  isPublicOrEmbedded?: boolean;
  isXray?: boolean;
  withTitle?: boolean;

  error?: { message?: string; icon?: IconName };
  headerIcon?: IconProps;

  onUpdateVisualizationSettings: (
    id: DashCardId,
    settings: VisualizationSettings,
  ) => void;
  onChangeCardAndRun: DashCardOnChangeCardAndRunHandler | null;
  showClickBehaviorSidebar: (dashCardId: DashCardId | null) => void;
  onChangeLocation: (location: LocationDescriptor) => void;
  onTogglePreviewing: () => void;

  downloadsEnabled: boolean;
  editDashboard: () => void;
}

// This is done to add the `getExtraDataForClick` prop.
// We need that to pass relevant data along with the clicked object.

export function DashCardVisualization({
  dashcard,
  dashboard,
  series: _series,
  getClickActionMode,
  getHref,
  gridSize,
  gridItemWidth,
  totalNumGridCols,
  expectedDuration,
  error,
  headerIcon,
  isAction,
  isSlow,
  isPreviewing,
  isPublicOrEmbedded,
  isXray,
  isEditingDashboardLayout,
  isClickBehaviorSidebarOpen,
  isEditingDashCardClickBehavior,
  isEditing = false,
  isNightMode = false,
  isFullscreen = false,
  isMobile = false,
  isEditingParameter,
  withTitle = true,
  onChangeCardAndRun,
  onTogglePreviewing,
  showClickBehaviorSidebar,
  onChangeLocation,
  onUpdateVisualizationSettings,
  downloadsEnabled,
  editDashboard,
}: DashCardVisualizationProps) {
  const datasets = useSelector(state => getDashcardData(state, dashcard.id));
  const [
    isVisualizerModalOpen,
    { open: openVisualizerModal, close: closeVisualizerModal },
  ] = useDisclosure(false);

  const dispatch = useDispatch();

  const editVisualization = useMemo(() => {
    if (
      isVisualizerDashboardCard(dashcard) &&
      dashboardCardSupportsVisualizer(dashcard)
    ) {
      return () => {
        openVisualizerModal();
        editDashboard();
      };
    }
  }, [editDashboard, dashcard, openVisualizerModal]);

  const onVisualizerModalSave = useCallback(
    (visualization: VisualizerHistoryItem) => {
      dispatch(
        replaceCardWithVisualization({
          dashcardId: dashcard.id,
          visualization,
        }),
      );
      closeVisualizerModal();
    },
    [dashcard.id, dispatch, closeVisualizerModal],
  );

  const onVisualizerModalClose = useCallback(() => {
    closeVisualizerModal();
  }, [closeVisualizerModal]);

  const visualizerModalInitialState = useMemo(
    () => ({
      state: dashcard.visualization_settings
        ?.visualization as Partial<VisualizerHistoryItem>,
    }),
    [dashcard.visualization_settings],
  );

  const getCard = useCallback(
    async (cardName: string) => {
      const [, cardId] = cardName.split(":");

      const { data } = await dispatch(
        cardApi.endpoints.getCard.initiate({ id: +cardId }),
      );

      return data;
    },
    [dispatch],
  );

  const series = useMemo(() => {
    if (
      !dashcard ||
      !_series ||
      _series.length === 0 ||
      !isVisualizerDashboardCard(dashcard)
    ) {
      return _series;
    }

    const { display, columns, columnValuesMapping, settings } = dashcard
      .visualization_settings!.visualization as VisualizerHistoryItem;

    const cards = [dashcard.card];
    if (Array.isArray(dashcard.series)) {
      cards.push(...dashcard.series);
    }

    const dataSources = cards.map(card =>
      createDataSource("card", card.id, card.name),
    );

    const dataSourceDatasets = Object.fromEntries(
      Object.entries(datasets ?? {}).map(([cardId, dataset]) => [
        `card:${cardId}`,
        dataset,
      ]),
    );

    return [
      {
        card: {
          display,
          name: settings["card.title"],
          visualization_settings: settings,
        },

        data: mergeVisualizerData({
          columns,
          columnValuesMapping,
          datasets: dataSourceDatasets,
          dataSources,
        }),

        // Certain visualizations memoize settings computation based on series keys
        // This guarantees a visualization always rerenders on changes
        started_at: new Date().toISOString(),
      },
    ];
  }, [_series, dashcard, datasets]);

  const metadata = useSelector(getMetadata);
  const question = useMemo(() => {
    return isQuestionCard(dashcard.card)
      ? new Question(dashcard.card, metadata)
      : null;
  }, [dashcard.card, metadata]);

  const handleOnUpdateVisualizationSettings = useCallback(
    (settings: VisualizationSettings) => {
      onUpdateVisualizationSettings(dashcard.id, settings);
    },
    [dashcard.id, onUpdateVisualizationSettings],
  );

  const visualizationOverlay = useMemo(() => {
    if (isClickBehaviorSidebarOpen) {
      const disableClickBehavior = getVisualizationRaw(
        series as RawSeries,
      )?.disableClickBehavior;
      if (isVirtualDashCard(dashcard) || disableClickBehavior) {
        const virtualDashcardType = getVirtualCardType(
          dashcard,
        ) as VirtualCardDisplay;
        const placeholderText =
          {
            link: t`Link`,
            action: t`Action Button`,
            text: t`Text Card`,
            heading: t`Heading Card`,
            placeholder: t`Placeholder Card`,
            iframe: t`Iframe Card`,
          }[virtualDashcardType] ??
          t`This card does not support click mappings`;

        return (
          <Flex align="center" justify="center" h="100%">
            <Title className={S.VirtualDashCardOverlayText} order={4} p="md">
              {placeholderText}
            </Title>
          </Flex>
        );
      }
      return (
        <ClickBehaviorSidebarOverlay
          dashcard={dashcard}
          dashcardWidth={gridItemWidth}
          showClickBehaviorSidebar={showClickBehaviorSidebar}
          isShowingThisClickBehaviorSidebar={isEditingDashCardClickBehavior}
        />
      );
    }

    if (shouldShowParameterMapper({ dashcard, isEditingParameter })) {
      return (
        <DashCardParameterMapper dashcard={dashcard} isMobile={isMobile} />
      );
    }

    return null;
  }, [
    dashcard,
    gridItemWidth,
    isMobile,
    isEditingParameter,
    isClickBehaviorSidebarOpen,
    isEditingDashCardClickBehavior,
    showClickBehaviorSidebar,
    series,
  ]);

  const actionButtons = useMemo(() => {
    if (!question) {
      return null;
    }

    const mainSeries = series[0] as unknown as Dataset;
    const shouldShowDashCardMenu = DashCardMenu.shouldRender({
      question,
      result: mainSeries,
      isXray,
      isPublicOrEmbedded,
      isEditing,
      downloadsEnabled,
    });

    if (!shouldShowDashCardMenu) {
      return null;
    }

    return (
      <DashCardMenu
        downloadsEnabled={downloadsEnabled}
        question={question}
        result={mainSeries}
        dashcardId={dashcard.id}
        dashboardId={dashboard.id}
        token={
          isJWT(dashcard.dashboard_id)
            ? String(dashcard.dashboard_id)
            : undefined
        }
        uuid={isUuid(dashcard.dashboard_id) ? dashcard.dashboard_id : undefined}
        onEditVisualization={editVisualization}
      />
    );
  }, [
    question,
    series,
    isXray,
    isPublicOrEmbedded,
    isEditing,
    dashcard.id,
    dashcard.dashboard_id,
    dashboard.id,
    downloadsEnabled,
    editVisualization,
  ]);

  const { getExtraDataForClick } = useClickBehaviorData({
    dashcardId: dashcard.id,
  });

  return (
    <>
      <Visualization
        className={cx(CS.flexFull, {
          [CS.pointerEventsNone]: isEditingDashboardLayout,
          [CS.overflowAuto]: visualizationOverlay,
          [CS.overflowHidden]: !visualizationOverlay,
        })}
        dashboard={dashboard}
        dashcard={dashcard}
        rawSeries={series}
        metadata={metadata}
        mode={getClickActionMode}
        getHref={getHref}
        gridSize={gridSize}
        totalNumGridCols={totalNumGridCols}
        headerIcon={headerIcon}
        expectedDuration={expectedDuration}
        error={error?.message}
        errorIcon={error?.icon}
        showTitle={withTitle}
        canToggleSeriesVisibility={!isEditing}
        isAction={isAction}
        isDashboard
        isSlow={isSlow}
        isFullscreen={isFullscreen}
        isNightMode={isNightMode}
        isEditing={isEditing}
        isPreviewing={isPreviewing}
        isEditingParameter={isEditingParameter}
        isMobile={isMobile}
        actionButtons={actionButtons}
        replacementContent={visualizationOverlay}
        getExtraDataForClick={getExtraDataForClick}
        onUpdateVisualizationSettings={handleOnUpdateVisualizationSettings}
        onTogglePreviewing={onTogglePreviewing}
        onChangeCardAndRun={onChangeCardAndRun}
        onChangeLocation={onChangeLocation}
        getCard={getCard}
      />
      {isVisualizerModalOpen && (
        <VisualizerModal
          onSave={onVisualizerModalSave}
          onClose={onVisualizerModalClose}
          initialState={visualizerModalInitialState}
          saveLabel={t`Save`}
        />
      )}
    </>
  );
}
