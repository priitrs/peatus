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

const options = {hour: 'numeric', minute: 'numeric'};

function getFormattedTime(time) {
    return new Date(time).toLocaleTimeString(undefined, options);
}

function getTimesForJourney(start, end, journeyNode) {
    let journeyTitle = journeyNode.textContent;
    hideOtherJourneys(journeyNode)
    journeyNode.innerText = journeyTitle + '  loading...';

    fetchData(start, end).then(res => {
        journeyNode.innerText = journeyTitle;
        res.forEach(trip => {
            let tripData = trip.trips[0]
            if (tripData.departure_time_min > getMinutesFromMidnight()) {
                const listItem = document.createElement('p')
                listItem.innerText = getFormattedTime(tripData.departure_time) + ' - ' + getFormattedTime(tripData.arrival_time);
                journeyNode.appendChild(listItem)
            }
        });
    }).catch(e => {
        console.log(e)
    });
}

function getTimesForCombinedJourney(start, end, start2, end2, journeyNode) {
    let journeyTitle = journeyNode.textContent;
    hideOtherJourneys(journeyNode)
    journeyNode.innerText = journeyTitle + '  loading...';

    fetchData(start, end).then(res => {
        fetchData(start2, end2).then(res2 => {
            journeyNode.innerText = journeyTitle;
            res.forEach(trip => {
                let trip1Data = trip.trips[0]
                let departureIsInFuture = trip1Data.departure_time_min > getMinutesFromMidnight();
                if (departureIsInFuture) {
                    let trip2Data = null;
                    let gapBetweenTrips = null;
                    res2.forEach(trip2 => {
                        let currentGapBetweenTrips = trip2.trips[0].departure_time_min - trip1Data.arrival_time_min
                        if (!trip2Data && currentGapBetweenTrips > 0) {
                            trip2Data = trip2.trips[0];
                            gapBetweenTrips = currentGapBetweenTrips;
                        }
                    });

                    if (!!trip2Data) {
                        const listItem = document.createElement('p');
                        listItem.innerHTML = getFormattedTime(trip1Data.departure_time) + ' - ' + getFormattedTime(trip1Data.arrival_time)
                            + `<span class="${(getColorForGap(gapBetweenTrips))}">` + ' (' + gapBetweenTrips + 'min) ' + '</span>' + getFormattedTime(trip2Data.departure_time) + ' - ' + getFormattedTime(trip2Data.arrival_time)
                        journeyNode.appendChild(listItem);
                    }
                }
            })
        });
    }).catch(e => {
        console.log(e)
    });
}

function getColorForGap(gap) {
    if (gap <= 15) {
        return 'bold green';
    } else if (gap < 30) {
        return 'bold yellow';
    } else {
        return 'bold red'
    }
}

function hideOtherJourneys(activeNode) {
    const allTrips = document.querySelectorAll('.trip');
    allTrips.forEach(trip => {
        if (activeNode.id !== trip.id) {
            trip.hidden = true;
            trip.style.display = 'none';
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
