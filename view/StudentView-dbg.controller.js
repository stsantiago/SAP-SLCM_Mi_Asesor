/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.controller("ean.edu.asesor.s1.view.StudentView", {

	/**
	 * Called when a controller is instantiated and its View controls (if available) are already created.
	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
	 * @memberOf src.main.webapp.view.StudentView
	 */
	/*onInit: function() {
		},*/

	handleEmailPress: function(oEvent) {
		sap.m.URLHelper.triggerEmail(oEvent.getSource().getText());
	},

	handleTelPress: function(oEvent) {
		sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
	}

	/**
	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
	 * (NOT before the first rendering! onInit() is used for that one!).
	 * @memberOf src.main.webapp.view.StudentView
	 */
	//	onBeforeRendering: function() {
	//
	//	},

	/**
	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
	 * This hook is the same one that SAPUI5 controls get after being rendered.
	 * @memberOf src.main.webapp.view.StudentView
	 */
	//	onAfterRendering: function() {
	//
	//	},

	/**
	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
	 * @memberOf src.main.webapp.view.StudentView
	 */
	//	onExit: function() {
	//
	//	}

});