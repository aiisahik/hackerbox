import wsgiref.handlers
import cgi
import logging, email
from google.appengine.ext import webapp
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler 
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from google.appengine.api import urlfetch
import parsepy2 as ParsePy
import boxdotnet as Box
import emailscraper as EmailScraper

# Jie's
# ParsePy.APPLICATION_ID = "IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8"
# ParsePy.MASTER_KEY = "iGW730DEr0h5VA4110jCwQf0TJjnIvyNIWRXemT8"

# Mine - urt
ParsePy.APPLICATION_ID = "PC3kFSx73egQ3sWgB2E6d9IdOudhtftcmtVGakyg"
ParsePy.MASTER_KEY = "K5qe9mITvaIsNg1LYwH1PN6TsdAlU1fTCDXG6zJC"



class LogSenderHandler(InboundMailHandler):
    def receive(self, mail_message):
        # store email fields in a parse blob        
        userResponse = ParsePy.ParseObject("UserResponse")
        es = EmailScraper.EmailScraper()
        fromEmail = es.findFirstEmail(mail_message.sender)
        userResponse.fromEmail = fromEmail
        userResponse.toEmail = mail_message.to
        userResponse.subject = mail_message.subject
        # returns an iterator that returns HTML bodies first, then plain text bodies
        bodies = mail_message.bodies()
        for content_type, body in bodies:
            userResponse.body = body.decode()            
        # handle attachments
        if hasattr(mail_message, 'attachments'):
            attachments = mail_message.attachments
            if attachments and len(attachments) > 0:
                # Each value in the list is a tuple of two elements: the filename and the file contents
                for filename, filedata in attachments:                
                    b = Box.BoxDotNet()
                    b.upload(filename, filedata.decode(), auth_token='k473spr5fz6hc9kyy8mkjb2o8z7m4a0s',folder_id='351017243',share=1)
        userResponse.save()        


app = webapp.WSGIApplication([LogSenderHandler.mapping()], debug=True)