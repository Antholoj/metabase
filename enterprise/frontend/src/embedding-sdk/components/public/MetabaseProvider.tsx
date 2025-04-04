import { Global } from "@emotion/react";
import type { Action, Store } from "@reduxjs/toolkit";
import { type JSX, type ReactNode, memo, useEffect, useRef } from "react";

import { SdkThemeProvider } from "embedding-sdk/components/private/SdkThemeProvider";
import { useInitData } from "embedding-sdk/hooks";
import { getSdkStore } from "embedding-sdk/store";
import {
  setErrorComponent,
  setEventHandlers,
  setLoaderComponent,
  setMetabaseClientUrl,
  setPlugins,
} from "embedding-sdk/store/reducer";
import type {
  SdkErrorComponent,
  SdkStoreState,
} from "embedding-sdk/store/types";
import type { MetabaseAuthConfig } from "embedding-sdk/types";
import type { SdkEventHandlersConfig } from "embedding-sdk/types/events";
import type { CommonElementProps } from "embedding-sdk/types/props";
import { EMBEDDING_SDK_ROOT_ELEMENT_ID } from "metabase/embedding-sdk/config";
import type { MetabaseTheme } from "metabase/embedding-sdk/theme";
import type { MetabasePluginsConfig } from "metabase/embedding-sdk/types/plugins";
import { MetabaseReduxProvider } from "metabase/lib/redux";
import { LocaleProvider } from "metabase/public/LocaleProvider";
import { setOptions } from "metabase/redux/embed";
import { EmotionCacheProvider } from "metabase/styled-components/components/EmotionCacheProvider";
import { Box } from "metabase/ui";

import { SCOPED_CSS_RESET } from "../private/PublicComponentStylesWrapper";
import { SdkContextProvider } from "../private/SdkContext";
import { SdkFontsGlobalStyles } from "../private/SdkGlobalFontsStyles";
import {
  FullPagePortalContainer,
  PortalContainer,
} from "../private/SdkPortalContainer";
import { SdkUsageProblemDisplay } from "../private/SdkUsageProblem";

import "metabase/css/index.module.css";
import "metabase/css/vendor.css";

export interface MetabaseProviderProps
  extends Omit<CommonElementProps, "style"> {
  /**
   * The children of the MetabaseProvider component.
   */
  children: ReactNode;

  /**
   * Defines how to authenticate with Metabase.
   */
  authConfig: MetabaseAuthConfig;

  /**
   * See [Appearance](./appearance.md).
   */
  theme?: MetabaseTheme;

  /**
   * See [Plugins](./plugins.md).
   */
  pluginsConfig?: MetabasePluginsConfig;

  /**
   * See [Global event handlers](#global-event-handlers).
   */
  eventHandlers?: SdkEventHandlersConfig;

  /**
   * Defines the display language. Accepts an ISO language code such as `en` or `de`.
   * Defaults to `en`. Does not support country code suffixes (i.e. `en-US`)
   **/
  locale?: string;

  /**
   * A custom loader component to display while the SDK is loading.
   **/
  loaderComponent?: () => JSX.Element;

  /**
   * A custom error component to display when the SDK encounters an error.
   **/
  errorComponent?: SdkErrorComponent;

  /**
   * Whether to allow logging to the DevTools console. Defaults to true.
   **/
  allowConsoleLog?: boolean;
}

interface InternalMetabaseProviderProps extends MetabaseProviderProps {
  store: Store<SdkStoreState, Action>;
}

export const MetabaseProviderInternal = ({
  children,
  authConfig,
  pluginsConfig,
  eventHandlers,
  theme,
  store,
  className,
  locale = "en",
  errorComponent,
  loaderComponent,
  allowConsoleLog,
}: InternalMetabaseProviderProps): JSX.Element => {
  const { fontFamily } = theme ?? {};
  useInitData({ authConfig, allowConsoleLog });

  useEffect(() => {
    if (fontFamily) {
      store.dispatch(setOptions({ font: fontFamily }));
    }
  }, [store, fontFamily]);

  useEffect(() => {
    store.dispatch(setPlugins(pluginsConfig || null));
  }, [store, pluginsConfig]);

  useEffect(() => {
    store.dispatch(setEventHandlers(eventHandlers || null));
  }, [store, eventHandlers]);

  useEffect(() => {
    store.dispatch(setLoaderComponent(loaderComponent ?? null));
  }, [store, loaderComponent]);

  useEffect(() => {
    store.dispatch(setErrorComponent(errorComponent ?? null));
  }, [store, errorComponent]);

  useEffect(() => {
    store.dispatch(setMetabaseClientUrl(authConfig.metabaseInstanceUrl));
  }, [store, authConfig.metabaseInstanceUrl]);

  return (
    <SdkContextProvider>
      <EmotionCacheProvider>
        <Global styles={SCOPED_CSS_RESET} />
        <SdkThemeProvider theme={theme}>
          <SdkFontsGlobalStyles baseUrl={authConfig.metabaseInstanceUrl} />
          <Box className={className} id={EMBEDDING_SDK_ROOT_ELEMENT_ID}>
            <LocaleProvider locale={locale}>{children}</LocaleProvider>
            <SdkUsageProblemDisplay
              authConfig={authConfig}
              allowConsoleLog={allowConsoleLog}
            />
            <PortalContainer />
            <FullPagePortalContainer />
          </Box>
        </SdkThemeProvider>
      </EmotionCacheProvider>
    </SdkContextProvider>
  );
};

export const MetabaseProvider = memo(function MetabaseProvider(
  props: MetabaseProviderProps,
) {
  // This makes the store stable across re-renders, but still not a singleton:
  // we need a different store for each test or each storybook story
  const storeRef = useRef<Store<SdkStoreState, Action> | undefined>(undefined);
  if (!storeRef.current) {
    storeRef.current = getSdkStore();
  }

  return (
    <MetabaseReduxProvider store={storeRef.current}>
      <MetabaseProviderInternal store={storeRef.current} {...props} />
    </MetabaseReduxProvider>
  );
});
