'use strict';

 angular
  .module('app') 
  .controller('DashboardController', [
  	'$scope', 'Receipt', '$rootScope', '$stateParams', '$state', 'Customer', 
    function($scope, Receipt, $rootScope, $stateParams, $state, Customer) {     

      $scope.groupName = $stateParams.groupName;
      $scope.receipts = [];
      $scope.tagcloud = true;
      $scope.recentReceiptsCount;
      var tagnames = {};
      var userId, groupId;
      var tagWords = [];

      if($stateParams.groupId == undefined){
        userId = $rootScope.currentUser.id;
        groupId = "";
      }else{
        userId = $stateParams.ownerId;
        groupId = $stateParams.groupId;
      } 

      Receipt.find({ 
        filter: {
          fields: {
            id: true,
            date: true,
            total: true,
            storeId: true
          },          
          order: 'date DESC', 
          include: ['tags', 
            {
              relation: 'store',
              scope: {
                fields: {
                  id: true,
                  name: true
                }
              }
            }
          ],               
          where: 
            {and: [
                {customerId: userId},
                {groupId: groupId}
            ]}
        }
      })
      .$promise
      .then(function(receipts){
        //console.log("receipts: ", receipts);

        $scope.receipts = receipts;

        var name;
        if(receipts.length > 0){
          angular.forEach(receipts, function(receipt, receipt_key){
            if(receipt.tags.length > 0){
              angular.forEach(receipt.tags, function(tag, tag_key){
                name = tag.name;
                if(tagnames[name] == undefined){
                  tagnames[name] = 1;
                }else{
                  tagnames[name] += 1;
                }                
              });
            }
          });
        }
        angular.forEach(tagnames, function(tagname, key){
          var word = {text: key, weight: tagnames[key]};
          tagWords.push(word);
        });
        if(tagWords.length < 1){
          $scope.tagcloud =false;
        }else{
          $(function() {
            $("#tagcloud").jQCloud(tagWords, {
              delay: 50,
              autoResize: true
            });
            $('#update-tagcloud').on('click', function() {
              tagWords.splice(-3);
              $('#tagcloud').jQCloud('update', tagWords);
            });        
          });          
        }
        // Set Receipts into localStorate
        if(receipts.length > 0){
          if(localStorage[userId] != undefined && 
              JSON.parse(localStorage[userId])['recentReceipts'] != undefined){
              if(JSON.parse(localStorage[userId])['recentReceipts'].length != receipts.length){
                $scope.Receipts2localStorage(receipts, 'recentReceipts');  
              }
          }else{
            $scope.Receipts2localStorage(receipts, 'recentReceipts');  
          } 
           
          if(receipts.length>5){
            $scope.setValue2localStorage(5, 'recentReceiptsCount');
          }else{
            $scope.setValue2localStorage(receipts.length, 'recentReceiptsCount');          
          }
        }else{
          $scope.setValue2localStorage(0, 'recentReceiptsCount');
        }
        $scope.recentReceiptsCount = $scope.getValue2localStorage('recentReceiptsCount'); 

      });
      /* Sample word format JSON Array format
      var tag_array = [
          {text: "Lorem", weight: 15},
          {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
          {text: "Dolor", weight: 6, html: {title: "I can haz any html attribute"}},
      ];
      */
      $scope.setValue2localStorage = function(value, storageKey){
        var temp_localStorage = {};
        if(localStorage[userId] != undefined){
          temp_localStorage = JSON.parse(localStorage[userId]);  
        }
        temp_localStorage[storageKey] = value;
        localStorage.setItem(userId, JSON.stringify(temp_localStorage));        
      }
      $scope.getValue2localStorage = function(storageKey){
        if(localStorage[userId] != undefined){
          return JSON.parse(localStorage[userId])[storageKey];  
        }        
      }
      // Set Receipts into localStorate
      $scope.Receipts2localStorage = function(receipts, storageKey){
        var tmp_receipts = [];
        for(var i = 0 ; i < receipts.length ; i++){
          var receipt = {
            id: receipts[i].id,
            date: (receipts[i].date).substring(0, 10),
            total: receipts[i].total,
            storeName: receipts[i].store.name
          };
          tmp_receipts.push(receipt);
        }
        var temp_localStorage = {};
        if(localStorage[userId] != undefined){
          temp_localStorage = JSON.parse(localStorage[userId]);  
        }
        temp_localStorage[storageKey] = tmp_receipts;
        localStorage.setItem(userId, JSON.stringify(temp_localStorage));
      }

      $scope.showReceipts;
      $scope.recentReceipts = {};
      $scope.showRecentReceipts = function(){
        $scope.showReceipts = !$scope.showReceipts;
        if($scope.showReceipts){
          $scope.recentReceipts = JSON.parse(localStorage[userId])['recentReceipts'];  
        }       
      }

      $scope.viewReceipt = function(receiptId){
        $state.go('viewReceipt', {'id': receiptId});
      }

      // Show Recent Group Receipts
      $scope.groupReceipts;
      $scope.ownerGroup;
      $scope.memberGroup;
      $scope.ownerGroupRecentReceipts;
      $scope.memberGroupRecentReceipts;  
      $scope.recentGroupReceiptsCount;
      if($scope.getValue2localStorage('recentGroupReceiptsCount') == undefined){
        $scope.setValue2localStorage(0, 'recentGroupReceiptsCount');
        $scope.recentGroupReceiptsCount = 0;
      }else{
        $scope.recentGroupReceiptsCount = $scope.getValue2localStorage('recentGroupReceiptsCount');
      }

      $scope.showRecentGroupReceipts = function(){
        $scope.groupReceipts = !$scope.groupReceipts; 
        if($scope.groupReceipts){
          Customer.findById({
            id: userId,
            filter: { 
              include: 'groups',
              fields: {
                id: true,
                groupId: true
              }
            }
          })
          .$promise
          .then(function(customer){
            //console.log("customer: ", customer);
            if(customer.groups != undefined){
              if(customer.groups.length > 0){
                for(var i = 0 ; i < customer.groups.length ; i++){
                  if(customer.groups[i].ownerId == customer.id){
                    $scope.ownerGroup = {
                      ownerId: customer.groups[i].ownerId,
                      groupId: customer.groups[i].id,
                      groupName: customer.groups[i].name
                    };                      
                  }else{
                    $scope.memberGroup = {
                      ownerId: customer.groups[i].ownerId,
                      groupId: customer.groups[i].id,
                      groupName: customer.groups[i].name
                    }; 
                  }
                }
              }          
            } // if(customer.groups != undefined){

            if($scope.ownerGroup != undefined){
              // Get Owner Group Receipts
              Receipt.find({ 
                filter: {
                  fields: {
                    id: true,
                    date: true,
                    total: true,
                    storeId: true,
                    groupId: true
                  },
                  limit: 3,         
                  order: 'date DESC', 
                  include:  
                  {
                    relation: 'store',
                    scope: {
                      fields: {
                        id: true,
                        name: true
                      }
                    }
                  },               
                  where: {and: [
                    {customerId: $scope.ownerGroup.ownerId},
                    {groupId: $scope.ownerGroup.groupId}
                  ]}
                }
              })
              .$promise
              .then(function(receipts){
                //console.log("ownerGroupReceipts: ", receipts);
                if(receipts.length>0){ 
                  $scope.Receipts2localStorage(receipts, 'ownerGroupReceipts');
                  $scope.ownerGroupRecentReceipts = JSON.parse(localStorage[userId])['ownerGroupReceipts'];

                  $scope.setValue2localStorage(receipts.length, 'recentGroupReceiptsCount'); 
                  $scope.recentGroupReceiptsCount = receipts.length; 
                }else{
                  $scope.setValue2localStorage(0, 'recentGroupReceiptsCount'); 
                  $scope.recentGroupReceiptsCount = 0; 
                }
              });
            } //if($scope.ownerGroup != undefined){

            if($scope.memberGroup != undefined){
              // Get Member Group Receipts
              Receipt.find({ 
                filter: {
                  fields: {
                    id: true,
                    date: true,
                    total: true,
                    storeId: true,
                    groupId: true
                  },
                  limit: 3,          
                  order: 'date DESC', 
                  include:  
                  {
                    relation: 'store',
                    scope: {
                      fields: {
                        id: true,
                        name: true
                      }
                    }
                  },               
                  where: {and: [
                    {customerId: $scope.memberGroup.ownerId},
                    {groupId: $scope.memberGroup.groupId}
                  ]}
                }
              })
              .$promise
              .then(function(receipts){
                //console.log("memberGroupReceipts: ", receipts);  
                if(receipts.length>0){
                  $scope.Receipts2localStorage(receipts, 'memberGroupReceipts');  
                  $scope.memberGroupRecentReceipts = JSON.parse(localStorage[userId])['memberGroupReceipts'];

                  var temp_count = $scope.getValue2localStorage('recentGroupReceiptsCount');
                  temp_count += receipts.length;
                  $scope.setValue2localStorage(temp_count, 'recentGroupReceiptsCount');
                  $scope.recentGroupReceiptsCount = temp_count;
                  //console.log("member db");
                }                
              });               
            } //if($scope.memberGroup != undefined){            
          }); // .then(function(customer){
        }
      } //$scope.showRecentGroupReceipts = function(){

      $scope.viewGroupReceipt = function(receiptId, groupId, groupName, ownerId){
        $state.go(
          'groupViewReceipt', 
          {
            'id':         receiptId, 
            'groupId':    groupId, 
            'groupName':  groupName,
            'ownerId':    ownerId
          }
        );       
      }        

      //Combo chart using Hight Chart Open Source for non comercial
      $scope.combChart =    function () {
          $('#container1').highcharts({
              title: {
                  text: '2016 June weekly chart'
              },
              xAxis: {
                  categories: ['Jun.01', 'Jun.06', 'Jun.13', 'Jun.20', 'Jun.27']
              },
              labels: {
                  items: [{
                      html: 'June total consumption',
                      style: {
                          left: '50px',
                          top: '18px',
                          color: (Highcharts.theme && Highcharts.theme.textColor) || 'black'
                      }
                  }]
              },
              series: [{
                  type: 'column',
                  name: 'Mon',
                  data: [0, 20, 10, 30, 40]
              }, {
                  type: 'column',
                  name: 'Tue',
                  data: [0, 30, 50, 70, 60]
              }, {
                  type: 'column',
                  name: 'Wed',
                  data: [40, 30, 30, 90, 50]
              }, {
                  type: 'column',
                  name: 'Thr',
                  data: [40, 30, 30, 90, 20]
              }, {
                  type: 'column',
                  name: 'Fri',
                  data: [40, 30, 30, 90, 0]
              }, {
                  type: 'column',
                  name: 'Sat/Sun',
                  data: [40, 30, 30, 90, 0]
              }, {
                  type: 'spline',
                  name: 'Average',
                  data: [30, 20.67, 30, 60.33, 30.33],
                  marker: {
                      lineWidth: 2,
                      lineColor: Highcharts.getOptions().colors[6],
                      fillColor: 'white'
                  }
              }, {
                  type: 'pie',
                  name: 'Total consumption',
                  data: [{
                      name: 'Mon',
                      y: 100,
                      color: Highcharts.getOptions().colors[0] // Jane's color
                  }, {
                      name: 'Tue',
                      y: 100,
                      color: Highcharts.getOptions().colors[1] // John's color
                  }, {
                      name: 'Wed',
                      y: 150,
                      color: Highcharts.getOptions().colors[2] // Joe's color
                  }, {
                      name: 'Thr',
                      y: 150,
                      color: Highcharts.getOptions().colors[3] // Joe's color
                  }, {
                      name: 'Fri',
                      y: 200,
                      color: Highcharts.getOptions().colors[4] // Joe's color
                  }, {
                      name: 'Sat/Sun',
                      y: 400,
                      color: Highcharts.getOptions().colors[5] // Joe's color
                  }],
                  center: [100, 80],
                  size: 100,
                  showInLegend: false,
                  dataLabels: {
                      enabled: false
                  }
              }]
          });
      } // Combo chart using Hight Chart Open Source for non comercial

  }])  .controller('DashboardUserController', [
    '$scope', 'Receipt', '$rootScope', '$stateParams', 'Customer', '$modal',  
    function($scope, Receipt, $rootScope, $stateParams, Customer, $modal) {

      $scope.ownerId;
      $scope.groupId;
      $scope.groupName;
      $scope.customer;
      $scope.username = $rootScope.currentUser.username;
      $scope.email = $rootScope.currentUser.email;

      var userId, groupId;
      if($stateParams.groupId == undefined){
        userId = $rootScope.currentUser.id;
        groupId = "";
      }else{
        userId = $stateParams.ownerId;
        groupId = $stateParams.groupId;
      }
      $scope.userId = userId;

      $scope.showProfile;
      $scope.openUser = function(){
        if(localStorage.customer == undefined || 
            JSON.parse(localStorage.customer).userId != userId){

            $scope.customer = {};
            Customer.findById({
              id: userId,
              filter: { 
                include: 'groups'
              }
            })
            .$promise
            .then(function(customer){
              console.log("customer: ", customer);
              $scope.setCustomer2LocalStorage(customer);
            });
        }else{
          $scope.customer = JSON.parse(localStorage.customer);
        }
        $scope.showProfile =! $scope.showProfile;
      }

      $scope.setCustomer2LocalStorage = function(customer){
        var groupName, groupOwnerId;
        if(customer.groups != undefined){
          if(customer.groups.length > 0){
            for(var i = 0 ; i < customer.groups.length ; i++){
              if(customer.groups[i].ownerId == customer.id){
                groupName = customer.groups[i].name;
                groupOwnerId = customer.groups[i].ownerId;
              }
            }
          }          
        }
        var user = {
          'userId': customer.id,
          'username': customer.username,
          'firstName': customer.firstName,
          'lastName': customer.lastName,
          'groupId': customer.groupId,
          'groupName': groupName,
          'email': customer.email,
          'groupOwnerId': groupOwnerId
        }
        localStorage.setItem('customer', JSON.stringify(user));
        $scope.customer = user;
      }
      
      $scope.editCustomer = function(userId, username, firstName, lastName){
        $scope.params = {
          userId: userId,
          username: username,
          firstName: firstName,
          lastName: lastName
        };
        var modalInstance = $modal.open({
          templateUrl: 'ModalEditCustomer.html',
          controller: 'ModalEditCustomerInstanceCtrl',
          resolve: {
            params: function(){
              return $scope.params;
          }}
        });

        modalInstance.result.then(function (customer) {
          $scope.username = $rootScope.currentUser.username = customer.username;
          sessionStorage.setItem('access_token', JSON.stringify($rootScope.currentUser));
          $scope.setCustomer2LocalStorage(customer);
        }, function () {
          console.info('Customer Edit Modal dismissed.');
        });
      };
  }])
  .controller('ModalEditCustomerInstanceCtrl', [
    '$scope', '$state', '$modalInstance', 'params', 'Customer',   
      function($scope, $state, $modalInstance, params, Customer) {
      $scope.customer = params;
      $scope.submit = function(){
          Customer.prototype$updateAttributes(
              { id:$scope.customer.userId }, 
              { 
                username: $scope.customer.username,
                firstName: $scope.customer.firstName,
                lastName: $scope.customer.lastName 
              }
          )
          .$promise
          .then(function(customer){            
            $modalInstance.close(customer);
          });      
      }
      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
  }]);