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

   Study = Parse.Object.extend("Study");
   Email = Parse.Object.extend("Email");

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
            //this.options.pView.render();

          window.feedView = new FeedView({
            model: this.model
          });

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
      }      
   });
   
   window.EntryView = Backbone.View.extend({

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
          var fromEmail = this.modelJSON()['fromEmail'];
          if (fromEmail) {
            if ((fromEmail.indexOf("@userdiary.com") != -1) || (fromEmail.indexOf("@userresearchtool.appspotmail.com") != -1)) {
              return true;
            } else {
              return false;
            }
          } else {
            return false;
          }
        },
        modelJSON: function() {
            return this.model.toJSON();
        }
       
     });

   window.FeedView = Backbone.View.extend({
      template: _.template($("#feed-container-template").html()),
      events: {
        'click .btn-info': 'showSendEmail',
        'click .btn-success': 'sendEmail',
        'click .btn-submit': 'cancel'
      },

      initialize: function() {
         _.bindAll(this, 'render');
         this.model.bind('reset', this.render);
         this.getFeed(this.model);          
      },
      render: function() {
          this.getFeed(this.model);          
      },
      getFeed: function(participant){
        var self = this;
        // window.feed = new window.Emails();
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
        this.collection = feedCollection;
        $(this.el).append(this.template(participant.toJSON()));
        $("#main-tab-content").empty().append(this.$el);
        _.each(feedCollection.models, function(entry){
          var entryView = new EntryView({
            model: entry
          });
          //$(this.el).append(entryView.render().el);

          $("#main-tab-content .posts").append(entryView.render().el);
        }, this);
      },
      showSendEmail: function() {

          var template = _.template($("#feed-reply-template").html());
          var json = this.modelJSON();
          $("#sendReplyEmail").removeClass("disabled").addClass("btn-info");
          $("#sendReplyEmail").empty().append("Send");
          if (this.collection.length > 0 ){
            json.subject = this.collection.last().get('subject');
          } else {
            json.subject = "Checking in";
            // default email subject for new emails 
          }
          var date = new Date();
            json.month = date.format('mmm').toUpperCase();
            json.day = date.format('dd')
            json.time = date.format('h:MM TT')

          $("#main-tab-content .sendemail-container").empty().append(template(json));
          //$('#reply-container-' + this.model.id).show();
          $("#sendEmail-info").empty().hide();
          return false;
        },
      sendEmail: function() {
          var self = this;
          $("#sendReplyEmail").removeClass("btn-info").addClass("disabled");
          $("#sendReplyEmail").empty().append("Sending Email");
          var subject = $('#emailsubject').val();
          var toEmail = this.model.get('email');
          var body = $('#emailbody').val();
          var studyID = window.currentStudy.id;
          var researcherName = currentUser.get('firstName');
          var company = currentUser.get('company');
          var participantID = this.model.id;

          if (!body) {
              alert('Please enter some text');
              return false;
          }
          $.ajax({
            url: '/email/ajax',
            type: "POST",
            data: {subject : subject, body: body, toEmail : toEmail, participantID: participantID, studyID: studyID, researcherName: researcherName, company: company},
            success: function(data) {
              $("#sendEmail-info").show().html("Email successfully sent.");
              $("#sendReplyEmail").removeClass("disabled").addClass("btn-info");
              $("#sendReplyEmail").empty().append("Send");
              $('#emailsubject').val("");
              $('#emailbody').val("");
              // refresh the email feed for this participant
              self.render();
            }
          });
          return false;
        },

        cancel: function() {
          $("#main-tab-content .sendemail-container").empty().append('<a class="btn btn-info" href="#">Send Email</a><br><br>');
          return false;

        },
        modelJSON: function() {
            return this.model.toJSON();
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
        var q = new Parse.Query(Study);
        q.equalTo("creator", currentUser);
        q.first({
          success: function(studyResult) {
            if (studyResult != null) {
              window.currentStudy = studyResult;
              self.getData();
            } else {
              // create new study 
              var study = new Study();
              study.set("name", currentUser.get('firstName') + "'s User Study");
              study.set("email", currentUser.get('email'));
              study.set("phone", currentUser.get('phone'));
              study.set("creator", currentUser);
              // ** CHANGE WHEN ENABLING "ADD MULTIPLE STUDIES" FEATURE **
              study.save(null, {
                success: function(study) {
                  window.currentStudy = studyResult;
                  self.getData();
                  //StudyAccess is for later use case for researcher to
                  //grant access to other researchers
                },
                error: function(study, error) {
                  // The save failed.
                  // error is a Parse.Error with an error code and description.
                }
              });
            }
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
            if (collection.length > 0) {
              self.showParticipants(collection);  
            } else {
              self.setupAddParticipants();
              $('#addParticipantModal').modal('show');
            }
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
          $('#addParticipant').unbind();
          $('#addParticipant').click(function(e){
            $('#addParticipant').removeClass("btn-info").addClass("disabled");
            $("#addParticipant").empty().append("Adding Participant");
            $('#addParticipant-success').hide().empty();
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
                $('#addParticipant').removeClass("disabled").addClass("btn-info");
                $("#addParticipant").empty().append("Add Participant");
                $('#addParticipant-success').show().empty().append("Successfully added "+$("#p_first_name").val()+".");
                $('#addParticipantModal').find("input").val("");
              }
            });
          });
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

          $('#submitEmail').unbind();
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