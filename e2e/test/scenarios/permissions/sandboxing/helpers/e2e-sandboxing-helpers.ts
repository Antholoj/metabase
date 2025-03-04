import _ from "underscore";

import { SAMPLE_DB_ID, USER_GROUPS } from "e2e/support/cypress_data";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import type { StructuredQuestionDetails } from "e2e/support/helpers";
import { checkNotNull } from "metabase/lib/types";
import type {
  CacheConfig,
  CollectionItem,
  Dashboard,
  FieldValue,
  Filter,
  GetFieldValuesResponse,
  ParameterValue,
  ParameterValues,
  User,
} from "metabase-types/api";
import { CacheDurationUnit } from "metabase-types/api";

import type { DashcardQueryResponse, DatasetResponse } from "./types";

const { H } = cy;
const { PRODUCTS_ID, PRODUCTS } = SAMPLE_DATABASE;
const { ALL_USERS_GROUP, DATA_GROUP, COLLECTION_GROUP, READONLY_GROUP } =
  USER_GROUPS;

type CustomColumnType = "boolean" | "string" | "number";
type CustomViewType = "Question" | "Model";

type SandboxPolicy = {
  filterTableBy: "column" | "custom_view";
  customViewType?: CustomViewType;
  customViewName?: string;
  customColumnType?: "number" | "string" | "boolean";
  filterColumn?: string;
};

const customColumnTypeToFormula: Record<CustomColumnType, string> = {
  boolean: '[Category]="Gizmo"',
  string: 'concat("Category is ",[Category])',
  number: 'if([Category] = "Gizmo", 1, 0)',
};

const addCustomColumnToQuestion = (customColumnType: CustomColumnType) => {
  cy.log("Add a custom column");
  H.getNotebookStep("expression").icon("add").click();
  H.enterCustomColumnDetails({
    formula: customColumnTypeToFormula[customColumnType],
    name: `my_${customColumnType}`,
  });
  H.popover().button("Done").click();
};

const baseQuery = {
  type: "query",
  "source-table": PRODUCTS_ID,
  limit: 20,
};

const gizmoFilter: Filter = ["=", ["field", PRODUCTS.CATEGORY, null], "Gizmo"];

export const questionCustomView: StructuredQuestionDetails = {
  name: "Question showing the products whose category is Gizmo (custom view)",
  query: {
    ...baseQuery,
    filter: gizmoFilter,
  },
};

export const modelCustomView: StructuredQuestionDetails = {
  name: "Model showing the products whose category is Gizmo (custom view)",
  query: {
    ...baseQuery,
    filter: gizmoFilter,
  },
  type: "model",
};

const customViews = [questionCustomView, modelCustomView];

const savedQuestion: StructuredQuestionDetails = {
  name: "Question showing all products",
  query: baseQuery,
};

const model: StructuredQuestionDetails = {
  name: "Model showing all products",
  query: baseQuery,
  type: "model",
};

// const ordersJoinedToProducts: StructuredQuestionDetails = {
//   name: "Question with Orders joined to Products",
//   query: {
//     ...baseQuery,
//     joins: [
//       {
//         strategy: "left-join",
//         alias: "Products",
//         condition: [
//           "=",
//           ["field", ORDERS.PRODUCT_ID, null],
//           ["field", PRODUCTS.ID, { "join-alias": "Products" }],
//         ],
//         "source-table": PRODUCTS_ID,
//         fields: "all",
//       },
//     ],
//     aggregation: [["sum", ["field", ORDERS.TOTAL, null]]],
//     breakout: [["field", PRODUCTS.CATEGORY, { "join-alias": "Products" }]],
//     "source-table": ORDERS_ID,
//   } as StructuredQuery,
// };

// const ordersImplicitlyJoinedToProducts: StructuredQuestionDetails = {
//   name: "Question with Orders implicitly joined to Products",
//   query: {
//     "source-table": ORDERS_ID,
//     fields: [
//       [
//         "field",
//         PRODUCTS.CATEGORY,
//         { "base-type": "type/Text", "source-field": ORDERS.PRODUCT_ID },
//       ],
//       ["field", ORDERS.ID, null],
//       ["field", ORDERS.TOTAL, null],
//       ["field", ORDERS.PRODUCT_ID, null],
//     ],
//   },
// };

