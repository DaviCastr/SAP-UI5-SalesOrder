import NumberFormat from "sap/ui/core/format/NumberFormat";

interface NumberFormatOptions {
    groupingEnabled: boolean;
    groupingSeparator: string;
    decimalSeparator: string;
    decimals: number;
}

interface Formatter {
    formatPrice(sValue: string | number): string;
    formatStatus(sValue: string | number): string;
    getIconStatus(sStatus: string): string;
    getColorStatus(sStatus: string): string;
    getStateStatus(sStatus: string): string;
}

const Formatter: Formatter = {
    formatPrice(sValue: string | number): string {
        const oFormatOptions: NumberFormatOptions = {
            groupingEnabled: true,
            groupingSeparator: '.',
            decimalSeparator: ',',
            decimals: 2
        };

        const oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
        const nValue = typeof sValue === 'string' ? parseFloat(sValue) : sValue;

        return oFloatFormat.format(nValue);
    },

    formatStatus(sValue: string | number): string {
        if (sValue == null) {
            return "Undefined";
        }
        const oResourceBundle = (this as any)?.getOwnerComponent().getModel("i18n").getResourceBundle();
        return oResourceBundle.getText("Status" + sValue);
    },

    getIconStatus(sStatus: string): string {
        let sIcon = "sap-icon://message-information";
        switch (sStatus) {
            case "S":
                sIcon = "sap-icon://message-success";
                break;
            case "E":
                sIcon = "sap-icon://message-error";
                break;
            case "W":
                sIcon = "sap-icon://message-warning";
                break;
        }
        return sIcon;
    },

    getColorStatus(sStatus: string): string {
        let sColor = "#1A1A1A"; // Dark gray for better contrast
        switch (sStatus) {
            case "S":
                sColor = "#0A6ED1"; // SAP Success Blue
                break;
            case "E":
                sColor = "#BB0000"; // SAP Error Red
                break;
            case "W":
                sColor = "#E76500"; // SAP Warning Orange
                break;
        }
        return sColor;
    },

    getStateStatus(sStatus: string): string {
        let sState = "None";
        switch (sStatus) {
            case "S":
                sState = "Success";
                break;
            case "E":
                sState = "Error";
                break;
            case "W":
                sState = "Warning";
                break;
        }
        return sState;
    }

};

export default Formatter;