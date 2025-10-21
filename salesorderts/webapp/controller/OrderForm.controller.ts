
import MessageToast from "sap/m/MessageToast";
import History from "sap/ui/core/routing/History";
import UIComponent from "sap/ui/core/UIComponent";
import Router from "sap/ui/core/routing/Router";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Input from "sap/m/Input";
import Event from "sap/ui/base/Event";
import BindingMode from "sap/ui/model/BindingMode"
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import BaseController from "./BaseController.controller";

// Interfaces
interface OrderItem {
    SalesOrderItemNumber: number;
    Material: string;
    Description: string;
    Quantity: string | number;
    UnitPrice: string | number;
    TotalPrice: string | number;
}

interface OrderData {
    SalesOrderID: string | number;
    CreationDateTime: any;
    CreatedBy: string;
    CustomerID: string | number;
    TotalItems: string | number;
    TotalFreight: string | number;
    TotalOrder: string | number;
    Status: string;
    toItem: OrderItem[];
}

interface ODataResponse {
    toItem: {
        results: OrderItem[];
    };
    [key: string]: any;
}

interface RouteArguments {
    SalesOrderID: string;
}

export default class OrdemForm extends BaseController {

    public formMode = "I";

    public onInit(): void {
        const oRouter = UIComponent.getRouterFor(this) as Router;
        if (oRouter) {
            oRouter.getRoute("RouteOrderNew")?.attachMatched(this._onRouteMatchedNew, this);

            oRouter.getRoute("RouteOrderEdit")?.attachMatched(this._onRouteMatchedEdit, this);
        }
    }

    public liveChangeItemQuantity(oEvent: Event): void {
        const oInput = oEvent.getSource() as Input;
        let sValue = oInput.getValue();
        sValue = sValue.replace(/[^\d]/g, '');
        oInput.setValue(sValue);
        this.recalcOrder();
    }

    public liveChangePrice(oEvent: Event): void {
        const oInput = oEvent.getSource() as Input;
        let sValue = oInput.getValue();
        sValue = sValue.replace(/[^\d]/g, '');

        if (sValue == "") {
            oInput.setValue(sValue);
            return;
        }

        // Remove leading zeros
        sValue = sValue.replace(/^0+/, '');

        const iLength = sValue.length;
        if (iLength == 1) {
            sValue = "0.0" + sValue;
        } else if (iLength == 2) {
            sValue = "0." + sValue;
        } else if (iLength > 2) {
            sValue = sValue.slice(0, iLength - 2) + "." + sValue.slice(-2);
        } else {
            sValue = "";
        }

        const oView = this.getView();
        const oModel = oView?.getModel() as JSONModel;
        const oData = oModel.getData() as OrderData;
        const oContext = oInput.getBindingContext();
        const sInputPath = (oInput as any).mBindingInfos.value.binding.sPath;

        if (sInputPath == "/TotalFreight") {
            // TotalFreight
            oData.TotalFreight = parseFloat(sValue);
        } else {
            const sPath = oContext?.getPath();
            const aPath = sPath?.split("/");

            // UnitPrice
            if (sInputPath == "UnitPrice") {

                if (aPath) {
                    const iIndex = parseInt(aPath[2]);
                    oData.toItem[iIndex].UnitPrice = parseFloat(sValue);
                }
            }
        }

        this.recalcOrder();
    }

    public recalcOrder(): void {
        const oView = this.getView();
        const oModel = oView?.getModel() as JSONModel;
        const oOrder = this.getOrderObject();
        oModel.setData(oOrder);
        oView?.setModel(oModel);
    }

    public onNewItem(): void {
        const oView = this.getView();
        const oModel = oView?.getModel() as JSONModel;
        const oOrder = oModel.getData() as OrderData;
        const aItems = oOrder.toItem;

        let iLastSalesOrderItemNumber = 0;
        for (const item of aItems) {
            if (item.SalesOrderItemNumber > iLastSalesOrderItemNumber) {
                iLastSalesOrderItemNumber = item.SalesOrderItemNumber;
            }
        }

        const oNewItem = this.createEmptyItem();
        oNewItem.SalesOrderItemNumber = iLastSalesOrderItemNumber + 1;
        aItems.push(oNewItem);

        oModel.setData(oOrder);
        oView?.setModel(oModel);
    }

    public onDeleteItem(oEvent: Event): void {
        const oSource = oEvent.getSource() as any;
        const sSalesOrderItemNumber = oSource.data("SalesOrderItemNumber");

        const oView = this.getView();
        const oModel = oView?.getModel() as JSONModel;
        const oOrder = oModel.getData() as OrderData;
        const aItems = oOrder.toItem;

        const iIndex = aItems.findIndex(item => item.SalesOrderItemNumber == sSalesOrderItemNumber);
        if (iIndex !== -1) {
            aItems.splice(iIndex, 1);
        }

        oModel.setData(oOrder);
        oView?.setModel(oModel);
        this.recalcOrder();
    }