// const multiStageQuestion: StructuredQuestionDetails = {
//   name: "Multi-stage question",
//   query: {
//     "source-query": {
//       "source-query": {
//         "source-table": PRODUCTS_ID,
//         aggregation: [["count"]],
//         breakout: [["field", PRODUCTS.CATEGORY, null]],
//       },
//       aggregation: [["count"]],
//       breakout: [["field", PRODUCTS.CATEGORY, null]],
//     },
//     aggregation: [["count"]],
//     breakout: [["field", PRODUCTS.CATEGORY, null]],
//   },
// };

const questionData: StructuredQuestionDetails[] = [
  savedQuestion,
  model,
  // ordersJoinedToProducts,
  // ordersImplicitlyJoinedToProducts,
  // multiStageQuestion,
];

export const adhocQuestionData = {
  name: "Adhoc question",
  dataset_query: {
    database: SAMPLE_DB_ID,
    type: "query",
    query: {
      "source-table": PRODUCTS_ID,
      filter: [">", ["field", PRODUCTS.PRICE, null], 50],
    },
    limit: 20,
  },
};

function addCustomColumnsToQuestion() {
  H.openNotebook();
  H.getNotebookStep("data").button("Custom column").click();
  addCustomColumnToQuestion("boolean");
  addCustomColumnToQuestion("number");
  addCustomColumnToQuestion("string");
  H.visualize();

  // for some reason we can't use the saveQuestion helper here
  cy.intercept("PUT", "/api/card/*").as("updateQuestion");
  cy.findByTestId("qb-header").button("Save").click();
  H.modal().button("Save").click();
  cy.wait("@updateQuestion");
}

export const preparePermissions = () => {
  H.blockUserGroupPermissions(ALL_USERS_GROUP);
  H.blockUserGroupPermissions(COLLECTION_GROUP);
  H.blockUserGroupPermissions(READONLY_GROUP);
};

/**
 * creates all questions and models and puts them in a dashboard
 * all of them reside in a single collection
 */
export const createSandboxingDashboardAndQuestions = () => {
  customViews.forEach((view) => H.createQuestion(view));

  H.createCollection({ name: "Sandboxing", alias: "sandboxingCollectionId" });

  return cy.get("@sandboxingCollectionId").then((collectionId: any) => {
    H.createDashboardWithQuestions({
      dashboardName: "Dashboard with sandboxable questions",
      dashboardDetails: { collection_id: collectionId },
      questions: questionData.map((questionDetails) => ({
        ...questionDetails,
        collection_id: collectionId,
      })),
    }).then(({ dashboard, questions }) => {
      cy.log("Add question based on saved question");
      const savedQuestionId = questions.find(
        (q) => q.name === savedQuestion.name,
      )?.id;
      H.createQuestionAndAddToDashboard(
        {
          name: "Question based on the all-products question",
          query: {
            ...baseQuery,
            "source-table": `card__${savedQuestionId}`,
          },
          collection_id: collectionId,
        },
        dashboard.id,
      );

      cy.log("Add question based on model");
      const modelId = questions.find((q) => q.name === model.name)?.id;
      H.createQuestionAndAddToDashboard(
        {
          name: "Question based on model",
          query: {
            ...baseQuery,
            "source-table": `card__${modelId}`,
          },
          collection_id: collectionId,
        },
        dashboard.id,
      );

      H.createQuestionAndAddToDashboard(
        {
          name: "Question with custom columns",
          query: baseQuery,
          collection_id: collectionId,
        },
        dashboard.id,
      ).then((response: any) => {
        H.visitQuestion(response.body.card.id);
        addCustomColumnsToQuestion();

        // copy custom column question to a model
        cy.request("GET", `/api/card/${response.body.card.id}`).then(
          ({ body }) => {
            cy.request("POST", "/api/card", {
              ...body,
              name: "Model with custom columns",
              type: "model",
            }).then(({ body }) => {
              H.addQuestionToDashboard({
                cardId: body.id,
                dashboardId: dashboard.id,
              });
            });
          },
        );
      });
    });

    // Provide information about the dashboard and questions that the tests
    // can refer to
    return cy.request<{ data: CollectionItem[] }>(
      `/api/collection/${collectionId}/items`,
    );
  });
};

type NormalUser = Partial<User> & { email: string; password: string };

/** A non-admin user who should only see products that are Gizmos once the
 * sandboxing policies are applied */
export const gizmoViewer: NormalUser = {
  email: "alice@gizmos.com",
  password: "--------",
  user_group_memberships: [
    { id: ALL_USERS_GROUP, is_group_manager: false },
    { id: DATA_GROUP, is_group_manager: false },
    { id: COLLECTION_GROUP, is_group_manager: false },
  ],
};

/** A non-admin user who should only see products that are Widgets once the
 * sandboxing policies are applied */
