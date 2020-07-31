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
			AcadYearSess: function(oContext) {
				var sYear = oContext.getProperty("AcadYearTxt"),
					sSession = oContext.getProperty("AcadSessionTxt"),
					sResult = oContext.getProperty("PerResult"),
					sText = sYear + " " + sSession + ": " + sResult,
					sKey = oContext.getProperty("AcadYearSess");
				return {
					key: sKey,
					text: sText
				};
			}
		};

		this.oRouter.attachRoutePatternMatched(function(oEvent) {
			if (oEvent.getParameter("name") === "detail") {

				this.actFlag = false;
				this.blkFlag = false;
				this.acadFlag = false;
				this.advsrFlag = false;
				this.oActJson = false;
				this.oStudentJson = false;
				this.oHoldJson = false;

				var sStudentNum = oEvent.getParameter("arguments").objectId,
					sPrgmId = oEvent.getParameter("arguments").prgmId;

				var sObjectPath = "/AdviseeHeaderSet(StudentNumber='" + sStudentNum + "',ProgramID='" + sPrgmId + "')";
				this._bindView(sObjectPath);
				var oIconTab = this.byId("iconTabBar");
				var oIconTabFltr = oIconTab.setSelectedKey("academicTab");
				oIconTabFltr.setExpanded(true);
			}
		}, this);
		var that = this;
		this.oHeaderFooterOptions = {
			oEditBtn: {
				sId: "idTrkbtn",
				sI18nBtnTxt: "TRACK_DEGREE",
				onBtnPressed: function(evt) {
					that.triggerAction(evt);
				},
				bEnabled: false // default true
			},
			additionalShareButtonList: [{
				sI18nBtnTxt: "EXPORT_TO_PDF",
				sIcon: "sap-icon://download",
				onBtnPressed: function(evt) {
					jQuery.sap.log.info("share button 1 pressed " + evt);
					if (!that.exportDialog) {
						that.exportDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ExportDialog", that);
						that.getView().addDependent(that.exportDialog);
					}
					that.exportDialog.setModel(that.getView().getModel());
					that.exportDialog.open();
					that.refreshExprtDialog();
				}
			}]
		};
		this.setHeaderFooterOptions(this.oHeaderFooterOptions);
	},

	bindHldComboBx: function() {
		if (!this.oHldJson) {
			var mParameters = {
				success: function(response) {
					this.oHldJson = new sap.ui.model.json.JSONModel();
					this.oHldJson.setData(response);
					this.byId("idHldComboBx").setModel(this.oHldJson, "holdModel");
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/HoldOtypeSet", mParameters);
		}
	},

	bindActvtyComboBx: function() {
		if (!this.ooActvtyJson) {
			var mParameters = {
				success: function(response) {
					this.ooActvtyJson = new sap.ui.model.json.JSONModel();
					var oAllActvts = {
						ActivityListDesc: this.oResBundle.getText("ALL_ACTIVITIES"),
						ActivityListType: "0000"
					};
					response.results.splice(0, 0, oAllActvts);
					this.ooActvtyJson.setData(response);
					this.byId("idActvtyComboBx").setModel(this.ooActvtyJson, "activityModel");
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/ActivityTypeSet", mParameters);
		}
	},

	handleExprtCancel: function() {
		this.exportDialog.close();
	},

	triggerAction: function() {

		var sStudentNum = this.oResponse.StudentNumber;
		var sProgramId = this.oResponse.ProgramID;

		if (sap.ushell.Container) {
			var oCNav = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCNav.toExternal({
				target: {
					semanticObject: "Student",
					action: "displayfac"
				},
				params: {
					objectId: sStudentNum,
					progId: sProgramId
				}
			});
		}
	},

	_bindView: function(sObjectPath) {

		this.getView().setBusy(true);
		var mParameters = {
			filters: null,
			urlParameters: {
				"$expand": "Courses,PreviousResults"
			},
			success: function(response) {
				var aAcadYr = [];
				var aAcadSessn = [];
				//var sId = this.oHeaderFooterOptions.oEditBtn.getId();
				this.setBtnEnabled(true);
				this.getPage().getFooter().getContentRight()[0].setVisible(true);
				this.oResponse = response;
				if (response.DegreeAuditInd !== "X") {
					//this.setBtnEnabled(sId, false);
					this.getPage().getFooter().getContentRight()[0].setVisible(false);
				}

				var ooAct = new sap.ui.model.json.JSONModel();
				ooAct.setData(response);
				this.objHdr.setModel(ooAct);

				var aPreviousResults = response.PreviousResults;
				var oActTypeJson = new sap.ui.model.json.JSONModel();
				oActTypeJson.setData(aPreviousResults);
				this.byId("oPrevResId").setModel(oActTypeJson, "oResModel");

				var aOverAllResults = response.Courses;
				var ooActTypeJson = new sap.ui.model.json.JSONModel();
				ooActTypeJson.setData(aOverAllResults);
				this.byId("idAcademicTble").setModel(ooActTypeJson, "oCrseModel");

				var oAcadYear = {
					items: []
				};
				var oAcadSessn = {
					items: []
				};
				jQuery.each(aOverAllResults.results, function(i, oItem) {
					if (jQuery.inArray(oItem.AcadYear, aAcadYr) === -1) {
						aAcadYr.push(oItem.AcadYear);
						oAcadYear.items.push({
							"id": oItem.AcadYear,
							"acadYear": oItem.AcadYearTxt
						});
					}
				});
				jQuery.each(aOverAllResults.results, function(i, oItem) {
					if (jQuery.inArray(oItem.AcadSession, aAcadSessn) === -1) {
						aAcadSessn.push(oItem.AcadSession);
						oAcadSessn.items.push({
							"id": oItem.AcadSession,
							"acadSessn": oItem.AcadSessionTxt
						});
					}
				});
				var oAcadYrJson = new sap.ui.model.json.JSONModel();
				var oAll = {
					"id": "00",
					"acadYear": this.oResBundle.getText("LBL_ALL")
				};
				oAcadYear.items.splice(0, 0, oAll);
				oAcadYrJson.setData(oAcadYear);
				this.getView().setModel(oAcadYrJson, "oAcadYearrModel");

				var oAcadSessnJson = new sap.ui.model.json.JSONModel();
				var oAllSessn = {
					"id": "00",
					"acadSessn": this.oResBundle.getText("LBL_ALL")
				};
				oAcadSessn.items.splice(0, 0, oAllSessn);
				oAcadSessnJson.setData(oAcadSessn);
				this.getView().setModel(oAcadSessnJson, "oAcadSesionModel");

				var sResultPath = response.Courses.results[0];
				var sResTxt = this.oResBundle.getText("CURR_OVERALL_RESULT") + ":" + " ";
				if (sResultPath !== undefined) {
					var sOvrAllRslt = response.Courses.results[0].OvrAllResult;
					this.byId("idResult").setText(sResTxt + sOvrAllRslt);
					this.byId("idToolBar").setVisible(true);
				} else {
					this.byId("idResult").setText("");
					this.byId("idToolBar").setVisible(false);
				}

				var oBinding = this.oAcademicTble.getBinding("items");
				var aSorters = [];
				var sPath = "AcadYearSess";
				var bDescending = false;
				var vGroup = this.mGroupFunctions[sPath];
				aSorters.push(new sap.ui.model.Sorter(sPath, bDescending, vGroup));
				oBinding.sort(aSorters);
				this.getView().setBusy(false);
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
				//this.getView().setBusy(false);
			}.bind()
		};
		this.getView().getModel().read(sObjectPath, mParameters);
	},

	onTabSelect: function(oEvent) {
		if (oEvent.getParameters().selectedKey === "activityTab" && !this.actFlag) {
			this.ActivityBinding();
		}
		if (oEvent.getParameters().selectedKey === "holdsTab" && !this.blkFlag) {
			this.ListBinding();
		}
		if (oEvent.getParameters().selectedKey === "advisrTab" && !this.advsrFlag) {
			this.AdvisorBinding();
		}
	},

	AdvisorBinding: function() {
		var oPgmStudyId = this.oResponse.ProgramID;
		var sStudentNum = this.oResponse.StudentNumber;
		var oFilStdNbr = new sap.ui.model.Filter("StudentNum", "EQ", sStudentNum);
		var oFilPgrmId = new sap.ui.model.Filter("ProgramId", "EQ", oPgmStudyId);
		this.byId("idComboBx").setSelectedKey("0000");
		this.oAdvisoryLst.setBusy(true);
		var mParameters = {
			context: null,
			urlParameters: null,
			async: true,
			filters: [oFilStdNbr, oFilPgrmId],
			sorters: null,
			success: function(response) {
				var oAdvJson = new sap.ui.model.json.JSONModel();
				oAdvJson.setData(response);
				this.oAdvisoryLst.setModel(oAdvJson, "oAdvModel");
				this.oAdvisoryLst.setBusy(false);
				this.advsrFlag = true;
				
				var aNteType = [];
				var oNoteType = {items: []};
				jQuery.each(response.results, function(i, oItem) {
					if (jQuery.inArray(oItem.NoteType, aNteType) === -1) {
						aNteType.push(oItem.NoteType);
						oNoteType.items.push({
							"NoteType": oItem.NoteType,
							"NoteText": oItem.NoteTypeText
						});
					}
				});
				var oNteTypeJson = new sap.ui.model.json.JSONModel();
				var oAll = {
					"NoteType": "0000",
					"NoteText": this.oResBundle.getText("ALL_NOTES")
				};
				oNoteType.items.splice(0, 0, oAll);
				oNteTypeJson.setData(oNoteType);
				this.getView().setModel(oNteTypeJson, "oNoteTypeModel");
				
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/AdvisoryNoteSet", mParameters);
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
			var oSlctNte = sap.ui.getCore().byId("idNoteType");
			this.sNteKey = oSlctNte.getItems()[0].getKey();
			this.onNoteChange();
		}

		if (sap.ui.Device.system.phone) {
			this._noteDialog.setVerticalScrolling(true);
		}
	},

	bindNteSelect: function() {

		var mNteParameters = {
			success: function(response) {
				var oNoteTypeJson = new sap.ui.model.json.JSONModel();
				var oSlctNte = sap.ui.getCore().byId("idNoteType");
				oNoteTypeJson.setData(response);
				oSlctNte.setModel(oNoteTypeJson, "noteTypeModel");
				this.sNteKey = oSlctNte.getItems()[0].getKey();
				this.onNoteChange();
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/AdvisoryNoteTypeFilterSet", mNteParameters);
	},

	onHoldsDialogClose: function() {
		this._noteDialog.close();
	},

	ActivityBinding: function() {
		var sStudNumber = this.oResponse.StudentNumber;
		var oFilStdNbr = [];
		oFilStdNbr = new sap.ui.model.Filter("StudentNum", "EQ", sStudNumber);
		this.byId("idActvtyComboBx").setSelectedKey("0000");
		
		this.oActivityTble.setModel(this.getView().getModel());
		this.oActivityTble.bindAggregation("items", {
					path: '/ActivityInfoSet',
					template: this.oActivityTbleItm,
					filters: oFilStdNbr
		});
		this.actFlag = true;
		this.bindActvtyComboBx();
	},

	handleActivityValueHelp: function(oEvent) {
		var sInputValue = oEvent.getSource().getValue();

		this.inputId = oEvent.getSource().getId();
		if (!this._valueHelpDialog) {
			this._valueHelpDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ActivityTypeDialog", this);
			this.getView().addDependent(this._valueHelpDialog);
		}
		this._valueHelpDialog.setModel(this.getView().getModel());

		if (this._valueHelpDialog.getBinding("items")) {
			if (sInputValue) {
				this.handleActivityTypeFilter(sInputValue);
			} else if (this.sSearchValue) {
				this.handleActivityTypeFilter(this.sSearchValue);
			}
		}

		this._valueHelpDialog.open(sInputValue);
		if (!sInputValue && this.sSearchValue) {
			this._valueHelpDialog._oSearchField.setValue(this.sSearchValue);
		}

		if (!this.oActJson) {
			var ooActJson = new sap.ui.model.json.JSONModel();
			var actItemId = sap.ui.getCore().byId("idActivityTypeDialog");
			var actModel = actItemId._oList.getModel();
			var mParameter = {
				context: null,
				urlParameters: null,
				async: true,
				filters: null,
				sorters: null,
				success: jQuery.proxy(function(oData) {
					this.oActJson = true;
					var oAll = {
						ActivityListDesc: this.oResBundle.getText("ALL_ACTIVITIES"),
						ActivityListType: "0000"
					};
					var sInputVal = this.byId("idActvty").getValue();
					oData.results.splice(0, 0, oAll);
					ooActJson.setData(oData);
					actItemId.setModel(ooActJson, "actModel");
					actItemId._oList.setSelectedItem(actItemId._oList.getItems()[0]);
					if (sInputVal) {
						this.handleActivityTypeFilter(sInputVal);
					}
				}, this),
				error: jQuery.proxy(
					this.fnError, this)
			};
			actModel.read("/ActivityTypeSet", mParameter);
		}
	},

	handleActivityTypeFilter: function(sInputValue) {
		this._valueHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
			"ActivityListDesc", sap.ui.model.FilterOperator.Contains, sInputValue)]);
	},

	handleActivityDialogConfirm: function(oEvent) {
		var oSeltdItm = oEvent.getParameter("selectedItem"),
			sActivityType = oSeltdItm.getKey(),
			sStudNumber = this.oResponse.StudentNumber,
			oFilStdNbr = new sap.ui.model.Filter("StudentNum", sap.ui.model.FilterOperator.EQ, sStudNumber),
			oFilterItm = new sap.ui.model.Filter("ActivityType", sap.ui.model.FilterOperator.EQ, sActivityType),
			oFilter = [];
		oFilter.push(oFilStdNbr, oFilterItm);
		if (sActivityType === "0000") {
			this.ActivityBinding();
		} else {
			this.oActivityTble.bindAggregation("items", {
					path: '/ActivityInfoSet',
					template: this.oActivityTbleItm,
					filters: oFilter
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
		var oPgmStudyId = this.oResponse.ProgramID;
		var sStudentNum = this.oResponse.StudentNumber;
		var oFilStdNbr = new sap.ui.model.Filter("StuNumber", "EQ", sStudentNum);
		var oFilPgrmId = new sap.ui.model.Filter("ProgramId", "EQ", oPgmStudyId);
		this.byId("idHldComboBx").setSelectedKey("01");
		this.oHoldsLst.setBusy(true);
		var mParameters = {
			context: null,
			urlParameters: null,
			async: true,
			filters: [oFilStdNbr, oFilPgrmId],
			sorters: null,
			success: function(response) {
				var oHoldJson = new sap.ui.model.json.JSONModel();
				oHoldJson.setData(response);
				this.oHoldsLst.setModel(oHoldJson, "oHoldModel");
				this.oHoldsLst.setBusy(false);
				this.blkFlag = true;
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read("/HoldDetailsSet", mParameters);
		this.bindHldComboBx();
	},

	handleTitlePress: function(oEvent) {
		var oControl = oEvent.getParameter("domRef");
		jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
		var sSubViewName = "ean.edu.asesor.s1.view.StudentView";
		var sStudNumber = this.oResponse.StudentNumber;
		var sPrgmId = this.oResponse.ProgramID;
		if (sStudNumber !== undefined) {
			var fnBindContextToInstructor = jQuery.proxy(function(oQVView) {
				var sPath = "/AdviseeDetailsSet(StudentNumber='" + sStudNumber + "',ProgramId='" + sPrgmId + "')";
				oQVView.bindElement({
					path: sPath,
					events: {
						change: this.onHeaderChange.bind(this)
					}
				});
			}, this);
			var oQVConfig = {
				title: this.oResBundle.getText("STUDENT_DETAILS"),
				headerTitle: "{StudentName}",
				headerSubTitle: "{StudentNumber}",
				subViewName: sSubViewName,
				headerImgURL: "{PhotoURI}",
				oModel: this.oApplicationFacade.getODataModel(),
				afterQvConfigured: fnBindContextToInstructor
				/*,
		                popoverHeight : '32em'*/
			};
			var oQuickoverview = new sap.ca.ui.quickoverview.Quickoverview(oQVConfig);
			oQuickoverview.openBy(oControl);
		}
	},

	onSenderPress: function(oEvent) {
		var oControl = oEvent.getParameter("domRef");
		jQuery.sap.require("sap.ca.ui.quickoverview.Quickoverview");
		var sSubViewName = "ean.edu.asesor.s1.view.ContactCardView";
		var sResPath = oEvent.getSource().getBindingContext("oAdvModel").sPath;
		var oResObj = oEvent.getSource().getModel("oAdvModel").getProperty(sResPath),
			sPernr = oResObj.Pernr;

		if (sPernr !== undefined) {
			var fnBindContextToInstructor = jQuery.proxy(function(oQVView) {
				var sPath = "/ContactDetailsSet('" + sPernr + "')";
				oQVView.bindElement({
					path: sPath
				});
			}, this);
			var oQVConfig = {
				title: this.oResBundle.getText("ADVISOR"),
				headerTitle: "{Name}",
				headerSubTitle: "{AdvPosition}",
				subViewName: sSubViewName,
				headerImgURL: "{PhotoUri}",
				oModel: this.oApplicationFacade.getODataModel(),
				afterQvConfigured: fnBindContextToInstructor
				/*,
		                popoverHeight : '32em'*/
			};
			var oQuickoverview = new sap.ca.ui.quickoverview.Quickoverview(oQVConfig);
			oQuickoverview.openBy(oControl);
		}
	},

	onHeaderChange: function(oEvent) {

		var oGrpItm = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idAdvCntxt"),
			sAdvCntxt = oEvent.getSource().getBoundContext().getObject().AdvisingContext,
			aVals = sAdvCntxt.split(";");
		oGrpItm.destroyContent();

		var oGrpItmSpec = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idSpecializations"),
			sSpecs = oEvent.getSource().getBoundContext().getObject().Specializations,
			aSpecvals = sSpecs.split(";");
		oGrpItmSpec.destroyContent();
		if (sAdvCntxt) {
			var oCntxt = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idFrmCntxt");
			oCntxt.setVisible(true);
			for (var i = 0; i < aVals.length; i++) {
				var aElement = aVals[i].split(":");
				var oGrpElement = new sap.m.ObjectAttribute({
					title: aElement[0],
					text: aElement[1]
				});
				oGrpItm.addContent(oGrpElement);
			}
		}
		if (sSpecs) {
			var oSpecs = sap.ui.getCore().byId("ean.edu.asesor.s1.view.StudentView--idFrmSpecs");
			oSpecs.setVisible(true);
			for (var j = 0; j < aSpecvals.length; j++) {
				var aSpecElement = aSpecvals[j].split(":");
				var oGrpSpecElement = new sap.m.ObjectAttribute({
					title: aSpecElement[0],
					text: aSpecElement[1]
				});
				oGrpItmSpec.addContent(oGrpSpecElement);
			}
		}
	},

	onEmailPress: function(oEvt) {
		sap.m.URLHelper.triggerEmail(oEvt.getSource().getText());
	},

	handleNoteTypeFilter: function(sInputValue) {
		this._noteHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
			"NoteTypeText", sap.ui.model.FilterOperator.Contains, sInputValue)]);
	},

	handleHoldTypeFilter: function(sInputValue) {
		this._holdHelpDialog.getBinding("items").filter([new sap.ui.model.Filter(
			"HoldOtypeText", sap.ui.model.FilterOperator.Contains, sInputValue)]);
	},

	handleHoldDialogConfirm: function(oEvent) {
		var oSeltdItm = oEvent.getParameter("selectedItem"),
			sHoldType = oSeltdItm.getKey(),
			sStudNumber = this.oResponse.StudentNumber,
			sPrgmID = this.oResponse.ProgramID,
			oFilStdNbr = new sap.ui.model.Filter("StuNumber", sap.ui.model.FilterOperator.EQ, sStudNumber),
			oFilPgmID = new sap.ui.model.Filter("ProgramId", sap.ui.model.FilterOperator.EQ, sPrgmID),
			oFilterItm = new sap.ui.model.Filter("HoldOtype", sap.ui.model.FilterOperator.EQ, sHoldType);

		if (sHoldType === "01") {
			this.ListBinding();
		} else {
			this.oHoldsLst.setBusy(true);
			var mParameters = {
				context: null,
				urlParameters: null,
				async: true,
				filters: [oFilterItm, oFilStdNbr, oFilPgmID],
				sorters: null,
				success: function(response) {
					var oHoldJson = new sap.ui.model.json.JSONModel();
					oHoldJson.setData(response);
					this.oHoldsLst.setModel(oHoldJson, "oHoldModel");
					this.oHoldsLst.setBusy(false);
				}.bind(this),
				error: function() {
					jQuery.sap.log.info("Odata Error occured");
				}.bind()
			};
			this.getView().getModel().read("/HoldDetailsSet", mParameters);
		}
	},

	onHoldToken: function() {
		this.ListBinding();
		if (sap.ui.getCore().byId("idHoldTypeDialog")._oList.getSelectedItem()) {
			sap.ui.getCore().byId("idHoldTypeDialog")._oList.getSelectedItem().setSelected(false);
		}
	},

	handleNoteDialogConfirm: function(oEvent) {
		var oBinding = this.oAdvisoryLst.getBinding("items"),
			oSeltdItm = oEvent.getParameter("selectedItem"),
			sActivityType = oSeltdItm.getKey(),
			oFilterItm = new sap.ui.model.Filter("NoteType", sap.ui.model.FilterOperator.EQ, sActivityType);

		if (sActivityType === "0000") {
			this.AdvisorBinding();
		} else {
			oBinding.filter([oFilterItm]);
		}
	},

	getGroupHeader: function(oGroup) {
		return new sap.m.GroupHeaderListItem({
			title: oGroup.key,
			upperCase: false
		});
	},

	onItemPress: function(oEvent) {
		var oContext = this.oResponse;
		var sBndgPath = oEvent.getSource().getBindingContext("oCrseModel").sPath;
		var oCrseObj = oEvent.getSource().getModel("oCrseModel").getProperty(sBndgPath);
		this.oRouter.navTo("programDetailPage", {
			StudentNumber: oContext.StudentNumber,
			ProgramID: oContext.ProgramID,
			CourseID: oCrseObj.CourseID,
			AcadYear: oCrseObj.AcadYear,
			AcadSession: oCrseObj.AcadSession
		}, true);
	},

	popUpPress: function(oEvent) {
		var sResPath = oEvent.getSource().getBindingContext("oResModel").sPath;
		var oResObj = oEvent.getSource().getModel("oResModel").getProperty(sResPath);
		var oIndicator = oResObj.TypeInd;
		if (oIndicator === "X") {
			this.testDtlsDialogCall(oEvent, oResObj);
		} else {
			this.transDialogCall(oEvent, oResObj);
		}
	},

	transDialogCall: function(oEvent, oResObj) {
		if (!this.transDialog) {
			this.transDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.Transcript", this);
			this.getView().addDependent(this.transDialog);
		}
		this.transDialog.setModel(this.getView().getModel());
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.transDialog);
		var oButton = oEvent.getSource();
		this.transDialog.openBy(oButton);
		var oStuNum = oResObj.StudentNumb;
		var oTransGuid = oResObj.Guid;
		var actItemId = sap.ui.getCore().byId("transPopUpId");
		var url = "/TranscriptDetailsSet";
		url = url + "(StudentNumber='" + oStuNum + "',Guid='" + oTransGuid + "')";
		var mParameters = {
			filters: null,
			urlParameters: {
				"$expand": "Subjects"
			},
			success: function(response) {
				var ooAct = new sap.ui.model.json.JSONModel();
				ooAct.setData(response);
				actItemId.setModel(ooAct);

				var aSubjects = response.Subjects;
				var oSubJson = new sap.ui.model.json.JSONModel();
				oSubJson.setData(aSubjects);
				sap.ui.getCore().byId("idSubLst").setModel(oSubJson, "oSubModel");
			}.bind(),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(url, mParameters);
	},

	testDtlsDialogCall: function(oEvent, oResObj) {
		if (!this.testDtlsDialog) {
			this.testDtlsDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.TestDetails", this);
			this.getView().addDependent(this.testDtlsDialog);
		}
		this.testDtlsDialog.setModel(this.getView().getModel());
		jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this.testDtlsDialog);
		var oButton = oEvent.getSource();
		this.testDtlsDialog.openBy(oButton);
		var oStuNum = oResObj.StudentNumb;
		var oTransGuid = oResObj.Guid;
		var actItemId = sap.ui.getCore().byId("testPopUpId");
		var url = "/TestDetailsSet";
		url = url + "(StudentNumber='" + oStuNum + "',Guid='" + oTransGuid + "')";
		var mParameters = {
			filters: null,
			urlParameters: {
				"$expand": "Subtests"
			},
			success: function(response) {
				var ooAct = new sap.ui.model.json.JSONModel();
				ooAct.setData(response);
				actItemId.setModel(ooAct);

				var aSubTests = response.Subtests;
				var oSubTestJson = new sap.ui.model.json.JSONModel();
				oSubTestJson.setData(aSubTests);
				sap.ui.getCore().byId("idSubTestLst").setModel(oSubTestJson, "oSubTestModel");
			}.bind(),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(url, mParameters);
	},

	onTestDialogClose: function() {
		this.testDtlsDialog.close();
	},

	onTransDialogClose: function() {
		this.transDialog.close();
	},

	onNoteChange: function(oEvent) {

		var sKey;
		var sStudNumber = this.oResponse.StudentNumber;
		var sPrgmID = this.oResponse.ProgramID;
		var oAcadSessn = sap.ui.getCore().byId("idAcadSessn");
		var oAcadYr = sap.ui.getCore().byId("idAcadYr");
		var oStage = sap.ui.getCore().byId("idStage");
		var oSelectSessn = sap.ui.getCore().byId("idSelectSessn");
		var oSelectYr = sap.ui.getCore().byId("idSelectYr");
		var oSelectStage = sap.ui.getCore().byId("idSelectStage");
		var oNoteText = sap.ui.getCore().byId("idNteTxt");
		if (this.bFrstLoad || this.bDialogOpen) {
			sKey = this.sNteKey;
			this.bDialogOpen = false;
		} else {
			sKey = oEvent.getSource().getSelectedKey();
		}
		var sURL = "/AdvisoryNoteTypeFilterSet(ProgramId='" + sPrgmID + "',StudentNumber='" + sStudNumber + "',Notetype='" + sKey + "')";

		var mParameters = {
			filters: null,
			urlParameters: {
				"$expand": "AcademicStageSet,AcademicYearSet/AcademicSessionSet"
			},
			success: function(response) {
				oNoteText.setValue("").setEditable(true);
				this._noteDialog.getBeginButton().setEnabled(false);

				var aAcadYr = response.AcademicYearSet;
				var oAcadYrJson = new sap.ui.model.json.JSONModel();
				oAcadYrJson.setData(aAcadYr);
				oSelectYr.setModel(oAcadYrJson, "oAcadYrModel");

				if (this.bFrstLoad) {
					this.onAcadYrChange();
				}
				if (response.PredefinedFlag === "X") {
					oNoteText.setValue(response.NotesText).setEditable(false);
					this._noteDialog.getBeginButton().setEnabled(true);
				}

				var aAcadStage = response.AcademicStageSet;
				var oAcadStageJson = new sap.ui.model.json.JSONModel();
				oAcadStageJson.setData(aAcadStage);
				oSelectStage.setModel(oAcadStageJson, "oAcadStageModel");

				oAcadSessn.setVisible(true).setRequired(false);
				oSelectSessn.setVisible(true);
				oAcadYr.setVisible(true).setRequired(false);
				oSelectYr.setVisible(true);
				oStage.setVisible(true).setRequired(false);
				oSelectStage.setVisible(true);
				switch (response.AcadSessionSet) {
					case "1":
						oAcadSessn.setVisible(false);
						oSelectSessn.setVisible(false);
						break;
					case "3":
						oAcadSessn.setRequired(true);
						break;
				}
				switch (response.AcadYearSet) {
					case "1":
						oAcadYr.setVisible(false);
						oSelectYr.setVisible(false);
						break;
					case "3":
						oAcadYr.setRequired(true);
						break;
				}
				switch (response.StageSet) {
					case "1":
						oStage.setVisible(false);
						oSelectStage.setVisible(false);
						break;
					case "3":
						oStage.setRequired(true);
						break;
				}
			}.bind(this),
			error: function() {
				jQuery.sap.log.info("Odata Error occured");
			}.bind()
		};
		this.getView().getModel().read(sURL, mParameters);
	},

	onNotesDialogSave: function() {
		var oSelectSessn = sap.ui.getCore().byId("idSelectSessn");
		var oSelectYr = sap.ui.getCore().byId("idSelectYr");
		var oSelectStage = sap.ui.getCore().byId("idSelectStage");
		var oSelectNote = sap.ui.getCore().byId("idNoteType");
		var oNoteText = sap.ui.getCore().byId("idNteTxt");
		var oDialog = sap.ui.getCore().byId("idNteDialog");
		var sAcadYear = "",
			sAcadSession = "",
			sAcadLevel = "";
		if (oSelectSessn.getVisible()) {
			sAcadSession = oSelectSessn.getSelectedKey();
		}
		if (oSelectYr.getVisible()) {
			sAcadYear = oSelectYr.getSelectedKey();
		}
		if (oSelectStage.getVisible()) {
			sAcadLevel = oSelectStage.getSelectedKey();
		}
		this.getView().setBusy(true);
		var mParameters = {
			success: function(response) {
				this.getView().setBusy(false);
				this._noteDialog.close();
				var oAdvJson = new sap.ui.model.json.JSONModel();
				oAdvJson.setData(response.AdvNoteList);
				this.oAdvisoryLst.setModel(oAdvJson, "oAdvModel");
				oNoteText.setValue("");
				oDialog.getBeginButton().setEnabled(false);
				sap.m.MessageToast.show(this.oResBundle.getText("SUCCESS_MES", this.oResponse.StudentName));
				this.refreshSelect();
				this.byId("idComboBx").setSelectedKey("0000");
			}.bind(this),
			error: function(err) {
				oDialog.setBusy(false);
				var oErr = JSON.parse(err.response.body);
				//sap.m.MessageBox.error(oErr.error.message.value);
				sap.m.MessageBox.show(oErr.error.message.value, {
			          icon: sap.m.MessageBox.Icon.ERROR,
			          title: this.oResBundle.getText("ERROR")
			      }
			    );
			}.bind()
		};
		this.getView().getModel().create("/CreateAdvisoryNoteSet", {
			StudentNum: this.oResponse.StudentNumber,
			NoteType: oSelectNote.getSelectedKey(),
			NoteTitle: oSelectNote.getSelectedItem().getText(),
			NoteText: oNoteText.getValue(),
			ProgramId: this.oResponse.ProgramID,
			AcadYear: sAcadYear,
			AcadSession: sAcadSession,
			AcadLevel: sAcadLevel,
			AdvNoteList: []

		}, mParameters);
	},

	onNotesDialogClose: function() {
		var oNoteText = sap.ui.getCore().byId("idNteTxt");
		var oDialog = sap.ui.getCore().byId("idNteDialog");
		var oSelectNote = sap.ui.getCore().byId("idNoteType");
		this._noteDialog.close();
		if (oSelectNote.getSelectedKey() !== "PRE1") {
			oNoteText.setValue("");
		}
		oDialog.getBeginButton().setEnabled(false);
		this.refreshSelect();
	},

	handleLiveChange: function(oEvent) {
		var sText = oEvent.getParameter("value");
		var parent = sap.ui.getCore().byId("idNteDialog");
		parent.getBeginButton().setEnabled(sText.length > 0);
	},

	refreshSelect: function() {
		var oSelectSessn = sap.ui.getCore().byId("idSelectSessn");
		var oSelectYr = sap.ui.getCore().byId("idSelectYr");
		var oSelectStage = sap.ui.getCore().byId("idSelectStage");
		var oSelectNote = sap.ui.getCore().byId("idNoteType");
		oSelectSessn.setSelectedItem(oSelectSessn.getItems()[0]);
		oSelectYr.setSelectedItem(oSelectYr.getItems()[0]);
		oSelectStage.setSelectedItem(oSelectStage.getItems()[0]);
		oSelectNote.setSelectedItem(oSelectNote.getItems()[0]);
	},

	onAcadYrChange: function(oEvent) {
		var oSelectSessn = sap.ui.getCore().byId("idSelectSessn");
		var oAcadSessnJson = new sap.ui.model.json.JSONModel();
		var oSelectedItem;
		if (this.bFrstLoad) {
			var oSelectYr = sap.ui.getCore().byId("idSelectYr");
			oSelectedItem = oSelectYr.getItems()[0];
			this.bFrstLoad = false;
		} else {
			oSelectedItem = oEvent.getParameter("selectedItem");
		}
		var aAcadSessn = oSelectedItem.getBindingContext("oAcadYrModel").getObject().AcademicSessionSet;
		oAcadSessnJson.setData(aAcadSessn);
		oSelectSessn.setModel(oAcadSessnJson, "oAcadSessnModel");
	},

	handleFilter: function() {
		var oBinding = this.oAcademicTble.getBinding("items");
		var oAcadYr = new sap.ui.model.Filter("AcadYear", "EQ", "2015");
		var oAcadSessn = new sap.ui.model.Filter("AcadSession", "EQ", "002");
		oBinding.filter([oAcadYr, oAcadSessn]);
	},

	handleExprtOK: function() {
		var sStudNumber = this.oResponse.StudentNumber,
			sPrgmID = this.oResponse.ProgramID,
			oCheckBox = sap.ui.getCore().byId("idCheckBox"),
			oAcadItm = sap.ui.getCore().byId("idAcadItm"),
			oAdvNtsItm = sap.ui.getCore().byId("idAdvNtsItm"),
			oHoldsItm = sap.ui.getCore().byId("idHoldsItm"),
			oActvtsItm = sap.ui.getCore().byId("idActvtsItm"),
			ActivitiesFlag = "Y",
			AcademicFlag = "Y",
			NoteFlag = "Y",
			HoldFlag = "Y";

		if (oCheckBox.getSelected() === true) {
			ActivitiesFlag = "X";
			AcademicFlag = "X";
			NoteFlag = "X";
			HoldFlag = "X";
		} else {
			if (!oAcadItm.getSelected() && !oAdvNtsItm.getSelected() && !oHoldsItm.getSelected() && !oActvtsItm.getSelected()) {
				sap.m.MessageBox.warning(this.oResBundle.getText("WARNING_MES"));
				return;
			}
			if (oAcadItm.getSelected()) {
				AcademicFlag = "X";
			}
			if (oAdvNtsItm.getSelected()) {
				NoteFlag = "X";
			}
			if (oHoldsItm.getSelected()) {
				HoldFlag = "X";
			}
			if (oActvtsItm.getSelected()) {
				ActivitiesFlag = "X";
			}
		}
		this.exportDialog.close();
		sap.m.URLHelper.redirect("/sap/opu/odata/sap/ZSLCM_PIQ_ADVISEE_DETAILS_SRV/ExportToPdfSet(AdviseeNo='" + sStudNumber + "',ProgramId='" + sPrgmID +
			"',ActivitiesFlag='" + ActivitiesFlag + "',AcademicFlag='" + AcademicFlag + "',NoteFlag='" + NoteFlag + "',HoldFlag='" + HoldFlag +
			"')/$value", true);
	},

	onAcadFilterPress: function() {
		if (!this.filterDialog) {
			this.filterDialog = sap.ui.xmlfragment("ean.edu.asesor.s1.view.ViewSettingsFilterDialog", this);
			this.getView().addDependent(this.filterDialog);
		}
		this.filterDialog.setModel(this.getView().getModel());
		this.filterDialog.open();
	},

	onFilterDialogConfirm: function(oEvent) {
		var mParams = oEvent.getParameters(),
			oBinding = this.oAcademicTble.getBinding("items"),
			aFilters = [];
		jQuery.each(mParams.filterItems, function(i, oItem) {
			var sValue1;
			var sFilPath = oItem.getKey();
			var sOperator = sap.ui.model.FilterOperator.EQ;
			if (sFilPath === "AcadYear") {
				sValue1 = oItem.getBindingContext("oAcadYearrModel").getObject().id;
				if (sValue1 === "00") {
					return true;
				}
			} else if (sFilPath === "AcadSession") {
				sValue1 = oItem.getBindingContext("oAcadSesionModel").getObject().id;
				if (sValue1 === "00") {
					return true;
				}
			}
			var oFilter = new sap.ui.model.Filter(sFilPath, sOperator, sValue1);
			aFilters.push(oFilter);
		});
		oBinding.filter(aFilters);
	},

	onSelectAll: function(oEvent) {
		var oAcadItm = sap.ui.getCore().byId("idAcadItm"),
			oAdvNtsItm = sap.ui.getCore().byId("idAdvNtsItm"),
			oHoldsItm = sap.ui.getCore().byId("idHoldsItm"),
			oActvtsItm = sap.ui.getCore().byId("idActvtsItm");

		if (oEvent.getParameter("selected") === true) {
			oAcadItm.setSelected(true);
			oAdvNtsItm.setSelected(true);
			oHoldsItm.setSelected(true);
			oActvtsItm.setSelected(true);
		} else {
			oAcadItm.setSelected(false);
			oAdvNtsItm.setSelected(false);
			oHoldsItm.setSelected(false);
			oActvtsItm.setSelected(false);
		}
	},

	onHandleSelect: function(oEvent) {
		var oCheckBox = sap.ui.getCore().byId("idCheckBox");
		if (oEvent.getParameter("selected") !== true) {
			oCheckBox.setSelected(false);
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