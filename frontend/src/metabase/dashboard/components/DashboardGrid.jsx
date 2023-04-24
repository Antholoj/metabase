/* eslint-disable react/prop-types */
import React, { Component } from "react";
import PropTypes from "prop-types";

import _ from "underscore";
import cx from "classnames";
import { connect } from "react-redux";
import { t } from "ttag";
import ExplicitSize from "metabase/components/ExplicitSize";

import Modal from "metabase/components/Modal";

import { PLUGIN_COLLECTIONS } from "metabase/plugins";

import { getVisualizationRaw } from "metabase/visualizations";
import * as MetabaseAnalytics from "metabase/lib/analytics";
import { color } from "metabase/lib/colors";

import {
  GRID_ASPECT_RATIO,
  GRID_BREAKPOINTS,
  DEFAULT_CARD_SIZE,
  MIN_ROW_HEIGHT,
} from "metabase/lib/dashboard_grid";
import { ContentViewportContext } from "metabase/core/context/ContentViewportContext";
import { addUndo } from "metabase/redux/undo";
import { DashboardCard } from "./DashboardGrid.styled";

import GridLayout from "./grid/GridLayout";
import { generateMobileLayout } from "./grid/utils";
import AddSeriesModal from "./AddSeriesModal/AddSeriesModal";
import DashCard from "./DashCard";

const mapDispatchToProps = { addUndo };

class DashboardGrid extends Component {
  static contextType = ContentViewportContext;

  constructor(props, context) {
    super(props, context);

    this.state = {
      layouts: this.getLayouts(props),
      dashcards: this.getSortedDashcards(props),
      addSeriesModalDashCard: null,
      isDragging: false,
      isAnimationPaused: true,
    };
  }

  static propTypes = {
    isEditing: PropTypes.oneOfType([PropTypes.bool, PropTypes.object])
      .isRequired,
    isEditingParameter: PropTypes.bool.isRequired,
    isNightMode: PropTypes.bool,
    dashboard: PropTypes.object.isRequired,
    parameterValues: PropTypes.object.isRequired,

    setDashCardAttributes: PropTypes.func.isRequired,
    setMultipleDashCardAttributes: PropTypes.func.isRequired,
    removeCardFromDashboard: PropTypes.func.isRequired,
    markNewCardSeen: PropTypes.func.isRequired,
    fetchCardData: PropTypes.func.isRequired,

    onUpdateDashCardVisualizationSettings: PropTypes.func.isRequired,
    onReplaceAllDashCardVisualizationSettings: PropTypes.func.isRequired,

    onChangeLocation: PropTypes.func.isRequired,
  };

  static defaultProps = {
    width: 0,
    isEditing: false,
    isEditingParameter: false,
    gridSize: 18,
  };

  componentDidMount() {
    // In order to skip the initial cards animation we must let the grid layout calculate
    // the initial card positions. The timer is necessary to enable animation only
    // after the grid layout has been calculated and applied to the DOM.
    this._pauseAnimationTimer = setTimeout(() => {
      this.setState({ isAnimationPaused: false });
    }, 0);
  }

