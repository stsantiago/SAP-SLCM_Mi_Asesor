/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("ean.edu.asesor.s1.util.Formatter");
sap.ca.scfld.md.controller.BaseDetailController.extend("ean.edu.asesor.s1.view.S4", {
	onInit: function() {
		var v = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSLCM_PIQ_ADVISEE_DETAILS_SRV/", true);
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		this.oObjhdr = this.byId("idObjHeader");
		this.getView().setModel(v, "programView");
		sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(function(e) {
			if (e.getParameter("name") === "programDetailPage") {
				var s = e.getParameter("arguments").StudentNumber,
					p = e.getParameter("arguments").ProgramID,
					c = e.getParameter("arguments").CourseID,
					a = e.getParameter("arguments").AcadYear,
					A = e.getParameter("arguments").AcadSession;
				this.oStudNum = e.getParameter("arguments").StudentNumber;
				this.oPrgmId = p = e.getParameter("arguments").ProgramID;
				var o = "/CourseListSet(StudentNumber='" + s + "',ProgramID='" + p + "',CourseID='" + c + "',AcadYear='" + a + "',AcadSession='" +
					A + "')";
				this._bindView(o);
			}
		}, this);
		var t = this;
		this.oHeaderFooterOptions = {
			onBack: function() {
				t.onNavBtnPrss();
			 }
			// additionalShareButtonList: [{
			// 	sI18nBtnTxt: "EXPORT_TO_PDF",
			// 	sIcon: "sap-icon://download",
			// 	onBtnPressed: function(e) {
			// 		jQuery.sap.log.info("share button 1 pressed " + e);
			// 	}
			// }]
		};
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);
		
		// var o = {
	 //     bSuppressBookmarkButton: true
		//   };
		//   this.setHeaderFooterOptions(o);
	},
	_bindView: function(o) {
		this.getView().getModel("programView").read(o, {
			async: true,
			urlParameters: {
				"$expand": "Appraisals"
			},
			success: jQuery.proxy(function(r) {
				this.response = r;
				var a = new sap.ui.model.json.JSONModel();
				a.setData(r);
				this.oObjhdr.setModel(a);
				var A = r.Appraisals;
				var t = this.oResBundle.getText("APPRAISALS", A.results.length);
				var b = new sap.ui.model.json.JSONModel();
				b.setData(A);
				this.byId("idPrgmDtl").setModel(b, "oAppModel");
				this.byId("idApptitle").setText(t);
			}, this),
			error: function() {}
		});
	},
	onNavBtnPrss: function() {
		var h, p;
		h = sap.ui.core.routing.History.getInstance();
		p = h.getPreviousHash();
		if (p !== undefined) {
			window.history.go(-1);
		} else if (!this.response.StudentNumber || !this.response.ProgramID) {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
				objectId: this.oStudNum,
				prgmId: this.oPrgmId
			}, true);
		} else {
			sap.ui.core.UIComponent.getRouterFor(this).navTo("detail", {
				objectId: this.response.StudentNumber,
				prgmId: this.response.ProgramID
			}, true);
		}
	}
});