export const widgetViewer: NormalUser = {
  email: "bob@widgets.com",
  password: "--------",
  user_group_memberships: [
    { id: ALL_USERS_GROUP, is_group_manager: false },
    { id: DATA_GROUP, is_group_manager: false },
    { id: COLLECTION_GROUP, is_group_manager: false },
  ],
};

export const signInAs = (user: NormalUser) => {
  cy.log(`Sign in as user via an API call: ${user.email}`);
  return cy
    .request("POST", "/api/session", {
      username: user.email,
      password: user.password,
    })
    .then(() => {
      return waitForUserToBeLoggedIn(user);
    });
};

export const assignAttributeToUser = ({
  user,
  attributeKey = "filter-attribute",
  attributeValue,
}: {
  user: NormalUser;
  attributeKey?: string;
  attributeValue: string;
}) => {
  cy.request("GET", "/api/user")
    .then((response) => {
      const userData = response.body.data.find(
        (u: { email: string }) => u.email === user.email,
      );
      return userData.id;
    })
    .then((userId) => {
      return cy.request("GET", `/api/user/${userId}`);
    })
    .then((response) => {
      const user = response.body;
      return user;
    })
    .then((user) => {
      cy.request("PUT", `/api/user/${user.id}`, {
        ...user,
        login_attributes: {
          [attributeKey]: attributeValue,
        },
      });
    });
};

export const configureSandboxPolicy = (policy: SandboxPolicy) => {
  const { filterTableBy, customViewName, customViewType, filterColumn } =
    policy;

  cy.log(`Configure sandboxing policy: ${JSON.stringify(policy)}`);
  cy.log("Show the permissions configuration for the Sample Database");
  cy.visit("/admin/permissions/data/database/1");
  cy.log(
    "Show the permissions configuration for the Sample Database's Products table",
  );
  cy.findByRole("menuitem", { name: /Products/ }).click();
  cy.log("Modify the sandboxing policy for the 'data' group");
  H.modifyPermission("data", 0, "Sandboxed");

  H.modal().within(() => {
    cy.findByText(/Change access to this database to .*Sandboxed.*?/);
    cy.button("Change").click();
  });

  H.modal().findByText(/Restrict access to this table/);

  if (filterTableBy !== "custom_view") {
    cy.log("Filter by a column in the table");
    cy.findByRole("radio", {
      name: /Filter by a column in the table/,
    }).should("be.checked");
  } else if (customViewName) {
    cy.findByText(
      /Use a saved question to create a custom view for this table/,
    ).click();
    cy.findByTestId("custom-view-picker-button").click();
    H.entityPickerModal().within(() => {
      H.entityPickerModalTab(customViewType).click();
      cy.findByText(/Sandboxing/).click(); // collection name
      cy.findByText(customViewName).click();
    });
  }

  if (filterColumn) {
    H.modal()
      .findByRole("button", { name: /Pick a column|parameter/ })
      .click();
    cy.findByRole("option", { name: filterColumn }).click();
    H.modal()
      .findByRole("button", { name: /Pick a user attribute/ })
      .click();
    cy.findByRole("option", { name: "filter-attribute" }).click();
  }

  cy.log("Wait for the whole summary to render");
  cy.findByLabelText(/Summary/).contains("data");

  cy.log("Ensure the summary contains the correct text");
  cy.findByLabelText(/Summary/)
    .invoke("text")
    .should((summary) => {
      expect(summary).to.contain("Users in data can view");
      if (filterColumn) {
        expect(summary).to.contain(`${filterColumn} field equals`);
      }
    });

  cy.log("Save the sandboxing modal");
  H.modal().findByRole("button", { name: "Save" }).click();

  H.saveChangesToPermissions();
};

const getQuestionName = (
  response: DatasetResponse,
  questions: CollectionItem[],
) => {
  let questionName;
  if (questions.length === 1) {
    questionName = questions[0].name;
  } else {
    // Extract the card ID from the response URL
    const cardId = Number(response?.url?.match(/\/card\/(\d+)/)?.[1]);
    questionName = (questions.find((q) => q.id === cardId) as any)?.name as
      | string
      | undefined;
  }
  return { questionName };
};

