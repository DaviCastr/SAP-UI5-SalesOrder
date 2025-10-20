import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Event from "sap/ui/base/Event";
import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import MessageToast from "sap/m/MessageToast";
import Input from "sap/m/Input";
import TextArea from "sap/m/TextArea";
import UIComponent from "sap/ui/core/UIComponent";

// Interfaces para os dados
interface OVCabData {
    CustomerID: number;
    TotalItems: string;
    TotalFreight: string;
    TotalOrder: string;
    Status: string;
    toItem?: OVItemData[];
}

interface OVItemData {
    SalesOrderItemNumber: number;
    Material: string;
    Description: string;
    Quantity: number;
    UnitPrice: string;
    TotalPrice: string;
}

interface CreateResponse {
    SalesOrderID: string;
    [key: string]: any;
}

interface ErrorResponse {
    responseText: string;
    message?: string;
}

interface SuccessResponse {
    statusCode: number;
    headers?: {
        [key: string]: string;
    };
}

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
        var oModel = this.getView()?.getModel() as JSONModel;
        var oData = oModel?.getData();

        var sText = oI18n.getText("welcomeMsg", [oData.usuario.nome]);

        alert(sText);
    }

     public onCreateOVCab(): void {
        const oData: OVCabData = {
            CustomerID: 1,
            TotalItems: '100.00',
            TotalFreight: '10.00',
            TotalOrder: '110.00',
            Status: 'N'
        };
        this.create(oData);
    }

    public onCreateDeepOVCab(): void {
        const oData: OVCabData = {
            CustomerID: 1,
            TotalItems: '100.00',
            TotalFreight: '10.00',
            TotalOrder: '110.00',
            Status: 'N',
            toItem: [
                {
                    "SalesOrderItemNumber": 1,
                    "Material": "100",
                    "Description": "Mouse",
                    "Quantity": 1,
                    "UnitPrice": '1.00',
                    "TotalPrice": '1.00'
                },
                {
                    "SalesOrderItemNumber": 2,
                    "Material": "200",
                    "Description": "Teclado",
                    "Quantity": 2,
                    "UnitPrice": '10.00',
                    "TotalPrice": '20.00'
                }
            ]
        };
        this.create(oData);
    }

    private create(oData: OVCabData): void {
        const oModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
        const oView = this.getView();

        if (!oView) {
            console.error("View not found");
            return;
        }

        oView.setBusy(true);
        
        oModel.create("/SalesOrderHeaders", oData, {
            success: (oData2: CreateResponse, oResponse: SuccessResponse) => {
                oView.setBusy(false);

                console.log(oData2);
                console.log(oResponse);
                
                if (oResponse.statusCode == 201) {
                    (oView.byId("lastSalesOrderID") as Input).setValue(oData2.SalesOrderID);
                    (oView.byId("textarea1") as TextArea).setValue(JSON.stringify(oData2));
                    MessageToast.show("Cadastrado com sucesso");
                } else {
                    MessageToast.show("Erro no cadastro");
                }
            },
            error: (oError: ErrorResponse) => {
                oView.setBusy(false);
                console.log(oError);
                
                try {
                    const oObj = JSON.parse(oError.responseText);
                    MessageToast.show(oObj.error.message.value);
                } catch (parseError) {
                    MessageToast.show(oError.message || "Erro desconhecido");
                }
            }
        });
    }

    public onReadOVCab(): void {
        const oView = this.getView();
        if (!oView) return;

        const iSalesOrderID = (oView.byId("lastSalesOrderID") as Input).getValue();
        if (iSalesOrderID == "0" || !iSalesOrderID) {
            MessageToast.show("Crie um cabeçalho de ordem primeiro");
            return;
        }

        this.read(iSalesOrderID);
    }

    private read(iSalesOrderID: string): void {
        const oModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
        const oView = this.getView();

        if (!oView) {
            console.error("View not found");
            return;
        }

        oView.setBusy(true);
        oModel.read(`/SalesOrderHeaders(${iSalesOrderID})`, {
            success: (oData2: any, oResponse: SuccessResponse) => {
                oView.setBusy(false);
                (oView.byId("textarea1") as TextArea).setValue(JSON.stringify(oData2));

                console.log(oData2);
                console.log(oResponse);
                MessageToast.show("Leitura realizada");
            },
            error: (oError: ErrorResponse) => {
                oView.setBusy(false);
                console.log(oError);
                
                try {
                    const oObj = JSON.parse(oError.responseText);
                    MessageToast.show(oObj.error.message.value);
                } catch (parseError) {
                    MessageToast.show(oError.message || "Erro desconhecido");
                }
            }
        });
    }

    public onUpdateOVCab(): void {
        const oView = this.getView();
        if (!oView) return;

        const iSalesOrderID = (oView.byId("lastSalesOrderID") as Input).getValue();
        if (iSalesOrderID == "0" || !iSalesOrderID) {
            MessageToast.show("Crie um cabeçalho de ordem primeiro");
            return;
        }

        const oData: OVCabData = {
            CustomerID: 2,
            TotalItems: '150.00',
            TotalFreight: '10.00',
            TotalOrder: '160.00',
            Status: 'C'
        };
        this.update(iSalesOrderID, oData);
    }

    private update(iSalesOrderID: string, oData: OVCabData): void {
        const oModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
        const oView = this.getView();

        if (!oView) {
            console.error("View not found");
            return;
        }

        oView.setBusy(true);
        oModel.update(`/SalesOrderHeaders(${iSalesOrderID})`, oData, {
            success: (oData2: any, oResponse: SuccessResponse) => {
                oView.setBusy(false);
                console.log(oData2);
                console.log(oResponse);
                
                if (oResponse.statusCode == 204) {
                    MessageToast.show("Atualizado com sucesso");
                } else {
                    MessageToast.show("Erro em atualizar");
                }
            },
            error: (oError: ErrorResponse) => {
                oView.setBusy(false);
                console.log(oError);
                
                try {
                    const oObj = JSON.parse(oError.responseText);
                    MessageToast.show(oObj.error.message.value);
                } catch (parseError) {
                    MessageToast.show(oError.message || "Erro desconhecido");
                }
            }
        });
    }

    public onDeleteOVCab(): void {
        const oView = this.getView();
        if (!oView) return;

        const iSalesOrderID = (oView.byId("lastSalesOrderID") as Input).getValue();
        this.delete(iSalesOrderID);
    }

    private delete(iSalesOrderID: string): void {
        const oModel = (this.getOwnerComponent() as UIComponent).getModel() as ODataModel;
        const oView = this.getView();

        if (!oView) {
            console.error("View not found");
            return;
        }

        oView.setBusy(true);
        oModel.remove(`/SalesOrderHeaders(${iSalesOrderID})`, {
            success: (oData2: any, oResponse: SuccessResponse) => {
                oView.setBusy(false);
                console.log(oData2);
                console.log(oResponse);
                
                if (oResponse.statusCode == 204) {
                    MessageToast.show("Deletado com sucesso");
                } else {
                    MessageToast.show("Erro em deletar");
                }
            },
            error: (oError: ErrorResponse) => {
                oView.setBusy(false);
                console.log(oError);
                
                try {
                    const oObj = JSON.parse(oError.responseText);
                    MessageToast.show(oObj.error.message.value);
                } catch (parseError) {
                    MessageToast.show(oError.message || "Erro desconhecido");
                }
            }
        });
    }

}