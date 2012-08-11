import sendgrid

s = sendgrid.Sendgrid('jinxdabinx', 'sendgrid', secure=True)
message = sendgrid.Message("from@mydomain.com", "subject", "plain body", "Test body")
message.add_to("jamiewu@gmail.com", "Jamie Wu")
message.add_to("michesun@gmail.com", "Michelle Sun")

s.web.send(message)