export function rowsShouldContainGizmosAndWidgets({
  responses,
  questions,
}: {
  responses: DatasetResponse[];
  questions: CollectionItem[];
}) {
  expect(responses.length).to.equal(questions.length);
  responses.forEach((response) => {
    const { questionName } = getQuestionName(response, questions);
    expect(
      JSON.stringify(response.body),
      `No error in ${questionName}`,
    ).not.to.contain("stacktrace");
    expect(
      response.body.data.is_sandboxed,
      `Results are not sandboxed in ${questionName}`,
    ).to.be.false;
    const rows = response.body.data.rows;
    expect(
      rows.some((row) => row.includes("Gizmo")),
      `Results include at least one Gizmo in ${questionName}`,
    ).to.be.true;

    expect(
      rows.some(
        (row) =>
          row.includes("Widget") ||
          row.includes("Gadget") ||
          row.includes("Doohickey"),
      ),
      `Results include at least one Widget, Gadget, or Doohickey in ${questionName}`,
    ).to.be.true;
  });
  return cy.wrap(responses);
}

const productCategories = ["Gizmo", "Widget", "Doohickey", "Gadget"] as const;

export function rowsShouldContainOnlyOneCategory({
  responses,
  questions,
  productCategory,
}: {
  responses: DatasetResponse[];
  questions: CollectionItem[];
  productCategory: (typeof productCategories)[number];
}) {
  expect(responses.length).to.equal(questions.length);

  responses.forEach((response) => {
    const { questionName } = getQuestionName(response, questions);

    expect(
      JSON.stringify(response.body),
      `No error in ${questionName}`,
    ).not.to.contain("stacktrace");

    cy.log(`Results contain only ${productCategory}s in: ${questionName}`);

    const rows = response.body.data.rows;

    const groupedByCategory = _.groupBy(rows, (row) => row[3] as string);
    productCategories.forEach((category) => {
      if (category !== productCategory) {
        expect(
          groupedByCategory[category] || [],
          `No ${category}s in: ${questionName}`,
        ).to.have.length(0);
      }
    });

    expect(
      groupedByCategory[productCategory],
      `There are some ${productCategory}s in: ${questionName}`,
    ).to.have.length.greaterThan(0);

    const categoriesPresent = JSON.stringify(
      Object.keys(groupedByCategory).toSorted(),
    );

    // With implicit joins, some rows might have a null product. That's OK.
    const categoriesAreValid =
      categoriesPresent === `["${productCategory}"]` ||
      categoriesPresent === `["${productCategory}",null]`;

    expect(
      categoriesAreValid,
      `The categories (${categoriesPresent}) are valid in: ${questionName}`,
    ).to.be.true;

    expect(
      response?.body.data.is_sandboxed,
      `The response is sandboxed in: ${questionName}`,
    ).to.be.true;
  });
  return cy.wrap(responses);
}

export const valuesShouldContainGizmosAndWidgets = (
  valuesArray: (FieldValue | ParameterValue)[],
) => {
  const values = valuesArray.map((val) => val[0]);
  expect(values).to.contain("Gizmo");
  expect(values).to.contain("Widget");
};

export const valuesShouldContainOnlyOneCategory = (
  valuesArray: (FieldValue | ParameterValue)[],
  productCategory: (typeof productCategories)[number],
) => {
  const values = valuesArray.map((val) => val[0]);
  expect(values).to.deep.equal([productCategory]);
};

export const getDashcardResponses = (
  dashboard: Dashboard | null,
  questions: CollectionItem[],
) => {
  cy.log("Check dashcard responses");

  H.visitDashboard(checkNotNull(dashboard).id);

  expect(questions.length).to.be.greaterThan(0);
  return cy
    .wait(new Array(questions.length).fill("@dashcardQuery"))
    .then((interceptions) => {
      const responses = interceptions.map(
        (i) => i.response as unknown as DashcardQueryResponse,
      );
      return { questions, responses };
    });
};

export const getCardResponses = (questions: CollectionItem[]) => {
  expect(questions.length).to.be.greaterThan(0);
  cy.log("Check card responses");
  return H.cypressWaitAll(
    questions.map((question) =>
      cy.request<DatasetResponse>("POST", `/api/card/${question.id}/query`),
    ),
  ).then((responses) => {
    return { responses: responses, questions: questions };
  }) as Cypress.Chainable<{
    responses: DatasetResponse[];
    questions: CollectionItem[];
  }>;
};

export const getFieldValuesForProductCategories = () =>
  cy.request<GetFieldValuesResponse>(
    "GET",
    `/api/field/${PRODUCTS.CATEGORY}/values`,
  );

export const getParameterValuesForProductCategories = () =>
  cy.request<ParameterValues>("POST", "/api/dataset/parameter/values", {
    parameter: {
      id: "1234",
      name: "Text",
      slug: "text",
      type: "string/=",
      values_query_type: "list",
      values_source_type: null,
      values_source_config: {},
    },
    field_ids: [SAMPLE_DATABASE.PRODUCTS.CATEGORY],
  });

