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
    LeftNavItem = Backbone.View.extend({
        template: _.template($('#participant-li-template').html()),
        tagName: 'li',
        events: {
            'click .target': 'onClick'
        },
        initialize: function() {
            _.bindAll(this, 'render');
            this.model.bind('reset', this.render);
        },
        render: function(activate) {
            var data = this.model.toJSON();
            data.id = this.model.id;                 
            this.$el.html(this.template(data));                 
           $('#' + this.options.parentId).append(this.$el);
           if (activate) {
               this.$el.addClass('active');
               this.renderMain();
           }
           return this;
        },
        onClick: function() {
            this.renderMain();
        },
        renderMain: function() {
            this.options.pView.render();
        }
    });



    

   ParticipantView = Backbone.View.extend({
      template: _.template($("#feed-container-template").html()),
      tagName: 'div',
      initialize: function() {
         _.bindAll(this,'render');
         this.model.bind('reset', this.render);
      },
      render: function() {
          this.getFeed(this.model);          
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
              self.displayFeed(window.feed,participant);

            }, 
            error: function(res){
              console.log(res);
            }
          });
        },
        displayFeed: function(feedCollection,participant) {
            $("#main-tab-content").html(this.template(participant.toJSON()));
            var feedView = new FeedView({
               collection: feedCollection
            });
            $("#main-tab-content .posts").append(feedView.render().el);
        }
      
   });
   
   window.EntryView = Backbone.View.extend({
      events: {
         'click .btn-info': 'reply',
         'click .btn-danger': 'cancel',
         'click .btn-primary': 'sendEmail',
         
      },
      initialize: function() {
           _.bindAll(this, 'render');
           this.model.bind('reset', this.render);
        },

        render: function() {
            var template = _.template($("#feed-template").html());
            var json = this.modelJSON();
            if (!json.attachments) {
                json.attachments = false;
            }
            json.isResearcher = this.isResearcher();

            if (this.isResearcher()){
              json.type = "r";
            } else { 
              json.type = "p";
            }
           $(this.el).empty().append(template(json));
           return this;
        },
        isResearcher: function() {
            return (this.modelJSON()['fromEmail'] == 'survey@youxresearch.com') || (this.modelJSON()['fromEmail'] == 'test@userresearchtool.appspotmail.com');
        },
        modelJSON: function() {
            return this.model.toJSON();
        },
        reply: function() {
          $("#replyemail").remove();
          var template = _.template($("#feed-reply-template").html());
          var json = this.modelJSON();
          this.$el.append(template(json));
          return this;
        },
        sendEmail: function() {
          var subject = $('#emailsubject').val();
          var researcher_email = 'test@userresearchtool.appspotmail.com';
          var body = $('#emailbody').val();
          $.ajax({
            url: '/email/submit',
            type: "POST",
            data: {subject : subject, body: body, researcher_email: researcher_email},
            success: function(data) {
              $("#replyemail").remove().append("<h2>Email Submitted</h2>");
                $('#replyemail').fadeOut('slow', function() {
                  $('#replyemail').remove();
                // Animation complete.
              });
            }
          });
        },

        cancel: function() {
          $("#replyemail").remove();
          //this.$el.find(".reply").remove();
          return this;

        }
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
             collection.each(function(object, index) {                 
                 var pView = new ParticipantView({model: object, parentId: 'main-tab-content'});                 
                 var lnItem = new LeftNavItem({model: object, parentId: 'participant-container', pView: pView});                 
                 lnItem.render(index == 0);
              });
           
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
      }
      

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});