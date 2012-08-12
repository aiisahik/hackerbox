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

   window.ParticipantsView = Backbone.View.extend({
      tagName: 'tbody',
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
            // $("#participants").after(window.participantsView.render().el);
            getFeed();


           },
           error: function(collection, error) {
             // The collection could not be retrieved.
           }
         });
      },

      getFeed: function(){

         _.each(window.participants, function(participant){
            window.feed = new Emails();

            window.feed.equalTo("participant",participant);
            window.feed.fetch({
               success: function(collection) {
                  // collection.each(function(object)){
                  //    console.warn(object);
                  // });
               },

                error: function(collection, error) {
             // The collection could not be retrieved.
              }
            });
         });

      },

      var query = new Parse.Query(GameScore);
query.equalTo("playerEmail", "dstemkoski@example.com");
query.first({
  success: function(object) {
    // Successfully retrieved the object.
  },
  error: function(error) {
    alert("Error: " + error.code + " " + error.message);
  }
});

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});