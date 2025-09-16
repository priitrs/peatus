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

let names = {
    "hagTal": "Hagudi - Tallinn",
    "talUle": "Tallinn - Ülemiste",
    "hagUle": "Hagudi - Tallinn - Ülemiste",
    "hagLiiva": "Hagudi - Liiva",
    "uleTal": "Ülemiste - Tallinn",
    "talHag": "Tallinn - Hagudi",
    "uleHag": "Ülemiste - Tallinn - Hagudi",
    "liivaHag": "Liiva - Hagudi",
    "hagRapla": "Hagudi - Rapla",
    "raplaHag": "Rapla - Hagudi",
    "kasRapla": "Kasemetsa - Rapla",
    "raplaKas": "Rapla - Kasemetsa",
    "sakuRapla": "Saku - Rapla",
    "raplaSaku": "Rapla - Saku",
    "kasHag": "Kasemetsa - Hagudi",
    "hagKas": "Hagudi - Kasemetsa",

}

const hagudiTallinn = document.getElementById('hagTal');
const tallinnUlemiste = document.getElementById('talUle');
const hagudiUlemiste = document.getElementById('hagUle');
const hagudiLiiva = document.getElementById('hagLiiva');
const ulemisteTallinn = document.getElementById('uleTal');
const tallinnHagudi = document.getElementById('talHag');
const ulemisteHagudi = document.getElementById('uleHag');
const liivaHagudi = document.getElementById('liivaHag');
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


hagudiTallinn.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Hagudi, stops.TallinnW, null, null, hagudiTallinn);
});
tallinnUlemiste.addEventListener(('click'), () => {
    handleClickOnJourney(stops.TallinnS, stops.Ulemiste, null, null, tallinnUlemiste);
});
ulemisteTallinn.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Ulemiste, stops.TallinnS, null, null, ulemisteTallinn);
});
tallinnHagudi.addEventListener(('click'), () => {
    handleClickOnJourney(stops.TallinnW, stops.Hagudi, null, null, tallinnHagudi);
});
hagudiRapla.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Hagudi, stops.Rapla, null, null, hagudiRapla);
});
raplaHagudi.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Rapla, stops.Hagudi, null, null, raplaHagudi);
});
kasemetsaRapla.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Kasemetsa, stops.Rapla, null, null, kasemetsaRapla);
});
raplaKasemetsa.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Rapla, stops.Kasemetsa, null, null, raplaKasemetsa);
});
sakuRapla.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Saku, stops.Rapla, null, null, sakuRapla);
});
raplaSaku.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Rapla, stops.Saku, null, null, raplaSaku);
});
kasemetsaHagudi.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Kasemetsa, stops.Hagudi, null, null, kasemetsaHagudi);
});
hagudiKasemetsa.addEventListener(('click'), () => {
    handleClickOnJourney(stops.Hagudi, stops.Kasemetsa, null, null, hagudiKasemetsa);
});

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

function addLoadingText() {
    params.node.firstChild.textContent = names[params.node.id] + ' loading...'
}

function addToSearchResultsIfInFuture(trip) {
    if (getTripDepartureIsInFuture(trip)) {
        let formattedJourneyTime = getFormattedJourneyTimes(trip.trips[0]);
        addSearchResultToJourney(formattedJourneyTime);
    }
}

function getTripDepartureIsInFuture(trip) {
    return trip.trips[0].departure_time_min > getMinutesFromMidnight();
}

function getFormattedJourneyTimes(tripData) {
    return getFormattedTime(tripData.departure_time) + ' - ' + getFormattedTime(tripData.arrival_time);
}

function getFormattedTime(time) {
    return new Date(time).toLocaleTimeString(undefined, {hour: 'numeric', minute: 'numeric'});
}

function addSearchResultToJourney(formattedJourneyTime) {
    const listItem = document.createElement('p')
    listItem.innerText = formattedJourneyTime;
    params.node.appendChild(listItem)
}

function removeLoadingText() {
    params.node.firstChild.textContent = names[params.node.id];
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