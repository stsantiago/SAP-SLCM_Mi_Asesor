/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.ScfldMasterController");
jQuery.sap.require("sap.ui.Device");
jQuery.sap.require("ean.edu.asesor.s1.util.Formatter");
sap.ca.scfld.md.controller.ScfldMasterController.extend("ean.edu.asesor.s1.view.S2", {
	getHeaderFooterOptions: function() {
		var t = this;
		return {
			sI18NMasterTitle: "MASTER_TITLE",
			oFilterOptions: {
				bDisabled: false,
				onFilterPressed: jQuery.proxy(function(e) {
					t.handleOpenDialog(e);
				}, this)
			}
		};
	},
	onUpdateFinished: function() {
		if (this.bSearch && this._oList.getSelectedItem()) {
			this._oList.getSelectedItem().setSelected(false);
			this.bSearch = false;
		}
		var l = this._oList.getBinding("items").getLength();
		var m = this.oResBundle.getText("MASTER_TITLE", l);
		this._oControlStore.oMasterTitle.setText(m);
	},
	onInit: function() {
		this._oList = this.byId("list");
		this.oListItem = this.byId("idMstrLstItm").clone();
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		this.bFirstCancel = false;
		this.mGroupFunctions = {
			ProgramOfStudyId: function(c) {
				var p = c.getProperty("ProgramOfStudyText");
				var P = c.getProperty("ProgramOfStudyId");
				return {
					key: P,
					text: p
				};
			},
			HoldStatus: function(c) {
				var h = c.getProperty("HoldstatusText");
				var H = c.getProperty("HoldStatus");
				if (H === "I" || H === "") {
					return {
						key: H,
						text: h
					};
				} else {
					return {
						key: H,
						text: h
					};
				}
			}
		};
		this.aSorterLoad = [new sap.ui.model.Sorter("ProgramOfStudyId", false, function(c) {
			var p = c.getProperty("ProgramOfStudyText");
			var P = c.getProperty("ProgramOfStudyId");
			return {
				key: P,
				text: p
			};
		})];
		// var f = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "CS01");
		var f = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "ALL1");
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: [f],
			sorter: this.aSorterLoad
		});
		var l = this.oResBundle.getText("FILTRD_BY");
		var L = this.oResBundle.getText("STUDENT_STATUS");
		// var s = this.oResBundle.getText("ATTENDING");
		var s = this.oResBundle.getText("LBL_ALL");
		this.byId("idFilterLabel").setText(l + ":" + " " + L + " (" + s + ")");
	},
	handleOpenDialog: function() {
		var f;
		if (!this.oViewSettingsDialog) {
			this.oViewSettingsDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ViewSettingsDialog", this);
			this.getView().addDependent(this.oViewSettingsDialog);
			f = true;
			this.bFirstCancel = true;
		}
		if (f) {
			this.oViewSettingsDialog.setSortDescending(true);
			f = false;
		}
		this.oViewSettingsDialog.open();
		this.oViewSettingsDialog._groupContent[0].setVisible(false);
	},
	getDetailNavigationParameters: function(i) {
		return {
			objectId: i.getBindingContext().getProperty("StudentNumber"),
			prgmId: i.getBindingContext().getProperty("ProgramOfStudyId")
		};
	},
	isBackendSearch: function() {
		return true;
	},
	applyBackendSearchPattern: function(f) {
		var q = f,
			F = [];
		this.oSearchText = q;
		this.bSearch = true;
		if (q && q.length > 0) {
			var o = new sap.ui.model.Filter("SearchText", sap.ui.model.FilterOperator.Contains, q);
			F.push(o);
		}
		if (!this.oViewSettingsDialog) {
			// var a = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "CS01");
			var a = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, "ALL1");
			F.push(a);
		} else {
			var b = this.oViewSettingsDialog.getSelectedFilterItems();
			for (var i = 0; i < b.length; i++) {
				if (b[i].getKey() === "ProgramOfStudyId") {
					var p = b[i].getBindingContext().getObject().ProgramId;
					if (p === "00000001") {
						continue;
					}
					var c = new sap.ui.model.Filter("ProgramOfStudyId", sap.ui.model.FilterOperator.EQ, p);
					F.push(c);
				} else if (b[i].getKey() === "StudentStatus") {
					var s = b[i].getBindingContext().getObject().StudentStatusId;
					if (s === "ALL1") {
						continue;
					}
					var d = new sap.ui.model.Filter("StudentStatus", sap.ui.model.FilterOperator.EQ, s);
					F.push(d);
				} else if (b[i].getKey() === "HoldStatus") {
					var h = b[i].getBindingContext().getObject().HoldStatusId;
					if (h === "B") {
						continue;
					}
					var H = new sap.ui.model.Filter("HoldStatus", sap.ui.model.FilterOperator.EQ, h);
					F.push(H);
				}
			}
		}
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: F,
			sorter: this.aSorterLoad
		});
	},
	onConfirmViewSettingsDialog: function(e) {
		var p = e.getParameters();
		var s = [];
		this.bFirstCancel = false;
		if (p.groupItem) {
			var P = p.groupItem.getKey();
			var d = p.groupDescending;
			var g = this.mGroupFunctions[P];
			s.push(new sap.ui.model.Sorter(P, d, g));
		}
		var S = p.sortItem.getKey();
		var b = p.sortDescending;
		s.push(new sap.ui.model.Sorter(S, b));
		var f = [];
		var o = this.byId("page").getSubHeader().getContentMiddle()[0].getValue();
		jQuery.each(p.filterItems, function(i, I) {
			var v;
			var F = I.getKey();
			var O = sap.ui.model.FilterOperator.EQ;
			if (F === "ProgramOfStudyId") {
				v = I.getBindingContext().getObject().ProgramId;
				if (v === "00000001") {
					return true;
				}
			} else if (F === "StudentStatus") {
				v = I.getBindingContext().getObject().StudentStatusId;
				if (v === "ALL1") {
					return true;
				}
			} else if (F === "HoldStatus") {
				v = I.getBindingContext().getObject().HoldStatusId;
				if (v === "B") {
					return true;
				}
			}
			var c = new sap.ui.model.Filter(F, O, v);
			f.push(c);
		});
		if (o) {
			var a = new sap.ui.model.Filter("SearchText", sap.ui.model.FilterOperator.Contains, o);
			f.push(a);
		}
		this.aSorterLoad = s;
		this._oList.bindAggregation("items", {
			path: '/AdviseesListSet',
			template: this.oListItem,
			filters: f,
			sorter: s
		});
		if (p.filterString !== "") {
			this.byId("idFilterBar").setVisible(true);
			this.byId("idFilterLabel").setText(p.filterString);
		} else {
			this.byId("idFilterBar").setVisible(false);
		}
	},
	onCancelViewSettingsDialog: function() {
		if (this.bFirstCancel) {
			var f = this.oViewSettingsDialog.getFilterItems()[1].getItems();
			for (var i = 0; i < f.length; i++) {
				if (f[i].getText() === "Attending") {
					f[i].setSelected(true);
				}
			}
			this.bFirstCancel = false;
		}
	}
});