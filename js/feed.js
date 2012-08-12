$(function(){


   Parse.initialize("IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8", "I9JnUSqpP9bcqhpwIialhWZGcNtXTCTnKzqZqWwq");

   // Participant Model
   // ----------
   //window.Participant = Backbone.Model.extend();

   Participant = Parse.Object.extend("Participant");
   window.Participants = Parse.Collection.extend({
      model: Participant
   });

   Email = Parse.Object.extend("Email");
   window.Emails = Parse.Collection.extend({
      model: Email
   });

// -- VIEWS
   // window.ParticipantView = Backbone.View.extend({
   //    template: _.template($("#participant-template").html()),
   //    tagName: 'tr',
   //    // events: {
   //    //    'click .thumbnail': 'toNode',
   //    // },
   //    initialize: function() {
   //       _.bindAll(this, 'render');
   //       this.model.bind('reset', this.render);
   //    },
   //    render: function() {
   //       $(this.el).empty().append(this.template(this.model.toJSON()));
   //       return this;
   //    },
   // });

   // window.ParticipantsView = Backbone.View.extend({
   //    tagName: 'tbody',
   //    initialize: function() {
   //       _.bindAll(this, 'render');
   //       this.collection.bind('reset', this.render);
   //    },
   //    render: function() {
   //       _.each(this.collection.models, function(participant){
   //          var participantView = new ParticipantView({
   //             model: participant
   //          });
   //          $(this.el).append(participantView.render().el);
   //       }, this);
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
        var self = this;
         window.participants = new Participants();
         window.participants.fetch({

          
          success: function(collection) {
              var container = $('#participant-container');
              var main = $('#main-tab-content');
              collection.each(function(object) {
                 // render left nav item
                 var rendered = _.template($('#participant-li-template').html(), {
                     firstName: object.get("firstName"),
                     lastName: object.get("lastName"),
                     id: object.id
                     });
                 container.append(rendered);
                 
                 // render main tab wrappers
                 var rendered = _.template($('#participant-main-template').html(), {
                     firstName: object.get("firstName"),
                     lastName: object.get("lastName"),
                     id: object.id
                     });
                 main.append(rendered);


                 
              });
              self.getFeed("CTeaSW3801");
           
              // window.participantsView = new ParticipantsView({
              //    collection: window.participants
              // });
              // $("#participants").after(window.participantsView.render().el);
              // self.getFeed();
           },
           error: function(collection, error) {
             // The collection could not be retrieved.
           }
         });
      },

      getFeed: function(participantId){


          window.feed = new window.Emails();

         _.each(window.participants.models, function(participant){


            //var EmailObject = Parse.Object.extend("Email");
            window.feed.query = new Parse.Query(Email);
            window.feed.query.equalTo("participant",participant);
            //window.feed.query.equalTo("fromEmail","survey@youxresearch.com");

            window.feed.fetch({
              success: function(res) {
                console.log(res);

              }, 
              error: function(res){
                console.log(res);
              }
            });
            //console.warn(window.feedCollection);
            // window.feed = new Emails();

            // window.feed.equalTo("participant",participant);
            // window.feed.fetch({
            //    success: function(collection) {
            //       collection.each(function(object){
            //          console.warn(object);
            //       });

            //       // var query = new Parse.Query(GameScore);
            //       // query.equalTo("playerEmail", "dstemkoski@example.com");
            //       // query.first({
            //       // success: function(object) {
            //       //   // Successfully retrieved the object.
            //       // },
            //       //   error: function(error) {
            //       //     alert("Error: " + error.code + " " + error.message);
            //       // }
            //    },

            //     error: function(collection, error) {
            //  // The collection could not be retrieved.
            //   }
            //});
         });

      }

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});