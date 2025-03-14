import dayjs from "dayjs";

import type { EnterpriseSettings } from "metabase-enterprise/settings/types";
import type {
  Engine,
  EngineField,
  EngineSource,
  FontFile,
  SettingDefinition,
  SettingKey,
  Settings,
  TokenFeatures,
  TokenStatus,
  Version,
  VersionInfo,
  VersionInfoRecord,
} from "metabase-types/api";

export const createMockEngine = (opts?: Partial<Engine>): Engine => ({
  "driver-name": "PostgreSQL",
  "details-fields": [],
  source: createMockEngineSource(),
  "superseded-by": null,
  ...opts,
});

export const createMockEngineField = (
  opts?: Partial<EngineField>,
): EngineField => ({
  name: "field",
  "display-name": "Field",
  ...opts,
});

export const createMockEngineSource = (
  opts?: Partial<EngineSource>,
): EngineSource => ({
  type: "official",
  contact: null,
  ...opts,
});

export const createMockEngines = (
  opts?: Record<string, Engine>,
): Record<string, Engine> => ({
  postgres: createMockEngine(),
  communityEngine: createMockEngine({
    "driver-name": "CommunityEngine",
    source: createMockEngineSource({
      type: "community",
    }),
  }),
  partnerEngine: createMockEngine({
    "driver-name": "PartnerEngine",
    source: createMockEngineSource({
      type: "partner",
    }),
  }),
  ...opts,
});

export const createMockFontFile = (opts?: Partial<FontFile>): FontFile => ({
  src: "https://metabase.test/regular.woff2",
  fontWeight: 400,
  fontFormat: "woff2",
  ...opts,
});

export const createMockVersion = (opts?: Partial<Version>): Version => ({
  tag: "v1",
  ...opts,
});

export const createMockVersionInfoRecord = (
  opts?: Partial<VersionInfoRecord>,
): VersionInfoRecord => ({
  version: "v1",
  released: "2021-01-01",
  patch: true,
  highlights: ["Bug fix"],
  ...opts,
});

export const createMockVersionInfo = (
  opts?: Partial<VersionInfo>,
): VersionInfo => ({
  latest: createMockVersionInfoRecord(),
  older: [createMockVersionInfoRecord()],
  ...opts,
});

export const createMockTokenStatus = (
  opts?: Partial<TokenStatus>,
): TokenStatus => ({
  status: "Token is Valid.",
  valid: true,
  trial: false,
  "valid-thru": "2022-12-30T23:00:00Z",
  features: [],
  ...opts,
});

export const createMockTokenFeatures = (
  opts?: Partial<TokenFeatures>,
): TokenFeatures => ({
  attached_dwh: false,
  advanced_permissions: false,
  audit_app: false,
  cache_granular_controls: false,
  disable_password_login: false,
  content_verification: false,
  embedding: false,
  embedding_sdk: false,
  hosting: false,
  official_collections: false,
  llm_autodescription: false,
  sandboxes: false,
  scim: false,
  sso_google: false,
  sso_jwt: false,
  sso_ldap: false,
  sso_saml: false,
  session_timeout_config: false,
  whitelabel: false,
  dashboard_subscription_filters: false,
  snippet_collections: false,
  email_allow_list: false,
  email_restrict_recipients: false,
  collection_cleanup: false,
  upload_management: false,
  query_reference_validation: false,
  serialization: false,
  cache_preemptive: false,
  metabot_v3: false,
  ai_sql_fixer: false,
  ...opts,
});

export const createMockSettingDefinition = <
  Key extends SettingKey = SettingKey,
>(
  opts: SettingDefinition<Key>,
): SettingDefinition<Key> => ({
  env_name: "",
  is_env_setting: false,
  value: opts.value,
  ...opts,
});

