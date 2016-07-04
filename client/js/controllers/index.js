'use strict';

 angular
  .module('app')
  .controller('IndexController', ['$scope', '$state', 'IntroHeaderService', 
   function($scope, $state, IntroHeaderService) {
    //Fix nav bar and hid the intro header
    IntroHeaderService.isIntroHeaderVisible(true);   	

  }]);