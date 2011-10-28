var fetch  = require('./fetch'),
	rucod  = require('./store'),
	nodeio = require('node.io');

//Fetch helper function
var handleFetch = function(keywords, category, automatic, callback) {
	
	var options = {
	    timeout: 30,   //Timeout after 30 seconds
	    max: 1,        //Run 1 thread concurrently (when run() is async)
	    retries: 3,    //Threads can retry 3 times before failing
	    flatten: false
	};
	
	var job = new nodeio.Job(options, {
	    input: function (start, num, callback) {
	        //Handling the input
			//Let's get the arguments passed to the script
			if (!this.options.args[0] || !this.options.args[1] || !this.options.args[2]) {
				this.exit('No arguments were given to the CO fetch job');
			}
			//We won't allow more than one input line to be processed as once
			if(num > 1) {
				this.exit('The take parameter can not be set higher than 1 for this job');
			}
			
			var keywords = this.options.args[0];
			var category = this.options.args[1];
			var automatic = this.options.args[2];
			
			if(start < keywords.length) {
				
				//Return the current result object
				console.log("Fetching data for query " + (start+1) +" of " + keywords.length + ": '" + keywords[start] + "'...");
				callback([new Array(keywords[start],category,automatic,start)]);
				
			} else {
				//There is nothing left for the job, so stop it
				callback(null,false);
			}
	    },
	    run: function (input) {

	    	var cofetcher = new fetch.Fetch();
	    	
	    	//Preserve the context of this function	
			var context = this;
	    	
			var fetchCallback = function(error, data, index) {
				
				if(error) {
					context.emit(error);
				} else {

					//Check if content object is valid, e.g. contains files
					if(data.Files.length >= 1) {
						//Add retrieved content object data to result array
						console.log("Content Object Data fetched for query '" + data.Name + "' with index " + index + "!");
						//result.push(data);
						context.emit(data);
						
					} else {
						console.log("No Content Object Data could be fetched for query '" + data.Name + "' with index " + index + "!");
						context.emit(null);
					}
					
				} //End error if
			}; //End fetchCallback function 
			
			//If data for the given keyword already exists, we do not need to get it again
			rucod.exists(input[0], input[1], function(data) {
				if(data != undefined) {
					console.log("Stored data loaded for query '" + input[0] +"'.");
					fetchCallback(null,data,input[3]);
				} else {
					console.log("Fetching data for query '" + input[0] +"'...");
					cofetcher.get(input[0], input[1], input[3], input[2], fetchCallback);
				}
			});
			
	    } //End run function
	});
	
	nodeio.start(job, {args: [keywords,category,automatic]}, function(error,data) {
		
		if(error) {
			callback(error, null);
			return;
		}

		callback(null, data[0]);
		
	}, true);
	
};

var handleFetchCluster = function(cluster) {
	
	var options = {
	    timeout: 1200,  //Timeout after 20min
	    max: 1,        //Run 1 thread concurrently (when run() is async)
	    retries: 3,    //Threads can retry 3 times before failing
	    flatten: false
	};
	
	var job = new nodeio.Job(options, {
	    input: function (start, num, callback) {
	        //Handling the input
			//Let's get the arguments passed to the script
			if (!this.options.args[0]) {
				this.exit('No arguments were given to the fetchCluster job');
			}
			//We won't allow more than one input line to be processed as once
			if(num > 1) {
				this.exit('The take parameter can not be set higher than 1 for this job');
			}
			
			var clusters = this.options.args[0];
			
			if(start < clusters.length) {
			
				console.log(" ");
				console.log("-------------------------------------------------------------------------");
				console.log("Start new keyword sequence for category '" + clusters[start].category + "'");
				console.log("-------------------------------------------------------------------------");
				
				//Return the current result object
				callback([clusters[start]]);
				
			} else {
				
				//There is nothing left for the job, so stop it
				callback(null,false);
			}
	    },
	    run: function (input) {
	        
	    	//Preserve the context of this function	
			var context = this;
	    	
			var keywords = input.keywords.split(',');
			var category = input.category;
			
			handleFetch(keywords, category, true, function(error,data) {
				
				if(error) {
					console.log(error);
				} else {

					rucod.storeAutomaticInput(data, function(error, messages) {
			    		if(error) {
			    			console.log('Automatic storing ended with errors listed below:\n\r' + error);
			    		} else {
			    			//All done emit the messages
			    			console.log(messages);
						}
			    		context.emit(null);
			    	});
				}
			});
			
	    }, //End run function
	    output: function(output) {
	    	console.log(" ");
			console.log("-------------------------------------------------------------------------");
			console.log("FINISHED!");
			console.log("-------------------------------------------------------------------------");
	    }
	});
	
	nodeio.start(job, {args: [cluster]});
	
};

