/*
 * Copyright (C) 2009-2016 SAP SE or an SAP affiliate company. All rights reserved.
 */
jQuery.sap.require("sap.ca.scfld.md.controller.BaseDetailController");
jQuery.sap.require("ean.edu.asesor.s1.util.Formatter");
jQuery.sap.require("sap.m.MessageBox");
jQuery.sap.require("sap.m.MessageToast");
sap.ca.scfld.md.controller.BaseDetailController.extend("ean.edu.asesor.s1.view.S3", {
	onInit: function() {
		this.oResBundle = this.oApplicationFacade.getResourceBundle();
		this.oObjHdr = this.byId("objectHeader");
		this.sNteKey = "";
		this.actFlag = false;
		this.blkFlag = false;
		this.acadFlag = false;
		this.advsrFlag = false;
		this.oActJson = false;
		this.oStudentJson = false;
		this.oHoldJson = false;
		this.bFirstLoad = true;
		this.oActivityTble = this.byId("idActivityTble");
		this.oActivityTbleItm = this.byId("idActivityTbleItm").clone();
		this.oHoldsLst = this.byId("idHoldsTble");
		this.oHoldsLstItm = this.byId("idHoldsTbleItm").clone();
		this.oAdvisoryLst = this.byId("idFeedLst");
		this.oAdvisoryLstItm = this.byId("idFeedLstItm").clone();
		this.objHdr = this.byId("objectHeader");
		this.oAcademicTble = this.byId("idAcademicTble");
		this.mGroupFunctions = {
			AcadYearSess: function(c) {
				var y = c.getProperty("AcadYearTxt"),
					s = c.getProperty("AcadSessionTxt"),
					r = c.getProperty("PerResult"),
					T = y + " " + s + ": " + r,
					k = c.getProperty("AcadYearSess");
				return {
					key: k,
					text: T
				};
			}
		};
		this.oRouter.attachRoutePatternMatched(function(e) {
			if (e.getParameter("name") === "detail") {
				this.actFlag = false;
				this.blkFlag = false;
				this.acadFlag = false;
				this.advsrFlag = false;
				this.oActJson = false;
				this.oStudentJson = false;
				this.oHoldJson = false;
				var s = e.getParameter("arguments").objectId,
					p = e.getParameter("arguments").prgmId;
				var o = "/AdviseeHeaderSet(StudentNumber='" + s + "',ProgramID='" + p + "')";
				this._bindView(o);
				var i = this.byId("iconTabBar");
				var I = i.setSelectedKey("academicTab");
				I.setExpanded(true);
			}
		}, this);
		var t = this;
		this.oHeaderFooterOptions = {
			oEditBtn: {
				sId: "idTrkbtn",
				sI18nBtnTxt: "TRACK_DEGREE",
				onBtnPressed: function(e) {
					t.triggerAction(e);
				},
				bEnabled: false
			},
			additionalShareButtonList: [{
				sI18nBtnTxt: "EXPORT_TO_PDF",
				sIcon: "sap-icon://download",
				onBtnPressed: function(e) {
					jQuery.sap.log.info("share button 1 pressed " + e);
					if (!t.exportDialog) {
						t.exportDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ExportDialog", t);
						t.getView().addDependent(t.exportDialog);
					}
					t.exportDialog.setModel(t.getView().getModel());
					t.exportDialog.open();
					t.refreshExprtDialog();
				}
			}]
		};
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);
		
		var o = {
	      bSuppressBookmarkButton: true
		  };
		  this.setHeaderFooterOptions(o);
	},
	bindHldComboBx: function() {
		if (!this.oHldJson) {
			var p = {
				success: function(r) {
					this.oHldJson = new sap.ui.model.json.JSONModel();
					this.oHldJson.setData(r);
					this.byId("idHldComboBx").setModel(this.oHldJson, "holdModel");
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/HoldOtypeSet", p);
		}
	},
	bindActvtyComboBx: function() {
		if (!this.ooActvtyJson) {
			var p = {
				success: function(r) {
					this.ooActvtyJson = new sap.ui.model.json.JSONModel();
					var a = {
						ActivityListDesc: this.oResBundle.getText("ALL_ACTIVITIES"),
						ActivityListType: "0000"
					};
					r.results.splice(0, 0, a);
					this.ooActvtyJson.setData(r);
					this.byId("idActvtyComboBx").setModel(this.ooActvtyJson, "activityModel");
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/ActivityTypeSet", p);
		}
	},
	handleExprtCancel: function() {
		this.exportDialog.close();
	},
	triggerAction: function() {
		var s = this.oResponse.StudentNumber;
		var p = this.oResponse.ProgramID;
		if (sap.ushell.Container) {
			var c = sap.ushell.Container.getService("CrossApplicationNavigation");
			c.toExternal({
				target: {
					semanticObject: "Student",
					action: "displayfac"
				},
				params: {
					objectId: s,
					progId: p
				}
			});
		}
	},
	_bindView: function(o) {
		this.getView().setBusy(true);
		var p = {
			filters: null,
			urlParameters: {
				"$expand": "Courses,PreviousResults"
			},
			success: function(r) {
				var a = [];
				var A = [];
				// this.setBtnEnabled(true);
				this.setBtnEnabled(false);
				this.getPage().getFooter().getContentRight()[0].setVisible(false);
				this.oResponse = r;
				if (r.DegreeAuditInd !== "X") {
					this.getPage().getFooter().getContentRight()[0].setVisible(false);
				}
				var b = new sap.ui.model.json.JSONModel();
				b.setData(r);
				this.objHdr.setModel(b);
				var P = r.PreviousResults;
				var c = new sap.ui.model.json.JSONModel();
				c.setData(P);
				this.byId("oPrevResId").setModel(c, "oResModel");
				var O = r.Courses;
				var d = new sap.ui.model.json.JSONModel();
				d.setData(O);
				this.byId("idAcademicTble").setModel(d, "oCrseModel");
				var e = {
					items: []
				};
				var f = {
					items: []
				};
				jQuery.each(O.results, function(i, I) {
					if (jQuery.inArray(I.AcadYear, a) === -1) {
						a.push(I.AcadYear);
						e.items.push({
							"id": I.AcadYear,
							"acadYear": I.AcadYearTxt
						});
					}
				});
				jQuery.each(O.results, function(i, I) {
					if (jQuery.inArray(I.AcadSession, A) === -1) {
						A.push(I.AcadSession);
						f.items.push({
							"id": I.AcadSession,
							"acadSessn": I.AcadSessionTxt
						});
					}
				});
				var g = new sap.ui.model.json.JSONModel();
				var h = {
					"id": "00",
					"acadYear": this.oResBundle.getText("LBL_ALL")
				};
				e.items.splice(0, 0, h);
				g.setData(e);
				this.getView().setModel(g, "oAcadYearrModel");
				var j = new sap.ui.model.json.JSONModel();
				var k = {
					"id": "00",
					"acadSessn": this.oResBundle.getText("LBL_ALL")
				};
				f.items.splice(0, 0, k);
				j.setData(f);
				this.getView().setModel(j, "oAcadSesionModel");
				var R = r.Courses.results[0];
				var s = this.oResBundle.getText("CURR_OVERALL_RESULT") + ":" + " ";
				if (R !== undefined) {
					var l = r.Courses.results[0].OvrAllResult;
					this.byId("idResult").setText(s + l);
					this.byId("idToolBar").setVisible(true);
				} else {
					this.byId("idResult").setText("");
					this.byId("idToolBar").setVisible(false);
				}
				var B = this.oAcademicTble.getBinding("items");
				var S = [];
				var m = "AcadYearSess";
				var D = false;
				var G = this.mGroupFunctions[m];
				S.push(new sap.ui.model.Sorter(m, D, G));
				B.sort(S);
				this.getView().setBusy(false);
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(o, p);
	},
	onTabSelect: function(e) {
		if (e.getParameters().selectedKey === "activityTab" && !this.actFlag) {
			this.ActivityBinding();
		}
		if (e.getParameters().selectedKey === "holdsTab" && !this.blkFlag) {
			this.ListBinding();
		}
		if (e.getParameters().selectedKey === "advisrTab" && !this.advsrFlag) {
			this.AdvisorBinding();
		}
	},
	AdvisorBinding: function() {
		var p = this.oResponse.ProgramID;
		var s = this.oResponse.StudentNumber;
		var f = new sap.ui.model.Filter("StudentNum", "EQ", s);
		var F = new sap.ui.model.Filter("ProgramId", "EQ", p);
		this.byId("idComboBx").setSelectedKey("0000");
		this.oAdvisoryLst.setBusy(true);
		var P = {
			context: null,
			urlParameters: null,
			async: true,
			filters: [f, F],
			sorters: null,
			success: function(r) {
				var a = new sap.ui.model.json.JSONModel();
				a.setData(r);
				this.oAdvisoryLst.setModel(a, "oAdvModel");
				this.oAdvisoryLst.setBusy(false);
				this.advsrFlag = true;
				var n = [];
				var N = {
					items: []
				};
				jQuery.each(r.results, function(i, I) {
					if (jQuery.inArray(I.NoteType, n) === -1) {
						n.push(I.NoteType);
						N.items.push({
							"NoteType": I.NoteType,
							"NoteText": I.NoteTypeText
						});
					}
				});
				var o = new sap.ui.model.json.JSONModel();
				var A = {
					"NoteType": "0000",
					"NoteText": this.oResBundle.getText("ALL_NOTES")
				};
				N.items.splice(0, 0, A);
				o.setData(N);
				this.getView().setModel(o, "oNoteTypeModel");
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/AdvisoryNoteSet", P);
	},
	onAddNteBtnPrss: function() {
		if (!this._noteDialog) {
			this._noteDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.NoteDialog", this);
			this.getView().addDependent(this._noteDialog);
			this.bFrstLoad = true;
			this.bindNteSelect();
		}
		this._noteDialog.setModel(this.getView().getModel());
		this._noteDialog.open();
	},
	handleDialogOpen: function() {
		if (!this.bFrstLoad) {
			this.bDialogOpen = true;
			var s = sap.ui.getCore().byId("idNoteType");
			this.sNteKey = s.getItems()[0].getKey();
			this.onNoteChange();
		}
		if (sap.ui.Device.system.phone) {
			this._noteDialog.setVerticalScrolling(true);
		}
	},
	bindNteSelect: function() {
		var n = {
			success: function(r) {
				var N = new sap.ui.model.json.JSONModel();
				var s = sap.ui.getCore().byId("idNoteType");
				N.setData(r);
				s.setModel(N, "noteTypeModel");
				this.sNteKey = s.getItems()[0].getKey();
				this.onNoteChange();
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/AdvisoryNoteTypeFilterSet", n);
	},
	onHoldsDialogClose: function() {
		this._noteDialog.close();
	},
	ActivityBinding: function() {
		var s = this.oResponse.StudentNumber;
		var f = [];
		f = new sap.ui.model.Filter("StudentNum", "EQ", s);
		this.byId("idActvtyComboBx").setSelectedKey("0000");
		this.oActivityTble.setModel(this.getView().getModel());
		this.oActivityTble.bindAggregation("items", {
			path: '/ActivityInfoSet',
			template: this.oActivityTbleItm,
			filters: f
		});
		this.actFlag = true;
		this.bindActvtyComboBx();
	},
	handleActivityValueHelp: function(e) {
		var i = e.getSource().getValue();
		this.inputId = e.getSource().getId();
		if (!this._valueHelpDialog) {
			this._valueHelpDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ActivityTypeDialog", this);
			this.getView().addDependent(this._valueHelpDialog);
		}
		this._valueHelpDialog.setModel(this.getView().getModel());
		if (this._valueHelpDialog.getBinding("items")) {
			if (i) {
				this.handleActivityTypeFilter(i);
			} else if (this.sSearchValue) {
				this.handleActivityTypeFilter(this.sSearchValue);
			}
		}
		this._valueHelpDialog.open(i);
		if (!i && this.sSearchValue) {
			this._valueHelpDialog._oSearchField.setValue(this.sSearchValue);
		}
		if (!this.oActJson) {
			var o = new sap.ui.model.json.JSONModel();
			var a = sap.ui.getCore().byId("idActivityTypeDialog");
			var b = a._oList.getModel();
			var p = {
				context: null,
				urlParameters: null,
				async: true,
				filters: null,
				sorters: null,
				success: jQuery.proxy(function(d) {
					this.oActJson = true;
					var A = {
						ActivityListDesc: this.oResBundle.getText("ALL_ACTIVITIES"),
						ActivityListType: "0000"
					};
					var I = this.byId("idActvty").getValue();
					d.results.splice(0, 0, A);
					o.setData(d);
					a.setModel(o, "actModel");
					a._oList.setSelectedItem(a._oList.getItems()[0]);
					if (I) {
						this.handleActivityTypeFilter(I);
					}
				}, this),
				error: jQuery.proxy(this.fnError, this)
			};
			b.read("/ActivityTypeSet", p);
		}
	},
	handleActivityTypeFilter: function(i) {
		this._valueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter("ActivityListDesc", sap.ui.model.FilterOperator.Contains, i)]);
	},
	handleActivityDialogConfirm: function(e) {
		var s = e.getParameter("selectedItem"),
			a = s.getKey(),
			S = this.oResponse.StudentNumber,
			f = new sap.ui.model.Filter("StudentNum", sap.ui.model.FilterOperator.EQ, S),
			F = new sap.ui.model.Filter("ActivityType", sap.ui.model.FilterOperator.EQ, a),
			o = [];
		o.push(f, F);
		if (a === "0000") {
			this.ActivityBinding();
		} else {
			this.oActivityTble.bindAggregation("items", {
				path: '/ActivityInfoSet',
				template: this.oActivityTbleItm,
				filters: o
			});
		}
	},
	onTokenDelete: function() {
		this.ActivityBinding();
		if (sap.ui.getCore().byId("idActivityTypeDialog")._oList.getSelectedItem()) {
			sap.ui.getCore().byId("idActivityTypeDialog")._oList.getSelectedItem().setSelected(false);
		}
	},
	ListBinding: function() {
		var p = this.oResponse.ProgramID;
		var s = this.oResponse.StudentNumber;
		var f = new sap.ui.model.Filter("StuNumber", "EQ", s);
		var F = new sap.ui.model.Filter("ProgramId", "EQ", p);
		this.byId("idHldComboBx").setSelectedKey("01");
		this.oHoldsLst.setBusy(true);
		var P = {
			context: null,
			urlParameters: null,
			async: true,
			filters: [f, F],
			sorters: null,
			success: function(r) {
				var h = new sap.ui.model.json.JSONModel();
				h.setData(r);
				this.oHoldsLst.setModel(h, "oHoldModel");
				this.oHoldsLst.setBusy(false);
				this.blkFlag = true;
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/HoldDetailsSet", P);
		this.bindHldComboBx();
	},
	handleTitlePress: function(e) {
		var c = e.getParameter("domRef");
		jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
		var s = "ean.edu.asesor.s1.view.StudentView";
		var S = this.oResponse.StudentNumber;
		var p = this.oResponse.ProgramID;
		if (S !== undefined) {
			var b = jQuery.proxy(function(o) {
				var P = "/AdviseeDetailsSet(StudentNumber='" + S + "',ProgramId='" + p + "')";
				o.bindElement({
					path: P,
					events: {
						change: this.onHeaderChange.bind(this)
					}
				});
			}, this);
			var q = {
				title: this.oResBundle.getText("STUDENT_DETAILS"),
				headerTitle: "{StudentName}",
				headerSubTitle: "{StudentNumber}",
				subViewName: s,
				headerImgURL: "{PhotoURI}",
				oModel: this.oApplicationFacade.getODataModel(),
				afterQvConfigured: b
			};
			var Q = new sap.ca.ui.quickoverview.Quickoverview(q);
			Q.openBy(c);
		}
	},
	onSenderPress: function(e) {
		var c = e.getParameter("domRef");
		jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
		var s = "ean.edu.asesor.s1.view.ContactCardView";
		var r = e.getSource().getBindingContext("oAdvModel").sPath;
		var R = e.getSource().getModel("oAdvModel").getProperty(r),
			p = R.Pernr;
		if (p !== undefined) {
			var b = jQuery.proxy(function(o) {
				var P = "/ContactDetailsSet('" + p + "')";
				o.bindElement({
					path: P
				});
			}, this);
			var q = {
				title: this.oResBundle.getText("ADVISOR"),
				headerTitle: "{Name}",
				headerSubTitle: "{AdvPosition}",
				subViewName: s,
				headerImgURL: "{PhotoUri}",
				oModel: this.oApplicationFacade.getODataModel(),
				afterQvConfigured: b
			};
			var Q = new sap.ca.ui.quickoverview.Quickoverview(q);
			Q.openBy(c);
		}
	},
	onHeaderChange: function(e) {
		var g = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idAdvCntxt"),
			a = e.getSource().getBoundContext().getObject().AdvisingContext,
			v = a.split(";");
		g.destroyContent();
		var G = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idSpecializations"),
			s = e.getSource().getBoundContext().getObject().Specializations,
			S = s.split(";");
		G.destroyContent();
		if (a) {
			var c = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idFrmCntxt");
			c.setVisible(true);
			for (var i = 0; i < v.length; i++) {
				var E = v[i].split(":");
				var o = new sap.m.ObjectAttribute({
					title: E[0],
					text: E[1]
				});
				g.addContent(o);
			}
		}
		if (s) {
			var b = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idFrmSpecs");
			b.setVisible(true);
			for (var j = 0; j < S.length; j++) {
				var d = S[j].split(":");
				var f = new sap.m.ObjectAttribute({
					title: d[0],
					text: d[1]
				});
				G.addContent(f);
			}
		}
	},
	onEmailPress: function(e) {
		sap.m.URLHelper.triggerEmail(e.getSource().getText());
	},
	handleNoteTypeFilter: function(i) {
		this._noteHelpDialog.getBinding("items").filter([new sap.ui.model.Filter("NoteTypeText", sap.ui.model.FilterOperator.Contains, i)]);
	},
	handleHoldTypeFilter: function(i) {
		this._holdHelpDialog.getBinding("items").filter([new sap.ui.model.Filter("HoldOtypeText", sap.ui.model.FilterOperator.Contains, i)]);
	},
	handleHoldDialogConfirm: function(e) {
		var s = e.getParameter("selectedItem"),
			h = s.getKey(),
			S = this.oResponse.StudentNumber,
			p = this.oResponse.ProgramID,
			f = new sap.ui.model.Filter("StuNumber", sap.ui.model.FilterOperator.EQ, S),
			F = new sap.ui.model.Filter("ProgramId", sap.ui.model.FilterOperator.EQ, p),
			o = new sap.ui.model.Filter("HoldOtype", sap.ui.model.FilterOperator.EQ, h);
		if (h === "01") {
			this.ListBinding();
		} else {
			this.oHoldsLst.setBusy(true);
			var P = {
				context: null,
				urlParameters: null,
				async: true,
				filters: [o, f, F],
				sorters: null,
				success: function(r) {
					var H = new sap.ui.model.json.JSONModel();
					H.setData(r);
					this.oHoldsLst.setModel(H, "oHoldModel");
					this.oHoldsLst.setBusy(false);
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/HoldDetailsSet", P);
		}
	},
	onHoldToken: function() {
		this.ListBinding();
		if (sap.ui.getCore().byId("idHoldTypeDialog")._oList.getSelectedItem()) {
			sap.ui.getCore().byId("idHoldTypeDialog")._oList.getSelectedItem().setSelected(false);
		}
	},
	handleNoteDialogConfirm: function(e) {
		var b = this.oAdvisoryLst.getBinding("items"),
			s = e.getParameter("selectedItem"),
			a = s.getKey(),
			f = new sap.ui.model.Filter("NoteType", sap.ui.model.FilterOperator.EQ, a);
		if (a === "0000") {
			this.AdvisorBinding();
		} else {
			b.filter([f]);
		}
	},
	getGroupHeader: function(g) {
		return new sap.m.GroupHeaderListItem({
			title: g.key,
			upperCase: false
		});
	},
	onItemPress: function(e) {
		var c = this.oResponse;
		var b = e.getSource().getBindingContext("oCrseModel").sPath;
		var C = e.getSource().getModel("oCrseModel").getProperty(b);
		this.oRouter.navTo("programDetailPage", {
			StudentNumber: c.StudentNumber,
			ProgramID: c.ProgramID,
			CourseID: C.CourseID,
			AcadYear: C.AcadYear,
			AcadSession: C.AcadSession
		}, true);
	},
	popUpPress: function(e) {
		var r = e.getSource().getBindingContext("oResModel").sPath;
		var R = e.getSource().getModel("oResModel").getProperty(r);
		var i = R.TypeInd;
		if (i === "X") {
			this.testDtlsDialogCall(e, R);
		} else {
			this.transDialogCall(e, R);
		}
	},
	transDialogCall: function(e, r) {
		if (!this.transDialog) {
			this.transDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.Transcript", this);
			this.getView().addDependent(this.transDialog);
		}
		this.transDialog.setModel(this.getView().getModel());
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.transDialog);
		var b = e.getSource();
		this.transDialog.openBy(b);
		var s = r.StudentNumb;
		var t = r.Guid;
		var a = sap.ui.getCore().byId("transPopUpId");
		var u = "/TranscriptDetailsSet";
		u = u + "(StudentNumber='" + s + "',Guid='" + t + "')";
		var p = {
			filters: null,
			urlParameters: {
				"$expand": "Subjects"
			},
			success: function(c) {
				var o = new sap.ui.model.json.JSONModel();
				o.setData(c);
				a.setModel(o);
				var S = c.Subjects;
				var d = new sap.ui.model.json.JSONModel();
				d.setData(S);
				sap.ui.getCore().byId("idSubLst").setModel(d, "oSubModel");
			}.bind(),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(u, p);
	},
	testDtlsDialogCall: function(e, r) {
		if (!this.testDtlsDialog) {
			this.testDtlsDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.TestDetails", this);
			this.getView().addDependent(this.testDtlsDialog);
		}
		this.testDtlsDialog.setModel(this.getView().getModel());
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.testDtlsDialog);
		var b = e.getSource();
		this.testDtlsDialog.openBy(b);
		var s = r.StudentNumb;
		var t = r.Guid;
		var a = sap.ui.getCore().byId("testPopUpId");
		var u = "/TestDetailsSet";
		u = u + "(StudentNumber='" + s + "',Guid='" + t + "')";
		var p = {
			filters: null,
			urlParameters: {
				"$expand": "Subtests"
			},
			success: function(c) {
				var o = new sap.ui.model.json.JSONModel();
				o.setData(c);
				a.setModel(o);
				var S = c.Subtests;
				var d = new sap.ui.model.json.JSONModel();
				d.setData(S);
				sap.ui.getCore().byId("idSubTestLst").setModel(d, "oSubTestModel");
			}.bind(),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(u, p);
	},
	onTestDialogClose: function() {
		this.testDtlsDialog.close();
	},
	onTransDialogClose: function() {
		this.transDialog.close();
	},
	onNoteChange: function(e) {
		var k;
		var s = this.oResponse.StudentNumber;
		var p = this.oResponse.ProgramID;
		var a = sap.ui.getCore().byId("idAcadSessn");
		var A = sap.ui.getCore().byId("idAcadYr");
		var S = sap.ui.getCore().byId("idStage");
		var o = sap.ui.getCore().byId("idSelectSessn");
		var b = sap.ui.getCore().byId("idSelectYr");
		var c = sap.ui.getCore().byId("idSelectStage");
		var n = sap.ui.getCore().byId("idNteTxt");
		if (this.bFrstLoad || this.bDialogOpen) {
			k = this.sNteKey;
			this.bDialogOpen = false;
		} else {
			k = e.getSource().getSelectedKey();
		}
		var u = "/AdvisoryNoteTypeFilterSet(ProgramId='" + p + "',StudentNumber='" + s + "',Notetype='" + k + "')";
		var P = {
			filters: null,
			urlParameters: {
				"$expand": "AcademicStageSet,AcademicYearSet/AcademicSessionSet"
			},
			success: function(r) {
				n.setValue("").setEditable(true);
				this._noteDialog.getBeginButton().setEnabled(false);
				var d = r.AcademicYearSet;
				var f = new sap.ui.model.json.JSONModel();
				f.setData(d);
				b.setModel(f, "oAcadYrModel");
				if (this.bFrstLoad) {
					this.onAcadYrChange();
				}
				if (r.PredefinedFlag === "X") {
					n.setValue(r.NotesText).setEditable(false);
					this._noteDialog.getBeginButton().setEnabled(true);
				}
				var g = r.AcademicStageSet;
				var h = new sap.ui.model.json.JSONModel();
				h.setData(g);
				c.setModel(h, "oAcadStageModel");
				a.setVisible(true).setRequired(false);
				o.setVisible(true);
				A.setVisible(true).setRequired(false);
				b.setVisible(true);
				S.setVisible(true).setRequired(false);
				c.setVisible(true);
				switch (r.AcadSessionSet) {
					case "1":
						a.setVisible(false);
						o.setVisible(false);
						break;
					case "3":
						a.setRequired(true);
						break;
				}
				switch (r.AcadYearSet) {
					case "1":
						A.setVisible(false);
						b.setVisible(false);
						break;
					case "3":
						A.setRequired(true);
						break;
				}
				switch (r.StageSet) {
					case "1":
						S.setVisible(false);
						c.setVisible(false);
						break;
					case "3":
						S.setRequired(true);
						break;
				}
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(u, P);
	},
	onNotesDialogSave: function() {
		var s = sap.ui.getCore().byId("idSelectSessn");
		var S = sap.ui.getCore().byId("idSelectYr");
		var o = sap.ui.getCore().byId("idSelectStage");
		var a = sap.ui.getCore().byId("idNoteType");
		var n = sap.ui.getCore().byId("idNteTxt");
		var d = sap.ui.getCore().byId("idNteDialog");
		var A = "",
			b = "",
			c = "";
		if (s.getVisible()) {
			b = s.getSelectedKey();
		}
		if (S.getVisible()) {
			A = S.getSelectedKey();
		}
		if (o.getVisible()) {
			c = o.getSelectedKey();
		}
		this.getView().setBusy(true);
		var p = {
			success: function(r) {
				this.getView().setBusy(false);
				this._noteDialog.close();
				var e = new sap.ui.model.json.JSONModel();
				e.setData(r.AdvNoteList);
				this.oAdvisoryLst.setModel(e, "oAdvModel");
				n.setValue("");
				d.getBeginButton().setEnabled(false);
				sap.m.MessageToast.show(this.oResBundle.getText("SUCCESS_MES", this.oResponse.StudentName));
				this.refreshSelect();
				this.byId("idComboBx").setSelectedKey("0000");
			}.bind(this),
			error: function(e) {
				d.setBusy(false);
				var E = JSON.parse(e.response.body);
				sap.m.MessageBox.show(E.error.message.value, {
					icon: sap.m.MessageBox.Icon.ERROR,
					title: this.oResBundle.getText("ERROR")
				});
			}.bind()
		};
		this.getView().getModel().create("/CreateAdvisoryNoteSet", {
			StudentNum: this.oResponse.StudentNumber,
			NoteType: a.getSelectedKey(),
			NoteTitle: a.getSelectedItem().getText(),
			NoteText: n.getValue(),
			ProgramId: this.oResponse.ProgramID,
			AcadYear: A,
			AcadSession: b,
			AcadLevel: c,
			AdvNoteList: []
		}, p);
	},
	onNotesDialogClose: function() {
		var n = sap.ui.getCore().byId("idNteTxt");
		var d = sap.ui.getCore().byId("idNteDialog");
		var s = sap.ui.getCore().byId("idNoteType");
		this._noteDialog.close();
		if (s.getSelectedKey() !== "PRE1") {
			n.setValue("");
		}
		d.getBeginButton().setEnabled(false);
		this.refreshSelect();
	},
	handleLiveChange: function(e) {
		var t = e.getParameter("value");
		var p = sap.ui.getCore().byId("idNteDialog");
		p.getBeginButton().setEnabled(t.length > 0);
	},
	refreshSelect: function() {
		var s = sap.ui.getCore().byId("idSelectSessn");
		var S = sap.ui.getCore().byId("idSelectYr");
		var o = sap.ui.getCore().byId("idSelectStage");
		var a = sap.ui.getCore().byId("idNoteType");
		s.setSelectedItem(s.getItems()[0]);
		S.setSelectedItem(S.getItems()[0]);
		o.setSelectedItem(o.getItems()[0]);
		a.setSelectedItem(a.getItems()[0]);
	},
	onAcadYrChange: function(e) {
		var s = sap.ui.getCore().byId("idSelectSessn");
		var a = new sap.ui.model.json.JSONModel();
		var S;
		if (this.bFrstLoad) {
			var o = sap.ui.getCore().byId("idSelectYr");
			S = o.getItems()[0];
			this.bFrstLoad = false;
		} else {
			S = e.getParameter("selectedItem");
		}
		var A = S.getBindingContext("oAcadYrModel").getObject().AcademicSessionSet;
		a.setData(A);
		s.setModel(a, "oAcadSessnModel");
	},
	handleFilter: function() {
		var b = this.oAcademicTble.getBinding("items");
		var a = new sap.ui.model.Filter("AcadYear", "EQ", "2015");
		var A = new sap.ui.model.Filter("AcadSession", "EQ", "002");
		b.filter([a, A]);
	},
	handleExprtOK: function() {
		var s = this.oResponse.StudentNumber,
			p = this.oResponse.ProgramID,
			c = sap.ui.getCore().byId("idCheckBox"),
			a = sap.ui.getCore().byId("idAcadItm"),
			A = sap.ui.getCore().byId("idAdvNtsItm"),
			h = sap.ui.getCore().byId("idHoldsItm"),
			o = sap.ui.getCore().byId("idActvtsItm"),
			b = "Y",
			d = "Y",
			N = "Y",
			H = "Y";
		if (c.getSelected() === true) {
			b = "X";
			d = "X";
			N = "X";
			H = "X";
		} else {
			if (!a.getSelected() && !A.getSelected() && !h.getSelected() && !o.getSelected()) {
				sap.m.MessageBox.warning(this.oResBundle.getText("WARNING_MES"));
				return;
			}
			if (a.getSelected()) {
				d = "X";
			}
			if (A.getSelected()) {
				N = "X";
			}
			if (h.getSelected()) {
				H = "X";
			}
			if (o.getSelected()) {
				b = "X";
			}
		}
		this.exportDialog.close();
		sap.m.URLHelper.redirect("/sap/opu/odata/sap/ZSLCM_PIQ_ADVISEE_DETAILS_SRV/ExportToPdfSet(AdviseeNo='" + s + "',ProgramId='" + p +
			"',ActivitiesFlag='" + b + "',AcademicFlag='" + d + "',NoteFlag='" + N + "',HoldFlag='" + H + "')/$value", true);
	},
	onAcadFilterPress: function() {
		if (!this.filterDialog) {
			this.filterDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ViewSettingsFilterDialog", this);
			this.getView().addDependent(this.filterDialog);
		}
		this.filterDialog.setModel(this.getView().getModel());
		this.filterDialog.open();
	},
	onFilterDialogConfirm: function(e) {
		var p = e.getParameters(),
			b = this.oAcademicTble.getBinding("items"),
			f = [];
		jQuery.each(p.filterItems, function(i, I) {
			var v;
			var F = I.getKey();
			var o = sap.ui.model.FilterOperator.EQ;
			if (F === "AcadYear") {
				v = I.getBindingContext("oAcadYearrModel").getObject().id;
				if (v === "00") {
					return true;
				}
			} else if (F === "AcadSession") {
				v = I.getBindingContext("oAcadSesionModel").getObject().id;
				if (v === "00") {
					return true;
				}
			}
			var a = new sap.ui.model.Filter(F, o, v);
			f.push(a);
		});
		b.filter(f);
	},
	onSelectAll: function(e) {
		var a = sap.ui.getCore().byId("idAcadItm"),
			A = sap.ui.getCore().byId("idAdvNtsItm"),
			h = sap.ui.getCore().byId("idHoldsItm"),
			o = sap.ui.getCore().byId("idActvtsItm");
		if (e.getParameter("selected") === true) {
			a.setSelected(true);
			A.setSelected(true);
			h.setSelected(true);
			o.setSelected(true);
		} else {
			a.setSelected(false);
			A.setSelected(false);
			h.setSelected(false);
			o.setSelected(false);
		}
	},
	onHandleSelect: function(e) {
		var c = sap.ui.getCore().byId("idCheckBox");
		if (e.getParameter("selected") !== true) {
			c.setSelected(false);
		}
	},
	refreshExprtDialog: function() {
		sap.ui.getCore().byId("idAcadItm").setSelected(false);
		sap.ui.getCore().byId("idAdvNtsItm").setSelected(false);
		sap.ui.getCore().byId("idHoldsItm").setSelected(false);
		sap.ui.getCore().byId("idActvtsItm").setSelected(false);
		sap.ui.getCore().byId("idCheckBox").setSelected(false);
	}
});