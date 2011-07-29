#I-SEARCH

Welcome, this is an I-SEARCH (strange apple-like acronym meaning *A unIfied framework for multimodal SEARCH*) repo.
This space is used to build the GUI part of I-SEARCH.


##Some info: 

- the mockup is built on top of the amazing HTML5BoilerPlate
- the build/ test/ crossdomain.xml robots.txt and plugin stub are here for the near future.
  We'll probably need it very soon. But if you ask: yes, they're unuseful right
  now.



##Try to be compliant with the Google JS Style guide: 
  
It can be found [here](http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)
(e.g, indentation = 2 spaces, no tabs, or opening bracket on the same line, etc)

##Use of requireJS for dependancy management

RequireJS (check the [official website](http://requirejs.org)) is a dependancy management system, which will need at some point (loading all the scripts at the beginning is just not an option when there will be heavy visualization scripting)

Let's also embrace the use of **module pattern**. Example: 

    define(“the/path/to/my/module”, [“dependancy1”, “dependancy2”],   function(dependancy1, dependancy2){
      //This will execute when the dependancies are loaded
      var privateVariable = “secret”;
      var privateStuff = function(){
        dependancy1.aUsefulFunction();
        dependancy2.util(privateVariable);
        //do stuff
      };

     var publicThing = “hooray”;
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
 
The "fake server" needs to be manually uploaded each time it is changed.
Right now, the URL to access the static RUCoD returned is http://www.osmoz2009.com/isearch

Maybe I'll put some parameters later on to alter the behaviour.


Have fun!
