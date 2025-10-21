import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
import EnterText from "sap/ui/test/actions/EnterText";
import Properties from "sap/ui/test/matchers/Properties";
import Ancestor from "sap/ui/test/matchers/Ancestor";
import AggregationFilled from "sap/ui/test/matchers/AggregationFilled";

const sViewName = "OrderForm";

Opa5.createPageObjects({
    onTheOrderFormPage: {
        baseClass: Opa5,

        actions: {
            iEnterCreateAt: function (sDateTime: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.CreationDateTime",
                    actions: new EnterText({ text: sDateTime }),
                    success: function () {
                        Opa5.assert.ok(true, `Created at date entered: ${sDateTime}`);
                    },
                    errorMessage: "Could not enter creation date"
                });
            },

            iEnterCreateBy: function (sCreatedBy: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.CreatedBy",
                    actions: new EnterText({ text: sCreatedBy }),
                    success: function () {
                        Opa5.assert.ok(true, `Created by entered: ${sCreatedBy}`);
                    },
                    errorMessage: "Could not enter created by field"
                });
            },

            iEnterCustomerId: function (sCustomerId: string | number) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.CustomerID",
                    actions: new EnterText({ text: sCustomerId.toString() }),
                    success: function () {
                        Opa5.assert.ok(true, `Customer ID entered: ${sCustomerId}`);
                    },
                    errorMessage: "Could not enter customer ID"
                });
            },

            iEnterTotalFreight: function (sFreightAmount: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.TotalFreight",
                    actions: new EnterText({ text: sFreightAmount }),
                    success: function () {
                        Opa5.assert.ok(true, `Total freight entered: ${sFreightAmount}`);
                    },
                    errorMessage: "Could not enter total freight"
                });
            },

            iPressOnTheAddItemButton: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "bt-additem",
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "Add item button was pressed");
                    },
                    errorMessage: "The add item button could not be pressed"
                });
            },

            iAddItem: function (iIndex: number, sMaterial: string, sDescription: string, iQuantity: number, sUnitPrice: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "table2",
                    timeout: 5,
                    matchers: new AggregationFilled({ name: "rows" }),
                    success: function (oTable: any) {
                        const aRows = oTable.getRows();
                        if (iIndex < aRows.length) {
                            const aCells = aRows[iIndex].getCells();
                            
                            // Set material
                            if (aCells[1] && aCells[1].setValue) {
                                aCells[1].setValue(sMaterial);
                            }
                            
                            // Set description
                            if (aCells[2] && aCells[2].setValue) {
                                aCells[2].setValue(sDescription);
                            }
                            
                            // Set quantity
                            if (aCells[3] && aCells[3].setValue) {
                                aCells[3].setValue(iQuantity.toString());
                            }
                            
                            // Set unit price
                            if (aCells[4] && aCells[4].setValue) {
                                aCells[4].setValue(sUnitPrice);
                            }
                            
                            Opa5.assert.ok(true, `Item added at index ${iIndex}: ${sDescription}`);
                        } else {
                            Opa5.assert.ok(false, `Row index ${iIndex} not found in table`);
                        }
                    },
                    errorMessage: "Could not add item to the order"
                });
            },

            iSelectStatus: function (sStatus: string) {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "SalesOrder.Status",
                    actions: new Press(),
                    success: function (oSelect: any) {
                        (this as any).waitFor({
                            controlType: "sap.ui.core.Item",
                            matchers: [
                                new Ancestor(oSelect),
                                new Properties({ key: sStatus })
                            ],
                            actions: new Press(),
                            success: function () {
                                Opa5.assert.ok(true, `Status selected: ${sStatus}`);
                            },
                            errorMessage: `Cannot select status: ${sStatus}`
                        });
                    },
                    errorMessage: "The status field was not found"
                });
            },

            iPressOnTheSaveButton: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "bt-save",
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "Save button was pressed");
                    },
                    errorMessage: "The save button could not be pressed"
                });
            },

            iPressOnTheBackButton: function () {
                return (this as any).waitFor({
                    viewName: sViewName,
                    id: "page2",
                    actions: new Press(),
                    success: function () {
                        Opa5.assert.ok(true, "Back button was pressed");
                    },
                    errorMessage: "The back button could not be pressed"
                });
            }
        },

        assertions: {
            iShouldSeeThePage: function () {
                return (this as any).waitFor({
                    id: "page2",
                    viewName: sViewName,
                    success: function () {
                        Opa5.assert.ok(true, `The ${sViewName} view is displayed`);
                    },
                    errorMessage: `Did not find the ${sViewName} view`
                });
            },

            iShouldSeeTheSuccessMessage: function () {
                return (this as any).waitFor({
                    matchers: function () {
                        const oMessageToast = document.querySelector(".sapMMessageToast");
                        return oMessageToast ? oMessageToast.textContent : null;
                    },
                    success: function (sMessage: string | null) {
                        const successKeywords = ["success", "sucesso", "created", "saved"];
                        const hasSuccess = successKeywords.some(keyword => 
                            sMessage && sMessage.toLowerCase().includes(keyword.toLowerCase())
                        );
                        
                        if (hasSuccess) {
                            Opa5.assert.ok(true, "The order was processed successfully");
                        } else {
                            Opa5.assert.ok(false, `Failed to process order. Message: ${sMessage}`);
                        }
                    },
                    errorMessage: "Failed to process order - no success message found"
                });
            }
        }
    }
});