  componentWillUnmount() {
    clearTimeout(this._pauseAnimationTimer);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      dashcards: this.getSortedDashcards(nextProps),
      layouts: this.getLayouts(nextProps),
    });
  }

  onLayoutChange = ({ layout, breakpoint }) => {
    if (breakpoint !== "desktop") {
      // We allow moving and resizing cards only on the desktop
      // Ensures onLayoutChange triggered by window resize,
      // won't break the main layout
      return;
    }

    const { dashboard, setMultipleDashCardAttributes } = this.props;
    const changes = [];

    layout.forEach(layoutItem => {
      const dashboardCard = dashboard.ordered_cards.find(
        card => String(card.id) === layoutItem.i,
      );

      const keys = ["h", "w", "x", "y"];
      const changed = !_.isEqual(
        _.pick(layoutItem, keys),
        _.pick(this.getLayoutForDashCard(dashboardCard), keys),
      );

      if (changed && this.props.isEditing) {
        changes.push({
          id: dashboardCard.id,
          attributes: {
            col: layoutItem.x,
            row: layoutItem.y,
            size_x: layoutItem.w,
            size_y: layoutItem.h,
          },
        });
      }
    });

    if (changes.length > 0) {
      setMultipleDashCardAttributes(changes);
      MetabaseAnalytics.trackStructEvent("Dashboard", "Layout Changed");
    }
  };

  getSortedDashcards(props) {
    return (
      props.dashboard &&
      props.dashboard.ordered_cards.sort((a, b) => {
        if (a.row < b.row) {
          return -1;
        }
        if (a.row > b.row) {
          return 1;
        }
        if (a.col < b.col) {
          return -1;
        }
        if (a.col > b.col) {
          return 1;
        }
        return 0;
      })
    );
  }

  getLayoutForDashCard = dashcard => {
    const { gridSize } = this.props;

    const { visualization } = getVisualizationRaw([{ card: dashcard.card }]);
    const initialSize = DEFAULT_CARD_SIZE;
    const minSize = visualization.minSize || DEFAULT_CARD_SIZE;

    let x = dashcard.col || 0;
    let w = dashcard.size_x || initialSize.width;

    if (gridSize === 24) {
      w = w + Math.floor((x + w + 2) / 3) - Math.floor((x + 1) / 3);
      x = Math.round((x * 24) / 18);
    }

    return {
      i: String(dashcard.id),
      x,
      y: dashcard.row || 0,
      w,
      h: dashcard.size_y || initialSize.height,
      dashcard: dashcard,
      minW: minSize.width,
      minH: minSize.height,
    };
  };

  getLayouts({ dashboard }) {
    const desktop = dashboard.ordered_cards.map(this.getLayoutForDashCard);
    const mobile = generateMobileLayout({
      desktopLayout: desktop,
      defaultCardHeight: 6,
      heightByDisplayType: {
        action: 1,
        link: 1,
        text: 2,
        scalar: 4,
      },
    });
    return { desktop, mobile };
  }

  getRowHeight = () => {
    const { width, gridSize } = this.props;

    const contentViewportElement = this.context;
    const hasScroll =
      contentViewportElement?.clientHeight <
      contentViewportElement?.scrollHeight;

    const aspectHeight = width / gridSize / GRID_ASPECT_RATIO;
    const actualHeight = Math.max(aspectHeight, MIN_ROW_HEIGHT);

    // prevent infinite re-rendering when the scroll bar appears/disappears
    // https://github.com/metabase/metabase/issues/17229
    return hasScroll ? Math.ceil(actualHeight) : Math.floor(actualHeight);
  };

  renderAddSeriesModal() {
    // can't use PopoverWithTrigger due to strange interaction with ReactGridLayout
    const isOpen = this.state.addSeriesModalDashCard != null;
    return (
      <Modal className="Modal AddSeriesModal" isOpen={isOpen}>
        {isOpen && (
          <AddSeriesModal
            dashcard={this.state.addSeriesModalDashCard}
            dashboard={this.props.dashboard}
            dashcardData={this.props.dashcardData}
            databases={this.props.databases}
            fetchCardData={this.props.fetchCardData}
            fetchDatabaseMetadata={this.props.fetchDatabaseMetadata}
            removeCardFromDashboard={this.props.removeCardFromDashboard}
            setDashCardAttributes={this.props.setDashCardAttributes}
            onClose={() => this.setState({ addSeriesModalDashCard: null })}
          />
        )}
      </Modal>
    );
  }

  // we need to track whether or not we're dragging so we can disable pointer events on action buttons :-/
  onDrag = () => {
    if (!this.state.isDragging) {
      this.setState({ isDragging: true });
    }
  };

  onDragStop = () => {
    this.setState({ isDragging: false });
  };

  onDashCardRemove(dc) {
    this.props.removeCardFromDashboard({
      dashcardId: dc.id,
    });
    this.props.addUndo({
      message: t`Removed card`,
      undo: true,
      action: () =>
        this.props.undoRemoveCardFromDashboard({ dashcardId: dc.id }),
    });
    MetabaseAnalytics.trackStructEvent("Dashboard", "Remove Card");
  }

  onDashCardAddSeries(dc) {
    this.setState({ addSeriesModalDashCard: dc });
  }

  getDashboardCardIcon = dashCard => {
    const { isRegularCollection } = PLUGIN_COLLECTIONS;
    const { dashboard } = this.props;
    const isRegularQuestion = isRegularCollection({
      authority_level: dashCard.collection_authority_level,
    });
    const isRegularDashboard = isRegularCollection({
      authority_level: dashboard.collection_authority_level,
    });
    if (isRegularDashboard && !isRegularQuestion) {
      const authorityLevel = dashCard.collection_authority_level;
      const opts = PLUGIN_COLLECTIONS.AUTHORITY_LEVEL[authorityLevel];
      const iconSize = 14;
      return {
        name: opts.icon,
        color: color(opts.color),
        tooltip: opts.tooltips?.belonging,
        size: iconSize,

        // Workaround: headerIcon on cards in a first column have incorrect offset out of the box
        targetOffsetX: dashCard.col === 0 ? iconSize : 0,
      };
    }
  };

  renderDashCard(dc, { isMobile, gridItemWidth, totalNumGridCols }) {
    return (
      <DashCard
        dashcard={dc}
        headerIcon={this.getDashboardCardIcon(dc)}
        dashcardData={this.props.dashcardData}
        parameterValues={this.props.parameterValues}
        slowCards={this.props.slowCards}
        fetchCardData={this.props.fetchCardData}
        gridItemWidth={gridItemWidth}
        totalNumGridCols={totalNumGridCols}
        markNewCardSeen={this.props.markNewCardSeen}
        isEditing={this.props.isEditing}
        isEditingParameter={this.props.isEditingParameter}
        isFullscreen={this.props.isFullscreen}
        isNightMode={this.props.isNightMode}
        isMobile={isMobile}
        isPublic={this.props.isPublic}
        onRemove={this.onDashCardRemove.bind(this, dc)}
        onAddSeries={this.onDashCardAddSeries.bind(this, dc)}
        onUpdateVisualizationSettings={this.props.onUpdateDashCardVisualizationSettings.bind(
          this,
          dc.id,
        )}
        onReplaceAllVisualizationSettings={this.props.onReplaceAllDashCardVisualizationSettings.bind(
          this,
          dc.id,
        )}
        mode={this.props.mode}
        navigateToNewCardFromDashboard={
          this.props.navigateToNewCardFromDashboard
        }
        onChangeLocation={this.props.onChangeLocation}
        metadata={this.props.metadata}
        dashboard={this.props.dashboard}
        showClickBehaviorSidebar={this.props.showClickBehaviorSidebar}
        clickBehaviorSidebarDashcard={this.props.clickBehaviorSidebarDashcard}
      />
    );
  }

  get isEditingLayout() {
    const { isEditing, isEditingParameter, clickBehaviorSidebarDashcard } =
      this.props;
    return (
      isEditing && !isEditingParameter && clickBehaviorSidebarDashcard == null
    );
  }

  renderGridItem = ({
    item: dc,
    breakpoint,
    gridItemWidth,
    totalNumGridCols,
  }) => (
    <DashboardCard
      key={String(dc.id)}
      className="DashCard"
      isAnimationDisabled={this.state.isAnimationPaused}
    >
      {this.renderDashCard(dc, {
        isMobile: breakpoint === "mobile",
        gridItemWidth,
        totalNumGridCols,
      })}
    </DashboardCard>
  );

  renderGrid = () => {
    const { dashboard, width, gridSize } = this.props;
    const { layouts } = this.state;
    const rowHeight = this.getRowHeight();

    const columns = {
      desktop: gridSize,
      mobile: 1,
    };

    return (
      <GridLayout
        className={cx("DashboardGrid", {
          "Dash--editing": this.isEditingLayout,
          "Dash--dragging": this.state.isDragging,
        })}
        layouts={layouts}
        breakpoints={GRID_BREAKPOINTS}
        cols={columns}
        width={width}
        margin={{ desktop: [6, 6], mobile: [6, 10] }}
        containerPadding={[0, 0]}
        rowHeight={rowHeight}
        onLayoutChange={this.onLayoutChange}
        onDrag={this.onDrag}
        onDragStop={this.onDragStop}
        isEditing={this.isEditingLayout}
        compactType="vertical"
        items={dashboard.ordered_cards}
        itemRenderer={this.renderGridItem}
      />
    );
  };

  render() {
    const { width } = this.props;
    return (
      <div className="flex layout-centered">
        {width > 0 ? this.renderGrid() : <div />}
        {this.renderAddSeriesModal()}
      </div>
    );
  }
}

export default _.compose(
  ExplicitSize(),
  connect(null, mapDispatchToProps),
)(DashboardGrid);
