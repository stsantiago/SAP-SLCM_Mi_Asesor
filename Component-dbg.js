/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("ean.edu.asesor.s1.Component");
//jQuery.sap.require("ean.edu.asesor.s1.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ComponentBase");

sap.ca.scfld.md.ComponentBase.extend("ean.edu.asesor.s1.Component", {
	metadata: sap.ca.scfld.md.ComponentBase.createMetaData("MD", {
		// "name": "Master Detail Sample",
		// "version": "4.0.1",
		// "library": "ean.edu.asesor.s1",
		// "includes": ["css/scfld.css"],
		// "dependencies": {
		// 	"libs": ["sap.m", "sap.me"],
		// 	"components": []
		// },
		"manifest": "json",
		"config": {
			//	"resourceBundle" : "i18n/i18n.properties",
			//	"titleResource" : "SHELL_TITLE",
			//	"icon" : "sap-icon://Fiori2/F0002",
			//	"favIcon" : "./resources/sap/ca/ui/themes/base/img/favicon/F0002_My_Accounts.ico",
			//	"homeScreenIconPhone" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/57_iPhone_Desktop_Launch.png",
			//	"homeScreenIconPhone@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/114_iPhone-Retina_Web_Clip.png",
			//	"homeScreenIconTablet" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/72_iPad_Desktop_Launch.png",
			//	"homeScreenIconTablet@2" : "./resources/sap/ca/ui/themes/base/img/launchicon/F0002_My_Accounts/144_iPad_Retina_Web_Clip.png",
		},
		viewPath: "ean.edu.asesor.s1.view",

		masterPageRoutes: {
			// // fill the routes to your master pages in here. The application will start with a navigation to route "master"
			// leading to master screen S2.
			// // If this is not desired please define your own route "master"
			"master": {
				"pattern": "",
				"view": "S2"
			}
		},
		detailPageRoutes: {
			// //fill the routes to your detail pages in here. The application will navigate from the master page to route
			// //"detail" leading to detail screen S3.
			// If this is not desired please define your own route "detail"
			"detail": {
				"pattern": "detail/{objectId}/{prgmId}",
				"view": "S3"
			},

			"programDetailPage": {
				"pattern": "programDetail/{StudentNumber}/{ProgramID}/{CourseID}/{AcadYear}/{AcadSession}",
				"view": "S4"
			}
		}
		//fullScreenPageRoutes : {
		//	// fill the routes to your full screen pages in here.
		//	"subDetail" : {
		//		"pattern" : "subDetail/{contextPath}",
		//		"view" : "S4",
		//	}
		//}
	}),

	/**
	 * Initialize the application
	 *
	 * @returns {sap.ui.core.Control} the content
	 */
	createContent: function() {

		var oViewData = {
			component: this
		};
		return sap.ui.view({
			viewName: "ean.edu.asesor.s1.Main",
			type: sap.ui.core.mvc.ViewType.XML,
			viewData: oViewData
		});
	}
});