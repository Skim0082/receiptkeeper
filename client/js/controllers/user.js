// Copyright IBM Corp. 2015. All Rights Reserved.
// Node module: loopback-getting-started-intermediate
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

angular
  .module('app')
  .controller('AuthLoginController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    $scope.user = {};

    $scope.login = function() {
      AuthService.login($scope.user.email, $scope.user.password)
        .then(function() {
          //console.log("currentCustomer: ", $scope);
          $state.go('Receipts');
        });
    };
  }])
  .controller('AuthLogoutController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    AuthService.logout()
      .then(function() {
        $state.go('Home');
      });
  }])
  .controller('SignUpController', ['$scope', 'AuthService', '$state',
      function($scope, AuthService, $state) {
    $scope.user = {};

    $scope.register = function() {      
      AuthService.register($scope.user.email, $scope.user.password)
        .then(function() {
          $state.transitionTo('Stores');
        });
    };
  }])
  // Admin Activities
  .controller('AddCustomerController', ['$scope', 'Customer',
      '$state', function($scope, Customer, $state) {
    $scope.action = 'Add';
    $scope.user = {};

    $scope.submitForm = function() {
      Customer
        .create({
          username: $scope.username,
          email: $scope.email
        })
        .$promise
        .then(function() {
          $state.go('Customers');
        });
    };
  }])  
  .controller('AllCustomersController', [
    '$scope', 'Customer', function($scope, Customer) {
      $scope.users = Customer.find();
  }])
  .controller('EditCustomerController', ['$scope', 'Customer', '$stateParams', '$state', 
      function($scope, Customer, $stateParams, $state) {
        $scope.action = 'Edit';

        Customer.findById({ id: $stateParams.id }).$promise
        .then(function(user){
          $scope.username = user.username;
          $scope.email = user.email;
        });  

        $scope.submitForm = function() {        
          Customer.prototype$updateAttributes(
              { id:$stateParams.id }, { username: $scope.username, email: $scope.email }
          )
          .$promise
          .then(function(){
            $state.go('Customers');
          });
        };
  }])
  .controller('DeleteCustomerController', ['$scope', 'Customer', '$state',
      '$stateParams', function($scope, Customer, $state, $stateParams) {
    Customer
      .deleteById({ id: $stateParams.id })
      .$promise
      .then(function() {
        $state.go('Customers');
      });
  }]);