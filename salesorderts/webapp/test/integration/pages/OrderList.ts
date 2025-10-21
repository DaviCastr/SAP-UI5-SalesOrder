import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
import EnterText from "sap/ui/test/actions/EnterText";
import Properties from "sap/ui/test/matchers/Properties";
import Ancestor from "sap/ui/test/matchers/Ancestor";
import AggregationFilled from "sap/ui/test/matchers/AggregationFilled";

const sViewName = "OrderList";

Opa5.createPageObjects({
    onTheOrderListPage: {
        baseClass: Opa5,

        actions: {
            iSelectSortField: function (sValue: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "OrderField",
                    actions: new Press(),
                    success: function (oSelect: any) {
                        (this as any).waitFor({
                            controlType: "sap.ui.core.Item",
                            matchers: [
                                new Ancestor(oSelect),
                                new Properties({ key: sValue })
                            ],
                            actions: new Press(),
                            success: function () {
                                Opa5.assert.ok(true, `Sort field selected: ${sValue}`);
                            },
                            errorMessage: `Cannot select sort field: ${sValue}`
                        });
                    },
                    errorMessage: "The sort field was not found"
                });
            },

            iSelectSortType: function (sValue: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "OrderType",
                    actions: new Press(),
                    success: function (oSelect: any) {
                        (this as any).waitFor({
                            controlType: "sap.ui.core.Item",
                            matchers: [
                                new Ancestor(oSelect),
                                new Properties({ key: sValue })
                            ],
                            actions: new Press(),
                            success: function () {
                                Opa5.assert.ok(true, `Sort type selected: ${sValue}`);
                            },
                            errorMessage: `Cannot select sort type: ${sValue}`
                        });
                    },
                    errorMessage: "The sort type field was not found"
                });
            },

            iEnterLimit: function (sLimit: string | number) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "Limite",
                    actions: new EnterText({ text: sLimit.toString() }),
                    success: function () {
                        Opa5.assert.ok(true, `Limit entered: ${sLimit}`);
                    },
                    errorMessage: "Could not enter limit"
                });
            },

            iEnterOrderId: function (sOrderId: string | number) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.SalesOrderID",
                    actions: new EnterText({ text: sOrderId.toString() }),
                    success: function () {
                        Opa5.assert.ok(true, `Order ID entered: ${sOrderId}`);
                    },
                    errorMessage: "Could not enter Order ID"
                });
            },

            iPressOnTheFilterButton: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "filterBar1",
                    actions: function (oFilterBar: any) {
                        oFilterBar.search();
                    },
                    success: function () {
                        Opa5.assert.ok(true, "Filter button was pressed");
                    },
                    errorMessage: "The filter button could not be pressed"
                });
            },

            iPressOnTheNewButton: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "bt-new",
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "New button was pressed");
                    },
                    errorMessage: "The new button could not be pressed"
                });
            },

            iPressOnTheEditButton: function () {
                return (this as any).waitFor({
                    controlType: "sap.m.Button",
                    matchers: new Properties({ icon: "sap-icon://edit" }),
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "Edit button was pressed");
                    },
                    errorMessage: "The edit button could not be pressed"
                });
            },

            iPressOnTheDeleteButton: function () {
                return (this as any).waitFor({
                    controlType: "sap.m.Button",
                    matchers: new Properties({ icon: "sap-icon://delete" }),
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "Delete button was pressed");
                    },
                    errorMessage: "The delete button could not be pressed"
                });
            }
        },

        assertions: {
            iShouldSeeThePage: function () {
                return (this as any).waitFor({
                    id: "page",
                    viewName: sViewName,
                    success: function () {
                        Opa5.assert.ok(true, `The ${sViewName} view is displayed`);
                    },
                    errorMessage: `Did not find the ${sViewName} view`
                });
            },

            iShouldSeeOnlyOneRecord: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "table1",
                    timeout: 15,
                    matchers: new AggregationFilled({ name: "rows" }),
                    check: function (oTable: any) {
                        const oBinding = oTable.getBinding("rows");
                        return oBinding ? oBinding.getLength() === 1 : false;
                    },
                    success: function () {
                        Opa5.assert.ok(true, "Only one record found in the table");
                    },
                    errorMessage: "Expected exactly one record but found different number"
                });
            },

            iShouldSeeTheSuccessMessage: function () {
                return (this as any).waitFor({
                    matchers: function () {
                        const oMessageToast = document.querySelector(".sapMMessageToast");
                        return oMessageToast ? oMessageToast.textContent : null;
                    },
                    success: function (sMessage: string | null) {
                        const successKeywords = ["success", "sucesso", "completed", "finished"];
                        const hasSuccess = successKeywords.some(keyword =>
                            sMessage && sMessage.toLowerCase().includes(keyword.toLowerCase())
                        );

                        if (hasSuccess) {
                            Opa5.assert.ok(true, "Operation completed successfully");
                        } else {
                            Opa5.assert.ok(false, `Operation failed. Message: ${sMessage}`);
                        }
                    },
                    errorMessage: "Operation failed - no success message found"
                });
            }
        }
    }
});