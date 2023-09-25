let stops = {
    "Hagudi" : "64-6298-5",
    "Liiva": "64-6298-48",
    "TallinnW" : "64-6298-93",
    "TallinnS" : "64-6320-93",
    "Ulemiste": "64-6320-117"
}

const hagudiTallinn = document.getElementById('hagTal');
const tallinnUlemiste = document.getElementById('talUle');
const ulemisteTallinn = document.getElementById('uleTal');
const tallinnHagudi = document.getElementById('talHag');
const liivaHagudi = document.getElementById('liivaHag');

hagudiTallinn.addEventListener(('click'), () => {
    getTimesForJourney(stops.Hagudi, stops.TallinnW, hagudiTallinn);
});

tallinnHagudi.addEventListener(('click'), () => {
    getTimesForJourney(stops.TallinnW, stops.Hagudi, tallinnHagudi);
});

ulemisteTallinn.addEventListener(('click'), () => {
    getTimesForJourney(stops.Ulemiste, stops.TallinnS, ulemisteTallinn);
});

liivaHagudi.addEventListener(('click'), () => {
    getTimesForJourney(stops.Liiva, stops.Hagudi, liivaHagudi);
});

tallinnUlemiste.addEventListener(('click'), () => {
    getTimesForJourney(stops.TallinnS, stops.Ulemiste, ulemisteTallinn);
});

function getTimesForJourney(start, end, journeyNode) {
    fetchData(start, end).then(res => {
        console.log(res);
        const currentMinutesFromMidnight = getMinutesFromMidnight();

        const allTrips = document.querySelectorAll('.trip');
        allTrips.forEach(trip => {
            while (trip.firstChild) {
                trip.removeChild(trip.firstChild);
            }
        });
        
        res.forEach(trip => {
            let tripData = trip.trips[0]
            if (tripData.departure_time_min > currentMinutesFromMidnight) {
                let departure = new Date(tripData.departure_time);
                let arrival = new Date(tripData.arrival_time);
                const listItem = document.createElement('p')
                listItem.innerText = departure.toLocaleTimeString() + ' - ' + arrival.toLocaleTimeString();
                journeyNode.appendChild(listItem)
                // console.log(departure.toLocaleTimeString() + ' - ' + arrival.toLocaleTimeString())
            }
        });
    }).catch(e => {
        console.log(e)
    });
}

function getMinutesFromMidnight() {
    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    currentDate.setHours(0, 0, 0, 0);
    return Math.round((currentTime - currentDate.getTime()) / (1000 * 60));
}

function fetchData(originStop, destinationStop) {
    return fetch('https://api.ridango.com/v2/64/intercity/stopareas/trips/direct', {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
            "date": getCurrentDate,
            "origin_stop_area_id": originStop,
            "destination_stop_area_id": destinationStop,
            "channel": "web"
        }), // Include a JSON payload for POST requests
    })
        .then(response => {
            let jsonString = '';
            const reader = response.body.getReader();

            function readData() {
                return reader.read().then(({value, done}) => {
                    if (done) {
                        const jsonObject = JSON.parse(jsonString); // Deserialize
                        return jsonObject.journeys;
                        const serializedJsonString = JSON.stringify(jsonObject, null, 2); // Serialize
                    } else {
                        jsonString += new TextDecoder('utf-8').decode(value);
                        return readData();
                    }
                });
            }

            return readData();
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}

function getCurrentDate() {
    const year = currentDate.getFullYear(); // Get the current year
    const month = currentDate.getMonth();    // Get the current month (0-11, where 0 is January)
    const day = currentDate.getDate();       // Get the current day of the month (1-31)

    return `${year}-${month + 1}-${day}`;
}
