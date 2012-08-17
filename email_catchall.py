import wsgiref.handlers
import cgi
import logging, email
from google.appengine.ext import webapp
from google.appengine.ext.webapp.mail_handlers import InboundMailHandler 
from google.appengine.ext.webapp.util import run_wsgi_app
import urllib2
from google.appengine.api import urlfetch
import parsepy as ParsePy
import boxdotnet as Box
import emailscraper as EmailScraper
import string

ParsePy.APPLICATION_ID = "IjTmpLYQk8sI3Vhhv2IbCprhrZ4pCnpy9yELySQ8"
ParsePy.MASTER_KEY = "iGW730DEr0h5VA4110jCwQf0TJjnIvyNIWRXemT8"


class LogSenderHandler(InboundMailHandler):
    def receive(self, mail_message):
        # store email fields in a parse blob        
        userResponse = ParsePy.ParseObject("Email")
        es = EmailScraper.EmailScraper()
        fromEmail = es.findFirstEmail(mail_message.sender)
        userResponse.fromEmail = fromEmail
        userResponse.toEmail = mail_message.to
        # we parse the to email bc it has our studyId in it
        split_arr = string.split(mail_message.to, '+')
        studyId = None
        if len(split_arr) > 1:
            #sec_arr = string.split(split_arr[1], '_')
            sec_arr = string.split(split_arr[1], '@')
            studyId = sec_arr[0]
            logging.info('studyID: ' + studyId)
        # fetch study object and store with our email object
        if studyId:
            study = ParsePy.ParseQuery('Study').get(studyId)
            userResponse.study = study
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
                attaches = []
                for filename, filedata in attachments:                
                    file_id = self.upload_to_box(filename, filedata)                    
                    url = self.get_box_share_url(file_id)
                    attaches.append(url)
                userResponse.addToList('attachments', attaches)        
        # fetch the participant object and store relational field
        q = ParsePy.ParseQuery('Participant')        
        q.eq('email', fromEmail)
        q.eq('study', study)
        logging.info('study: ' + study.objectId())

        participant = q.fetch()
        if participant:
            if len(participant) > 0:
                participant = participant[0]
            userResponse.participant = participant        
        userResponse.save()      
    
    def upload_to_box(self, filename, filedata, shouldDecode=True):
        """Returns file_id"""
        b = Box.BoxDotNet()        
        if shouldDecode:
            filedata = filedata.decode()

        res = b.upload(filename, filedata, auth_token='k473spr5fz6hc9kyy8mkjb2o8z7m4a0s',folder_id='351017243',share=1)
        return res.files[0].file[0]['id']
        
    def get_box_share_url(self, file_id):
        b = Box.BoxDotNet()
        res = b.get_file_data(file_id)
        return res['shared_link']['download_url']
        


app = webapp.WSGIApplication([LogSenderHandler.mapping()], debug=True)