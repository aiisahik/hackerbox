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
             collection.each(function(object) {
                console.warn(object);
                // $(this.el).append(personView.render().el);
              });
           
              // window.participantsView = new ParticipantsView({
              //    collection: window.participants
              // });
              // $("#participants").after(window.participantsView.render().el);
              self.getFeed();
           },
           error: function(collection, error) {
             // The collection could not be retrieved.
           }
         });
      },

      getFeed: function(){

         _.each(window.participants.models, function(participant){
            // window.email = new Emails();
            var Email = Parse.Object.extend("Email");
            window.email.query = new Parse.Query(Email);
            window.email.query.equalTo("toEmail","jie.z.zhou@gmail.com");
            window.email.fetch();

            // window.feedCollection = query.collection();
            // email.find({
            //   success: function(results) {
            //     for (i=0; i<results.length; i++){
            //       results[i]
            //     };
            //     alert("Successfully retrieved " + results.length + " scores.");
            //   },
            //   error: function(error) {
            //     alert("Error: " + error.code + " " + error.message);
            //   }
// // Create our collection of Todos
// this.todos = new TodoList;

// // Setup the query for the collection to look for todos from the current user
// this.todos.query = new Parse.Query(Todo);
// this.todos.query.equalTo("user", Parse.User.current());

// // ...

// // Fetch all the todo items for this user from Parse
// this.todos.fetch();    
            });
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
         // });

      }

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});