//{category: 'Humanoid/Human',
// keywords: 'Crusade Knight,CABALLERO,Greek Horse Archer,The Roman Army - Auxiliary Heavy Infantry,The Roman Army - Auxiliary Light Infantry Skirmisher,The Roman Army - Legionary Centurion,The Roman Army - Legionary Optio,The Roman Army - Legionary Infantry Soldier,The Roman Army - Republican Legionary Infantry Soldier,The Roman Army - Equites Legionis Roman Cavalry Officer,Roman Marching Camp - Legionary Soldier on the March,The Roman Army - Equites Legionis Roman Praefectus Equitum,Greek Archer chariots,Templar,Ancient Greek Hoplite,Lara Croft - Tomb Raider,Guy WITH A CABLE REEL,Guy WITH A PAIR OF STOLEN BUTTERFLY WINGS,Guy HIT ME,Guy ON THE GLOBAL WAY OF LIFE,Guy as a Tree'},

var ucdata = [{category: 'Humanoid/Fantasy',
	           keywords: 'stargate Saria Nova,lexx Zev of B3K,northen water tribe young female,Autobot Arcee,witch red fina,The Lich Queen,'},
	         {category: 'Humanoid/Human',
		      keywords: 'a girl in red shoes,Yukie Kawamura,iClone Ximena torres,iClone Citizen Female 01,iClone Citizen Female 02,iClone Citizen Female 03,iClone Citizen Male 01,iClone Citizen Male 02,iClone Citizen Male 03,Female Green Lantern,Female Yellow Lantern,'},
	        {category: 'Animal/Fantasy',
		     keywords: 'Gryphomon,Megadramon,V-mon,Pikachu,Sonic the Hedgehog,Kirby,Waddle Dee,Meta Knight,Montey mole,Koopa troopa,Yoshi,cartoon penguin,cartoon rabbit,cartoon Duck,cartoon Lambert,cartoon dog,cartoon cowgirl,cartoon ladybug,cartoon tweety,mickey mouse,Pink Panther,Pinky and the Brain,donald duck,dragon'},
		    {category: 'Animal/Reptile',
		     keywords: 'Komodo Dragon,snake reptile'},
		    {category: 'Weapon/Sword',
			 keywords: 'Lei\'rajin keeper of balance,Conan sword,wow Frostgram schwert,Samurai Sword,katana sword,fantasy sword,Nazgul Sword,Sword of the Witch King,Frodos Sword Sting,Glamdring sword,Gimlis Axe,Anime Sword,Valdris Blade KR8,Elite sword,Roman Mainz Gladias,Roman Short Sword,Scottish Claymore Sword and Targe,Warsock halo difficulty logo,twilight princess swords and shields,Runescape Dragon Handed Sword,Sica Sword,Spartan Scimitar short sword,medievil claymore sword,sword of war,crystal destiny sword,Seran Claymore sword,Desane Claymore sword,Claymore Sword,Sephiroth masamune,Blade of Darkness sword,final fantasy Buster Sword,final fantasy cloud Sword,Zanbato sword,Frostmourne blade'}, 
			{category: 'Weapon/Knife',
			 keywords: 'Dragon Lord Knife,Phoenix Klingon Knife,Gil Hibben Knife'},
			{category: 'Weapon',
			 keywords: 'CrossMark Compound Bow,Bow and Arrow,Dark Bow,Short bow,Roman Bow,Longbow,Ball & Chain weapon'},
			{category: 'Weapon/Gun',
			 keywords: 'Smith and Wesson Magnum,44 Magnum Revolver,IMI Desert Eagle,300 Winchester magnum sniper rifle,MP5K,Heckler & Koch MP-7,MP-45,Colt 45,H&K MP5 1981,Colt 1911,M38 Carbine,G43 Scoped,Star Trek Weapons Phase Pistol'},
			{category: 'Apparel/Armor',
			 keywords: 'Helm of the Witch-King,Roman Armor - Lorica Hamata,Roman Armor - Lorica Segmentata,The SkareKrow Armor,Vexen Shield,Roman Scutum,Roman Centurion Galea with Crest Block,Dwarven Shield,Hades Heavy Body Armor MK-II,Hades Heavy Body Armor-MK-III,Hades Heavy Body Armor MK-I,Imperial Roman Legionarys Scotum,hylian shield,Master Chief Helmet,Roman Legionary Galea - Montefortino Type F,Roman Legionary Galea - Gallic Type C,EVA Helmet,Halo 3 Helmet pack,Trippy Helmet Pack,halo Recon Armor Set'},
			{category: 'Apparel/Jewelry',
			 keywords: 'The one Ring,Wedding Ring with Diamonds,Platin Ring with 4ct Diamond,Ring with Bagette Diamonds,Turning Ring,emerald ring'},
			{category: 'Plant/Tree',
			 keywords: 'Green Ash Tree,Erable,ARVORE TIPUANA,Large mango tree,Maple tree,Ipê Amarelo,WILLOW TREE,Aceraceae tree,ganyedes peach tree,chestnut tree,Willow deciduous tree,Bamboo tree,Summer birch,Yucca brevifolia,Livistona chinensis,Abies alba,Phoenix canariensis,Jacaranda mimosifolia,Magnolia stellata,Acer circinatum,Populus nigra,Gleditsia triacanthos,Jacaranda mimosifolia,Acacia berlandieri,Eucalyptus polyanthemos,Eucalyptus camaldulensis,Lyonothamnus floribundus asplenifolius,Acacia abyssinica,Conifer,Abies balsamea'},
			{category: 'Plant/Bush',
			 keywords: 'Arbusto,Bamboo cluster,Japanese mock orange shrub,yucca,Fern,Cyperus alternifolius,Fatsia japonica,Cycas revoluta,Phormium hybrids'},
			{category: 'Plant/Flower',
			 keywords: 'Stonecrop,Heliconia psittacorum,Water lily,Pond plant,orange lilly,Regal mist grass,Bougainvillea plant,Hydrangea macrophylla,Cattail plant,Cactus,Aloe striata,Agave americana,Agave victoriae-reginae,Agave lurida,Strelitzia reginae,Agapanthus africanus,Clivia miniata,Iris hybrids,Hemerocallis hybrids,Dietes iridioides,Beschorneria yuccoides,Kniphofia uvaria'},
			{category: 'Vehicles/Car',
			 keywords: 'Ferrari Enzo Red,Porsche Boxter 911,volkswagen bus t2 yellow,4x4 Modified Pickup Truck,Aston Martin DB1,Aston Martin DB7,Bentley Arnage,Bentley Azure,Bentley Continental,Caddy Eldorado,Caddy Eldorado Brougham,Caddy Eldorado STS,Caddy Escalade,Chevrolet Bel Air Conv,Chevrolet Camaro Z28,Chevrolet Corvette,Chevrolet Corvette Stingray,DeTomaso Pantera,Dodge Daytona,Dodge Viper GTS,Ferrari 265 GTB4, Ferrari 355 B,Ferrari 355 F1,Ferrari 550 Maranello,Ferrari Testarossa,Ford F350 4x4,Ford Thunderbird,GMC Yukon,AM General Hummer,Infiniti Q45,Jaguar JX-220, Jaguar XK8,Lamborghini Countach,Lamborghini Diablo,Lamborghini LM SUV,Lexus LS400,Lincoln Navigator,Mercedes-Benz CL500,Mercedes-Benz S600,Mercedes-Benz SL300 Gullwing,Mercedes-Benz SL600,Mercury Custom,Plymouth Hemi Cuda,Plymouth Road Runner, Plymouth Super Bee,Pontiac GTO,Porsche 911 Twin Turbo,Porsche 959,Porsche 996,Porsche Boxster,Porsche Speedster, Rolls Royce Stretch Limosine,Shelby AC Cobra,Shelby GT500,Toyota Land Cruiser,Toyota Supra Turbo,Toyota Land Cruiser 1984,1999 Isuzu Rodeo,Aston Martin DB9,Ferrari 360 Modena,Audi A8 4.2 TDI,Mercedes Benz S Class 500 AMG,BMW X5,BMW X6,Audi Q7 S line,Land Rover Range Rover Sport,General Motors HUMMER H2,Porsche 911 Carrera 997 GT3,Audi R8,Lamborghini Gallardo,Bentley Continental GT,Bentley Continental Flying Spur,Mercedes Benz ML 320,Mercedes Benz GL 500,Mercedes Banz Viano,Maserati GranTurismo MC Sport Line,Lamborghini Gallardo LP560-4 Spyder, Aston Martin DB9 Volante, Bentley Continental GTC,Lamborghini Murcielago LP 640,Porsche Cayenne Turbo,vw samba bus,2005 Bentley Continental GT,Nissan 300ZX Twin Turbo, Austin Healey Sprite,  2006 Subaru WRX Imprezza STI,buick regal gnx,KITT Knight Rider Three Thousand,Knight Rider KITT,Chrysler 300C Hemi,  Lincoln Zephyr 2006,  Lotus Esprit S1,Mercedes Benz 500E,TVR Tuscan,Mercedes Benz W211 E 270,  2000 Cadillac DeVille,1994 Cadillac DeVille,1966 Oldsmobile Toronado,1953 CHEVROLET BEL AIR,Mini Cooper,Mini Cooper S,2011 Dodge Ram Mega Cab,1961 Maserati 3500GT,Hudson Hornet,Ferrari 288 GTO,Chrysler town and country 2000,Mercedes-Benz 450SE W116,Blue Brimstone 55 Chevy Gasser,Ford GT,1949 mercury Woody Wagon,1969 Chevrolet Chevelle SS 396,BMW M3 CSL,2004 Mazda MX-5 Miata,Volkswagen Beetle,Jaguar XKR,Ferrari 360 Challenge Stradale,Ford Lotus Cortina Mark 1,Auburn 851 Boattail Speedster,Ferrari 250 GTO,1999 Mini Cooper,Bentley Blower,1999 Dodge Viper GTS,De Tomaso Mangusta,1960 Cadillac Eldorado,Fiat 500,1970 Plymouth Superbird,Hummer H2,1970 Dodge Charger convertible,Bentley Continental GT,Volvo C30 convertible,1972 Datsun 240z,Alfa Romeo 8C,Porsche 356 coupe,1938 Alfa Romeo 8C 2900,Audi S1 Coupe Quattro,McLaren F1 LM,Buick Riviera 72,Porsche 959,Nissan Skyline GTR,Lincoln Continental Mark IV,Lamborghini Countach LP5000,1959 Cadillac Eldorado Biarritz,Porsche 550 Spyder,Seat Cordoba WRC,1971 Plymouth Cuda,Porsche Carrera GT,1984 Volkswagen Golf GTI,Citroen 2CV,Lotus elise mk1,Toyota 2000 GT,Ferrari 458 italia,1973 Lancia Stratos HF,Renault R5 Turbo II,1972 Chevrolet Camaro SS,1965 Lincoln Continental,1980 Jeep CJ,cord coupe 1930,Mercedes Benz 540 K,Citroen Traction Avant,1967 Shelby Mustang GT 500,2008 Lincoln Navigator,1937 bugatti type 57 SC atlantic,1955 Chevrolet Bel Air,1938 Alfa Romeo 8C 2900B,1999 BMW E38 750iL,1965 Lincoln Continental,1996 Jaguar XJ6,1968 Ford GT-40 MK-1 Le Mans,Ferrari F40,1968 ford mustang fastback,1975 BMW E9 3.0 CSL,1970 Hemi Cuda Convertible,1993 McLaren F1,Citroen SM,Jaguar E-Type,aston martin db5 james bond,Lancia Stratos prototype,Mercedes Benz 300SL Gullwing,Duesenberg Model J,Duesenberg SSJ,1957 Citroen DS,Ford Anglia,2000 Jaguar XK8 Convertible,Shelby Cobra,AC Cobra 427,Porsche 911 Turbo,1965 Chevrolet Corvette Stingray,1999 Gmc TopKick Tow truck,Chevy 3500 Crew Self-loader,SGT Towing & Recovery Medium Duty Wrecker,ECTO-1 Ghostbusters,DeLorean timemachine,Rims and Tyres with Brakes,Car Tyre,Rain Tyre,Performance Tyre'},
			{category: 'Interior',
			 keywords: 'stainless steel toolbox,SnapOn tool box model kra2411,Rollaway Tool Cabinet,Snap-On seat creeper stool,Snap-On Creeper JCW60R,Snap-on Tool Box KRA2432,IKEA hack workstation,ATM CUSTOMS GARAGE,Steelcase Amia Chair,Drill Press Accessory Cabinet'},
			{category: 'Tool',
			 keywords: 'napa lift,Highlift Off Road Jack,Hi-lift jack,"ENGINE STAND",CABLE Spool,PARTS WASHER'},
			{category: 'Tool/Power Tool',
			 keywords: 'makita cordless drill,Corded Drill,Pneumatic Stapler,Mini MAGLITE AA,MAG-LITE 2 D-Cell,IMPACT DRIVER,Workshop Drill,PILLAR DRILL,BENCH GRINDER,GLUE GUN'},
			{category: 'Tool/Hand Tool',
			 keywords: 'Table VICE,Socket Spanner,Screwdriver (TX-10),SOCKET WRENCH,Snap-On 1/4" drive Ratchet,Snap-On wrench set,Screwdriver case and Screwdrivers,SCREWDRIVER PHILLIPS,Allen wrench set,Simple wrench,Pipe Wrench 90 Degree Offset,Llave inglesa,Simple Spanner,monkey wrench,ADJUSTABLE SPANNER,Snap-On 7/16" wrench,Snap-On sockets,Fire Extinguisher,Snap-On screw driver,Stanley 750 chisel,Blacksmith Sledge Hammer,CORROSION ASSESMENT TOOL HEX TOP ALAN-KEY,Teppichmesser,Masters Laser Screwdriver,Dovetail Saw,Screw driver slot,Flathead screwdriver,Gerber Nautilus,Red Screwdriver,screw driver bit,Snap-On Hammer Impact,Fire Axe,wrecker wheelift,wheel Lift Kit,Gray Pliers,Pince,pincers,Lineman pliers,Centre Punch,Lincoln Plasma Cutter,CAULK GUN,allen tools,Black and Decker BDSL30,Mop Bucket,Woodworking chisels'},
			{category: 'Tool/Office utensil',
			 keywords: 'DIXON pencil,Faber Castell Scale Ruler'},
			{category: 'Infrastructure/Bulding/Hall',
			 keywords: 'Garage,Work shop Garage MOT Station,repar shop,Hayes Family Auto Provo Utah,T.P. Brake & Muffler,North Lincs Tyres,A premium Workshop,Automotive Workshop & Showroom'}];

//Starting point for script
handleFetchCluster(ucdata);