/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
  tsconfig: "./tsconfig.sdk-docs.json",
  plugin: [
    "typedoc-plugin-missing-exports",
    "typedoc-plugin-markdown",
    "typedoc-plugin-frontmatter",
    "typedoc-plugin-remark",
  ],
  entryPoints: ["../resources/embedding-sdk/dist/index.d.ts"],
  router: "structure",
  customJs: "page-custom-logic.js",
  internalModule: "internal",
  collapseInternalModule: true,
  favicon: "../resources/frontend_client/favicon.ico",
  outputs: [
    {
      name: "markdown",
      path: "../docs/embedding/sdk/generated/markdown",
      options: {
        flattenOutputFiles: false,
        hideBreadcrumbs: true,
        useCodeBlocks: true,
        expandObjects: true,
        expandParameters: true,
        hidePageHeader: true,
        hidePageTitle: true,
        hideGroupHeadings: true,
        indexFormat: "table",
        parametersFormat: "table",
        interfacePropertiesFormat: "table",
        classPropertiesFormat: "table",
        enumMembersFormat: "table",
        propertyMembersFormat: "table",
        typeDeclarationFormat: "table",
        tableColumnSettings: {
          hideDefaults: false,
          hideInherited: false,
          hideModifiers: false,
          hideOverrides: false,
          hideSources: true,
          hideValues: false,
          leftAlignHeaders: false,
        },
        remarkPlugins: [
          ["remark-behead", { minDepth: 4 }],
          [
            "remark-link-rewrite",
            {
              replacer: async url => {
                if (url.includes("generated/html")) {
                  return url;
                }

                return `./generated/html/${url}`;
              },
            },
          ],
        ],
      },
    },
    {
      name: "html",
      path: "../docs/embedding/sdk/generated/html",
      options: {
        hideGenerator: true,
        navigation: {
          includeCategories: false,
          includeGroups: false,
          includeFolders: false,
          compactFolders: true,
          excludeReferences: true,
        },
        visibilityFilters: {},
        includeHierarchySummary: false,
        frontmatterGlobals: {
          layout: "docs-api",
        },
      },
    },
  ],
  kindSortOrder: [
    "Reference",
    "Project",
    "Namespace",
    "Enum",
    "EnumMember",
    "Class",
    "Interface",
    "TypeAlias",
    "Constructor",
    "Property",
    "Variable",
    "Function",
    "Accessor",
    "Method",
    "Parameter",
    "TypeParameter",
    "TypeLiteral",
    "CallSignature",
    "ConstructorSignature",
    "IndexSignature",
    "GetSignature",
    "SetSignature",
    "Module",
  ],
  readme: "none",
  excludePrivate: true,
  excludeExternals: true,
  excludeInternal: true,
  excludeNotDocumented: true,
  excludeReferences: true,
  excludeNotDocumentedKinds: [
    "Module",
    "Namespace",
    "Enum",
    "EnumMember",
    "Variable",
    "Function",
    "Class",
    "Constructor",
    "Method",
    "CallSignature",
    "IndexSignature",
    "ConstructorSignature",
    "Accessor",
    "GetSignature",
    "SetSignature",
    "Reference",
  ],
  treatWarningsAsErrors: true,
  disableSources: true,
  validation: {
    notExported: true,
    invalidLink: false,
    rewrittenLink: true,
    notDocumented: false,
    unusedMergeModuleWith: true,
  },
  defaultRemarkPlugins: {
    gfm: true,
    frontmatter: true,
    mdx: false,
  },
};

export default config;
