#I-SEARCH

Welcome, this is an I-SEARCH (strange apple-like acronym meaning *A unIfied framework for multimodal SEARCH*) repo.
This space is used to build the GUI part of I-SEARCH.


##Some info: 

- this is the GUI project for I-SEARCH. It consists of several components which are here
  splitted in a client and server folder for a better project structure 
- the main interface component is named MuSeBag which stands for Multimodal Search Bag. The
  prototype is built on top of the amazing HTML5BoilerPlate
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

###Linux 

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
     - follow this guide for full install and config: http://redis.io/download
     - follow this instructions for fast install, without setup: http://rediscookbook.org/install_with_installer.html
     - Make sure the redis-cli binary is running on the server
   - Intall connect module via 
     `npm install connect -g`
   - Install connect-redis module via
     `npm install connect-redis -g`
   - Install express module via
     `npm install express -g`
   - Install jsdom module via
     `npm install jsdom -g`                
   - Install now module via
     `npm install now -g`
   - Install restler module via
     `npm install restler -g`
   - Install webservice module via
     `npm install webservice -g`
   - Install step module via
     `npm install step -g`
   - Install forever module via
     `npm install forever -g`  
   - Install http-proxy module via
     `npm install http-proxy -g`    
4. Create a folder for the I-SEARCH GUI framework on your server under "/var/www/isearch"
5. Pull this github repository into this folder by changing into the directory "/var/www/isearch" and typing
   `git clone git://github.com/tomayac/isearch.git`
6. Make sure you reserve 1 public port (default: 80) for the GUI Framework as well as 5 local ports for GUI services (default: 8081,8082,8083,8084,8085)
7. Start the server scripts for the GUI framework:
   - change directory to /var/www/isearch/server/pTag
   - enter: `forever start index-ptag.js`
   - change directory to /var/www/isearch/server/musebag
   - enter: `forever start index.js`
   - change directory to /var/www/isearch/server
   - enter: `forever start isearch-proxy.js`
   - if any errors occur during this procedure please check the error
     messages for missing modules and try to install them with `npm install <module_name>` in the folder
     where the error occured
9. You're done! Try your server URL and port in your browser.
   If any unexpected issues occur please feel free to list them as **issue** here on **github**.

###Windows
    
NodeJS can also run on Windows, but it's not as nice as Linux. There is quite a lot going on right now.
You can find the newest Windows binary here: http://nodejs.org/ and click the **Download"** button.

Some guidiance in how to set up nodeJS on Windows 7 can be found here. After you installed the binary
for Windows from nodejs.org do the following steps:

1. nodejs is basically installed into "C:\Program Files (x86)\nodejs", add this path to your **PATH** 
   enviroment variable via System Settings > System > Enhanced System Settings.
2. Set up a new enviroment variavle called "NODE_PATH" with the value of your node directory - basically 
   it's "C:\Program Files (x86)\nodejs"
3. your global node modules will be installed under in the **npm** data directory which is mostly found 
   under "C:\Users\USERNAME\AppData\Roaming\npm\node_modules"
4. Install the modules listed in the Linux instructions within the `cmd.exe` in admin mode by just 
   entering `npm install MODULENAME -g` - so the same procedure like under Linux.
5. **Problems**: some modules want install now, since they need to be compiled. A trick can be to go 
   directly to the GitHub pages of the module creators and download the sources as ZIP file. Some modules
   creators provide already compiled versions of there modules for Windows builds of nodeJS.
   The process is as follows:
   1. Download the module package as ZIP file from the GitHub page of the module (i.e. https://github.com/visionmedia/express)
   2. Extract the ZIP folder into yout npm data directory (e.g. "C:\Users\USERNAME\AppData\Roaming\npm\node_modules")
   3. Rename the folder into the original module name (e.g. if you download "express" rename the folder to "express")
   That's it.
     
   The jsdom module is an example of the problems currently seen with Windows installations of nodeJS.
   Here is an example: https://github.com/tmpvar/jsdom/issues/378 for reference. 
 

##Other matters:

- The project URL of the interface is: http://isearch.ai.fh-erfurt.de/ 
- pTag is a RESTful Webservice, the service description can be found here:
  http://isearch.ai.fh-erfurt.de/ptag/

Have fun!

##License:

This software is released under the DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE, version 2 (http://sam.zoy.org/wtfpl/COPYING):

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
Version 2, December 2004

Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

Everyone is permitted to copy and distribute verbatim or modified
copies of this license document, and changing it is allowed as long
as the name is changed.

DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

0. You just DO WHAT THE FUCK YOU WANT TO.

