import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Event from "sap/ui/base/Event";
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";

/**
 * @namespace apps.dflc.salesorderts.controller
 */
export default class View1 extends Controller {

    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {

        var oView = this.getView();
        var oModel = new JSONModel();
        oModel.setData({ "usuario": { "nome": "Davi" } });
        oView?.setModel(oModel);

    }

    public onPress(oEvent: Event) {
        alert("Bral")
    }

    public onExibirMensagem() {

        var oI18nModel = this.getView()?.getModel("i18n") as ResourceModel;
        var oI18n = oI18nModel.getResourceBundle() as ResourceBundle;
        var oModel = this.getView()?.getModel("usuario") as JSONModel;
        var oData = oModel?.getData();

        var sText = oI18n.getText("welcomeMsg", [oData.usuario.nome]);

        alert(sText);
    }

}