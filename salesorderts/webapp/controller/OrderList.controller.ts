import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import Sorter from "sap/ui/model/Sorter";
import MessageToast from "sap/m/MessageToast";
import Router from "sap/ui/core/routing/Router";
import UIComponent from "sap/ui/core/UIComponent";
import Event from "sap/ui/base/Event";
import { Route$MatchedEvent } from "sap/ui/core/routing/Route";
import Table from "sap/ui/table/Table";
import BaseController from "./BaseController.controller";
import Dialog from "sap/m/Dialog";
import Control from "sap/ui/core/Control";

// Interfaces
interface FilterData {
    SalesOrderID: string;
    CreationDateTime: any;
    CreatedBy: string;
    CustomerID: string;
    TotalItems: number;
    TotalFreight: number;
    TotalOrder: number;
    Status: string;
    OrderField: string;
    OrderType: string;
    Limite: number;
    Ignore: number;
}

interface TableData {
    results: any[];
}

interface StatusUpdateItem {
    SalesOrderID: string;
    Status: string;
}

interface StatusMessage {
    Type: string;
    Message: string;
    [key: string]: any;
}

interface FunctionImportResponse {
    results: StatusMessage[];
}

export default class OrderList extends BaseController {

    private oDialogMessageList: Dialog | null = null;
    private aUpdateStatusQueue: StatusUpdateItem[] = [];    // Status update queue array
    private aUpdateStatusMessages: StatusMessage[] = [];    // Status messages array

    public onInit(): void {
        const oView = this.getView();
        const oFModel = new JSONModel();

        oFModel.setData({
            "SalesOrderID": "",
            "CreationDateTime": null,
            "CreatedBy": "",
            "CustomerID": "",
            "TotalItems": 0,
            "TotalFreight": 0,
            "TotalOrder": 0,
            "Status": "",
            "OrderField": "SalesOrderID",
            "OrderType": "ASC",
            "Limite": 25,
            "Ignore": 0
        } as FilterData);
        oView?.setModel(oFModel, "filter");

        const oTModel = new JSONModel();
        oTModel.setData([]);
        oView?.setModel(oTModel, "table");

        const oRouter = UIComponent.getRouterFor(this) as Router;
        oRouter.getRoute("RouteOrderList")?.attachMatched(this._onRouteMatchedList, this);
    }

    public onFilterReset(): void {
        // Implement reset logic here
        const oView = this.getView();
        const oFModel = oView?.getModel("filter") as JSONModel;

        oFModel.setData({
            "SalesOrderID": "",
            "CreationDateTime": null,
            "CreatedBy": "",
            "CustomerID": "",
            "TotalItems": 0,
            "TotalFreight": 0,
            "TotalOrder": 0,
            "Status": "",
            "OrderField": "SalesOrderID",
            "OrderType": "ASC",
            "Limite": 25,
            "Ignore": 0
        } as FilterData);
    }

    public onFilterSearch(oEvent?: Event): void {
        const oView = this.getView();
        const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
        const oTable = oView?.byId("table1") as Table;
        const oFModel = oView?.getModel("filter") as JSONModel;
        const oTModel = oView?.getModel("table") as JSONModel;
        const oFData = oFModel.getData() as FilterData;

        const aParams: string[] = [];
        const aSorter: Sorter[] = [];
        const aFilters: Filter[] = [];

        // Applying filters
        if (oFData.SalesOrderID !== '') {
            const oFilter = new Filter({
                path: 'SalesOrderID',
                operator: FilterOperator.EQ,
                value1: oFData.SalesOrderID
            });
            aFilters.push(oFilter);
        }

        if (oFData.CustomerID !== '') {
            const oFilter = new Filter({
                path: 'CustomerID',
                operator: FilterOperator.EQ,
                value1: oFData.CustomerID
            });
            aFilters.push(oFilter);
        }

        // Applying sorting
        const bDescending = oFData.OrderType === "DESC";
        if (oFData.OrderField !== '') {
            const oSort = new Sorter(oFData.OrderField, bDescending);
            aSorter.push(oSort);
        }

        // Limit and offset
        aParams.push(`$top=${oFData.Limite}`);
        aParams.push(`$skip=${oFData.Ignore}`);

        // Executing filter
        oView?.setBusy(true);
        oModel.read("/SalesOrderHeaders", {
            sorters: aSorter,
            filters: aFilters,
            urlParameters: aParams as any,
            success: (oData: TableData, oResponse: any) => {
                oView?.setBusy(false);
                oTModel.setData(oData.results);
            },
            error: (oError: any) => {
                oView?.setBusy(false);
                MessageToast.show("Erro ao carregar dados");
                console.error("Error loading data:", oError);
            }
        });
    }

