import { createReducer } from "@reduxjs/toolkit";
import { assoc, dissoc } from "icepick";

import { handleActions } from "metabase/lib/redux";
import { NAVIGATE_BACK_TO_DASHBOARD } from "metabase/query_builder/actions";
import type { UiParameter } from "metabase-lib/v1/parameters/types";
import type {
  DashCardId,
  ParameterId,
  ParameterValueOrArray,
} from "metabase-types/api";
import type { DashboardSidebarName } from "metabase-types/store/dashboard";

import {
  CANCEL_FETCH_CARD_DATA,
  CLOSE_SIDEBAR,
  FETCH_CARD_DATA,
  FETCH_CARD_DATA_PENDING,
  FETCH_DASHBOARD_CARD_DATA,
  HIDE_ADD_PARAMETER_POPOVER,
  INITIALIZE,
  REMOVE_PARAMETER,
  RESET,
  RESET_PARAMETERS,
  SET_EDITING_DASHBOARD,
  SET_PARAMETER_VALUE,
  SET_PARAMETER_VALUES,
  SET_SIDEBAR,
  SHOW_ADD_PARAMETER_POPOVER,
  SHOW_AUTO_APPLY_FILTERS_TOAST,
  fetchDashboard,
  markCardAsSlow,
  setDisplayTheme,
  setDocumentTitle,
  setShowLoadingCompleteFavicon,
} from "./actions";
import { INITIAL_DASHBOARD_STATE } from "./constants";

export const dashboardId = createReducer(
  INITIAL_DASHBOARD_STATE.dashboardId,
  builder => {
    builder.addCase(INITIALIZE, () => null);
    builder.addCase(
      fetchDashboard.fulfilled,
      (_state, { payload }) => payload.dashboardId,
    );
    builder.addCase(RESET, () => null);
  },
);

// TODO: double check if this reducer is used
export const missingActionParameters = handleActions(
  {
    [INITIALIZE]: {
      next: () => null,
    },
    [RESET]: {
      next: () => null,
    },
  },
  INITIAL_DASHBOARD_STATE.missingActionParameters,
);

export const autoApplyFilters = createReducer(
  INITIAL_DASHBOARD_STATE.autoApplyFilters,
  builder => {
    builder.addCase<
      string,
      {
        type: string;
        payload: { toastId: number | null; dashboardId: number | null };
      }
    >(SHOW_AUTO_APPLY_FILTERS_TOAST, (state, { payload }) => {
      const { toastId, dashboardId } = payload;

      state.toastId = toastId;
      state.toastDashboardId = dashboardId;
    });
  },
);

export const theme = createReducer(INITIAL_DASHBOARD_STATE.theme, builder => {
  builder.addCase(setDisplayTheme, (_state, { payload }) => payload || null);
});

export const slowCards = createReducer(
  INITIAL_DASHBOARD_STATE.slowCards,
  builder => {
    builder.addCase(markCardAsSlow, (state, { payload: { id, result } }) => ({
      ...state,
      [id]: result,
    }));
  },
);

export const isNavigatingBackToDashboard = handleActions(
  {
    [NAVIGATE_BACK_TO_DASHBOARD]: () => true,
    [RESET]: () => false,
  },
  INITIAL_DASHBOARD_STATE.isNavigatingBackToDashboard,
);

export const isAddParameterPopoverOpen = handleActions(
  {
    [SHOW_ADD_PARAMETER_POPOVER]: () => true,
    [HIDE_ADD_PARAMETER_POPOVER]: () => false,
    [INITIALIZE]: () => false,
    [RESET]: () => false,
  },
  INITIAL_DASHBOARD_STATE.isAddParameterPopoverOpen,
);

export const editingDashboard = handleActions(
  {
    [INITIALIZE]: { next: () => INITIAL_DASHBOARD_STATE.editingDashboard },
    [SET_EDITING_DASHBOARD]: {
      next: (_state, { payload }) => payload ?? null,
    },
    [RESET]: { next: () => INITIAL_DASHBOARD_STATE.editingDashboard },
  },
  INITIAL_DASHBOARD_STATE.editingDashboard,
);

export const loadingControls = createReducer(
  INITIAL_DASHBOARD_STATE.loadingControls,
  builder => {
    builder.addCase(setDocumentTitle, (state, { payload }) => {
      state.documentTitle = payload;
    });

    builder.addCase(setShowLoadingCompleteFavicon, (state, { payload }) => {
      state.showLoadCompleteFavicon = payload;
    });

    builder.addCase(RESET, () => INITIAL_DASHBOARD_STATE.loadingControls);

    builder.addCase(INITIALIZE, () => INITIAL_DASHBOARD_STATE.loadingControls);

    builder.addCase(fetchDashboard.pending, state => {
      state.isLoading = true;
    });

    builder.addCase(fetchDashboard.fulfilled, state => {
      state.isLoading = false;
    });

    builder.addCase(fetchDashboard.rejected, state => {
      state.isLoading = false;
    });
  },
);

const DEFAULT_SIDEBAR = { props: {} };
export const sidebar = createReducer(
  INITIAL_DASHBOARD_STATE.sidebar,
  builder => {
    builder.addCase(INITIALIZE, () => DEFAULT_SIDEBAR);
    builder.addCase(RESET, () => DEFAULT_SIDEBAR);
    builder.addCase(REMOVE_PARAMETER, () => DEFAULT_SIDEBAR);
    builder.addCase(SET_EDITING_DASHBOARD, () => DEFAULT_SIDEBAR);
    builder.addCase(CLOSE_SIDEBAR, () => DEFAULT_SIDEBAR);

    builder.addCase<
      string,
      {
        type: string;
        payload: {
          name: DashboardSidebarName;
          props?: { dashcardId?: DashCardId; parameterId?: ParameterId };
        };
      }
    >(SET_SIDEBAR, (_state, { payload: { name, props } }) => ({
      name,
      props: props || {},
    }));
  },
);

