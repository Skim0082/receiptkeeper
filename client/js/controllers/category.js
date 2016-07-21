'use strict';

 angular
  .module('app')
  .controller('AddCategoryController', ['$scope', 'Category',
      '$state', '$rootScope', '$stateParams', 'ReceiptService', 
      function($scope, Category, $state, $rootScope, $stateParams, ReceiptService) {

    //console.log("$stateParams: ", $stateParams);
    $scope.groupName = $stateParams.groupName;

    var userId, groupId;
    if($stateParams.groupId == undefined){
      userId = $rootScope.currentUser.id;
      groupId = "";
    }else{
      userId = $stateParams.ownerId;
      groupId = $stateParams.groupId;
    } 

    $scope.action = 'Add';
    $scope.category = {};

    $scope.categorys = Category.find({
      filter: {
        fields: { "id": true, "name": true},
        order: 'name ASC',
          where: {and: [
            {customerId: userId},
            {groupId: groupId}
          ]}
      }
    });

    $scope.submitForm = function() {
      var newCategoryName = (($scope.categoryname).trim()).toLowerCase();
      var categoryName;
      var isNewCategoryName = false;
      if($scope.categorys.length > 0){
        var isExist = false;
        for(var i = 0 ; i < $scope.categorys.length ; i++){
          categoryName = (($scope.categorys[i].name).trim()).toLowerCase();
          if(categoryName == newCategoryName){
            ReceiptService.publicShowMessage('#addCategoryErrorMessage');
            isExist = true;
            break;
          }
        } // for(var i = 0 ; i < $scope.categorys.length ; i++){
        isNewCategoryName = !isExist;
      }else{
        isNewCategoryName = true;
      } // if($scope.tags.length > 0){
      if(isNewCategoryName){
        Category
          .create({
            name: ($scope.categoryname).trim(),
            customerId: userId,
            groupId: groupId
          })
          .$promise
          .then(function() {
            $scope.Categories();
          });         
      } // if(isNewCategoryName){
    };  // $scope.submitForm = function() {

    $scope.Categories = function(){
      if($stateParams.groupId == undefined){
        $state.go('Categories');
      }else{
         $state.go(
          'groupCategories', 
          {
            'groupId': $stateParams.groupId, 
            'ownerId': $stateParams.ownerId
          }
        );
      }      
    }

  }])  
  .controller('AllCategoriesController', [
      '$scope', 'Category', '$rootScope', '$stateParams', '$state', 'ReceiptService', 
      function($scope, Category, $rootScope, $stateParams, $state, ReceiptService) {

      //console.log("$stateParams: ", $stateParams);
      //console.log("groupId: ", $stateParams.groupId);

      $scope.groupName = $stateParams.groupName;

      var userId, groupId;
      if($stateParams.groupId == undefined){
        userId = $rootScope.currentUser.id;
        groupId = "";
      }else{
        userId = $stateParams.ownerId;
        groupId = $stateParams.groupId;
      }

      $scope.categorys = Category.find({
        filter: {
          order: 'name ASC',
          where: {and: [
            {customerId: userId},
            {groupId: groupId}
          ]}
        }
      });                     

      $scope.viewGroup = function(){
        if($stateParams.groupId != undefined){
             $state.go('viewGroup', {'id': $stateParams.groupId});
        }        
      }

      $scope.addCategory = function(){
        if($stateParams.groupId == undefined){
          $state.go('addCategory');
        }else{
             $state.go(
              'groupAddCategory', 
              {
                'groupId':    $stateParams.groupId, 
                'groupName':  $stateParams.groupName,
                'ownerId':    $stateParams.ownerId
              }
            );
        }
      }

      $scope.actionCategory = function(action, groupAction, categoryId){
        if($stateParams.groupId == undefined){
           $state.go(
            action, 
            {
              'id': categoryId
            }
          );
        }else{
           $state.go(
            groupAction, 
            {
              'id': categoryId, 
              'groupId': $stateParams.groupId, 
              'groupName':  $stateParams.groupName,
              'ownerId': $stateParams.ownerId
            }
          );  
        } 
      }
 
      $scope.editCategory = function(categoryId){
        $scope.actionCategory('editCategory', 'groupEditCategory', categoryId);  
      }

      $scope.deleteCategory = function(categoryId){
        if(confirm("Are you sure?")){
          $scope.actionCategory('deleteCategory', 'groupDeleteCategory', categoryId);  
        }         
      }    

  }])
  .controller('EditCategoryController', ['$scope', 'Category', '$stateParams', '$state', '$location', 'ReceiptService', 
      function($scope, Category, $stateParams, $state, $location, ReceiptService) {
		    $scope.action = 'Edit';
        $scope.category = {};
        $scope.groupName = $stateParams.groupName;

        Category.findById({ id: $stateParams.id })
        .$promise
        .then(function(category){
          $scope.categoryname = category.name;
          $scope.category = category;
        });  

        var groupParameters;
        if($stateParams.groupId != undefined){
          groupParameters = {
                'groupId': $stateParams.groupId, 
                'groupName': $stateParams.groupName, 
                'ownerId': $stateParams.ownerId
              };
        } 

        //console.log("groupParameters: ", groupParameters);       

        $scope.Categories = function(){
          if($stateParams.groupId == undefined){
            $state.go('Categories');
          }else{
             $state.go('groupCategories', groupParameters);
          }      
        }

        $scope.deleteCategory = function(){
          if(confirm("Are you sure?")){
            if($stateParams.groupId == undefined){
               $state.go(
                'deleteCategory', 
                {
                  'id': $stateParams.id
                }
              );
            }else{
              groupParameters['id'] = $stateParams.id;
              $state.go('groupDeleteCategory', groupParameters);
            } 
          }        
        }        

		    $scope.submitForm = function() {				
          Category.prototype$updateAttributes(
              { id:$stateParams.id }, { name: $scope.categoryname }
          )
          .$promise
          .then(function(){
            $scope.Categories();
          });
		    };
  }])
  .controller('DeleteCategoryController', ['$scope', 'Category', '$state',
      '$stateParams', function($scope, Category, $state, $stateParams) {
    Category
      .deleteById({ id: $stateParams.id })
      .$promise
      .then(function() {

        if($stateParams.groupId == undefined){
          $state.go('Categories');
        }else{
           $state.go(
            'groupCategories', 
            {
              'groupId': $stateParams.groupId, 
              'groupName': $stateParams.groupName, 
              'ownerId': $stateParams.ownerId
            }
          );
        }
      });
  }]);