import re

class EmailScraper():
    def __init__(self):        
        self.emails = []

    def reset(self):
        self.emails = []
        
    def findFirstEmail(self, source):
        "collects first email address from source"
        email_pattern = re.compile("[-a-zA-Z0-9._]+@[-a-zA-Z0-9_]+.[a-zA-Z0-9_.]+")
        found = re.findall(email_pattern, source)
        if len(found) > 0:
            return found[0]
        else:
            return None

    def collectAllEmail(self, htmlSource):
        "collects all possible email addresses from a string, but still it can miss some addresses"
        #example: t.s@d.com
        email_pattern = re.compile("[-a-zA-Z0-9._]+@[-a-zA-Z0-9_]+.[a-zA-Z0-9_.]+")
        self.emails = re.findall(email_pattern, htmlSource)
        
    def collectEmail(self, htmlSource):
        "collects all emails that starts with mailto: in the html source string"
        #example: <a href="mailto:t.s@d.com">
        email_pattern = re.compile("<a\s+href=\"mailto:([a-zA-Z0-9._@]*)\">", re.IGNORECASE)
        self.emails = re.findall(email_pattern, htmlSource)