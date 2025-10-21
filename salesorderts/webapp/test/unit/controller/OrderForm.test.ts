import Controller from "apps/dflc/salesorderts/controller/OrderForm.controller";

QUnit.module("OrderFormController");

QUnit.test("Testing createEmptyOrderObject method", function (assert) {
    const oAppController = new Controller("OrderForm");
    const oOrder = oAppController.createEmptyOrderObject();
    assert.strictEqual(typeof oOrder, "object", "Order object creation OK");
});

QUnit.test("Testing getOrderObject method", function (assert) {
    const oAppController = new Controller("OrderForm");

    // Mock the view and model
     (oAppController as any).getView = function() {
        return {
            getModel: function() {
                return {
                    getData: function() {
                        return {
                            SalesOrderID: 0,
                            CreationDateTime: null,
                            CreatedBy: "",
                            CustomerID: "",
                            TotalItems: 0.0,
                            TotalFreight: 10.50,
                            TotalOrder: 0.0,
                            Status: "N",
                            toItem: [
                                {
                                    SalesOrderItemNumber: 1,
                                    Material: "1",
                                    Description: "Test Product",
                                    Quantity: 2,
                                    UnitPrice: 10,
                                    TotalPrice: 20
                                }
                            ]
                        };
                    }
                };
            }
        };
    };

    assert.strictEqual(
        oAppController.getOrderObject().TotalOrder, 
        30.50, 
        "getOrderObject calculation OK"
    );
});

QUnit.test("Testing parseInt method with valid number", function (assert) {
    const oAppController = new Controller("OrderForm");
    const result = oAppController.parseInt("123");
    assert.strictEqual(result, 123, "parseInt with valid number OK");
});

QUnit.test("Testing parseInt method with empty string", function (assert) {
    const oAppController = new Controller("OrderForm");
    const result = oAppController.parseInt("");
    assert.strictEqual(result, 0, "parseInt with empty string OK");
});