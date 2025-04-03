import { Combobox, type MantineThemeOverride } from "@mantine/core";

import S from "./Combobox.module.css";

export const comboboxOverrides: MantineThemeOverride["components"] = {
  Combobox: Combobox.extend({
    defaultProps: {
      size: "md",
    },
    classNames: {
      empty: S.empty,
    },
  }),
};
