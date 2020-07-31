/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("ean.edu.asesor.s1.util.Formatter");

sap.ca.scfld.md.controller.BaseDetailController.extend("ean.edu.asesor.s1.view.S4", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf src.main.webapp.view.S4
	 */
	onInit: function() {
		var oViewModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZSLCM_PIQ_ADVISEE_DETAILS_SRV/", true);
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		this.oObjhdr = this.byId("idObjHeader");

		this.getView().setModel(oViewModel, "programView");

		sap.ui.core.UIComponent.getRouterFor(this).attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "programDetailPage") {
				var sStudentNum = oEvent.getParameter("arguments").StudentNumber,
					sPrgmId = oEvent.getParameter("arguments").ProgramID,
					sCrseId = oEvent.getParameter("arguments").CourseID,
					sAcadyr = oEvent.getParameter("arguments").AcadYear,
					sAcadSessn = oEvent.getParameter("arguments").AcadSession;

				this.oStudNum = oEvent.getParameter("arguments").StudentNumber;
				this.oPrgmId = sPrgmId = oEvent.getParameter("arguments").ProgramID;

				var sObjectPath = "/CourseListSet(StudentNumber='" + sStudentNum + "',ProgramID='" + sPrgmId + "',CourseID='" + sCrseId +
					"',AcadYear='" + sAcadyr + "',AcadSession='" + sAcadSessn + "')";
				this._bindView(sObjectPath);
			}
		}, this);
		var that = this;
		this.oHeaderFooterOptions = {
			onBack: function() {
				that.onNavBtnPrss();
			},
			additionalShareButtonList: [{
				sI18nBtnTxt: "EXPORT_TO_PDF",
				sIcon: "sap-icon://download",
				onBtnPressed: function(evt) {
					jQuery.sap.log.info("share button 1 pressed " + evt);
				}
			}]
		};
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);
	},

	_bindView: function(sObjectPath) {
		this.getView().getModel("programView").read(sObjectPath, {
			async: true,
			urlParameters: {
				"$expand": "Appraisals"
			},
			success: jQuery.proxy(function(response) {
				/*var ooAct = new sap.ui.model.json.JSONModel();
		 		        ooAct.setData(response);
						this.byId("idPrgmDtl").setModel(ooAct, "oAppModel"); */

				this.response = response;
				var ooAct = new sap.ui.model.json.JSONModel();
				ooAct.setData(response);
				this.oObjhdr.setModel(ooAct);
				//this.oObjhdr.rerender();

				var aAppTypes = response.Appraisals;
				var sText = this.oResBundle.getText("APPRAISALS", aAppTypes.results.length);
				var oActTypeJson = new sap.ui.model.json.JSONModel();
				oActTypeJson.setData(aAppTypes);
				this.byId("idPrgmDtl").setModel(oActTypeJson, "oAppModel");
				this.byId("idApptitle").setText(sText);
			}, this),
			error: function() {}
		});
	},

	onNavBtnPrss: function() {
		//window.history.back();
		var oHistory, sPreviousHash;

		oHistory = sap.ui.core.routing.History.getInstance();
		sPreviousHash = oHistory.getPreviousHash();

		if (sPreviousHash !== undefined) {
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

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf src.main.webapp.view.S4
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf src.main.webapp.view.S4
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf src.main.webapp.view.S4
	 */
	//	onExit: function() {
	//
	//	}

});