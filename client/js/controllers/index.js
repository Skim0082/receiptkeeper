'use strict';

 angular
	.module('app')
	.controller('IndexController', ['$scope', '$state', 'IntroHeaderService', 
	function($scope, $state, IntroHeaderService) {
		//Fix nav bar and hid the intro header
		IntroHeaderService.isIntroHeaderVisible(true); 
		$scope.name = "index"; 	

	}])
	.controller('ModalLoginCtrl', function ($scope, $modal, $log) {

		$scope.open = function (size) {
		    var modalInstance = $modal.open({
		      templateUrl: 'ModalLogin.html',
		      controller: 'ModalInstanceLoginCtrl'
		    });
	  	};
	})
  .controller('ModalInstanceLoginCtrl', [
  	'$scope', 'AuthService', '$state', '$rootScope', '$modalInstance', 
      function($scope, AuthService, $state, $rootScope, $modalInstance) {           

    $scope.user = {
      email: "joe@gmail.com",
      password: "aaa"
    };

    $scope.login = function() {
      AuthService.login($scope.user.email, $scope.user.password)
        .then(function() {
          //Check the invalid user, and giving a message will need
          $modalInstance.close('login');
          //$state.go('Dashboard');
        });
    };

	$scope.cancel = function () {
	$modalInstance.dismiss('cancel');
	};

	$scope.signup = function(){
      $modalInstance.close('signup');
      $state.go('Signup');			
	};

  }]);  