var dateFormEl = document.querySelector("#input-form");
var getSome = document.querySelector("#get-some");
var dateInput = document.querySelector("#searched-date");
var historyContainer = document.querySelector("#location-date-weather")
var zipVal = document.querySelector('#searched-location');

var formSubmitHandler = function (event) {
  event.preventDefault();
  var dateVal = dateInput.value;
  var zipper = zipVal.value;
  
  if (dateVal) {
    getHistoricalEvents(dateVal); 
    getCoordinates(dateVal, zipper);
  } else {
    alert("Please enter a Valid Date")
  }
}

var createHistory = function (textYear) {
  for (var i = 0; i < 5; i++) {
    var h4 = document.createElement("h4");
    var p = document.createElement("p");
    h4.textContent = textYear.events[i].text
    p.textContent = textYear.events[i].year
    historyContainer.appendChild(h4)
    historyContainer.appendChild(p)
  }

}

var getHistoricalEvents = function (date) {
  var historyURL = "https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/" + date;
  
  fetch(historyURL).then(function (response) {
    response.json().then(function (data) {
      createHistory(data);
      data.events[0].text
    });

  });
}


function timeZoneConverter (longitude) {
  // returns an amount to subtract from sunrise/sunset in UTC time returned from API based on timezone of coordinates provided by user
  // each time zone represents 15 degrees longitude
  var offset = Math.round(longitude/15);
  return offset;
};  // end function timeZoneConverter


function getHours(item, zone) {
                   
  var pm = false;
  if (item.includes("P")) {
      pm = true;
    }
  var temp = parseInt(item);

  if (pm) {
    var temp = temp + 12;
    }
  temp = temp + zone;
  if (temp >= 12) {                                // convert back to 12 hour format
    temp = temp -12;
  }
  else if (temp < 0)  {
    temp = temp + 12;
  }
                                                   // convert the hours portion of the time in integer and adjust the time zone                    
  var hours = JSON.stringify(temp);                       // return the hours to string
  return hours;

}; // end function getHours

function saveSunData (where, sunData, date) {
                                                    // save the data for later use
    localStorage.setItem("savedSunTimes", date +  where.address + sunData); 
   
} // end function saveSunData

function printSunshine (facts, locale, date) {
 
    var heading = document.createElement("h3");           // create an element for the address heading
    heading.textContent = locale.address;                 // the address the user specifiect via zip code
    historyContainer.appendChild(heading);                // add the address to the HTML
    for (i=0; i < 3; i++) {                               // add the sunshine data to the HTML
        var li = document.createElement("li");
        li.textContent = facts[i];
        historyContainer.appendChild(li);
    } // for

    var li = document.createElement("li");
    li.textContent = "Sunshine facts saved to local storage for later use.";
    historyContainer.appendChild(li);
    saveSunData (locale, facts, date);                            
    // var saveButton = document.createElement("button");
    // saveButton.className = "savebtn";
    // saveButton.textContent = "Save sun data?";    
    // historyContainer.appendChild(saveButton);

}; // end function printSunShine
function findChar (charArray) {
  
  var searchChar = ":";

  for (i=0; i < charArray.length; i++) {           // where is the first colon
    if (charArray[i] === searchChar) {
      var index = i;
      break;
    }
  } 
  return index;

}; // end function findChar

function createSunshine (data, points, date) {
  
  var zone = timeZoneConverter(points.long);

  var upSlice = findChar (data.results.sunrise);
 
  var downSlice = findChar (data.results.sunset);
 
  var sunObj = [
    "Sunrise: " + getHours(data.results.sunrise, zone) + data.results.sunrise.slice(upSlice, -upSlice) + "AM",
    "Sunset: " + getHours(data.results.sunset, zone) + data.results.sunset.slice(downSlice, -downSlice) + "PM",
    "Hours of Daylight: " + data.results.day_length ];

    printSunshine(sunObj, points, date);
  
};  // end function createSunshine

function getSunshine (date, pointsObj) {
 
  var url = 'https://api.sunrise-sunset.org/json?lat=' + pointsObj.lat + '&lng=' + pointsObj.long +  '&date=' + date;

  fetch(url) 
      .then(function(response) {
        return response.json();})
      .then(function(data) {
          if (data.status === "OK") {
              createSunshine(data, pointsObj, date);                  // handle the data returned by the API
          } // if
      });   // then
  
};   // end function getSunshine

function getCoordinates (date, zip) {
  
  var url = 'https://maps.googleapis.com/maps/api/geocode/json?sensor=false&address=' + zip + '&key=AIzaSyD5dYDmJwSLitEhrRLMSrI7Kia3IE7AZ6g';
  
  // an api to convert zip code to longitute/latitude

  fetch (url)
    .then(function(response) {
          return response.json();})
    .then(function(data) {
          var coordinates = {
              lat : data.results[0].geometry.location.lat,
              long : data.results[0].geometry.location.lng,
              address : data.results[0].formatted_address };
          getSunshine (date, coordinates);
    });   // then

}; // end function getCoordinates

//getHistoricalEvents();
getSome.addEventListener("click", formSubmitHandler);