export const createMockSettings = (
  opts?: Partial<Settings | EnterpriseSettings>,
): EnterpriseSettings => ({
  "admin-email": "admin@metabase.test",
  "airgap-enabled": false,
  "allowed-iframe-hosts": "*",
  "anon-tracking-enabled": false,
  "application-colors": {},
  "application-font": "Lato",
  "application-font-files": [],
  // eslint-disable-next-line no-literal-metabase-strings -- This is a mock
  "application-name": "Metabase",
  "application-favicon-url": "",
  "available-fonts": [],
  "available-locales": [
    // this is a subset of the locales we have in the real app
    ["de", "German"],
    ["en", "English"],
    ["es", "Spanish"],
    ["ko", "Korean"],
    ["pt_BR", "Portuguese (Brazil)"],
    ["zh", "Chinese"],
    ["zh_CN", "Chinese (China)"],
    ["zh_HK", "Chinese (Hong Kong SAR China)"],
    ["zh_TW", "Chinese (Taiwan)"],
  ],
  "bug-reporting-enabled": false,
  "bcc-enabled?": true,
  "cloud-gateway-ips": null,
  "custom-formatting": {},
  "custom-homepage": false,
  "custom-homepage-dashboard": null,
  "help-link": "metabase",
  "help-link-custom-destination": "",
  "deprecation-notice-version": undefined,
  "ee-ai-features-enabled": false,
  "ee-openai-model": "",
  "ee-openai-api-key": "",
  "email-configured?": false,
  "email-smtp-host": null,
  "email-smtp-port": null,
  "email-smtp-security": "none",
  "email-smtp-username": null,
  "email-smtp-password": null,
  "embedding-app-origin": "",
  "embedding-app-origins-sdk": "",
  "embedding-app-origins-interactive": "",
  "enable-embedding": false,
  "enable-embedding-static": false,
  "enable-embedding-sdk": false,
  "enable-embedding-interactive": false,
  "enable-enhancements?": false,
  "enable-nested-queries": true,
  "enable-pivoted-exports": true,
  "expand-browse-in-nav": true,
  "expand-bookmarks-in-nav": true,
  "query-caching-ttl-ratio": 10,
  "query-caching-min-ttl": 60,
  "enable-password-login": true,
  "enable-public-sharing": false,
  "enable-xrays": false,
  engines: createMockEngines(),
  "example-dashboard-id": 1,
  gsheets: { status: "not-connected", folder_url: null },
  "humanization-strategy": "simple",
  "has-user-setup": true,
  "hide-embed-branding?": true,
  "instance-creation": dayjs().toISOString(),
  "show-static-embed-terms": true,
  "show-sdk-embed-terms": true,
  "google-auth-auto-create-accounts-domain": null,
  "google-auth-client-id": null,
  "google-auth-configured": false,
  "google-auth-enabled": false,
  "is-hosted?": false,
  "jwt-enabled": false,
  "jwt-configured": false,
  "ldap-configured?": false,
  "ldap-enabled": false,
  "ldap-port": 389, // default value from API
  "ldap-group-membership-filter": "(member={dn})",
  "loading-message": "doing-science",
  "map-tile-server-url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  "native-query-autocomplete-match-style": "substring",
  "openai-api-key": null,
  "openai-organization": null,
  "openai-model": null,
  "openai-available-models": [],
  "other-sso-enabled?": false,
  "password-complexity": { total: 6, digit: 1 },
  "persisted-models-enabled": false,
  "persisted-model-refresh-cron-schedule": "0 0 0/6 * * ? *",
  "premium-embedding-token": null,
  "read-only-mode": false,
  "report-timezone-short": "UTC",
  "report-timezone-long": "Europe/London",
  "saml-configured": false,
  "saml-enabled": false,
  "saml-identity-provider-uri": null,
  "scim-enabled": false,
  "scim-base-url": "http://localhost:3000/api/ee/scim/v2/",
  "snowplow-url": "",
  "search-typeahead-enabled": true,
  "setup-token": null,
  "session-cookies": null,
  "session-cookie-samesite": "lax",
  "slack-bug-report-channel": null,
  "snowplow-enabled": false,
  "show-database-syncing-modal": false,
  "show-google-sheets-integration": false,
  "show-homepage-data": false,
  "show-homepage-pin-message": false,
  "show-homepage-xrays": false,
  "show-metabase-links": true,
  "show-metabot": true,
  "show-updated-permission-modal": false,
  "show-updated-permission-banner": false,
  "site-locale": "en",
  "site-name": "Metabae",
  "site-url": "http://localhost:3000",
  "site-uuid": "1234",
  "slack-app-token": null,
  "slack-token": null,
  "slack-token-valid?": false,
  "start-of-week": "sunday",
  "store-url": "https://store.staging.metabase.com",
  "subscription-allowed-domains": null,
  "token-features": createMockTokenFeatures(),
  "token-status": null,
  version: createMockVersion(),
  "version-info": createMockVersionInfo(),
  "version-info-last-checked": null,
  "uploads-settings": {
    db_id: null,
    schema_name: null,
    table_prefix: null,
  },
  "user-visibility": null,
  "last-acknowledged-version": "v1",
  "last-used-native-database-id": 1,
  "embedding-homepage": "hidden",
  "setup-license-active-at-setup": false,
  "notebook-native-preview-shown": false,
  "notebook-native-preview-sidebar-width": null,
  "query-analysis-enabled": false,
  "check-for-updates": true,
  "update-channel": "latest",
  "trial-banner-dismissal-timestamp": null,
  ...opts,
});
