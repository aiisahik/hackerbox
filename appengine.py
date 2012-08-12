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
		logging.info('sending email:')

	# def post(self):
	# 	pass

class EmailSubmitHandler(webapp2.RequestHandler):
    def post(self):
		s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True) 
		# include user and password
		q = parsepy.ParseQuery("Participant")
		Participants = q.fetch()
		logging.info('sending email:')

		for p in Participants:
			if self.request.get('check_'+p.email) == "on" :

				emailObject = parsepy.ParseObject("Email")
				emailObject.participant = p
				emailObject.subject = self.request.get('subject')
				emailObject.body = self.request.get('body')
				plaintext = emailObject.body
				html = emailObject.body.replace("/n","<br>")
				emailObject.save()

				logging.info('sending email: ' + plaintext)

				message = sendgrid.Message("survey@youxresearch.com", emailObject.subject, 
					plaintext , html)

				message.add_to(
					    {
					    	p.email : {'%firstname%': p.firstName},
					    }
				    )
				# change to bcc. 
				s.web.send(message)

			# username, password


app = webapp2.WSGIApplication([
    webapp2.Route(r'/', handler=HomeHandler, name='home'),
    webapp2.Route(r'/setup', handler=SetupHandler, name='setup'),
    webapp2.Route(r'/setup/submit', handler=SetupPostHandler, name='setup_submit'),
    webapp2.Route(r'/email', handler=EmailHandler, name='email'),
    webapp2.Route(r'/email/submit', handler=EmailSubmitHandler, name='email_submit') ])

