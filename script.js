let stops = {
    "Hagudi": "64-8852-5",
    "Valdeku": "64-6347-104",
    "Liiva": "64-6298-48",
    "TallinnW": "64-8852-93",
    "TallinnS": "64-6320-93",
    "Ulemiste": "64-6320-117",
    "Nomme": "64-6347-57",
    "Tondi": "64-6347-98",
    "Rapla": "64-8852-78",
    "Saku": "64-8852-85",
    "Kasemetsa": "64-8852-17"
}

const hagudiTallinn = document.getElementById('hagTal');
const tallinnUlemiste = document.getElementById('talUle');
const ulemisteTallinn = document.getElementById('uleTal');
const tallinnHagudi = document.getElementById('talHag');
const hagudiRapla = document.getElementById('hagRapla');
const raplaHagudi = document.getElementById('raplaHag');
const kasemetsaRapla = document.getElementById('kasRapla');
const raplaKasemetsa = document.getElementById('raplaKas');
const sakuRapla = document.getElementById('sakuRapla');
const raplaSaku = document.getElementById('raplaSaku');
const kasemetsaHagudi = document.getElementById('kasHag');
const hagudiKasemetsa = document.getElementById('hagKas');

const allTrips = document.querySelectorAll('.trip');

let otherJourneysAreHidden = false;
let params = {};

let config = [
    {node: hagudiTallinn, start: stops.Hagudi, end: stops.TallinnW},
    {node: tallinnUlemiste, start: stops.TallinnS, end: stops.Ulemiste},
    {node: ulemisteTallinn, start: stops.Ulemiste, end: stops.TallinnS},
    {node: tallinnHagudi, start: stops.TallinnW, end: stops.Hagudi},
    {node: hagudiRapla, start: stops.Hagudi, end: stops.Rapla},
    {node: raplaHagudi, start: stops.Rapla, end: stops.Hagudi},
    {node: kasemetsaRapla, start: stops.Kasemetsa, end: stops.Rapla},
    {node: raplaKasemetsa, start: stops.Rapla, end: stops.Kasemetsa},
    {node: sakuRapla, start: stops.Saku, end: stops.Rapla},
    {node: raplaSaku, start: stops.Rapla, end: stops.Saku},
    {node: kasemetsaHagudi, start: stops.Kasemetsa, end: stops.Hagudi},
    {node: hagudiKasemetsa, start: stops.Hagudi, end: stops.Kasemetsa},
]

config.forEach( c => {
    c.node.addEventListener(('click'), () => {
        handleClickOnJourney(c.start, c.end, null, null, c.node);
    });
})

function handleClickOnJourney(start, destination, start2, destination2, node) {
    prepareSearchParameters(start, destination, start2, destination2, node);
    return otherJourneysAreHidden ? clearLastSearch() : startNewSearch();
}

function prepareSearchParameters(start, destination, start2, destination2, node) {
    params.start1 = start;
    params.start2 = start2;
    params.destination1 = destination;
    params.destination2 = destination2;
    params.node = node;
    params.isSingleJourney = start2 === null || destination2 === null;
}

function startNewSearch() {
    addLoadingText();
    toggleJourneysListVisibility();
    return params.isSingleJourney ? getTimesForSingleJourney() : getTimesForCombinedJourney();
}

function getTimesForSingleJourney() {
    fetchData(params.start1, params.destination1).then(res => {
        res.forEach(trip => {
            addToSearchResultsIfInFuture(trip);
        });
    }).then(() => {
        removeLoadingText();
    }).catch(e => {
        console.log(e)
    });
}
const loading = ' loading...'

function addLoadingText() {
    params.node.firstChild.textContent = params.node.firstChild.textContent + loading
}

function addToSearchResultsIfInFuture(trip) {
    let result = getTripDepartureIsInFuture(trip) ? '• ' : '';
    result += getFormattedJourneyTimes(trip.trips[0]);
    result += '  (' + trip.trips[0].ext_trip_id + ')'
    addSearchResultToJourney(result);
}

function getTripDepartureIsInFuture(trip) {
    return trip.trips[0].departure_time_min > getMinutesFromMidnight();
}

function getFormattedJourneyTimes(tripData) {
    return getFormattedTime(tripData.departure_time) + ' - ' + getFormattedTime(tripData.arrival_time);
}

function getFormattedTime(time) {
    return new Date(time).toLocaleTimeString('EST', {hour: 'numeric', minute: 'numeric'});
}

function addSearchResultToJourney(formattedJourneyTime) {
    const listItem = document.createElement('p')
    listItem.innerText = formattedJourneyTime;
    params.node.appendChild(listItem)
}

function removeLoadingText() {
    params.node.firstChild.textContent = params.node.firstChild.textContent.slice(0, -loading.length);
}

function getTimesForCombinedJourney() {
    fetchData(params.start1, params.destination1).then(res => {
        fetchData(params.start2, params.destination2).then(res2 => {
            res.forEach(trip => {
                if (getTripDepartureIsInFuture(trip)) {
                    let connectingTripFound = false;
                    res2.forEach(trip2 => {
                        if (!connectingTripFound && (trip2.trips[0].departure_time_min > trip.trips[0].arrival_time_min)) {
                           connectingTripFound = true;
                           addCombinedTripToSearchResults(trip, trip2);
                        }
                    });
                }
            })
        });
    }).then(() => {
        removeLoadingText();
    }).catch(e => {
        console.log(e)
    });
}

function addCombinedTripToSearchResults(trip, trip2) {
    let gapBetweenTrips = trip2.trips[0].departure_time_min - trip.trips[0].arrival_time_min;
    const listItem = document.createElement('p');
    listItem.innerHTML = getFormattedJourneyTimes(trip.trips[0]) + getFormattedGap(gapBetweenTrips) + getFormattedJourneyTimes(trip2.trips[0])
    params.node.appendChild(listItem);
}

function toggleJourneysListVisibility() {
    otherJourneysAreHidden = !otherJourneysAreHidden;
    allTrips.forEach(journey => {
        let currentIsSelectedJourney = params.node.id === journey.id;
        if (!currentIsSelectedJourney) {
            journey.hidden = otherJourneysAreHidden;
            journey.style.display = otherJourneysAreHidden ? 'none' : 'flex';
        }
    });
}

function clearLastSearchResults() {
    let firstChild = params.node.firstChild;
    while (params.node.firstChild) {
        params.node.removeChild(params.node.firstChild);
    }
    params.node.appendChild(firstChild);
}

function clearLastSearch() {
    clearLastSearchResults();
    toggleJourneysListVisibility();
}

function getFormattedGap(gapBetweenTrips) {
    return '&nbsp;&nbsp;' + `<span class="${(getColorForGapBetween(gapBetweenTrips))}">` + ' ' + gapBetweenTrips + 'min ' + `</span>` + '&nbsp;&nbsp;';
}

function getColorForGapBetween(minutesBetweenTrips) {
    if (minutesBetweenTrips <= 15) {
        return 'bold green';
    } else if (minutesBetweenTrips < 30) {
        return 'bold yellow';
    } else {
        return 'bold red'
    }
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
            "origin_stop_area_id": originStop,
            "destination_stop_area_id": destinationStop,
            "channel": "web"
        }),
    })
        .then(response => {
            let jsonString = '';
            const reader = response.body.getReader();
            function readData() {
                return reader.read().then(({value, done}) => {
                    if (done) {
                        return JSON.parse(jsonString).journeys;
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