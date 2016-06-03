'use strict';

 angular
  .module('app')
  .controller('AddStoreController', ['$scope', 'Store', 'Category',
      '$state', function($scope, Store, Category, $state) {
    $scope.action = 'Add';
    $scope.store = {};
    $scope.categories = {};
    $scope.selectedCategory;

    Category
      .find()
      .$promise
      .then(function(categories){
        $scope.categories = categories;
        $scope.selectedCategory = $scope.selectedCategory || categories[0]
    });

    $scope.submitForm = function() {
      Store
        .create({
          name: $scope.storename
        })
        .$promise
        .then(function() {
          $state.go('Stores');
        });
    };
  }])  
  .controller('AllStoresController', [
  	'$scope', 'Store', function($scope, Store) {
	    $scope.stores = Store.find();
  }])
  .controller('EditStoreController', ['$scope', 'Store', 'Category', '$stateParams', '$state', 
      function($scope, Store, Category, $stateParams, $state) {
		    $scope.action = 'Edit';

        Store.findById({ id: $stateParams.id }).$promise
        .then(function(store){
          $scope.storename = store.name;
        });  

        Category
          .find()
          .$promise
          .then(function(categories){
            $scope.categories = categories;
            $scope.selectedCategory = $scope.selectedCategory || categories[0];
        });

		    $scope.submitForm = function() {				
          Store.prototype$updateAttributes(
              { id:$stateParams.id }, { name: $scope.storename }
          )
          .$promise
          .then(function(){
            $state.go('Stores');
          });
		    };
  }])
  .controller('DeleteStoreController', ['$scope', 'Store', '$state',
      '$stateParams', function($scope, Store, $state, $stateParams) {
    Store
      .deleteById({ id: $stateParams.id })
      .$promise
      .then(function() {
        $state.go('Stores');
      });
  }]);