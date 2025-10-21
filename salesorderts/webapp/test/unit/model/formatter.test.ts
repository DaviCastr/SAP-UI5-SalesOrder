import formatter from "apps/dflc/salesorderts/model/formatter";

QUnit.module("Formatter - Price Formatting");

QUnit.test("Testing price formatting with valid number", function(assert) {
    const sValue = formatter.formatPrice(1234.56);
    assert.strictEqual(sValue, "1.234,56", "Price formatting with number OK");
});

QUnit.test("Testing price formatting with string", function(assert) {
    const sValue = formatter.formatPrice("1234.56" as any);
    assert.strictEqual(sValue, "1.234,56", "Price formatting with string OK");
});

QUnit.test("Testing price formatting with invalid input", function(assert) {
    const sValue = formatter.formatPrice("invalid" as any);
    assert.strictEqual(sValue, "", "Price formatting with invalid input OK");
});

QUnit.module("Formatter - Status Icons");

QUnit.test("Testing success status icon", function(assert) {
    const sIcon = formatter.getIconStatus("S");
    assert.strictEqual(sIcon, "sap-icon://message-success", "Success status icon OK");
});

QUnit.test("Testing error status icon", function(assert) {
    const sIcon = formatter.getIconStatus("E");
    assert.strictEqual(sIcon, "sap-icon://message-error", "Error status icon OK");
});

QUnit.test("Testing default status icon", function(assert) {
    const sIcon = formatter.getIconStatus("Unknown");
    assert.strictEqual(sIcon, "sap-icon://message-information", "Default status icon OK");
});

QUnit.module("Formatter - Status Colors");

QUnit.test("Testing success status color", function(assert) {
    const sColor = formatter.getColorStatus("S");
    assert.strictEqual(sColor, "#0A6ED1", "Success status color OK");
});

QUnit.test("Testing error status color", function(assert) {
    const sColor = formatter.getColorStatus("E");
    assert.strictEqual(sColor, "#BB0000", "Error status color OK");
});

QUnit.test("Testing default status color", function(assert) {
    const sColor = formatter.getColorStatus("Unknown");
    assert.strictEqual(sColor, "#1A1A1A", "Default status color OK");
});