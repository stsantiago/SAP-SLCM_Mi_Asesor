/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.declare("ean.edu.asesor.s1.Configuration");
jQuery.sap.require("sap.ca.scfld.md.ConfigurationBase");
jQuery.sap.require("sap.ca.scfld.md.app.Application");
sap.ca.scfld.md.ConfigurationBase.extend("ean.edu.asesor.s1.Configuration", {
	oServiceParams: {
		serviceList: [{
			name: "ZSLCM_PIQ_ADVISEE_DETAILS_SRV",
			masterCollection: "AdviseesListSet",
			serviceUrl: ean.edu.asesor.s1.Component.getMetadata().getManifestEntry("sap.app").dataSources[
				"ZSLCM_PIQ_ADVISEE_DETAILS_SRV"].uri,
			isDefault: true,
			mockedDataSource: jQuery.sap.getModulePath("ean.edu.asesor.s1") + "/" + ean.edu.asesor.s1.Component.getMetadata()
				.getManifestEntry("sap.app").dataSources["ZSLCM_PIQ_ADVISEE_DETAILS_SRV"].settings.localUri
		}]
	},
	getServiceParams: function() {
		return this.oServiceParams;
	},
	getServiceList: function() {
		return this.getServiceParams().serviceList;
	},
	getMasterKeyAttributes: function() {
		return ["Id"];
	}
});