    public onNew(oEvent: Event): void {
        const oRouter = UIComponent.getRouterFor(this) as Router;
        oRouter.navTo("RouteOrderNew");
    }

    public onEdit(oEvent: Event): void {
        const oSource = oEvent.getSource() as any;
        const sSalesOrderID = oSource.data("SalesOrderID");

        const oRouter = UIComponent.getRouterFor(this) as Router;
        oRouter.navTo("RouteOrderEdit", { SalesOrderID: sSalesOrderID });
    }

    public onDelete(oEvent: Event): void {
        const oSource = oEvent.getSource() as any;
        const sSalesOrderID = oSource.data("SalesOrderID");

        this.onDeleteOrder(sSalesOrderID, (sStatus: string) => {
            if (sStatus === 'S') {
                this.onFilterSearch();
            }
        });
    }

    public onChangeStatus(sStatus: string): void {
        const oView = this.getView();
        const oTable = oView?.byId("table1") as Table;
        const oTableModel = oView?.getModel("table") as JSONModel;
        const aData = oTableModel.getData() as any[];

        const aIndex = oTable.getSelectedIndices();
        if (aIndex.length === 0) {
            const sMessage = this._getI18nText("selectAtLeastOneItem");
            MessageToast.show(sMessage);
            return;
        }

        this.aUpdateStatusQueue = [];
        this.aUpdateStatusMessages = [];

        for (const iIndex of aIndex) {
            try {
                const sSalesOrderID = aData[iIndex].SalesOrderID;

                this.aUpdateStatusQueue.push({
                    SalesOrderID: sSalesOrderID,
                    Status: sStatus
                });
            } catch (e) {
                console.error("Error processing selected item:", e);
                console.log("Index:", iIndex);
            }
        }

        this.runUpdateStatusQueue();
    }

    private runUpdateStatusQueue(): void {
        const oQueue = this.aUpdateStatusQueue.pop();

        if (oQueue === undefined) {
            this.getView()?.setBusy(false);
            this.onOpenMessageListDialog(this.aUpdateStatusMessages);
            this.onFilterSearch();
            return;
        }

        const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
        this.getView()?.setBusy(true);

        oModel.callFunction(
            "/UPDATE_ORDER_STATUS",
            {
                method: "GET",
                urlParameters: {
                    SalesOrderID: oQueue.SalesOrderID,
                    Status: oQueue.Status
                },
                success: (oData: FunctionImportResponse, response: any) => {
                    for (const oResult of oData.results) {
                        this.aUpdateStatusMessages.push(oResult);
                    }
                    this.runUpdateStatusQueue();
                },
                error: (oResponse: any) => {
                    try {
                        const oError = JSON.parse(oResponse.responseText);
                        const sErrorMessage = this._getI18nText("errorUpdatingOrderWithMessage")
                            .replace("{0}", oQueue.SalesOrderID)
                            .replace("{1}", oError.error.message.value);

                        this.aUpdateStatusMessages.push({
                            "Type": "E",
                            "Message": sErrorMessage
                        });
                    } catch (e) {
                        const sErrorMessage = this._getI18nText("errorUpdatingOrder")
                            .replace("{0}", oQueue.SalesOrderID);

                        this.aUpdateStatusMessages.push({
                            "Type": "E",
                            "Message": sErrorMessage
                        });
                    }

                    this.runUpdateStatusQueue();
                }
            }
        );
    }

    public onOpenMessageListDialog(aMessageList: StatusMessage[]): void {
        const sName = "apps.dflc.salesorderts.view.MessageList";

        const oModel = new JSONModel(aMessageList);
        this.getView()?.setModel(oModel, "messageList");

        if (!this.oDialogMessageList) {
            this.loadFragment({
                name: sName
            }).then((oDialog: Control | Control[]) => {
                this.oDialogMessageList = oDialog as Dialog;
                this.oDialogMessageList.open();
            }).catch((oError: Error) => {
                console.error("Error loading fragment:", oError);
                MessageToast.show(this._getI18nText("errorLoadingDialog"));
            });
        } else {
            this.oDialogMessageList.open();
        }
    }

    public onCloseMessageListDialog(): void {
        const oDialog = this.byId("MessageListDialog") as Dialog;
        if (oDialog) {
            oDialog.close();
        }
    }


    private _onRouteMatchedList(oEvent: Route$MatchedEvent): void {
        this.onFilterSearch();
    }
}