    public getOrderObject(): OrderData {
        const oView = this.getView();
        const oModel = oView?.getModel() as JSONModel;
        const oOrder = oModel.getData() as OrderData;

        // Header
        oOrder.SalesOrderID = this.parseInt(oOrder.SalesOrderID);
        oOrder.TotalFreight = this.parsePrice(oOrder.TotalFreight);

        // Items
        oOrder.TotalItems = 0;
        for (const item of oOrder.toItem) {
            item.Quantity = this.parseInt(item.Quantity);
            item.UnitPrice = this.parsePrice(item.UnitPrice);
            item.TotalPrice = Number(item.Quantity) * Number(item.UnitPrice);
            oOrder.TotalItems += Number(item.TotalPrice);
        }

        oOrder.TotalOrder = Number(oOrder.TotalItems) + Number(oOrder.TotalFreight);
        return oOrder;
    }

    private getOrderOData(): OrderData {
        const oOrder = this.getOrderObject();

        // Header
        if (oOrder.SalesOrderID == "") {
            oOrder.SalesOrderID = 0;
        }
        oOrder.CustomerID = this.parseInt(oOrder.CustomerID);

        oOrder.TotalItems = String((oOrder.TotalItems as Number).toFixed(2));
        oOrder.TotalFreight = String((oOrder.TotalFreight as Number).toFixed(2));
        oOrder.TotalOrder = String((oOrder.TotalOrder as Number).toFixed(2));

        // Items
        for (const item of oOrder.toItem) {
            item.UnitPrice = String(Number(item.UnitPrice).toFixed(2));
            item.TotalPrice = String(Number(item.TotalPrice).toFixed(2));
        }

        return oOrder;
    }

    public createEmptyOrderObject(): OrderData {
        return {
            SalesOrderID: "",
            CreationDateTime: null,
            CreatedBy: "",
            CustomerID: "",
            TotalItems: 0.0,
            TotalFreight: 0,
            TotalOrder: 0.0,
            Status: "",
            toItem: []
        };
    }

    private createEmptyItem(): OrderItem {
        return {
            SalesOrderItemNumber: 0,
            Material: "",
            Description: "",
            Quantity: "",
            UnitPrice: "",
            TotalPrice: ""
        };
    }

    public onSave(): void {
        const oView = this.getView();
        const oODataModel = this.getOwnerComponent()?.getModel() as ODataModel;
        const oJSONModel = oView?.getModel() as JSONModel;
        const oOrder = this.getOrderOData();

        // Validations
        const oCustomerID = oView?.byId("SalesOrder.CustomerID") as Input;
        oCustomerID.setValueState("None");

        if (oOrder.CustomerID == 0) {
            oCustomerID.setValueState("Error");
            MessageToast.show("Customer initial");
            return;
        }

        if (this.formMode == "I") {

            if (this.isUsingMockData()) {
                if (!(this as any).iLastOrdemId) {
                    (this as any).iLastOrdemId = 1000;
                }
                oOrder.SalesOrderID = (this as any).iLastOrdemId;
                (this as any).iLastOrdemId++;
            }

            oView?.setBusy(true);
            oODataModel.create("/SalesOrderHeaders", oOrder, {
                success: (oData: ODataResponse, oResponse: any) => {
                    // Adjust items that come back in the results field
                    (oData.toItem as any) = oData.toItem.results;

                    oJSONModel.setData(oData);
                    if (oResponse.statusCode == 201) {
                        // Lock fields
                        (oView?.byId("SalesOrder.CreationDateTime") as any)?.setEditable(false);
                        (oView?.byId("SalesOrder.CreatedBy") as any)?.setEditable(false);
                        (oView?.byId("bt-delete") as any)?.setVisible(true);

                        MessageToast.show("Order created with Success");
                    } else {
                        MessageToast.show("Error to save");
                    }

                    oView?.setBusy(false);
                },
                error: (oResponse: any) => {
                    const oError = JSON.parse(oResponse.responseText);
                    MessageToast.show(oError.error.message.value);
                    oView?.setBusy(false);
                }
            });

        } else {

            if (this.isUsingMockData()) {
                // usando mock, o objeto esta sendo duplicado ao invés de ser atualizado
                // para corrigir isso, o objeto anterior esta sendo deletado
                oODataModel.remove("/SalesOrderHeaders(" + oOrder.SalesOrderID + ")", {
                    success: function (oData: any, oResponse: any) {
                        oODataModel.create("/SalesOrderHeaders", oOrder, {
                            success: function (oData: any, oResponse: any) {
                                if (oResponse.statusCode == 204 || oResponse.statusCode == 201) {
                                    MessageToast.show("Order Updated with success");
                                }
                                oView?.setBusy(false);
                            },
                            error: function (oResponse: any) {
                                var oError = JSON.parse(oResponse.responseText);
                                MessageToast.show(oError.error.message.value);
                                oView?.setBusy(false);
                            }
                        }
                        );
                    },
                    error: function (oResponse: any) { }
                });

            } else {

                oView?.setBusy(true);

                // com deep entity, o método create é usado para atualizar também
                oODataModel.create("/SalesOrderHeaders", oOrder, {
                    success: function (oData: ODataResponse, oResponse: any) {
                        if (oResponse.statusCode == 204 || oResponse.statusCode == 201) {
                            MessageToast.show("Order Updated with success");
                        }
                        oView?.setBusy(false);
                    },
                    error: function (oResponse: any) {
                        var oError = JSON.parse(oResponse.responseText);
                        MessageToast.show(oError.error.message.value);
                        oView?.setBusy(false);
                    }
                });

            }

        }

    }

