'use strict';

angular
  .module('app')
  // The example of the full functionality
  .controller('UploadController',['$state', '$scope', 'FileUploader', 
      '$rootScope', 'Container', 
            function ($state, $scope, FileUploader, $rootScope, Container) {
    'use strict';


      var userId = "";
      var repositoryPath = "";
      
      if($rootScope.currentUser == undefined || $rootScope.currentUser == null){
        $state.go('forbidden');
      }else{
        userId = $rootScope.currentUser.id;
        repositoryPath = userId + '/';     
      }     

    // create a uploader with options

    var uploader = $scope.uploader = new FileUploader({
      scope: $scope,                          // to automatically update the html. Default: $rootScope
      url: '/api/containers/' + repositoryPath + 'upload',
      formData: [
        { key: 'value' }
      ]
    });

    // ADDING FILTERS
    uploader.filters.push({
        name: 'imageFilter',
        fn: function (item, options) { // second user filter
          var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
          return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
        }
    });

    // REGISTER HANDLERS
    // --------------------
    uploader.onAfterAddingFile = function(item) {
      console.info('After adding a file', item);
    };
    // --------------------
    uploader.onAfterAddingAll = function(items) {
      console.info('After adding all files', items);
    };
    // --------------------
    uploader.onWhenAddingFileFailed = function(item, filter, options) {
      console.info('When adding a file failed', item);
    };
    // --------------------
    uploader.onBeforeUploadItem = function(item) {
      console.info('Before upload', item);
    };
    // --------------------
    uploader.onProgressItem = function(item, progress) {
      console.info('Progress: ' + progress, item);
    };
    // --------------------
    uploader.onProgressAll = function(progress) {
      console.info('Total progress: ' + progress);
    };
    // --------------------
    uploader.onSuccessItem = function(item, response, status, headers) {
      console.info('Success', response, status, headers);
      $scope.$broadcast('uploadCompleted', item);
    };
    // --------------------
    uploader.onErrorItem = function(item, response, status, headers) {
      console.info('Error', response, status, headers);
    };
    // --------------------
    uploader.onCancelItem = function(item, response, status, headers) {
      console.info('Cancel', response, status);
    };
    // --------------------
    uploader.onCompleteItem = function(item, response, status, headers) {
      console.info('Complete', response, status, headers);
    };
    // --------------------
    uploader.onCompleteAll = function() {
      console.info('Complete all');
    };
    // --------------------
    console.info('uploader: ', uploader);
  }
]).controller('FilesController',['$state', '$scope', '$http', '$rootScope', 
    function ($state, $scope, $http, $rootScope) {

      var userId = "";
      var repositoryPath = "";
      
      if($rootScope.currentUser == undefined || $rootScope.currentUser == null){
        $state.go('forbidden');
      }else{
        userId = $rootScope.currentUser.id;
        repositoryPath = userId + '/';      
      }    

    $scope.load = function () {
      $http.get('/api/containers/' + repositoryPath + 'files').success(function (data) {
        console.log("file data: ", data);
        $scope.files = data;
        $scope.filepath = repositoryPath;
      });
    };

    $scope.delete = function (index, id) {
      $http.delete('/api/containers/' + repositoryPath + 'files/' + encodeURIComponent(id)).success(function (data, status, headers) {
        $scope.files.splice(index, 1);
      });    
    };

    $scope.$on('uploadCompleted', function(event) {
      console.log('uploadCompleted event received');
      $scope.load();
    });

  }])
  .directive('ngThumb', ['$window', function($window) {
      var helper = {
          support: !!($window.FileReader && $window.CanvasRenderingContext2D),
          isFile: function(item) {
              return angular.isObject(item) && item instanceof $window.File;
          },
          isImage: function(file) {
              var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
              return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
          }
      };

      return {
          restrict: 'A',
          template: '<canvas/>',
          link: function(scope, element, attributes) {
              if (!helper.support) return;

              var params = scope.$eval(attributes.ngThumb);

              if (!helper.isFile(params.file)) return;
              if (!helper.isImage(params.file)) return;

              var canvas = element.find('canvas');
              var reader = new FileReader();

              reader.onload = onLoadFile;
              reader.readAsDataURL(params.file);

              function onLoadFile(event) {
                  var img = new Image();
                  img.onload = onLoadImage;
                  img.src = event.target.result;
              }

              function onLoadImage() {
                  var width = params.width || this.width / this.height * params.height;
                  var height = params.height || this.height / this.width * params.width;
                  canvas.attr({ width: width, height: height });
                  canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
              }
          }
      };
    }]);