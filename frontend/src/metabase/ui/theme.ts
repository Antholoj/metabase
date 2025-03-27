import type { MantineThemeOverride } from "@mantine/core";
import { rem } from "@mantine/core";

import { DEFAULT_METABASE_COMPONENT_THEME } from "metabase/embedding-sdk/theme";

import {
  getAccordionOverrides,
  getActionIconOverrides,
  getAlertOverrides,
  getAnchorOverrides,
  getAutocompleteOverrides,
  getBadgeOverrides,
  getButtonOverrides,
  getCalendarOverrides,
  getCardOverrides,
  getCheckboxOverrides,
  getChipOverrides,
  getCodeOverrides,
  getDateInputOverrides,
  getDatePickerOverrides,
  getDividerOverrides,
  getFileInputOverrides,
  getHoverCardOverrides,
  getInputOverrides,
  getListOverrides,
  getMenuOverrides,
  getModalOverrides,
  getMonthPickerOverrides,
  getMultiSelectOverrides,
  getNavLinkOverrides,
  getOverlayOverrides,
  getPaperOverrides,
  getPopoverOverrides,
  getProgressOverrides,
  getRadioOverrides,
  getScrollAreaOverrides,
  getSegmentedControlOverrides,
  getSelectOverrides,
  getSkeletonOverrides,
  getSwitchOverrides,
  getTabsOverrides,
  getTextInputOverrides,
  getTextOverrides,
  getTextareaOverrides,
  getTimeInputOverrides,
  getTitleOverrides,
  getTooltipOverrides,
} from "./components";
import { getThemeColors } from "./utils/colors";

export const breakpoints = {
  xs: "23em",
  sm: "40em",
  md: "60em",
  lg: "80em",
  xl: "120em",
};
export type BreakpointName = keyof typeof breakpoints;

export const getThemeOverrides = (): MantineThemeOverride => ({
  breakpoints,
  colors: getThemeColors(),
  primaryColor: "brand",
  primaryShade: 0,
  shadows: {
    sm: "0px 1px 4px 2px rgba(0, 0, 0, 0.08)",
    md: "0px 4px 20px 0px rgba(0, 0, 0, 0.05)",
  },
  spacing: {
    xs: rem(4),
    sm: rem(8),
    md: rem(16),
    lg: rem(24),
    xl: rem(32),
  },
  radius: {
    xs: "4px",
    sm: "6px",
    md: "8px",
    xl: "40px",
  },
  fontSizes: {
    xs: rem(11),
    sm: rem(12),
    md: rem(14),
    lg: rem(17),
    xl: rem(21),
  },
  lineHeight: "1rem",
  headings: {
    sizes: {
      h1: {
        fontSize: rem(24),
        lineHeight: rem(24),
      },
      h2: {
        fontSize: rem(20),
        lineHeight: rem(24),
      },
      h3: {
        fontSize: rem(14),
        lineHeight: rem(16),
      },
      h4: {
        fontSize: rem(14),
        lineHeight: rem(16),
      },
    },
  },
  fontFamily: "var(--mb-default-font-family), sans-serif",
  fontFamilyMonospace: "Monaco, monospace",
  focusRingStyles: {
    styles: (theme) => ({
      outline: `${rem(2)} solid ${theme.colors.focus[0]}`,
      outlineOffset: rem(2),
    }),
  },
  components: {
    ...getAccordionOverrides(),
    ...getActionIconOverrides(),
    ...getAlertOverrides(),
    ...getAnchorOverrides(),
    ...getAutocompleteOverrides(),
    ...getBadgeOverrides(),
    ...getButtonOverrides(),
    ...getCalendarOverrides(),
    ...getCardOverrides(),
    ...getCheckboxOverrides(),
    ...getChipOverrides(),
    ...getCodeOverrides(),
    ...getDateInputOverrides(),
    ...getDatePickerOverrides(),
    ...getDividerOverrides(),
    ...getFileInputOverrides(),
    ...getInputOverrides(),
    ...getMenuOverrides(),
    ...getModalOverrides(),
    ...getMonthPickerOverrides(),
    ...getMultiSelectOverrides(),
    ...getNavLinkOverrides(),
    ...getOverlayOverrides(),
    ...getRadioOverrides(),
    ...getPaperOverrides(),
    ...getPopoverOverrides(),
    ...getProgressOverrides(),
    ...getSkeletonOverrides(),
    ...getScrollAreaOverrides(),
    ...getSegmentedControlOverrides(),
    ...getSelectOverrides(),
    ...getSwitchOverrides(),
    ...getTabsOverrides(),
    ...getTextareaOverrides(),
    ...getTextInputOverrides(),
    ...getTextOverrides(),
    ...getTimeInputOverrides(),
    ...getTitleOverrides(),
    ...getTooltipOverrides(),
    ...getHoverCardOverrides(),
    ...getListOverrides(),
  },
  other: DEFAULT_METABASE_COMPONENT_THEME,
});
