'use strict';

 angular
  .module('app')
  .controller('AddGroupController', ['$scope', 'Group','$state', 
    'CustomerGroup', 'Customer', '$rootScope',
    function($scope, Group, $state, CustomerGroup, Customer, $rootScope) {
    $scope.action = 'Add';
    $scope.group = {};
    $scope.isDisabled = true;  

    var userId = $rootScope.currentUser.id;


    /*
    // 401 Unauthorized Error even at authorized mode
    Customer.groups
      .count({id: userId})
      .$promise
      .then(function(res){
          console.log("group count: ", res.count);
          if(res.count > 0){
            $scope.isDisabled = true;
            $state.go('Groups');
          }else{
            $scope.isDisabled = false;
          }
      });
    */

    // Below works with authorized mode
    Customer
      .findById({
        id: userId,   
        filter: {
          fields: 'id',
          include: {
            relation: 'groups',
            scope: {
              order: 'createdAt DESC', 
              fields: ['id', 'name'],
              limit: 1
            }
          }
        }
      })
      .$promise
      .then(function(customer){
        $scope.groups = customer.groups;
        if(customer.groups.length > 0){
          $scope.isDisabled = true;
          $state.go('Groups');
        }else{
          $scope.isDisabled = false;
        }
        //console.log("customer: ", customer.groups.length);
      });    

    $scope.submitForm = function() {

      Group
        .create({
          name: $scope.group.name                
        }, function(group){
          console.log('group id : ', group.id);
          CustomerGroup
            .create({
              customerId: userId,   //'575100c91269fce419dc2c4c', //
              groupId: group.id
            })
            .$promise
            .then(function(){
              $state.go('Groups');
            });
      });
    };
  }])  
  .controller('AllGroupsController', [
  	'$scope', 'Group', 'Customer', '$rootScope', function($scope, Group, Customer, $rootScope) {
      
      $scope.isDisabled = true;
      var userId = $rootScope.currentUser.id;
      console.log("login userId: ", userId);

      Customer
        .findById({
          id: userId,   //'575100c91269fce419dc2c4c',
          filter: {
            include: {
              relation: 'groups',
              scope: {
                order: 'createdAt DESC', 
                fields: ['id', 'name'],
                limit: 1
              }
            }
          }
        })
        .$promise
        .then(function(customer){
          $scope.groups = customer.groups;
          if(customer.groups.length > 0){
            $scope.isDisabled = true;
          }else{
            $scope.isDisabled = false;
          }
          console.log("customer: ", customer.groups.length);
        });
      
  }])
  .controller('EditGroupController', ['$scope', 'Group', '$stateParams', '$state', 
      function($scope, Group, $stateParams, $state) {

		    $scope.action = 'Edit';

        Group.findById({ id: $stateParams.id }).$promise
        .then(function(group){
          $scope.group = group;
        });  

		    $scope.submitForm = function() {				
          Group.prototype$updateAttributes(
              { id:$stateParams.id }, { name: $scope.group.name }
          )
          .$promise
          .then(function(){
            $state.go('Groups');
          });
		    };
  }])
  .controller('DeleteGroupController', ['$scope', 'Group', '$state',
      '$stateParams', function($scope, Group, $state, $stateParams) {
        Group.customers.destroyAll({
          id: $stateParams.id
        })
        .$promise
        .then(function(){
          Group
            .deleteById({ id: $stateParams.id })
            .$promise
            .then(function() {
              $state.go('Groups');
            });          
        });
  }]);