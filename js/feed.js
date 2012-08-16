$(function(){

  Parse.initialize("IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8", "I9JnUSqpP9bcqhpwIialhWZGcNtXTCTnKzqZqWwq");
  var currentUser = Parse.User.current();
  if (currentUser) {
    $("#researcher-name").empty().append(currentUser.get('firstName')+' '+currentUser.get('lastName'));
  } else {
      window.location = "/";
  }
  $("#logout").click(function(e){
    e.preventDefault();
    Parse.User.logOut();
    window.location = "/";
  })
  

    // Participant Model
    // ----------

   Participant = Parse.Object.extend("Participant");
   window.Participants = Parse.Collection.extend({
      model: Participant,
      query: (new Parse.Query(Participant)).equalTo("study", window.currentStudy)
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
            this.$el.empty().append(this.template(data));
           //$('#' + this.options.parentId).append(this.$el);
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
          window.query.equalTo("study",window.currentStudy);
          window.query.descending('updatedAt');
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
            $("#main-tab-content").empty().append(this.template(participant.toJSON()));
            var feedView = new FeedView({
               collection: feedCollection
            });
            $("#main-tab-content .posts").append(feedView.render().el);
        }
      
   });
   
   window.EntryView = Backbone.View.extend({
      events: {
         'click .btn-info': 'reply',
         'click .btn-submit': 'cancel',
         'click .btn-success': 'sendEmail',
         
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
            json.id = this.model.id;
            var date = new Date(this.model.updatedAt);
            json.month = date.format('mmm').toUpperCase();
            json.day = date.format('dd')
            json.time = date.format('h:MM TT')
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
          var template = _.template($("#feed-reply-template").html());
          var json = this.modelJSON();
          $('#reply-container-' + this.model.id).html(template(json));
          $('#reply-container-' + this.model.id).show();
          return false;
        },
        sendEmail: function() {
          var subject = $('#emailsubject').val();
          var toEmail = this.modelJSON()['fromEmail'];
          var researcher_email = 'test@userresearchtool.appspotmail.com';
          var body = $('#emailbody').val();
          if (!body) {
              alert('Please enter some text');
              return false;
          }
          var participantID = this.model.get('participant').id;
          $.ajax({
            url: '/email/ajax',
            type: "POST",
            data: {subject : subject, body: body, researcher_email: researcher_email, toEmail : toEmail, participantID: participantID},
            success: function(data) {
              $("#replyemail").remove().append("<h2>Email Submitted</h2>");
                $('#replyemail').fadeOut('slow', function() {
                  $('#reply-container-' + this.model.id).hide();
                // Animation complete.
              });
            }
          });
          return false;
        },

        cancel: function() {
          $('#reply-container-' + this.model.id).hide();
          //this.$el.find(".reply").remove();
          return false;

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
        var self = this;
        var Study = Parse.Object.extend("Study");
        var study = new Parse.Query(Study);
        study.equalTo("creator", currentUser);
        study.first({
          success: function(studyResult) {
              window.currentStudy = studyResult;
              self.getData();
          }
        });
      },

      render: function(){
         
      },

      getData: function(){
        var self = this;
        
        var participant_query = new Parse.Query(Participant);
        participant_query.equalTo("study",window.currentStudy);
        participant_query.descending('firstName');
        window.participants = participant_query.collection();
         window.participants.fetch({  
          success: function(collection) {
             self.showParticipants(collection);
           },
           error: function(collection, error) {
             alert(error.message);
           }
         });
      }, 
      showParticipants: function(collection){
        $('#participant-container').empty();
        var container = $('#participant-container');
        var main = $('#main-tab-content');
        collection.each(function(object, index) {                 
          var pView = new ParticipantView({model: object, parentId: 'main-tab-content'});                 
          var lnItem = new LeftNavItem({model: object, parentId: 'participant-container', pView: pView});                 
          lnItem.render(index == 0);
          $("#participant-container").append(lnItem.render().el);


        });   
        this.setupAddParticipants();
        this.setupSendEmail();
      },

      setupAddParticipants: function(){
        var self=this;
        $("#showAddParticipant").click(function (e) {
          e.preventDefault();
          $('#addParticipantModal').modal('show');
        });
        $('#addParticipantModal').on('show', function () {
          $('#addParticipant').click(function(e){
            var participant = new Participant();
            participant.set("firstName", $("#p_first_name").val());
            participant.set("lastName", $("#p_last_name").val());
            participant.set("email", $("#p_email_address").val());
            participant.set("phoneNumber", $("#p_phone_number").val());          
            participant.set("creator", currentUser);
            participant.set("study", window.currentStudy);
            participant.save(null, {
              success: function(participant) {        
                window.participants.add(participant);
                $('#addParticipant-success').show().empty().append("Successfully added "+$("#p_first_name").val()+".");
                $('#addParticipantModal').find("input").val("");
              }
            });
          })
        });
        $('#addParticipantModal').on('hide', function () {
          self.showParticipants(window.participants);
        });
      }, 
      setupSendEmail: function() {
        var self=this;
        $("#showSendEmail").click(function (e) {
          e.preventDefault();
          $('#sendEmailModal').modal('show');
         
        });
        $('#sendEmailModal').on('show', function () {
          $("#sendAllEmail-info").hide().empty();
           var $el = "";
          _.each(window.participants.models, function(participant){
            $el += '<a href="#" class="btn">'+participant.get('firstName')+"&nbsp"+participant.get('lastName')+"</a>&nbsp";
          }, this);
          $('#emailToList').empty().append($el);

          $("#submitEmail").click(function (e) {
            e.preventDefault();
            self.emailAllParticipants();
          });
          //sendEmailTemplate = _.template($("#sendEmail-template").html()),
          //$("#sendEmailModal .modal-body").empty().append(sendEmailTemplate(currentUser.toJSON()));
          // set up list of participants to email 
          // var $el = "";
          // _.each(window.participants.models, function(participant){
          //   var participantEmailListTemplate = _.template($("#participantEmailList-template").html());
          //   $el += participantEmailListTemplate(participant.toJSON());
          // }, this);
          // $("#participants").after($el);
          // $("#participant_table").find("input").prop("checked",true);
          // $("#check_all").click(function() {
          //    if ($("#check_all").prop("checked")){
          //       $("#participant_table").find("input").prop("checked",true);  
          //    } else { 
          //       $("#participant_table").find("input").prop("checked",false);
          //    }
          // });

        });
      },
      emailAllParticipants: function() {
        $("#submitEmail").removeClass("btn-info").addClass("disabled");
        $("#submitEmail").empty().append("Sending Emails");
        var subject = $('#emailsubject').val();
        var fromEmail = window.currentStudy.get('email');
        var body = $('#emailbody').val();
        var studyID = window.currentStudy.id;
        var researcherName = currentUser.get('firstName');
        var company = currentUser.get('company');
        if (!body) {
            alert('Please enter some text');
            return false;
        }
        $.ajax({
          url: '/emailall/ajax',
          type: "POST",
          data: {subject : subject, body: body, fromEmail: fromEmail, studyID: studyID, researcherName: researcherName, company:company},
          success: function(data) {
            //$('#sendEmailModal').modal('hide').fade();
            $("#submitEmail").removeClass("disabled").addClass("btn-info");
            $("#submitEmail").empty().append("Send");
            $("#sendAllEmail-info").show().html("Emails successfully send.");
          },
           error: function(error) {
             //alert(error.message);
             $("#sendAllEmail-info").removeClass("alert-success").addClass("alert-error");
             $("#sendAllEmail-info").show().html("Emails successfully send.");
          }
        });
        return false;
      }
      

   });

   $(function() {
      var app = new AppRouter();
      Backbone.history.start();

   });

});