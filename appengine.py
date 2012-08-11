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

parsepy.APPLICATION_ID = "IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8"
parsepy.MASTER_KEY = "iGW730DEr0h5VA4110jCwQf0TJjnIvyNIWRXemT8"


def sendemail(participant):
## 2. Send email to get recipient input 
	s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True) 
	# include user and password

	# unique_email = "%s%s%d%d@youxresearch.com" %(coname,survey,surveyid,userid)
	message = sendgrid.Message("survey@youxresearch.com", "subject", "Hello %name%, your code is %code%", "<b>Hello %name%, your code is %code%</b>")

	for p in participant:
		message.add_to(
			    {
			    	p.email : {'%name%': p.firstName},
			    }
		    )
	# change to bcc. 
		s.web.send(message)
# username, password




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

class GenEmailHandler(webapp2.RequestHandler):
	# a page for user email / first/last name / phone
    def get(self):
		path = os.path.join(os.path.dirname(__file__), 'gen_email.html')
		participant = parsepy.ParseQuery("Participant")
		# does it return a list of dictionary
		# call a function that send out email
		self.response.out.write(template.render(path,{}))

	# def post(self):
	# 	pass

app = webapp2.WSGIApplication([
    webapp2.Route(r'/', handler=HomeHandler, name='home'),
    webapp2.Route(r'/setup', handler=SetupHandler, name='setup'),
    webapp2.Route(r'/setup/submit', handler=SetupPostHandler, name='setup_submit'),
    webapp2.Route(r'/gen_email', handler=GenEmailHandler, name='gen_email') ])

