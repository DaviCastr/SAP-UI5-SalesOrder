import Controller from "sap/ui/core/mvc/Controller";
import UIComponent from "sap/ui/core/UIComponent";
import History from "sap/ui/core/routing/History";
import MessageToast from "sap/m/MessageToast";
import ODataModel from "sap/ui/model/odata/ODataModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Formatter from "../model/formatter";

/**
 * Base controller with common utility methods
 */
export default class BaseController extends Controller {

    public formatter = Formatter;

    /**
     * Parse string to integer with safety checks
     */
    protected parseInt(sValue: any): number {
        if (sValue == "" || sValue == null || sValue == undefined) {
            return 0;
        }

        let iValue = parseInt(sValue);
        if (iValue == null || isNaN(iValue)) {
            iValue = 0;
        }
        return iValue;
    }

    /**
     * Parse price string to number with Brazilian format support
     */
    protected parsePrice(sValue: any): number {
        if (sValue == "" || sValue == null || sValue == undefined) {
            return 0.00;
        }

        if (typeof sValue == "number") {
            return sValue;
        }

        let sValueStr = sValue.toString();

        // If no comma, it's already in standard format
        if (sValueStr.indexOf(",") == -1) {
            return parseFloat(sValueStr);
        }

        // Brazilian format: 1.234,56 -> 1234.56
        sValueStr = sValueStr.replace(/[^0-9.,]/g, '');
        sValueStr = sValueStr.replace(/^0+/, '');
        sValueStr = sValueStr.replace(".", "");
        sValueStr = sValueStr.replace(",", ".");
        return parseFloat(sValueStr);
    }

    /**
     * Format number to Brazilian price format
     */
    protected formatPrice(fPrice: number): string {
        if (typeof fPrice !== "number") {
            return "0.00";
        }
        let sPrice = fPrice.toFixed(2);
        sPrice = sPrice.replace(".", ",");
        return sPrice;
    }

    /**
     * Navigate back in history or to order list
     */
    protected onPageBack(): void {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
            window.history.go(-1);
        } else {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("RouteOrdemList");
        }
    }

    /**
     * Delete order with callback
     */
    protected onDeleteOrder(SalesOrderID: string | number, callback: (status: string) => void): void {
        const oModel = this.getOwnerComponent()?.getModel() as ODataModel;
        const oView = this.getView();
        
        oView?.setBusy(true);
        oModel.remove(`/SalesOrderHeaders(${SalesOrderID})`, {
            success: (oData: any, oResponse: any) => {
                this._handleDeleteSuccess(oResponse, oView);
                callback("S");
            },
            error: (oResponse: any) => {
                this._handleDeleteError(oResponse, oView);
                callback("E");
            }
        });
    }

    /**
     * Async version of onDeleteOrder
     */
    protected async onDeleteOrderAsync(SalesOrderID: string | number): Promise<boolean> {
        return new Promise((resolve) => {
            this.onDeleteOrder(SalesOrderID, (sStatus: string) => {
                resolve(sStatus == "S");
            });
        });
    }

    /**
     * Handle successful delete operation
     */
    private _handleDeleteSuccess(oResponse: any, oView: any): void {
        if (oResponse.statusCode == 204) {
            const sMessage = this._getI18nText("deletedSuccessfully");
            MessageToast.show(sMessage);
        } else {
            const sMessage = this._getI18nText("errorDeleting");
            MessageToast.show(sMessage);
        }
        oView.setBusy(false);
    }

    /**
     * Handle delete operation error
     */
    private _handleDeleteError(oResponse: any, oView: any): void {
        try {
            const oError = JSON.parse(oResponse.responseText);
            MessageToast.show(oError.error.message.value);
        } catch (parseError) {
            const sMessage = this._getI18nText("deleteError");
            MessageToast.show(sMessage);
        }
        oView.setBusy(false);
    }

    /**
     * Get internationalized text with fallback
     */
    protected _getI18nText(sKey: string): string {
        try {
            const oResourceModel = this.getOwnerComponent()?.getModel("i18n") as ResourceModel;
            if (oResourceModel?.getResourceBundle) {
                const oResourceBundle = oResourceModel.getResourceBundle() as ResourceBundle;
                return oResourceBundle.getText(sKey) as string;
            }
        } catch (error) {
            console.warn("Could not access i18n resource bundle:", error);
        }
        return this._getDefaultText(sKey);
    }

    /**
     * Get default English text
     */
    private _getDefaultText(sKey: string): string {
        const mDefaultTexts: { [key: string]: string } = {
            "deletedSuccessfully": "Order deleted successfully",
            "errorDeleting": "Error deleting order",
            "deleteError": "Error during order deletion"
        };
        return mDefaultTexts[sKey] || sKey;
    }
}