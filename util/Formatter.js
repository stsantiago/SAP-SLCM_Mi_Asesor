/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("ean.edu.asesor.s1.util.Formatter");
ean.edu.asesor.s1.util.Formatter = {
	startDate: function(v, V) {
		return v + " " + "-" + " " + V;
	},
	programText: function(v, V, s) {
		return v + " " + "(" + V + " " + s + ")";
	},
	headerInfoTxt: function(v) {
		this.oResBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		if (v) {
			var t = this.oResBundle.getText("LST_ADV_NTE");
			return t + ": " + v;
		} else {
			return v;
		}
	},
	statusText: function(v) {
		if (v === "A") {
			return "Error";
		} else if (v === "I") {
			return "None";
		}
	},
	specializations: function(v) {
		if (v) {
			return v.replace(/;/gi, ", ");
		}
	},
	creditText: function(v, V) {
		var i = Math.round(v);
		return i + " " + V;
	},
	statusState: function(v) {
		if (v === "02") {
			return "Success";
		} else {
			return "Error";
		}
	},
	chartPercentage: function(v) {
		var V = parseFloat(v);
		return V;
	},
	displayPercentage: function(v) {
		var V = parseFloat(v);
		return V + "%";
	},
	diaplayParentTxt: function(v) {
		if (v) {
			return true;
		} else {
			return false;
		}
	},
	courseDetail: function(v, V) {
		return v + " " + V;
	},
	testResultAppend: function(v) {
		this.oResBundle = sap.ca.scfld.md.app.Application.getImpl().getResourceBundle();
		var t = this.oResBundle.getText("RESULT");
		return t + ": " + v;
	},
	appendAcadYearnSess: function(v, V) {
		if (v && V) {
			return v + "," + " " + V;
		}
	},
	handleSelected: function(v) {
		if (v === "ALL1") {
			return true;
		}
	},
	defaultSelected: function(v) {
		if (v === "00") {
			return true;
		}
	}
};