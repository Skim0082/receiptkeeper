'use strict';

 angular
  .module('app') 
  .controller('DashboardController', [
  	'$scope', 'Receipt', '$rootScope', '$stateParams', 
    function($scope, Receipt, $rootScope, $stateParams) {     

      $scope.groupName = $stateParams.groupName;
      $scope.receipts = [];
      $scope.tagcloud = true;
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
          order: 'date DESC', 
          include: 'tags',               
          where: 
            {and: [
                {customerId: userId},
                {groupId: groupId}
            ]}
        }
      })
      .$promise
      .then(function(receipts){
        $scope.receipts = receipts;
        //console.log("receipts: ", receipts);
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
            // When DOM is ready, select the container element and call the jQCloud method, passing the array of words as the first argument.
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
      });
      /* Sample word format JSON Array format
      var tag_array = [
          {text: "Lorem", weight: 15},
          {text: "Ipsum", weight: 9, link: "http://jquery.com/"},
          {text: "Dolor", weight: 6, html: {title: "I can haz any html attribute"}},
      ];
      */

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
              $scope.setCustomer2LocalStorage(customer);
            });
        }else{
          $scope.customer = JSON.parse(localStorage.customer);
        }
        $scope.showProfile =! $scope.showProfile;
      }

      $scope.setCustomer2LocalStorage = function(customer){
        var groupName;
        if(customer.groups != undefined){
          if(customer.groups.length > 0){
            groupName = customer.groups[0].name;
          }          
        }
        var user = {
          'userId': customer.id,
          'username': customer.username,
          'firstName': customer.firstName,
          'lastName': customer.lastName,
          'groupId': customer.groupId,
          'groupName': groupName,
          'email': customer.email
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