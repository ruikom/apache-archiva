/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
define("archiva.proxy-connectors-rules",["jquery","i18n","jquery.tmpl","bootstrap","jquery.ui","knockout"
  ,"knockout.simpleGrid","knockout.sortable","archiva.proxy-connectors"], function() {

  ProxyConnectorRulesViewModel=function(proxyConnectorRules,proxyConnectors){
    var self=this;
    this.proxyConnectorRules=ko.observableArray(proxyConnectorRules?proxyConnectorRules:[]);
    this.proxyConnectors=proxyConnectors;

    // FIXME get that from a REST service
    // FIXME i18n
    this.ruleTypes=[new RuleType("BLACK_LIST","Black list","images/red-22-22.png"),new RuleType("WHITE_LIST","White list","images/green-22-22.png")];

    this.findRuleType=function(proxyConnectorRule){
      var ruleType;
      $.each(self.ruleTypes, function(index, value) {
        if(value.type==proxyConnectorRule.proxyConnectorRuleType()){
          ruleType=value;
        }
      });
      return ruleType;
    }

    this.displayGrid=function(){
      var mainContent = $("#main-content");

      $.each(self.proxyConnectorRules(), function(index, value) {
        value.ruleType=self.findRuleType(value);
      });

      this.gridViewModel = new ko.simpleGrid.viewModel({
        data: self.proxyConnectorRules,
        pageSize: 5,
        gridUpdateCallBack: function(){
          //$("#main-content" ).find("#proxy-connectors-rules-view-tabsTable" ).find("[title]").tooltip();
        }
      });

      ko.applyBindings(self,mainContent.find("#proxy-connector-rules-view").get(0));

      removeSmallSpinnerImg();

      mainContent.find("#proxy-connectors-rules-view-tabs").on('show', function (e) {
        $.log("on show:"+$(e.target).attr("href"));
        if ($(e.target).attr("href")=="#proxy-connector-rules-edit") {
          var proxyConnectorRuleViewModel = new ProxyConnectorRuleViewModel(new ProxyConnectorRule(),self,false);
          ko.applyBindings(proxyConnectorRuleViewModel,mainContent.find("#proxy-connector-rules-edit" ).get(0));
          activateProxyConnectorRulesEditTab();
        }
      });
    }
    addProxyConnectorRule=function(proxyConnectorRule){
      $("#proxy-connector-rule-add-btn" ).button("loading");
      $.log("addProxyConnectorRule");
      self.saveProxyConnectorRule(proxyConnectorRule,"restServices/archivaServices/proxyConnectorRuleService/proxyConnectorRule",true,
      function(){
        $("#proxy-connector-rule-add-btn" ).button("reset");
      });
    }

    this.saveProxyConnectorRule=function(proxyConnectorRule,url,add,completeFnCallback){
      $.log("saveProxyConnectorRule:"+url);
      $("#user-messages" ).html(mediumSpinnerImg());
      $.ajax(url,
        {
          type: "POST",
          contentType: 'application/json',
          data: ko.toJSON(proxyConnectorRule),
          dataType: 'json',
          success: function(data) {
            $.log("save proxyConnectorRule pattern:"+proxyConnectorRule.pattern());
            var message=$.i18n.prop(add?'proxy-connector-rule.added':'proxy-connector-rule.updated',proxyConnectorRule.pattern());
            displaySuccessMessage(message);
            proxyConnectorRule.modified(false);
            if(add){
              // add rule type for image
              proxyConnectorRule.ruleType=self.findRuleType(proxyConnectorRule);
              self.proxyConnectorRules.push(proxyConnectorRule);
            }
            activateProxyConnectorRulesGridTab();
          },
          error: function(data) {
            var res = $.parseJSON(data.responseText);
            displayRestError(res);
          },
          complete:function(data){
            removeMediumSpinnerImg("#user-messages");
            if(completeFnCallback){
              completeFnCallback();
            }
          }
        }
      );
    }

    updateProxyConnectorRule=function(proxyConnectorRule){
      $.log("updateProxyConnectorRule");
      $("#main-content" ).find("#proxy-connectors-rules-edit-div").find("#proxy-connector-rule-update-btn").button("loading");
      self.saveProxyConnectorRule(proxyConnectorRule,"restServices/archivaServices/proxyConnectorRuleService/updateProxyConnectorRule",
                                  false,
                                  function(){
                                    $("#proxy-connector-rule-update-btn" ).button("reset");
                                  }
      );
    }

    this.deleteProxyConnectorRule=function(proxyConnectorRule){
      $("#main-content" ).find("proxy-connectors-rules-view-tabsTable").find(".btn").button("loading");
      $("#user-messages" ).html(mediumSpinnerImg());
      $.ajax("restServices/archivaServices/proxyConnectorRuleService/deleteProxyConnectorRule",
       {
         type:"POST",
         contentType: 'application/json',
         data: ko.toJSON(proxyConnectorRule),
         dataType: 'json',
         success:function(data){
           var message=$.i18n.prop('proxy-connector-rule.deleted',proxyConnectorRule.pattern());
           self.proxyConnectorRules.remove(proxyConnectorRule);
           displaySuccessMessage(message);
         },
         error: function(data) {
           var res = $.parseJSON(data.responseText);
           displayRestError(res);
         },
         complete:function(data){
           removeMediumSpinnerImg("#user-messages");
           $("#main-content" ).find("proxy-connectors-rules-view-tabsTable").find(".btn").button("reset");
         }
       }
      );
    }

    removeProxyConnectorRule=function(proxyConnectorRule){

      openDialogConfirm(
          function(){self.deleteProxyConnectorRule(proxyConnectorRule);window.modalConfirmDialog.modal('hide')},
          $.i18n.prop('ok'), $.i18n.prop('cancel'),
          $.i18n.prop('proxy-connector-rule.delete.confirm',proxyConnectorRule.pattern()),"");

    }

    editProxyConnectorRule=function(proxyConnectorRule){
      var proxyConnectorRuleViewModel=new ProxyConnectorRuleViewModel(proxyConnectorRule,self,true);
      ko.applyBindings(proxyConnectorRuleViewModel,$("#main-content").find("#proxy-connector-rules-edit" ).get(0));
      activateProxyConnectorRulesEditTab();

    }

  }

  ProxyConnectorRuleViewModel=function(proxyConnectorRule,proxyConnectorRulesViewModel,update){
    var self=this;
    this.proxyConnectorRule=proxyConnectorRule;
    this.proxyConnectorRulesViewModel=proxyConnectorRulesViewModel;
    this.availableProxyConnectors=ko.observableArray(proxyConnectorRulesViewModel.proxyConnectors);
    this.update=update;

    proxyConnectorMoved=function(arg){
      $.log("repositoryMoved:"+arg.sourceIndex+" to " + arg.targetIndex);
    }

    saveProxyConnectorRule=function(){
      $.log("pattern:"+self.proxyConnectorRule.pattern());
      $.log("proxyConnectorRuleType:"+proxyConnectorRule.proxyConnectorRuleType());
      $.log("proxyConnectors:"+proxyConnectorRule.proxyConnectors().length);
      self.proxyConnectorRulesViewModel.saveProxyConnectorRule(self.proxyConnectorRule)
    }

  }


  displayProxyConnectorsRules=function(){
    $.log("displayProxyConnectorsRules");
    screenChange();
    var mainContent = $("#main-content");
    mainContent.html($("#proxyConnectorsRulesMain").tmpl());
    $("#user-messages").html(mediumSpinnerImg());
    loadAllProxyConnectors(function(data){
      var proxyConnectors = mapProxyConnectors(data);

        $.ajax("restServices/archivaServices/proxyConnectorRuleService/proxyConnectorRules", {
          type: "GET",
          dataType: 'json',
          success: function (data){
            var proxyConnectorRules=mapProxyConnectorRules(data);
            var proxyConnectorRulesViewModel = new ProxyConnectorRulesViewModel(proxyConnectorRules,proxyConnectors);
            proxyConnectorRulesViewModel.displayGrid();
            activateProxyConnectorRulesGridTab();
          },
          complete: function(data){
            removeMediumSpinnerImg("#user-messages");
          }

        });

    });
  }

  ProxyConnectorRule=function(pattern,proxyConnectorRuleType,proxyConnectors){
    //private String pattern;
    var self=this;

    this.modified=ko.observable(false);

    //private String sourceRepoId;
    this.pattern=ko.observable(pattern);
    this.pattern.subscribe(function(newValue){
      self.modified(true);
    });

    this.ruleType=null;

    //private ProxyConnectorRuleType proxyConnectorRuleType;
    this.proxyConnectorRuleType=ko.observable(proxyConnectorRuleType);
    this.proxyConnectorRuleType.subscribe(function(newValue){
      self.modified(true);
    });

    //private List<ProxyConnector> proxyConnectors;
    this.proxyConnectors=ko.observableArray(proxyConnectors?proxyConnectors:[]);
    this.proxyConnectors.subscribe(function(newValue){
      self.modified(true);
    });

    this.ruleType=null;
  }

  mapProxyConnectorRule=function(data){
    if (data==null){
      return null;
    }
    return new ProxyConnectorRule(data.pattern, data.proxyConnectorRuleType, mapProxyConnectors(data.proxyConnectors));
  }

  mapProxyConnectorRules=function(data){
    var mappedProxyConnectorRules = $.map(data, function(item) {
      return mapProxyConnectorRule(item);
    });
    return mappedProxyConnectorRules;
  }


  activateProxyConnectorRulesGridTab=function(){
    var mainContent = $("#main-content");
    mainContent.find("#proxy-connectors-rules-view-tabs-content div[class*='tab-pane']").removeClass("active");
    mainContent.find("#proxy-connectors-rules-view-tabs li").removeClass("active");

    mainContent.find("#proxy-connector-rules-view").addClass("active");
    mainContent.find("#proxy-connectors-rules-view-tabs-li-grid").addClass("active");
    mainContent.find("#proxy-connectors-rules-view-tabs-a-edit").html($.i18n.prop("add"));

  }

  activateProxyConnectorRulesEditTab=function(){
    var mainContent = $("#main-content");

    mainContent.find("#proxy-connectors-rules-view-tabs-content div[class*='tab-pane']").removeClass("active");
    mainContent.find("#proxy-connectors-rules-view-tabs > li").removeClass("active");

    mainContent.find("#proxy-connector-rules-edit").addClass("active");
    mainContent.find("#proxy-connectors-rules-view-tabs-edit").addClass("active");
  }

  RuleType=function(type,label,image){
    this.type=type;
    this.label=label;
    this.image=image;
  }

});