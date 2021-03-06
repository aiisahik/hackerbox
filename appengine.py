import wsgiref.handlers
import cgi
from google.appengine.api.memcache import Client
from google.appengine.ext.webapp import template
from google.appengine.ext import db
import webapp2
import time, os
import urlparse
import hashlib, base64
import sendgrid
import parsepy
import logging

parsepy.APPLICATION_ID = "IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8"
parsepy.MASTER_KEY = "iGW730DEr0h5VA4110jCwQf0TJjnIvyNIWRXemT8"


class HomeHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'index.html')
		self.response.out.write(template.render(path,{}))

class NewUserHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'newuser.html')
		self.response.out.write(template.render(path,{}))

class NewUserCreateHandler(webapp2.RequestHandler):
	def post(self):
		user = parsepy.ParseObject("User")
		user.username = self.request.get('username')		
		user.email = self.request.get('email')
		user.password = self.request.get('password')
		# user.phone = self.request.get('phone')
		user.save()

class LoginHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'login.html')
		self.response.out.write(template.render(path,{}))

class BackDoorHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'backdoor.html')
		self.response.out.write(template.render(path,{}))

class DemoHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'demologin.html')
		self.response.out.write(template.render(path,{}))

class SetupHandler(webapp2.RequestHandler):
	# a page for user email / first/last name / phone
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'setup.html')
		self.response.out.write(template.render(path,{}))

class SetupPostHandler(webapp2.RequestHandler):
	def post(self):
		participant = parsepy.ParseObject("Participant")
		participant.email = self.request.get('email_address')
		participant.firstName = self.request.get('first_name')
		participant.lastName = self.request.get('last_name')
		participant.phoneNumber = self.request.get('phone_number')
		participant.save()

class EmailHandler(webapp2.RequestHandler):
	# a page for user email / first/last name / phone
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'email.html')
		# participant = parsepy.ParseQuery("Participant")
		self.response.out.write(template.render(path,{}))

class EmailSubmitHandler(webapp2.RequestHandler):
    def post(self):
		s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True) 
		# include user and password
		studyId = self.request.get('studyId')
		study = parsepy.ParseQuery('Study').get(studyId)
		q = parsepy.ParseQuery("Participant")
		q.eq('study', study)
		Participants = q.fetch()

		for p in Participants:
			if self.request.get('check_'+p.email) == "on" :

				emailObject = parsepy.ParseObject("Email")
				emailObject.participant = p
				emailObject.subject = self.request.get('subject')
				emailObject.body = self.request.get('body').replace('%firstname%',p.firstName)
				emailObject.toEmail = p.email
				emailObject.fromEmail = self.request.get('researcher_email')					
				emailObject.study = study
				plaintext = emailObject.body
				html = emailObject.body.replace("/n","<br>")
				emailObject.save()

				logging.info('sending email: ' + plaintext)

				message = sendgrid.Message(("test+" + study.objectId() + "@userresearchtool.appspotmail.com", "Katherine from Square"), emailObject.subject, 
					plaintext , html)

				message.add_to(
					    {
					    	p.email : {'%firstname%': p.firstName},
					    }
				    )
				s.web.send(message)

		self.redirect("/feed")

class EmailAllAjaxHandler(webapp2.RequestHandler):
    def post(self):
		s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True) 
		# include user and password
		logging.info('body: ' + self.request.get('body'))
		logging.info('subject: ' + self.request.get('subject'))
		logging.info('study ID: ' + self.request.get('studyID'))
		studyId = self.request.get('studyID')
		study = parsepy.ParseQuery('Study').get(studyId)
		q = parsepy.ParseQuery("Participant")
		q.eq('study', study)
		Participants = q.fetch()
		for p in Participants:
			logging.info('emailing: ' + p.email)
			emailObject = parsepy.ParseObject("Email")
			emailObject.participant = p
			emailObject.subject = self.request.get('subject')
			emailObject.body = self.request.get('body').replace('%firstname%',p.firstName)
			emailObject.toEmail = p.email
			emailObject.study = study
			#emailObject.fromEmail = self.request.get('fromEmail')
			emailObject.fromEmail = self.request.get('researcherName') + "+" + study.objectId() + "@userresearchtool.appspotmail.com"
			html = emailObject.body.replace("/n","<br>")
			emailObject.save()
			message = sendgrid.Message((emailObject.fromEmail, 
				self.request.get('researcherName') + "@" + self.request.get('company')), 
				emailObject.subject, 
				emailObject.body, 
				html)

			message.add_to(
				    {
				    	p.email : {'%firstname%': p.firstName},
				    }
			    )
			s.web.send(message)
		#self.response.out.write('[{"success": "true"}]')	

