$(function(){

   // Brand Model
   // ----------
   window.Brand = Backbone.Model.extend();
   window.Brands = Backbone.Collection.extend({
      model: Brand
   });


//-- VIEWS

   // Brand VIEW
   // ----------
   window.BrandView = Backbone.View.extend({
      template: _.template($("#brand-template").html()),
      tagName: 'div',
      className: "span10",

      events: {
         'click .thumbnail': 'toNode',
      },
      initialize: function() {
         _.bindAll(this, 'render');
         this.model.bind('reset', this.render);
      },
      render: function() {

         // _.each(this.model.images, function(image){
         //    $(this.el).append('<img href="'+image+'" />');
         // }
         $(this.el).empty().append(this.template(this.model.toJSON()));
         return this;
      },
      toNode: function(){
         ///treeNodesView.update(this.model.get('id'));
      }
   });

   // Brands VIEW
   // ----------

   window.BrandsView = Backbone.View.extend({
      tagName: 'div',
      className: "row-fluid",
      
      initialize: function() {
         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
      },
      render: function() {
         $(this.el).empty();
         _.each(this.collection.models, function(brand){
            var brandView = new BrandView({
               model: brand
            });
            $(this.el).append(brandView.render().el);
         }, this);
         //$('#persons').empty().append($(this.el));
         //-- resize node to below 200 px --//
         
         return this;
      }


   });

   var AppRouter = Backbone.Router.extend({
      routes: {
         '': 'home'
      },
      initialize: function() {
         // should instantiate root level views
      },

      home: function() {
         this.getData();
         

      },

      render: function(){

      },

      getData: function(){
         $.ajax({
            url: "json/test1.json",
            success: function(data) {

               window.resultBrands = new Brands();
               window.resultBrands.add(data.results);
               
               window.queryBrand = new Brands();
               window.queryBrand.add(data.query);

               window.resultsView = new BrandsView({
                  collection: window.resultBrands
               });

               window.queryView = new BrandsView({
                  collection: window.queryBrand
               });

               $("#results").append(window.resultsView.render().el);

            }
         // .done(function() { 
         //       return null;
         //    });
         });
      },

      bindSearch: function() {

         // $("#search").find('li').height(150);
         // $("#persons").find('.thumbnail').height(150);

         // var firstNames = window.personsList.pluck('firstName');   
         // var lastNames = window.personsList.pluck('lastName');
         // window.names = [];
         // for(var i=0; i<lastNames.length; ++i) {
         //    window.names.push(firstNames[i] + " " + lastNames[i]);
         // }
         $("#search").autocomplete({source: window.names});

         $("#search").keypress(function(event) {
            if ( event.which == 13 ) {
               if ($("#searchbox").val() == "") {
                   $("#results").append(window.resultsView.render().el);
               } else {
                  event.preventDefault();
                  var search_string = $("#searchbox").val();
                  // if (person_index >=0 ) {
                  //    window.personsView.render_person(window.personsList.at(person_index));
                  // }
               }
            }
         });
      }


   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});