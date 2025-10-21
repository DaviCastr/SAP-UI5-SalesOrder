/*global QUnit*/
import Opa5 from "sap/ui/test/Opa5";
import opaTest from "sap/ui/test/opaQunit";
import CommonArrangements from "./CommonArrangements";

// Import the page objects - they auto-register with OPA5
import "./pages/OrderList";
import "./pages/OrderForm";

Opa5.extendConfig({
	viewNamespace: "apps.dflc.salesorderts.view.",
	autoWait: true
});

QUnit.module("Navigation Journey");

// Use the common arrangements
const Given = CommonArrangements;

setTimeout(function () {
	opaTest("Should see the initial order list page", function (Given: any, When: any, Then: any) {
		// Arrangements

		Given.onTheOrderListPage.iStartMyUIComponent({
			componentConfig: {
				name: "apps.dflc.salesorderts"
			}
		});

		// Assertions
		Then.onTheOrderListPage.iShouldSeeThePage();

	});

	opaTest("Should create a new order successfully", function (Given: any, When: any, Then: any) {
		When.onTheOrderListPage.iPressOnTheNewButton();
		Then.onTheOrderFormPage.iShouldSeeThePage();

		When.onTheOrderFormPage.iEnterCreateAt("01/01/2000 01:50:00");
		When.onTheOrderFormPage.iEnterCreateBy("ABAP");
		When.onTheOrderFormPage.iEnterCustomerId(1);
		When.onTheOrderFormPage.iEnterTotalFreight("1.50");
		When.onTheOrderFormPage.iSelectStatus('N');

		When.onTheOrderFormPage.iPressOnTheSaveButton();
		Then.onTheOrderFormPage.iShouldSeeTheSuccessMessage();

		When.onTheOrderFormPage.iPressOnTheBackButton();
		Then.onTheOrderListPage.iShouldSeeThePage();
	});

	opaTest("Should edit an existing order with items", function (Given: any, When: any, Then: any) {
		When.onTheOrderListPage.iSelectSortField("SalesOrderID");
		When.onTheOrderListPage.iSelectSortType("DESC");
		When.onTheOrderListPage.iEnterLimit(1);
		When.onTheOrderListPage.iPressOnTheFilterButton();
		Then.onTheOrderListPage.iShouldSeeOnlyOneRecord();
		When.onTheOrderListPage.iPressOnTheEditButton();

		Then.onTheOrderFormPage.iShouldSeeThePage();
		When.onTheOrderFormPage.iEnterCustomerId(2);
		When.onTheOrderFormPage.iEnterTotalFreight("20.33");
		When.onTheOrderFormPage.iSelectStatus('L');

		When.onTheOrderFormPage.iPressOnTheAddItemButton();
		When.onTheOrderFormPage.iAddItem(0, '100', 'Keyboard', 1, "1.99");

		When.onTheOrderFormPage.iPressOnTheAddItemButton();
		When.onTheOrderFormPage.iAddItem(1, '200', 'Mouse', 1, "2.50");

		When.onTheOrderFormPage.iPressOnTheSaveButton();
		Then.onTheOrderFormPage.iShouldSeeTheSuccessMessage();
		When.onTheOrderFormPage.iPressOnTheBackButton();

		Then.onTheOrderListPage.iShouldSeeThePage();
	});

	opaTest("Should delete an order successfully", function (Given: any, When: any, Then: any) {
		When.onTheOrderListPage.iSelectSortField("SalesOrderID");
		When.onTheOrderListPage.iSelectSortType("DESC");
		When.onTheOrderListPage.iEnterLimit(1);
		When.onTheOrderListPage.iPressOnTheFilterButton();
		Then.onTheOrderListPage.iShouldSeeOnlyOneRecord();
		When.onTheOrderListPage.iPressOnTheDeleteButton();

		Then.onTheOrderListPage.iShouldSeeTheSuccessMessage();
	});

	opaTest("Should complete the test journey", function (Given: any, When: any, Then: any) {
		Then.onTheOrderListPage.iShouldSeeThePage();
		Given.iTeardownMyApp();
	});
}, 1);