class EmailAjaxHandler(webapp2.RequestHandler):
    def post(self):
    	# setup SENDGRID include user and password
		s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True) 

		emailObject = parsepy.ParseObject("Email")

		# -- setup study object 
		study = parsepy.ParseQuery('Study').get(self.request.get('studyID'))
		emailObject.study = study
		# -- setup participant 
		p = parsepy.ParseQuery("Participant").get(self.request.get('participantID'))
		emailObject.participant = p
		emailObject.toEmail = p.email
		#Participants = q.fetch()
		#toEmail = self.request.get('toEmail')
		
		emailObject.subject = self.request.get('subject')
		emailObject.body = self.request.get('body').replace('%firstname%',p.firstName)
		#emailObject.fromEmail = self.request.get('fromEmail')
		emailObject.fromEmail = self.request.get('researcherName')+"+"+ study.objectId() + "@userresearchtool.appspotmail.com"

		plaintext = emailObject.body
		html = emailObject.body.replace("/n","<br>")
		emailObject.save()

		logging.info('sending to :'+emailObject.toEmail)
		logging.info('sending email: ' + plaintext)
		logging.info('study ID: ' + self.request.get('studyID'))
		
		message = sendgrid.Message((emailObject.fromEmail , 
			self.request.get('researcherName') + "@" + self.request.get('company')), 
			emailObject.subject, 
			plaintext, 
			html)
		# message = sendgrid.Message(("test@userresearchtool.appspotmail.com" , "Katherine from Square"), emailObject.subject, plaintext , html)

		message.add_to(
			    {
			    	p.email : {'%firstname%': p.firstName},
			    }
		    )
		s.web.send(message)
		

		outputJSON = '{"subject":"'+emailObject.subject+'", "body":"'+emailObject.body+'", "studyID":"'+study.objectId()+'", "toEmail":"'+emailObject.toEmail+'", "fromEmail":"'+emailObject.fromEmail+'", "participant":"'+emailObject.participant.objectId()+'", "updatedAt":"'+emailObject.updatedAt().strftime("%Y-%m-%d %H:%M:%S")+'"}'
		self.response.out.write(outputJSON)			

class FeedHandler(webapp2.RequestHandler):
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'feed.html')
		self.response.headers['Access-Control-Allow-Origin'] = '*' #this is a hack - remove in production version
		self.response.out.write(template.render(path,{}))

app = webapp2.WSGIApplication([
    webapp2.Route(r'/', handler=HomeHandler, name='home'),
    webapp2.Route(r'/newuser', handler=NewUserHandler, name='newuser'),
    webapp2.Route(r'/newuser/create', handler=NewUserCreateHandler, name='newuser_create'),
    webapp2.Route(r'/login', handler=LoginHandler, name='login'),    
    webapp2.Route(r'/backdoor', handler=BackDoorHandler, name='demo'),   
    webapp2.Route(r'/demo', handler=DemoHandler, name='demo'),   
    webapp2.Route(r'/setup', handler=SetupHandler, name='setup'),
    webapp2.Route(r'/setup/submit', handler=SetupPostHandler, name='setup_submit'),
    webapp2.Route(r'/feed', handler=FeedHandler, name='feed'),
    webapp2.Route(r'/email', handler=EmailHandler, name='email'),
    webapp2.Route(r'/email/ajax', handler=EmailAjaxHandler, name='email'),
    webapp2.Route(r'/emailall/ajax', handler=EmailAllAjaxHandler, name='email'),
    webapp2.Route(r'/email/submit', handler=EmailSubmitHandler, name='email_submit') ])

