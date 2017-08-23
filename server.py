#!/usr/bin/env python
"""
Modification of `python -m SimpleHTTPServer` with a fallback to /index.html
on requests for non-existing files.

This is useful when serving a static single page application using the HTML5
history API.

# taken from http://www.piware.de/2011/01/creating-an-https-server-in-python/
# generate server.xml with the following command:
#    openssl req -new -x509 -keyout server.pem -out server.pem -days 365 -nodes
# run as follows:
#    python simple-https-server.py
# then in your browser, visit:
#    https://localhost:4443

"""


import os
import sys
import urlparse
import SimpleHTTPServer
import BaseHTTPServer
import ssl

class Handler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        urlparts = urlparse.urlparse(self.path)
        request_file_path = urlparts.path.strip('/')

        if not os.path.exists(request_file_path):
            self.path = 'index.html'

        return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)


host = '0.0.0.0'
try:
    port = int(sys.argv[1])
except IndexError:
    port = 8000
httpd = BaseHTTPServer.HTTPServer((host, port), Handler)

try:
    protocol = sys.argv[2]
except IndexError:
    protocol = "http"
    
if protocol == 'https' :
	httpd.socket = ssl.wrap_socket (httpd.socket, certfile='../server.pem', server_side=True)
	print 'Using TLS/SSL'

print 'Serving HTTP on %s port %d ...' % (host, port)
httpd.serve_forever()
