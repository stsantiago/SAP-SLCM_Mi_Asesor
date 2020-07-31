/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("ean.edu.asesor.s1.Component");
jQuery.sap.require("sap.ca.scfld.md.ComponentBase");
sap.ca.scfld.md.ComponentBase.extend("ean.edu.asesor.s1.Component", {
	metadata: sap.ca.scfld.md.ComponentBase.createMetaData("MD", {
		"manifest": "json",
		"config": {},
		viewPath: "ean.edu.asesor.s1.view",
		masterPageRoutes: {
			"master": {
				"pattern": "",
				"view": "S2"
			}
		},
		detailPageRoutes: {
			"detail": {
				"pattern": "detail/{objectId}/{prgmId}",
				"view": "S3"
			},
			"programDetailPage": {
				"pattern": "programDetail/{StudentNumber}/{ProgramID}/{CourseID}/{AcadYear}/{AcadSession}",
				"view": "S4"
			}
		}
	}),
	createContent: function() {
		var v = {
			component: this
		};
		return sap.ui.view({
			viewName: "ean.edu.asesor.s1.Main",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: v
		});
	}
});