export const parameterValues = createReducer(
  INITIAL_DASHBOARD_STATE.parameterValues,
  builder => {
    builder.addCase<
      string,
      { type: string; payload: { clearCache?: boolean } }
    >(INITIALIZE, (state, { payload: { clearCache = true } = {} }) => {
      return clearCache ? {} : state;
    });

    builder.addCase(fetchDashboard.fulfilled, (_state, { payload }) => {
      return payload.parameterValues;
    });

    builder.addCase<
      string,
      {
        type: string;
        payload: {
          id: ParameterId;
          value: ParameterValueOrArray;
          isDraft: boolean;
        };
      }
    >(SET_PARAMETER_VALUE, (state, { payload: { id, value, isDraft } }) => {
      if (!isDraft) {
        state[id] = value;
      }
    });

    builder.addCase<
      string,
      {
        type: string;
        payload: Record<ParameterId, ParameterValueOrArray>;
      }
    >(SET_PARAMETER_VALUES, (_state, { payload }) => {
      return payload;
    });

    builder.addCase<
      string,
      {
        type: string;
        payload: UiParameter[];
      }
    >(RESET_PARAMETERS, (state, { payload: parameters }) => {
      for (const parameter of parameters) {
        const { id, value } = parameter;
        state[id] = value;
      }
    });

    builder.addCase<string, { type: string; payload: { id: ParameterId } }>(
      REMOVE_PARAMETER,
      (state, { payload: { id } }) => {
        delete state[id];
      },
    );
  },
);

export const loadingDashCards = createReducer(
  INITIAL_DASHBOARD_STATE.loadingDashCards,
  builder => {
    builder
      .addCase(INITIALIZE, state => {
        state.loadingStatus = "idle";
      })
      .addCase<
        string,
        {
          type: string;
          payload: {
            currentTime: number;
            loadingIds: DashCardId[];
          };
        }
      >(FETCH_DASHBOARD_CARD_DATA, (state, action) => {
        const { currentTime, loadingIds } = action.payload;
        state.loadingIds = loadingIds;
        state.loadingStatus = loadingIds.length > 0 ? "running" : "idle";
        state.startTime = loadingIds.length > 0 ? currentTime : null;
      })
      .addCase<
        string,
        {
          type: string;
          payload: {
            dashcard_id: DashCardId;
          };
        }
      >(FETCH_CARD_DATA_PENDING, (state, action) => {
        const { dashcard_id } = action.payload;
        if (!state.loadingIds.includes(dashcard_id)) {
          state.loadingIds.push(dashcard_id);
        }
      })
      .addCase<
        string,
        {
          type: string;
          payload: {
            currentTime: number;
            dashcard_id: DashCardId;
          };
        }
      >(FETCH_CARD_DATA, (state, action) => {
        const { dashcard_id, currentTime } = action.payload;
        state.loadingIds = state.loadingIds.filter(id => id !== dashcard_id);
        if (state.loadingIds.length === 0) {
          state.endTime = currentTime;
          state.loadingStatus = "complete";
        }
      })
      .addCase<
        string,
        {
          type: string;
          payload: {
            dashcard_id: DashCardId;
          };
        }
      >(CANCEL_FETCH_CARD_DATA, (state, action) => {
        const { dashcard_id } = action.payload;
        state.loadingIds = state.loadingIds.filter(id => id !== dashcard_id);
        if (state.loadingIds.length === 0) {
          state.startTime = null;
        }
      })
      .addCase(RESET, state => {
        state.loadingStatus = "idle";
      });
  },
);

export const draftParameterValues = createReducer({}, builder => {
  builder
    .addCase<string, { type: string; payload?: { clearCache?: boolean } }>(
      INITIALIZE,
      (state, action) => {
        const { clearCache = true } = action.payload ?? {};
        return clearCache ? {} : state;
      },
    )

    .addCase(fetchDashboard.fulfilled, (state, action) => {
      const { dashboard, parameterValues, preserveParameters } = action.payload;
      return preserveParameters && !dashboard.auto_apply_filters
        ? state
        : parameterValues;
    })

    .addCase<
      string,
      {
        type: string;
        payload: {
          id: ParameterId;
          value: ParameterValueOrArray;
          isDraft: boolean;
        };
      }
    >(SET_PARAMETER_VALUE, (state, action) => {
      const { id, value } = action.payload;
      return assoc(state ?? {}, id, value);
    })

    .addCase<
      string,
      {
        type: string;
        payload: Record<ParameterId, ParameterValueOrArray>;
      }
    >(SET_PARAMETER_VALUES, (_state, action) => action.payload)

    .addCase<
      string,
      {
        type: string;
        payload: UiParameter[];
      }
    >(RESET_PARAMETERS, (state, action) => {
      const parameters = action.payload;
      return parameters.reduce(
        (result, parameter) => assoc(result, parameter.id, parameter.value),
        state ?? {},
      );
    })

    .addCase<string, { type: string; payload: { id: ParameterId } }>(
      REMOVE_PARAMETER,
      (state, action) => {
        const { id } = action.payload;
        return dissoc(state, id);
      },
    );
});

// Combined reducer needs to init state for every slice
export const selectedTabId = (state = INITIAL_DASHBOARD_STATE.selectedTabId) =>
  state;
export const tabDeletions = (state = INITIAL_DASHBOARD_STATE.tabDeletions) =>
  state;
