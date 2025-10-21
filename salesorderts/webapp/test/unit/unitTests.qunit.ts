/* @sapUiRequire */
QUnit.config.autostart = false;

// import all your QUnit tests here
void Promise.all([
	import("sap/ui/core/Core"), // Required to wait until Core has booted to start the QUnit tests
import("apps/dflc/salesorderts/test/unit/controller/OrderForm.test"),
import("apps/dflc/salesorderts/test/unit/model/formatter.test")
]).then(([{default: Core}]) => Core.ready()).then(() => {
	QUnit.start();
});