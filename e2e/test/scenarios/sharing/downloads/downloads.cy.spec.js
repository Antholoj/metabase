import { H } from "e2e/support";
import { SAMPLE_DATABASE } from "e2e/support/cypress_sample_database";
import {
  ORDERS_DASHBOARD_DASHCARD_ID,
  ORDERS_DASHBOARD_ID,
  ORDERS_QUESTION_ID,
} from "e2e/support/cypress_sample_instance_data";

const { ORDERS, ORDERS_ID } = SAMPLE_DATABASE;

const testCases = ["csv", "xlsx"];

const canSavePngQuestion = {
  name: "Q1",
  display: "line",
  query: {
    "source-table": ORDERS_ID,
    aggregation: [["count"]],
    breakout: [["field", ORDERS.CREATED_AT, { "temporal-unit": "month" }]],
  },
  visualization_settings: {
    "graph.metrics": ["count"],
    "graph.dimensions": ["CREATED_AT"],
  },
};

const cannotSavePngQuestion = {
  name: "Q2",
  display: "table",
  query: {
    "source-table": ORDERS_ID,
  },
  visualization_settings: {},
};

describe("scenarios > question > download", () => {
  beforeEach(() => {
    H.restore();
    cy.signInAsAdmin();
  });

  testCases.forEach(fileType => {
    it(`downloads ${fileType} file`, () => {
      H.startNewQuestion();
      H.entityPickerModal().within(() => {
        H.entityPickerModalTab("Saved questions").click();
        cy.findByText("Orders, Count").click();
      });

      H.visualize();
      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.contains("18,760");

      H.downloadAndAssert({ fileType }, sheet => {
        expect(sheet["A1"].v).to.eq("Count");
        expect(sheet["A2"].v).to.eq(18760);
      });
    });
  });

  it("should allow downloading unformatted CSV data", () => {
    const fieldRef = ["field", ORDERS.TOTAL, null];
    const columnKey = `["ref",${JSON.stringify(fieldRef)}]`;

    H.createQuestion(
      {
        query: {
          "source-table": ORDERS_ID,
          fields: [fieldRef],
        },
        visualization_settings: {
          column_settings: {
            [columnKey]: {
              currency: "USD",
              currency_in_header: false,
              currency_style: "code",
              number_style: "currency",
            },
          },
        },
      },
      { visitQuestion: true, wrapId: true },
    );

    H.queryBuilderMain().findByText("USD 39.72").should("exist");

    cy.get("@questionId").then(questionId => {
      const opts = { questionId, fileType: "csv" };

      H.downloadAndAssert(
        {
          ...opts,
          enableFormatting: true,
        },
        sheet => {
          expect(sheet["A1"].v).to.eq("Total");
          expect(sheet["A2"].v).to.eq("USD 39.72");
        },
      );

      H.downloadAndAssert(
        {
          ...opts,
          enableFormatting: false,
        },
        sheet => {
          expect(sheet["A1"].v).to.eq("Total");
          expect(sheet["A2"].v).to.eq(39.718145389078366);
          expect(sheet["A2"].w).to.eq("39.718145389078366");
        },
      );
    });
  });

  it("respects renamed columns in self-joins", () => {
    const idLeftRef = [
      "field",
      ORDERS.ID,
      {
        "base-type": "type/BigInteger",
      },
    ];
    const idRightRef = [
      "field",
      ORDERS.ID,
      {
        "base-type": "type/BigInteger",
        "join-alias": "Orders",
      },
    ];
    const totalLeftRef = [
      "field",
      ORDERS.TOTAL,
      {
        "base-type": "type/Float",
      },
    ];
    const totalRightRef = [
      "field",
      ORDERS.TOTAL,
      {
        "base-type": "type/Float",
        "join-alias": "Orders",
      },
    ];

    const totalLeftColumnKey = '["name","TOTAL"]';
    const totalRightColumnKey = '["name","TOTAL_2"]';

    H.createQuestion(
      {
        query: {
          "source-table": ORDERS_ID,
          fields: [totalLeftRef],
          joins: [
            {
              fields: [totalRightRef],
              strategy: "left-join",
              alias: "Orders",
              condition: ["=", idLeftRef, idRightRef],
              "source-table": ORDERS_ID,
            },
          ],
          "order-by": [["desc", totalLeftRef]],
          limit: 1,
        },
        visualization_settings: {
          column_settings: {
            [totalLeftColumnKey]: {
              column_title: "Left Total",
            },
            [totalRightColumnKey]: {
              column_title: "Right Total",
            },
          },
        },
      },
      { visitQuestion: true, wrapId: true },
    );

    H.queryBuilderMain().findByText("Left Total").should("exist");
    H.queryBuilderMain().findByText("Right Total").should("exist");

    cy.get("@questionId").then(questionId => {
      testCases.forEach(fileType => {
        const opts = { questionId, fileType };

        H.downloadAndAssert(
          {
            ...opts,
            enableFormatting: true,
          },
          sheet => {
            expect(sheet["A1"].v).to.eq("Left Total");
            expect(sheet["A2"].v).to.closeTo(159.35, 0.01);
            expect(sheet["B1"].v).to.eq("Right Total");
            expect(sheet["B2"].v).to.closeTo(159.35, 0.01);
          },
        );
      });
    });
  });

  describe("from dashboards", () => {
    it("should allow downloading card data", () => {
      cy.intercept("GET", "/api/dashboard/**").as("dashboard");
      H.visitDashboard(ORDERS_DASHBOARD_ID);
      cy.findByTestId("dashcard").within(() => {
        cy.findByTestId("legend-caption").realHover();
      });

      assertOrdersExport(18760);

      H.editDashboard();

      H.setFilter("ID");

      cy.findByTestId("dashcard-container").contains("Select…").click();
      H.popover().contains("ID").eq(0).click();

      H.saveDashboard();

      H.filterWidget().contains("ID").click();

      H.popover().find("input").type("1");

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Add filter").click();

      cy.wait("@dashboard");

      cy.findByTestId("dashcard").within(() => {
        cy.findByTestId("legend-caption").realHover();
      });

      assertOrdersExport(1);
    });

    it("should allow downloading parameterized cards opened from dashboards as a user with no self-service permission (metabase#20868)", () => {
      cy.createQuestion({
        name: "20868",
        query: {
          "source-table": ORDERS_ID,
        },
        display: "table",
      }).then(({ body: { id: questionId } }) => {
        cy.createDashboard().then(({ body: { id: dashboardId } }) => {
          cy.request("PUT", `/api/dashboard/${dashboardId}`, {
            parameters: [
              {
                id: "92eb69ea",
                name: "ID",
                sectionId: "id",
                slug: "id",
                type: "id",
              },
            ],
          });

          H.addOrUpdateDashboardCard({
            card_id: questionId,
            dashboard_id: dashboardId,
            card: {
              parameter_mappings: [
                {
                  parameter_id: "92eb69ea",
                  card_id: questionId,
                  target: ["dimension", ["field", ORDERS.ID, null]],
                },
              ],
              visualization_settings: {
                click_behavior: {
                  parameterMapping: {
                    "92eb69ea": {
                      id: "92eb69ea",
                      source: { id: "ID", name: "ID", type: "column" },
                      target: {
                        id: "92eb69ea",
                        type: "parameter",
                      },
                    },
                  },
                },
              },
            },
          }).then(({ body: { id } }) => {
            cy.signIn("nodata");
            H.visitDashboard(dashboardId);

            cy.findByLabelText("ID").click();
            H.popover().findByPlaceholderText("Enter an ID").type("1");
            cy.button("Add filter").click();

            cy.findByTestId("legend-caption").contains("20868").click();

            H.downloadAndAssert(
              {
                fileType: "xlsx",
                questionId,
                dashboardId,
                dashcardId: id,
              },
              sheet => {
                expect(sheet["A1"].v).to.eq("ID");
                expect(sheet["A2"].v).to.eq(1);

                H.assertSheetRowsCount(1)(sheet);
              },
            );
          });
        });
      });
    });
  });

  describe("png images", () => {
    it("from dashboards", () => {
      cy.createDashboardWithQuestions({
        dashboardName: "saving pngs dashboard",
        questions: [canSavePngQuestion, cannotSavePngQuestion],
      }).then(({ dashboard }) => {
        H.visitDashboard(dashboard.id);
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Q1").realHover();
      H.getDashboardCardMenu(0).click();

      H.popover().within(() => {
        cy.findByText("Download results").click();
        cy.findByText(".png").click();
      });

      // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
      cy.findByText("Q2").realHover();
      H.getDashboardCardMenu(1).click();

      H.popover().within(() => {
        cy.findByText("Download results").click();
        cy.findByText(".png").should("not.exist");
      });

      cy.verifyDownload(".png", { contains: true });
    });

    it("from query builder", () => {
      cy.createQuestion(canSavePngQuestion, { visitQuestion: true });

      cy.findByTestId("download-button").click();

      H.popover().within(() => {
        cy.findByText(".png").click();
      });

      cy.verifyDownload(".png", { contains: true });

      cy.createQuestion(cannotSavePngQuestion, { visitQuestion: true });

      cy.findByTestId("download-button").click();

      H.popover().within(() => {
        cy.findByText(".png").should("not.exist");
      });
    });
  });
});

describe("scenarios > dashboard > download pdf", () => {
  beforeEach(() => {
    H.restore();
    cy.signInAsAdmin();
    cy.deleteDownloadsFolder();
  });
  it("should allow you to download a PDF of a dashboard", () => {
    const date = Date.now();
    cy.createDashboardWithQuestions({
      dashboardName: `saving pdf dashboard - ${date}`,
      questions: [canSavePngQuestion, cannotSavePngQuestion],
    }).then(({ dashboard }) => {
      H.visitDashboard(dashboard.id);
    });

    cy.findByLabelText("Move, trash, and more…").click();

    // eslint-disable-next-line no-unscoped-text-selectors -- deprecated usage
    cy.findByText("Export as PDF").click();

    cy.verifyDownload(`saving pdf dashboard - ${date}.pdf`);
  });
});

H.describeWithSnowplow("scenarios > dashboard > download pdf", () => {
  beforeEach(() => {
    H.restore();
    H.resetSnowplow();
    cy.signInAsAdmin();
    H.enableTracking();
  });

  afterEach(() => {
    H.expectNoBadSnowplowEvents();
  });

  it("should allow you to download a PDF of a dashboard", () => {
    cy.createDashboardWithQuestions({
      dashboardName: "test dashboard",
      questions: [canSavePngQuestion, cannotSavePngQuestion],
    }).then(({ dashboard }) => {
      H.visitDashboard(dashboard.id);
      cy.findByLabelText("Move, trash, and more…").click();

      H.popover().findByText("Export as PDF").click();

      H.expectGoodSnowplowEvent({
        event: "dashboard_pdf_exported",
        dashboard_id: dashboard.id,
      });
    });
  });
});

function assertOrdersExport(length) {
  H.downloadAndAssert(
    {
      fileType: "xlsx",
      questionId: ORDERS_QUESTION_ID,
      dashcardId: ORDERS_DASHBOARD_DASHCARD_ID,
      dashboardId: ORDERS_DASHBOARD_ID,
      isDashboard: true,
    },
    sheet => {
      expect(sheet["A1"].v).to.eq("ID");
      expect(sheet["A2"].v).to.eq(1);
      expect(sheet["B1"].v).to.eq("User ID");
      expect(sheet["B2"].v).to.eq(1);

      H.assertSheetRowsCount(length)(sheet);
    },
  );
}
