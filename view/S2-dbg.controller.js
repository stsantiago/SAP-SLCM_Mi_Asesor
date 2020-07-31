/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.ScfldMasterController");
jQuery.sap.require("sap.ui.Device");
jQuery.sap.require("ean.edu.asesor.s1.util.Formatter");

sap.ca.scfld.md.controller.ScfldMasterController.extend("ean.edu.asesor.s1.view.S2", {

	getHeaderFooterOptions: function() {
		var that = this;
		return {
			sI18NMasterTitle: "MASTER_TITLE",

			oFilterOptions: {
				bDisabled: false,
				onFilterPressed: jQuery.proxy(function(oEvt) {
					that.handleOpenDialog(oEvt);
				}, this)
			}
		};
	},

	onUpdateFinished: function() {
		if (this.bSearch && this._oList.getSelectedItem()) {
			this._oList.getSelectedItem().setSelected(false);
			this.bSearch = false;
		}
		var iLength = this._oList.getBinding("items").getLength();
		var oMasTitle = this.oResBundle.getText("MASTER_TITLE",iLength);
	    this._oControlStore.oMasterTitle.setText(oMasTitle);
	},

	onInit: function() {
		this._oList = this.byId("list");
		this.oListItem = this.byId("idMstrLstItm").clone();
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		this.bFirstCancel = false;

		this.mGroupFunctions = {
			ProgramOfStudyId: function(oContext) {
				var sPrgmName = oContext.getProperty("ProgramOfStudyText");
				var sPrgmkey = oContext.getProperty("ProgramOfStudyId");
				return {
					key: sPrgmkey,
					text: sPrgmName
				};
			},

			HoldStatus: function(oContext) {
				var sHoldStatus = oContext.getProperty("HoldstatusText");
				var sHoldStatusKey = oContext.getProperty("HoldStatus");

				if (sHoldStatusKey === "I" || sHoldStatusKey === "") {
					return {
						key: sHoldStatusKey,
						text: sHoldStatus
					};
				} else {
					return {
						key: sHoldStatusKey,
						text: sHoldStatus
					};
				}
			}
		};

		this.aSorterLoad = [new sap.ui.model.Sorter("ProgramOfStudyId", false,
			function(oContext) {
				var sPrgmName = oContext.getProperty("ProgramOfStudyText");
				var sPrgmkey = oContext.getProperty("ProgramOfStudyId");
				return {
					key: sPrgmkey,
					text: sPrgmName
				};
			})];

		var oFilter = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "CS01");
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: [oFilter],
			sorter: this.aSorterLoad
		});

		var sLabel1 = this.oResBundle.getText("FILTRD_BY");
		var sLabel2 = this.oResBundle.getText("STUDENT_STATUS");
		var sLabel3 = this.oResBundle.getText("ATTENDING");
		this.byId("idFilterLabel").setText(sLabel1 + ":" + " " + sLabel2 + " (" + sLabel3 + ")");
	},

	handleOpenDialog: function() {
		var bFrstLoad;
		if (!this.oViewSettingsDialog) {
			this.oViewSettingsDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ViewSettingsDialog", this);
			this.getView().addDependent(this.oViewSettingsDialog);
			bFrstLoad = true;
			this.bFirstCancel = true;
		}
		if (bFrstLoad) {
			this.oViewSettingsDialog.setSortDescending(true);
			bFrstLoad = false;
		}
		this.oViewSettingsDialog.open();
		this.oViewSettingsDialog._groupContent[0].setVisible(false);
	},

	getDetailNavigationParameters: function(oItem) {
		return {
			objectId: oItem.getBindingContext().getProperty("StudentNumber"),
			prgmId: oItem.getBindingContext().getProperty("ProgramOfStudyId")
		};
	},

	isBackendSearch: function() {
		return true;
	},

	applyBackendSearchPattern: function(sFilterPattern) {
		var sQuery = sFilterPattern,
			aFilters = [];
		this.oSearchText = sQuery;
		this.bSearch = true;

		if (sQuery && sQuery.length > 0) {
			var oFilterSearch = new sap.ui.model.Filter("SearchText", sap.ui.model.FilterOperator.Contains, sQuery);
			aFilters.push(oFilterSearch);
		}
		if (!this.oViewSettingsDialog) {
			var oFilterStatus = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "CS01");
			aFilters.push(oFilterStatus);
		} else {
			var oFilItms = this.oViewSettingsDialog.getSelectedFilterItems();
			for (var i = 0; i < oFilItms.length; i++) {
				if (oFilItms[i].getKey() === "ProgramOfStudyId") {
					var sPrgmId = oFilItms[i].getBindingContext().getObject().ProgramId;
					if (sPrgmId === "00000001") {
						continue;
					}
					var oFilPrgm = new sap.ui.model.Filter("ProgramOfStudyId", sap.ui.model.FilterOperator.EQ, sPrgmId);
					aFilters.push(oFilPrgm);
				} else if (oFilItms[i].getKey() === "StudentStatus") {
					var sStatusId = oFilItms[i].getBindingContext().getObject().StudentStatusId;
					if (sStatusId === "ALL1") {
						continue;
					}
					var oFilStatus = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, sStatusId);
					aFilters.push(oFilStatus);
				} else if (oFilItms[i].getKey() === "HoldStatus") {
					var sHoldId = oFilItms[i].getBindingContext().getObject().HoldStatusId;
					if (sHoldId === "B") {
						continue;
					}
					var oHoldStatus = new sap.ui.model.Filter("HoldStatus", sap.ui.model.FilterOperator.EQ, sHoldId);
					aFilters.push(oHoldStatus);
				}
			}
		}
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: aFilters,
			sorter: this.aSorterLoad
		});
	},

	onConfirmViewSettingsDialog: function(oEvent) {
		var mParams = oEvent.getParameters();
		var aSorters = [];
		this.bFirstCancel = false;
		if (mParams.groupItem) {
			var sPath = mParams.groupItem.getKey();
			var bDescending = mParams.groupDescending;
			var vGroup = this.mGroupFunctions[sPath];
			aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
		}
		var sSrtPath = mParams.sortItem.getKey();
		var bSrtDescending = mParams.sortDescending;
		aSorters.push(new sap.ui.model.Sorter(sSrtPath, bSrtDescending));

		var aFilters = [];
		var oSearchVal = this.byId("page").getSubHeader().getContentMiddle()[0].getValue();
		jQuery.each(mParams.filterItems, function(i, oItem) {
			var sValue1;
			var sFilPath = oItem.getKey();
			var sOperator = sap.ui.model.FilterOperator.EQ;
			if (sFilPath === "ProgramOfStudyId") {
				sValue1 = oItem.getBindingContext().getObject().ProgramId;
				if (sValue1 === "00000001") {
					return true;
				}
			} else if (sFilPath === "StudentStatus") {
				sValue1 = oItem.getBindingContext().getObject().StudentStatusId;
				if (sValue1 === "ALL1") {
					return true;
				}
			} else if (sFilPath === "HoldStatus") {
				sValue1 = oItem.getBindingContext().getObject().HoldStatusId;
				if (sValue1 === "B") {
					return true;
				}
			}
			var oFilter = new sap.ui.model.Filter(sFilPath, sOperator, sValue1);
			aFilters.push(oFilter);
		});
		if (oSearchVal) {
			var oSearchFil = new sap.ui.model.Filter("SearchText", sap.ui.model.FilterOperator.Contains, oSearchVal);
			aFilters.push(oSearchFil);
		}
		
		this.aSorterLoad = aSorters;
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: aFilters,
			sorter: aSorters
		});

		if (mParams.filterString !== "") {
			this.byId("idFilterBar").setVisible(true);
			this.byId("idFilterLabel").setText(mParams.filterString);
		} else {
			this.byId("idFilterBar").setVisible(false);
		}
	},

	onCancelViewSettingsDialog: function() {
		if (this.bFirstCancel) {
			var aFilItems = this.oViewSettingsDialog.getFilterItems()[1].getItems();
			for (var i = 0; i < aFilItems.length; i++) {
				if (aFilItems[i].getText() === "Attending") {
					aFilItems[i].setSelected(true);
				}
			}
			this.bFirstCancel = false;
		}
	}
});