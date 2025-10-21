import Opa5 from "sap/ui/test/Opa5";

export default new Opa5({
    iStartMyApp: function () {
        return this.iStartMyUIComponent({
            componentConfig: {
                name: "apps.dflc.salesorderts",
                async: true
            }
        });
    },

    iTeardownMyApp: function () {
        return this.iTeardownMyUIComponent();
    }
});