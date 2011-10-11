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

##Other matters:

- The project URL of the interface is: http://isearch.ai.fh-erfurt.de/ 
- pTag is a RESTful Webservice, the service description can be found here:
  http://isearch.ai.fh-erfurt.de/ptag/


Have fun!

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

