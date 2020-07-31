/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.controller("ean.edu.asesor.s1.view.StudentView", {
	handleEmailPress: function(e) {
		sap.m.URLHelper.triggerEmail(e.getSource().getText());
	},
	handleTelPress: function(e) {
		sap.m.URLHelper.triggerTel(e.getSource().getText());
	}
});