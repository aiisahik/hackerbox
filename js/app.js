$(function(){


   Parse.initialize("IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8", "I9JnUSqpP9bcqhpwIialhWZGcNtXTCTnKzqZqWwq");

   // Participant Model
   // ----------
   //window.Participant = Backbone.Model.extend();

   Participant = Parse.Object.extend("Participant");
   window.Participants = Parse.Collection.extend({
      model: Participant
   });


// -- VIEWS


  // PERSON VIEW
   // ----------
   window.ParticipantView = Backbone.View.extend({
      template: _.template($("#participant-template").html()),
      tagName: 'tr',
      // events: {
      //    'click .thumbnail': 'toNode',
      // },
      initialize: function() {
         _.bindAll(this, 'render');
         this.model.bind('reset', this.render);
      },
      render: function() {
         $(this.el).empty().append(this.template(this.model.toJSON()));
         return this;
      },
   });

//    Brand VIEW
//    ----------
   window.ParticipantsView = Backbone.View.extend({
      tagName: 'tbody',
      // events: {
      //    'click .thumbnail': 'toNode',
      // },
      initialize: function() {
         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
      },
      render: function() {
         _.each(this.collection.models, function(participant){
            var participantView = new ParticipantView({
               model: participant
            });
            $(this.el).append(participantView.render().el);
         }, this);

         //$("#participants").empty().append(this.el);
         return this;
      }
   });


   // Brands VIEW
   // ----------

   // window.BrandsView = Backbone.View.extend({
   //    tagName: 'div',
   //    className: "row-fluid",
      
   //    initialize: function() {
   //       _.bindAll(this, 'render');
   //       this.collection.bind('reset', this.render);
   //    },
   //    render: function() {
   //       $(this.el).empty();
   //       _.each(this.collection.models, function(brand){
   //          var brandView = new BrandView({
   //             model: brand
   //          });
   //          $(this.el).append(brandView.render().el);
   //       }, this);
   //       //$('#persons').empty().append($(this.el));
   //       //-- resize node to below 200 px --//
         
   //       return this;
   //    }


   // });

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
         window.participants = new Participants();
         window.participants.fetch({
           success: function(collection) {
               collection.each(function(object) {
                  console.warn(object);
            // $(this.el).append(personView.render().el);
               
             });

            window.participantsView = new ParticipantsView({
               collection: window.participants
            });

            $("#participants").after(window.participantsView.render().el);
            $("#check_all").click(function() {

               if ($("#check_all").prop("checked")){
                  $("#participant_table").find("input").prop("checked",true);  

               } else { 
                  $("#participant_table").find("input").prop("checked",false);
                 
               }
            });
             
           },
           error: function(collection, error) {
             // The collection could not be retrieved.
           }
         });

      },




      // bindSearch: function() {

      //    // $("#search").find('li').height(150);
      //    // $("#persons").find('.thumbnail').height(150);

      //    // var firstNames = window.personsList.pluck('firstName');   
      //    // var lastNames = window.personsList.pluck('lastName');
      //    // window.names = [];
      //    // for(var i=0; i<lastNames.length; ++i) {
      //    //    window.names.push(firstNames[i] + " " + lastNames[i]);
      //    // }
      //    $("#search").autocomplete({source: window.names});

      //    $("#search").keypress(function(event) {
      //       if ( event.which == 13 ) {
      //          if ($("#searchbox").val() == "") {
      //              $("#results").append(window.resultsView.render().el);
      //          } else {
      //             event.preventDefault();
      //             var search_string = $("#searchbox").val();
      //             // if (person_index >=0 ) {
      //             //    window.personsView.render_person(window.personsList.at(person_index));
      //             // }
      //          }
      //       }
      //    });
      // }


   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});