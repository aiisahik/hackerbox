import wsgiref.handlers
import cgi
import logging, email
from google.appengine.ext import webapp
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler 
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from google.appengine.api import urlfetch
import parsepy


# message = mail.InboundEmailMessage(self.request.body)
#          logging.info("Received a message from: " + mail_message.sender)

# class UserEmails(db.Model):
# 	toEmail = db.StringProperty()
# 	fromEmail = db.StringProperty()
# 	body = db.StringProperty()
# 	subject = db.StringProperty()
# 	timestamp = db.DateTimeProperty(auto_now_add=True)


class LogSenderHandler(InboundMailHandler):
    def receive(self, mail_message):
        logging.info("Received a message from: " + mail_message.sender)
        logging.info("Message sent to: " + mail_message.to)
        logging.info("Subject: " + mail_message.subject)
        # logging.info("Body: " + mail_message.body)
        # logging.info("Attachments: " + mail_message.attachments)

		# form_fields = {
		# 	"first_name": "Albert",
		# 	"last_name": "Johnson",
		#  	"email_address": "Albert.Johnson@example.com"
		# }

		# ## STORE TO USER EMAILS DB
		# url = "https://api.parse.com/1/classes/userEmails"

		# form_data = urllib.urlencode(form_fields)
		# result = urlfetch.fetch(url=url,
		# 	payload=form_data,
		# 	method=urlfetch.POST,
		# 	headers={'Content-Type': 'application/x-www-form-urlencoded'})
		ParsePy.APPLICATION_ID = "IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8"
		ParsePy.MASTER_KEY = "iGW730DEr0h5VA4110jCwQf0TJjnIvyNIWRXemT8"

		userEmail = ParsePy.ParseObject("userEmail")
		userEmail.fromEmail = 


	#    plaintext_bodies = mail_message.bodies('text/plain')
    	# html_bodies = mail_message.bodies('text/html')

    	# for content_type, body in html_bodies:
     #    	decoded_html = body.decode()

app = webapp.WSGIApplication([LogSenderHandler.mapping()], debug=True)