export const assertNoResultsOrValuesAreSandboxed = (
  dashboard: Dashboard | null,
  questions: CollectionItem[],
  shouldResultsBeCached?: boolean,
) => {
  checkNotNull(dashboard);
  const dashcardResponses = getDashcardResponses(dashboard, questions).then(
    rowsShouldContainGizmosAndWidgets,
  );
  const cardResponses = getCardResponses(questions).then(
    rowsShouldContainGizmosAndWidgets,
  );

  if (shouldResultsBeCached) {
    dashcardResponses.then(resultsShouldBeCached);
    cardResponses.then(resultsShouldBeCached);
  }

  H.visitQuestionAdhoc(adhocQuestionData).then(({ response }) =>
    rowsShouldContainGizmosAndWidgets({
      responses: [response],
      questions: [adhocQuestionData as unknown as CollectionItem],
    }),
  );

  getFieldValuesForProductCategories().then((response) =>
    valuesShouldContainGizmosAndWidgets(response.body.values),
  );

  getParameterValuesForProductCategories().then((response) =>
    valuesShouldContainGizmosAndWidgets(response.body.values),
  );
};

export const assertAllResultsAndValuesAreSandboxed = (
  dashboard: Dashboard | null,
  questions: CollectionItem[],
  productCategory: (typeof productCategories)[number],
) => {
  checkNotNull(dashboard);

  getDashcardResponses(dashboard, questions).then((data) =>
    rowsShouldContainOnlyOneCategory({ ...data, productCategory }),
  );
  getCardResponses(questions).then((data) =>
    rowsShouldContainOnlyOneCategory({ ...data, productCategory }),
  );
  getFieldValuesForProductCategories().then((response) =>
    valuesShouldContainOnlyOneCategory(response.body.values, productCategory),
  );
  getParameterValuesForProductCategories().then((response) =>
    valuesShouldContainOnlyOneCategory(response.body.values, productCategory),
  );

  H.visitQuestionAdhoc(adhocQuestionData).then(({ response }) => {
    rowsShouldContainOnlyOneCategory({
      responses: [response],
      questions: [adhocQuestionData as unknown as CollectionItem],
      productCategory,
    });
  });
};

export const resultsShouldBeCached = (responses: DatasetResponse[]) => {
  responses.forEach((response) => {
    expect(response.body.cached, "response should not be cached").not.to.be
      .null;
    expect(response.body.json_query?.["cache-strategy"]?.type).to.equal(
      "duration",
    );
  });
  return cy.wrap(responses);
};

export const cacheUnsandboxedResults = (questions: CollectionItem[]) => {
  const simpleCacheConfiguration: CacheConfig = {
    model: "root",
    model_id: 0,
    strategy: {
      type: "duration",
      duration: 1,
      unit: CacheDurationUnit.Hours,
      refresh_automatically: false,
    },
  };

  cy.log(
    "We additionally want to ensure that sandboxed users see filtered results even if the unsandboxed results are cached. So let's cache the unsandboxed results",
  );
  return cy.request("PUT", "/api/cache", simpleCacheConfiguration).then(() => {
    cy.log("Populate the caches");
    return getCardResponses(questions);
  });
};

export const runWithoutCachingThenWithCaching = (
  callback: (props: { isCachingEnabled?: boolean }) => void,
  { questions }: { questions: CollectionItem[] },
) => {
  callback({ isCachingEnabled: false });
  cy.signInAsAdmin().then(() => {
    cacheUnsandboxedResults(questions).then(() => {
      callback({ isCachingEnabled: true });
    });
  });
};

/** This avoids a race condition where requests intended to be made by a normal
 * user are instead made by an admin */
export const waitForUserToBeLoggedIn = (user: NormalUser) => {
  cy.log("Wait for user to be logged in");
  function check(tries: number) {
    if (tries === 0) {
      return cy.wrap(false);
    }
    return cy
      .request("/api/user/current")
      .then((response): Cypress.Chainable<boolean> => {
        if (response.body.email === user.email) {
          cy.log(`User is logged in: ${user.email}`);
          return cy.wrap(true);
        } else {
          cy.wait(500);
          return check(tries - 1);
        }
      });
  }
  return check(5).then((success) => {
    expect(success, "User is logged in").to.be.true;
  });
};

// session id for Gizmo dataset: 94280fb3-7608-497d-8937-d796e5d45925
// session id for widget dataset: f3c524a6-6107-443c-b5a8-9dac3d416fe8
