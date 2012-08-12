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
   window.EntryView = Backbone.View.extend({
      template: _.template($("#feed-template").html()),

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

   window.FeedView = Backbone.View.extend({
      
      initialize: function() {
         _.bindAll(this, 'render');
         this.collection.bind('reset', this.render);
      },
      render: function() {
         _.each(this.collection.models, function(entry){
            var entryView = new EntryView({
               model: entry
            });
            $(this.el).append(entryView.render().el);
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
              self.getFeed(window.participants.first());
        
           },
           error: function(collection, error) {
           }
         });
      },
      getFeed: function(participant){
        var self = this;
        // window.feed = new window.Emails();
        var Email = Parse.Object.extend("Email");
        window.query = new Parse.Query(Email);
        window.query.equalTo("participant",participant);

        // window.query.equalTo("toEmail","jie.z.zhou@gmail.com");
        window.feed = window.query.collection();
        window.feed.fetch({
          success: function(res) {
            console.log(res);
            self.displayFeed(window.feed,participant);

          }, 
          error: function(res){
            console.log(res);
          }
        });

      },
      displayFeed: function(feedCollection,participant) {
          var feedHeaderTemplate = _.template($("#feed-head-template").html());
          
          $("#main-tab-content").empty().append(feedHeaderTemplate(participant.toJSON()));

          var feedView = new FeedView({
             collection: feedCollection
          });
          $("#main-tab-content").append(feedView.render().el);
      }

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});