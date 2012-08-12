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
from PIL import Image

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
            basewidth = 510
            img = Image.open(filedata)
            wpercent = (basewidth / float(img.size[0]))
            hsize = int((float(img.size[1]) * float(wpercent)))
            img = img.resize((basewidth, hsize), Image.ANTIALIAS)
            newname = filename+‘resized.png’
            newfile = file(newname, "rb")
            newfiledata = fp.read()
            img.save(newname)

        res = b.upload(filename, filedata, auth_token='k473spr5fz6hc9kyy8mkjb2o8z7m4a0s',folder_id='351017243',share=1)
        res = b.upload(newname, newfiledata, auth_token='k473spr5fz6hc9kyy8mkjb2o8z7m4a0s',folder_id='351017243',share=1)
        return res.files[0].file[0]['id']
        
    def get_box_share_url(self, file_id):
        b = Box.BoxDotNet()
        res = b.get_file_data(file_id)
        return res['shared_link']['download_url']
        


app = webapp.WSGIApplication([LogSenderHandler.mapping()], debug=True)