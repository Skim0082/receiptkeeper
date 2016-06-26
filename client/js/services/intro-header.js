angular
  .module('app')
  .factory('IntroHeaderService', ['$rootScope',  function($rootScope){
    function isIntroHeaderVisible(home){
      if(home){
        $('.navbar-brand').attr("href", "#page-top");
        if(!$('header').is(":visible")){
          $('header').show();
          $('.navbar-default').removeClass('navbar-shrink' );
        } 
        if(!$rootScope.currentUser){    
            $('.staticNavMenu').removeClass("active");   
            if(!$('.staticNavMenu').is(":visible")){
              $('.staticNavMenu').show();       
            } 
            if($('.staticNavSigup').is(":visible")){
              $('.staticNavSigup').hide();       
            }     
        }         
      }else{
        $('.navbar-brand').attr("href", "/");
        if($('header').is(":visible")){
          $('header').hide();
          $('.navbar-default').addClass('navbar-shrink' );        
        } 
        if(!$rootScope.currentUser){    
            if($('.staticNavMenu').is(":visible")){
              $('.staticNavMenu').removeClass("active");
              $('.staticNavMenu').hide();       
            }
            if(!$('.staticNavSigup').is(":visible")){
              $('.staticNavSigup').show();       
            }                
        }
      } 

    };
    return {
      isIntroHeaderVisible: isIntroHeaderVisible
    };
  }]);