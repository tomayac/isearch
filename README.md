#I-SEARCH

Welcome, this is an I-SEARCH (strange apple-like acronym meaning *A unIfied framework for multimodal SEARCH*) repo.
This space is used to build the GUI part of I-SEARCH.


##Some info: 

- this is the GUI project for I-SEARCH. It consists of several components which are here
  splitted in a the client and server folder for a better project structure 
- the main interface component is names MuSeBag which stands for Multimodal Search Bag. Its
  mockup is built on top of the amazing HTML5BoilerPlate
- the build/ test/ crossdomain.xml robots.txt and plugin stub within the client/musebag folder are there for the near future.
  We'll probably need it very soon. But if you ask: yes, they're unuseful right
  now.
- further components are: 
   - CoFetch: a script for semi-automatic RUCoD creation, which is the exchange format
     on which the I-SEARCH search engine is based on.
   - CoFind: a component which enables collaborative search
   - pTag: a component which provides personal tag recommendation for I-SEARCH
- all server parts are javascript and will only run on a nodeJS server     



##Try to be compliant with the Google JS Style guide: 
  
It can be found [here](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
(e.g, indentation = 2 spaces, no tabs, or opening bracket on the same line, etc)

##Use of requireJS for dependancy management

RequireJS (check the [official website](http://requirejs.org)) is a dependancy management system, which will need at some point (loading all the scripts at the beginning is just not an option when there will be heavy visualization scripting)

Let's also embrace the use of **module pattern**. Example: 

    define("the/path/to/my/module", ["dependency1", "dependency2"],   function(dependency1, dependency2){
      //This will execute when the dependancies are loaded
      var privateVariable = "secret";
      var privateStuff = function(){
        dependency1.aUsefulFunction();
        dependency2.util(privateVariable);
        //do stuff
      };

     var publicThing = "hooray";
      var iAmPublic = function(){
        //do stuff
      };

      //This is where you decide which method/variable is public or
      //private. It defines the module API.
      return {
        moduleVar: publicThing, 
        moduleFunction: iAmPublic, 
      };
    })

##Install guide

The GUI framework for I-SEARCH is based on client and server side Javascript. Which means, that
a NodeJS server is needed with several module dependencies in order to run all components of the
I-SEARCH GUI Framework. Here is a little step-by-step setup guide in order to run this code on
your Linux server:

1. Download/Install NodeJS on your server
   - find NodeJS here: http://nodejs.org 
   - detailed instructions: https://github.com/joyent/node/wiki/Installation
   - for installation via package manager: https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager)
2. Make sure you install **npm** as it is the main module manager for NodeJS which will be used to
   install all dependencies for the I-SEARCH GUI Framework
3. Install the following requirements and NodeJS modules globally, usually npm makes sure that all dependencies
   will be intalled along with the modules: 
   - Install Git on your server with the help of this guide: http://book.git-scm.com/2_installing_git.html
   - Install Redis as document based database used for session management:
     - follow this guide for full install and config: http://library.linode.com/databases/redis (select the article for your server OS) 
     - follow this instructions for fast install, without setup: http://rediscookbook.org/install_with_installer.html
     - Make sure the redis-cli binary is running on the server
   - Intall connect module via 
     npm install connect -g
   - Install connect-redis module via
     npm install connect-redis -g
   - Install express module via
     npm install express -g
   - Install eyes module via
     npm install eyes -g    
   - Install formidable module via
     npm install formidable -g          
   - Install now module via
     npm install now -g
   - Install restler module via
     npm install restler -g
   - Install webservice module via
     npm install webservice -g
   - Install step module via
     npm install step -g
   - Install forever module via
     npm install forever -g  
4. Create a folder for the I-SEARCH GUI framework on your server under "/var/www/isearch"
5. Pull this github repository into this folder by changing into the directory "/var/www/isearch" and typing
   git clone git://github.com/tomayac/isearch.git
6. Make sure you reserve 1 public port (dafault: 80) for the GUI Frameswork as well as 5 local ports for GUI services (default: 8081,8082,8083,8084,8085)
7. Please change the paths in the following Javascript files within the repository and replace all "isearch.ai.fh-erfurt.de" and "http://isearch.ai.fh-erfurt.de" with your server URL/IP address:
   server/isearch-proxy.js
   client/cofetch/js/libs/cofetchHandler.js
8. Start the server scripts for the GUI framework:
   - change directory to /var/www/isearch/server/pTag
   - enter: forever start index-ptag.js
   - change directory to /var/www/isearch/server/musebag
   - enter: forever start index.js
   - change directory to /var/www/isearch/server
   - enter: forever start isearch-proxy.js
   - if any errors occur during this procedure please check the error
     messages for missing modules and try to install them with "npm install <module_name>" in the folder
     where the error occured
9. You're done! Try your server URL and port in your browser.
   If any unexpected issues occur please feel free to list them as **issue** here on **github**.
    
(NodeJS can also run on Windows, but it's not as nice as Linux. Find those
instructions by searching your preferred search engine)

##Other matters:

- The project URL of the interface is: http://isearch.ai.fh-erfurt.de/ 
- pTag is a RESTful Webservice, the service description can be found here:
  http://isearch.ai.fh-erfurt.de/ptag/


Have fun!