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

const allTrips = document.querySelectorAll('.trip');

let otherJourneysAreHidden = false;

hagudiTallinn.addEventListener(('click'), () => {
    toggleForJourney(stops.Hagudi, stops.TallinnW, null, null, hagudiTallinn);
});
tallinnUlemiste.addEventListener(('click'), () => {
    toggleForJourney(stops.TallinnS, stops.Ulemiste, null, null, tallinnUlemiste);
});
hagudiUlemiste.addEventListener(('click'), () => {
    toggleForJourney(stops.Hagudi, stops.TallinnW, stops.TallinnS, stops.Ulemiste, hagudiUlemiste);
});
hagudiLiiva.addEventListener(('click'), () => {
    toggleForJourney(stops.Hagudi, stops.Liiva, null, null, hagudiLiiva);
});
ulemisteTallinn.addEventListener(('click'), () => {
    toggleForJourney(stops.Ulemiste, stops.TallinnS, null, null, ulemisteTallinn);
});
tallinnHagudi.addEventListener(('click'), () => {
    toggleForJourney(stops.TallinnW, stops.Hagudi, null, null, tallinnHagudi);
});
ulemisteHagudi.addEventListener(('click'), () => {
    toggleForJourney(stops.Ulemiste, stops.TallinnS, stops.TallinnW, stops.Hagudi, ulemisteHagudi);
});
liivaHagudi.addEventListener(('click'), () => {
    toggleForJourney(stops.Liiva, stops.Hagudi, null, null, liivaHagudi);
});

function toggleForJourney(start, destination, start2, destination2, node) {
    if (!otherJourneysAreHidden) {
        if (start2 === null && destination2 === null) {
            getTimesForSingleJourney(start, destination, node);
        } else {
            getTimesForCombinedJourney(start, destination, start2, destination2, node);
        }
    } else {
        removeTimesFromJourney(node);
    }
    toggleOtherJourneysVisibility(node);
}

function getFormattedTime(time) {
    return new Date(time).toLocaleTimeString(undefined, {hour: 'numeric', minute: 'numeric'});
}

function getFormattedJourneyTimes(tripData) {
    return getFormattedTime(tripData.departure_time) + ' - ' + getFormattedTime(tripData.arrival_time);
}

function getTimesForSingleJourney(start, end, journeyNode) {
    fetchData(start, end).then(res => {
        res.forEach(trip => {
            let tripData = trip.trips[0]
            let tripDepartureIsInFuture = tripData.departure_time_min > getMinutesFromMidnight();
            if (tripDepartureIsInFuture) {
                const listItem = document.createElement('p')
                listItem.innerText = getFormattedJourneyTimes(tripData);
                journeyNode.appendChild(listItem)
            }
        });
    }).catch(e => {
        console.log(e)
    });
}

function getFormattedGap(gapBetweenTrips) {
    return '&nbsp;&nbsp;' + `<span class="${(getColorForGap(gapBetweenTrips))}">` + ' ' + gapBetweenTrips + 'min ' + `</span>` + '&nbsp;&nbsp;';
}

function getTimesForCombinedJourney(start, end, start2, end2, journeyNode) {
    fetchData(start, end).then(res => {
        fetchData(start2, end2).then(res2 => {
            res.forEach(trip => {
                let trip1Data = trip.trips[0]
                let tripDepartureIsInFuture = trip1Data.departure_time_min > getMinutesFromMidnight();
                if (tripDepartureIsInFuture) {
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
                        listItem.innerHTML = getFormattedJourneyTimes(trip1Data) + getFormattedGap(gapBetweenTrips) + getFormattedJourneyTimes(trip2Data)
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

function toggleOtherJourneysVisibility(activeNode) {
    otherJourneysAreHidden = !otherJourneysAreHidden;
    allTrips.forEach(trip => {
        if (activeNode.id !== trip.id) {
            trip.hidden = otherJourneysAreHidden;
            trip.style.display = otherJourneysAreHidden ? 'none' : 'flex';
        }
    });
}

function removeTimesFromJourney(activeNode) {
    let firstChild = activeNode.firstChild;
    while (activeNode.firstChild) {
        activeNode.removeChild(activeNode.firstChild);
    }
    activeNode.appendChild(firstChild);
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