    public onDelete(): void {
        const oOrder = this.getOrderOData();

        if (oOrder.SalesOrderID == 0) {
            const sMessage = this._getI18nText("onlyExistingOrderCanBeDeleted");
            MessageToast.show(sMessage);
            return;
        }

        this.onDeleteOrder(oOrder.SalesOrderID as number, (sStatus: string) => {
            if (sStatus == "S") {
                // Clear screen data
                const oModel = new JSONModel();
                oModel.setDefaultBindingMode(BindingMode.TwoWay);
                oModel.setData(this.createEmptyOrderObject());
                this.getView()?.setModel(oModel);

                // Redirect to list
                const oRouter = UIComponent.getRouterFor(this) as Router;
                oRouter.navTo("RouteOrderList");
            }
        });
    }

    private _onRouteMatchedNew(oEvent: Event): void {

        this.formMode = "I";

        const oView = this.getView();

        const oModel = new JSONModel();
        oModel.setDefaultBindingMode(BindingMode.TwoWay);
        oModel.setData(this.createEmptyOrderObject());
        oView?.setModel(oModel);

        (oView?.byId("SalesOrder.CreationDateTime") as any).setEditable(true);
        (oView?.byId("SalesOrder.CreatedBy") as any).setEditable(true);
        (oView?.byId("SalesOrder.CustomerID") as any).setValueState("None");
        (oView?.byId("bt-delete") as any)?.setVisible(false);

        this.recalcOrder();
    }

    private _onRouteMatchedEdit(oEvent: Route$MatchedEvent): void {

        const oView = this.getView();
        const oArgs = oEvent.getParameter("arguments") as RouteArguments;
        const sSalesOrderID = oArgs.SalesOrderID;
        const oModel = this.getOwnerComponent()?.getModel() as ODataModel;

        (this as any).formMode = "U";

        // Clear data
        const oJSONModel = new JSONModel(this.createEmptyOrderObject());
        oJSONModel.setDefaultBindingMode(BindingMode.TwoWay);

        (oView?.byId("SalesOrder.CreationDateTime") as Input).setEditable(false);
        (oView?.byId("SalesOrder.CreatedBy") as Input).setEditable(false);
        (oView?.byId("SalesOrder.CustomerID") as Input).setValueState("None");
        (oView?.byId("bt-delete") as any)?.setVisible(true);

        oView?.setBusy(true);

        // Header
        oModel.read(`/SalesOrderHeaders(${sSalesOrderID})`, {
            success: (oOrdem: OrderData, oResponse: any) => {
                // Items
                oModel.read(`/SalesOrderHeaders(${sSalesOrderID})/toItem`, {
                    success: (oData: ODataResponse, oResponse: any) => {
                        oOrdem.toItem = oData.results;
                        oJSONModel.setData(oOrdem);
                        oView?.setModel(oJSONModel);

                        this.recalcOrder();
                        oView?.setBusy(false);
                    },
                    error: (oError: any) => {
                        try {
                            const oParsedError = JSON.parse(oError.responseText);
                            MessageToast.show(oParsedError.error.message.value);
                        } catch (parseError) {
                            MessageToast.show("Error loading order items");
                        }
                        oView?.setBusy(false);
                    }
                });
            },
            error: (oResponse: any) => {
                try {
                    const oError = JSON.parse(oResponse.responseText);
                    MessageToast.show(oError.error.message.value);
                } catch (parseError) {
                    MessageToast.show("Error loading order header");
                }
                oView?.setBusy(false);
            }
        });
    }

    public onPageBack(): void {
        const oHistory = (History as any).getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            UIComponent.getRouterFor(this).navTo("RouteOrderList");
        }
    }

}