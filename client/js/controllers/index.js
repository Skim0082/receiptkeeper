'use strict';

 angular
  .module('app')
  .controller('IndexController', ['$scope', '$state', 'IntroHeaderService', '$rootScope', 
   function($scope, $state, IntroHeaderService, $rootScope) {
      
    IntroHeaderService.isIntroHeaderVisible(true);   	

  }]);