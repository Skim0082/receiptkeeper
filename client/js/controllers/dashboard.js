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
  }]);