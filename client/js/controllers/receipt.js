'use strict';

 angular
  .module('app')
  .controller('AllReceiptsController', [
  	'$scope', 'Receipt', function($scope, Receipt) {
	    $scope.receipts = Receipt.find();
  }])
  .controller('DeleteReceiptController', ['$scope', 'Receipt', '$state',
      '$stateParams', function($scope, Receipt, $state, $stateParams) {

    Receipt.items.destroyAll(
      {id: $stateParams.id}, 
      function(res1){
      Receipt
        .destroyById({ id: $stateParams.id })
        .$promise
        .then(function(res2) {
            $state.go('Receipts');        
        });      
    });
    
  }])
  .controller('EditReceiptController', ['$scope', 'Receipt', '$state',
      '$stateParams', 'Store', 'Item', 'ReceiptItem', 'Category',
      function($scope, Receipt, $state, $stateParams, Store, Item, ReceiptItem, Category) {

    $scope.action = 'Edit';
    $scope.stores = [];
    $scope.selectedStore;
    $scope.selectedCategory;
    $scope.receipt = {};
    $scope.isDisabled = false;
    $scope.delDisabled = true;  

    $scope.items = [];        
    $scope.newItem = function () {
      console.log("go into newItem");
      // Add Item input form
      $scope.items.push({});
      if($scope.items.length > 0){ 
        $scope.delDisabled = false;
      };
    };

    $scope.spliceItem = function(){
      console.log("Item length: ", $scope.items.length);
      $scope.items.splice($scope.items.length-1, 1);
      if($scope.items.length < 1){ 
        $scope.delDisabled = true;
      };      
    };

    Store.find()
      .$promise
      .then(function(stores){
        var stores = $scope.stores = stores;
        Receipt.findById({
         id: $stateParams.id, 
         filter: { 
          include: 'items'
          }
        })
        .$promise
        .then(function(receipt){            
          $scope.receipt = receipt; 
          $scope.items = receipt.items;
          if($scope.items.length > 0){ 
            $scope.delDisabled = false;
          };  

          var selectedStoreIndex = stores.map(function(store){ 
            return store.id;
          }).indexOf($scope.receipt.storeId);
          $scope.selectedStore = stores[selectedStoreIndex];     

          Category.find()
            .$promise
            .then(function(categories){
                $scope.categories = categories;
                var selectedCategoryIndex = categories.map(function(category){ 
                  return category.id;
                }).indexOf(receipt.categoryId);
                $scope.selectedCategory = categories[selectedCategoryIndex]; 
            });
        });
    });

    $scope.changePrice = function(){
      console.log("items.length: ", $scope.items.length);
      $scope.totalprice=0;
      if($scope.items.length > 0){ 
        for(var i = 0 ; i < $scope.items.length ; i++){
          $scope.totalprice += $scope.items[i].price;
        };
        console.log("total price: ", $scope.totalprice);
        $scope.receipt.numberOfItem = $scope.items.length;
        $scope.receipt.total = $scope.totalprice;
      };   
    };

    $scope.submitForm = function() {
      $scope.receipt.storeId = $scope.selectedStore.id;
      $scope.receipt.categoryId = $scope.selectedCategory.id;
      $scope.receipt
      .$save()
      .then(function(){

        Receipt.items.destroyAll(
          {id: $stateParams.id}, 
          function(res){
          for(var i=0 ; i < $scope.items.length ; i++){
            Item
            .create({
              name: $scope.items[i].name,
              price: $scope.items[i].price                
            }, function(item){
              console.log('item id : ', item.id);
              ReceiptItem
                .create({
                  receiptId: $scope.receipt.id,
                  itemId: item.id
                });                
            });
          }
          $state.go('Receipts');           
        }); 
      });
    };
  }])
  .controller('AddReceiptController', ['$scope', '$state', 
      'Receipt', 'Store', 'Category', 'Item', 'ReceiptItem', 
      function($scope, $state, Receipt, Store, Category, Item, ReceiptItem) {

    $scope.action = 'Add';
    $scope.stores = [];
    $scope.selectedStore;
    $scope.selectedCategory;
    $scope.receipt = {};
    $scope.isDisabled = false;
    $scope.delDisabled = true;

    Store
      .find()
      .$promise
      .then(function(stores){
        $scope.stores = stores;
        $scope.selectedStore = $scope.selectedStore || stores[0]
    });

    Category
      .find()
      .$promise
      .then(function(categories){
        $scope.categories = categories;
        $scope.selectedCategory = $scope.selectedCategory || categories[0]
    });

    $scope.items = [];        
    $scope.newItem = function () {
      console.log("go into newItem");
      // Add Item input form
      $scope.items.push({});
      if($scope.items.length > 0){ 
        $scope.delDisabled = false;
      };
      this.changePrice();
    };

    $scope.spliceItem = function(){
      console.log("Item length: ", $scope.items.length);
      $scope.items.splice($scope.items.length-1, 1);
      if($scope.items.length < 1){ 
        $scope.delDisabled = true;
      };
      this.changePrice();
    };        

    $scope.changePrice = function(){
      console.log("items.length: ", $scope.items.length);
      $scope.totalprice=0;
      if($scope.items.length > 0){ 
        for(var i = 0 ; i < $scope.items.length ; i++){
          $scope.totalprice += $scope.items[i].price;
        };
        console.log("total price: ", $scope.totalprice);
        $scope.receipt.numberOfItem = $scope.items.length;
        $scope.receipt.total = $scope.totalprice;
      };   
    };

    $scope.submitForm = function() {
      //console.log(" go into submitForm");
      Receipt
        .create({
          comment: $scope.receipt.comment, 
          numberOfItem: $scope.receipt.numberOfItem, 
          total: $scope.receipt.total, 
          storeId: $scope.selectedStore.id,
          categoryId: $scope.selectedCategory.id
        }, function(receipt){           
            for(var i=0 ; i < $scope.items.length ; i++){
              Item
                .create({
                  name: $scope.items[i].name,
                  price: $scope.items[i].price                
                }, function(item){
                  console.log('item id : ', item.id);
                  ReceiptItem
                    .create({
                      receiptId: receipt.id,
                      itemId: item.id
                    });
                });
            }
      });
      $state.go('Receipts');
    };        
  }]);  