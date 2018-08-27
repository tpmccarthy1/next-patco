/*

RoutesController.js: This controller contains all code to get Patco stops

*/

var mongoose = require("mongoose");
var express = require('express');
const gtfs = require('gtfs');


//create controller for CRUD operations
var routeController = {};


// Show list of all stops function.
routeController.home = function(req, res){
		res.render("../views/index");

};

//Time formatter function
function timeNow(){
		var d = new Date(); // for now
		var hours = d.getHours(); // => 9
		var min = d.getMinutes(); // =>  30
		var sec = d.getSeconds(); // => 51

		if(min > 9){
		return hours + ":" + min +  ":" + sec;
		}else{
			return hours + ":0" + min +  ":" + sec;
		} 
}

routeController.getNextTimes = function(req, res){
		
		//Get day of week to select correct service_id
		var id = new Date();
		switch(id.getDay()){
    		case 6:
	        	id = 30;
	        	break;
		    case 7:
		        id = 31;
		        break;
		    default:
		        id = 32;
		}


		var routeId = req.query.direction;  //Get direction from user request

		gtfs.getStoptimes({
			  agency_key: 'patco',
			  service_id: id,
			  route_id: routeId
			}, {
			  _id: 0
			}, {
			  sort: {stop_id: 1}
			})
			.then(stoptimes => {
				var stop = req.query.station;       //Get stop id from user request
				
				//Get current time & and format if necessary
				var time = timeNow();    //Get time string using using TimeNow() function			
				//Add 0 character to front of time string if less than 10:00 AM for valid comparision
				if(time.length === 7 ){
					time = "0" + "9:54:23";
					console.log(time);
 				}


				var validTimes = [];      // Array to store times that greater than the current time

				for(j=0; j < stoptimes.length; j++){
					//If stop ids match and the time is in the future push to the valid times array
					if(stoptimes[j].stop_id === stop && stoptimes[j].departure_time >= time){	
						validTimes.push(stoptimes[j].departure_time.substring(0, 5));
					}
				}

				//Loop to format strings in 12 hour clock format
				for(var z =0; z < 2; z++){
					var num = parseInt(validTimes[z].substring(0,2));

					if(num >= 12){	
						//format string to PM if time is 1:00 PM or later
						if(num > 12){					
							validTimes[z] = (num-12).toString() + ":" + validTimes[z].substring(3, 5) + " PM";
						}
						//format string as 12 PM if time is exactly 12
						else{
							validTimes[z] = validTimes[z] + " PM";
						}
					}
					//Format time as AM if time is AM
					else{
						validTimes[z] += " AM"; 
					}
				}

				//Array of next two times to send to client
				var result = [validTimes[0], validTimes[1]];

				

				//Set stop to string of stop's name
				switch(stop){
					case 2 : stop = "Ashland";
					case 3 : stop = "Woodcrest";
					case 4 : stop = "Haddonfield";
					case 5 : stop = "Westmont";
					case 6 : stop ="Collingswood";
					case 7 : stop = "Ferry Ave";
					case 8 : stop = "Broadway";
					case 9 : stop = "City Hall";
					case 10 : stop = "8th & Market";
					case 11 : stop = "9/10 & Locust";
					case 12 : stop = "12/13 & Locust";
					case 13 : stop = "15/16 & Locust";
					//default : stop = "Lindenwold";
				}

				//Set direction to string of destination name
				// switch(routeId){
				// 	case 2 : routeId = "Lindenwold, NJ";
				// 	//default : routeId = "15/16 Locust";

				// }
				
				//Render the result on client
				res.render("./result", {result: result, stop: stop, routeId: routeId});

			})
		
	}


//export park controller as modul/e
module.exports = routeController;
