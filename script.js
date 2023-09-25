let stops = {
    "Hagudi": "64-6298-5",
    "Liiva": "64-6298-48",
    "TallinnW": "64-6298-93",
    "TallinnS": "64-6320-93",
    "Ulemiste": "64-6320-117"
}

const hagudiTallinn = document.getElementById('hagTal');
const tallinnUlemiste = document.getElementById('talUle');
const hagudiUlemiste = document.getElementById('hagUle');
const hagudiLiiva = document.getElementById('hagLiiva');
const ulemisteTallinn = document.getElementById('uleTal');
const tallinnHagudi = document.getElementById('talHag');
const ulemisteHagudi = document.getElementById('uleHag');
const liivaHagudi = document.getElementById('liivaHag');

hagudiTallinn.addEventListener(('click'), () => {
    getTimesForJourney(stops.Hagudi, stops.TallinnW, hagudiTallinn);
});

tallinnUlemiste.addEventListener(('click'), () => {
    getTimesForJourney(stops.TallinnS, stops.Ulemiste, tallinnUlemiste);
});

hagudiUlemiste.addEventListener(('click'), () => {
    getTimesForCombinedJourney(stops.Hagudi, stops.TallinnW, stops.TallinnS, stops.Ulemiste, hagudiUlemiste);
});

hagudiLiiva.addEventListener(('click'), () => {
    getTimesForJourney(stops.Hagudi, stops.Liiva, hagudiLiiva);
});

ulemisteTallinn.addEventListener(('click'), () => {
    getTimesForJourney(stops.Ulemiste, stops.TallinnS, ulemisteTallinn);
});

tallinnHagudi.addEventListener(('click'), () => {
    getTimesForJourney(stops.TallinnW, stops.Hagudi, tallinnHagudi);
});

ulemisteHagudi.addEventListener(('click'), () => {
    getTimesForCombinedJourney(stops.Ulemiste, stops.TallinnS, stops.TallinnW, stops.Hagudi, ulemisteHagudi);
});

liivaHagudi.addEventListener(('click'), () => {
    getTimesForJourney(stops.Liiva, stops.Hagudi, liivaHagudi);
});

const options = { hour: 'numeric', minute: 'numeric' };

function getTimesForJourney(start, end, journeyNode) {
    let journeyTitle = journeyNode.textContent;
    clearPreviousSearch()
    journeyNode.innerText = journeyTitle + '  loading...';
    

    fetchData(start, end).then(res => {
        journeyNode.innerText = journeyTitle;
        res.forEach(trip => {
            let tripData = trip.trips[0]
            if (tripData.departure_time_min > getMinutesFromMidnight()) {
                let departure = new Date(tripData.departure_time).toLocaleTimeString(undefined, options);
                let arrival = new Date(tripData.arrival_time).toLocaleTimeString(undefined, options);
                const listItem = document.createElement('p')
                listItem.innerText = departure + ' - ' + arrival;
                journeyNode.appendChild(listItem)
            }
        });
    }).catch(e => {
        console.log(e)
    });
}

function getTimesForCombinedJourney(start, end, start2, end2, journeyNode) {
    let journeyTitle = journeyNode.textContent;
    clearPreviousSearch()
    journeyNode.innerText = journeyTitle + '  loading...';
    
    fetchData(start, end).then(res => {
        fetchData(start2, end2).then(res2 => {
            journeyNode.innerText = journeyTitle;
            res.forEach(trip => {
                let tripData = trip.trips[0]
                let departureIsInFuture = tripData.departure_time_min > getMinutesFromMidnight();
                if (departureIsInFuture) {
                    let tripData2 = null;
                    let gapBetween = null;
                    res2.forEach(trip2 => {
                        gapBetween = trip2.trips[0].departure_time_min - tripData.arrival_time_min
                        if (!tripData2 && gapBetween > 0) {
                            tripData2 = trip2.trips[0];
                        }
                    });

                    if (!!tripData2) {
                        let departure = new Date(tripData.departure_time).toLocaleTimeString(undefined, options);
                        let arrival = new Date(tripData.arrival_time).toLocaleTimeString(undefined, options);
                        const listItem = document.createElement('p');
                        let departure2 = new Date(tripData2.departure_time).toLocaleTimeString(undefined, options);
                        let arrival2 = new Date(tripData2.arrival_time).toLocaleTimeString(undefined, options);
                        listItem.innerText = departure + ' - ' + arrival + ' (' + gapBetween + 'min) ' + departure2 + ' - ' + arrival2;
                        journeyNode.appendChild(listItem);
                    }
                }
            })
        });
    }).catch(e => {
        console.log(e)
    });
}

function clearPreviousSearch() {
    const allTrips = document.querySelectorAll('.trip');
    allTrips.forEach(trip => {
        while (trip.firstChild) {
            trip.removeChild(trip.firstChild);
        }
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
