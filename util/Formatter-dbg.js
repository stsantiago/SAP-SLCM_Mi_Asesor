/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("ean.edu.asesor.s1.util.Formatter");

ean.edu.asesor.s1.util.Formatter = {

	startDate: function(sValue1, sValue2) {
		return sValue1 + " " + "-" + " " + sValue2;
	},

	programText: function(sValue1, sValue2, sValue3) {
		return sValue1 + " " + "(" + sValue2 + " " + sValue3 + ")";
	},

	headerInfoTxt: function(sValue) {
		this.oResBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		if (sValue) {
			var sTxt = this.oResBundle.getText("LST_ADV_NTE");
			return sTxt+": " + sValue;
		} else {
			return sValue;
		}

	},

	statusText: function(sValue1) {
		if (sValue1 === "A") {
			return "Error";
		} else if (sValue1 === "I") {
			return "None";
		}
	},

	specializations: function(sValue) {
		if (sValue) {
			return sValue.replace(/;/gi, ", ");
		}
	},

	creditText: function(sValue1, sValue2) {
		var iVal = Math.round(sValue1);
		return iVal + " " + sValue2;
	},

	statusState: function(sValue) {
		if (sValue === "02") {
			return "Success";
		} else {
			return "Error";
		}
	},

	chartPercentage: function(sValue) {
		var fValue = parseFloat(sValue);
		return fValue;
	},

	displayPercentage: function(sValue) {
		var fValue = parseFloat(sValue);
		return fValue + "%";
	},

	diaplayParentTxt: function(sValue) {
		if (sValue) {
			return true;
		} else {
			return false;
		}
	},

	courseDetail: function(sValue1, sValue2) {
		return sValue1 + " " + sValue2;
	},

	testResultAppend: function(sVal1) {
		this.oResBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		var sTxt = this.oResBundle.getText("RESULT");
		return  sTxt+": " + sVal1;
	},

	appendAcadYearnSess: function(sVal1, sVal2) {
		if (sVal1 && sVal2) {
			return sVal1 + "," + " " + sVal2;
		}
	},

	handleSelected: function(sVal) {
		if (sVal === "CS01") {
			return true;
		}
	},
	
	defaultSelected: function(sVal) {
		if (sVal === "00") {
			return true;
		}
	}

};