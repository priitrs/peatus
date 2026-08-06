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

const allTrips = document.querySelectorAll('.trip');

let otherJourneysAreHidden = false;
let params = {};

let config = [
    {node: document.getElementById('talUle'), start: stops.TallinnS, end: stops.Ulemiste},
    {node: document.getElementById('uleTal'), start: stops.Ulemiste, end: stops.TallinnS},
    {node: document.getElementById('talSaku'), start: stops.TallinnW, end: stops.Saku},
    {node: document.getElementById('talKas'), start: stops.TallinnW, end: stops.Kasemetsa},
    {node: document.getElementById('hagRapla'), start: stops.Hagudi, end: stops.Rapla},
    {node: document.getElementById('raplaHag'), start: stops.Rapla, end: stops.Hagudi},
    {node: document.getElementById('kasRapla'), start: stops.Kasemetsa, end: stops.Rapla},
    {node: document.getElementById('kasTal'), start: stops.Kasemetsa, end: stops.TallinnW},
    {node: document.getElementById('raplaKas'), start: stops.Rapla, end: stops.Kasemetsa},
    {node: document.getElementById('sakuRapla'), start: stops.Saku, end: stops.Rapla},
    {node: document.getElementById('sakuTal'), start: stops.Saku, end: stops.TallinnW},
    {node: document.getElementById('raplaSaku'), start: stops.Rapla, end: stops.Saku},
    {node: document.getElementById('raplaTal'), start: stops.Rapla, end: stops.TallinnW},
    {node: document.getElementById('talRapla'), start: stops.TallinnW, end: stops.Rapla},
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
            addToSearchResults(trip);
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

function addToSearchResults(trip) {
    console.log(trip)
    const isInFuture = getTripDepartureIsInFuture(trip)
    let result = getFormattedJourneyTimes(trip.trips[0]);
    result += '  (' + trip.trips[0].ext_trip_id + ')'
    const isExpress = trip.trips[0].route_class === 'E'
    const messages = trip.trips[0].trip_messages;
    addSearchResultToJourney(result, isInFuture, isExpress, messages);
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

function addSearchResultToJourney(formattedJourneyTime, isInFuture, isExpress, messages) {
    const listItem = document.createElement('p')
    listItem.innerText = formattedJourneyTime;
    listItem.classList.add('journey');
    if (!isInFuture) {
        listItem.classList.add('past');
    }
    if (isExpress) {
        const icon = document.createElement('span');
        icon.className = 'express-icon';
        icon.innerHTML = `
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" fill="currentColor"/>
      </svg>
    `;
        listItem.prepend(icon);
    }
    params.node.appendChild(listItem)

    messages = [
        {
            "id": 27330,
            "created_at": "2026-05-20T10:51:13.573+03:00",
            "updated_at": "2026-05-20T10:51:13.573+03:00",
            "ext_trip_id": "119",
            "realtime_data_enabled": false,
            "message_et": "Reis on asendatud bussiga Valga ja Elva vahel.",
            "message_en": "The train has been replaced by a bus between Valga and Elva.",
            "message_ru": "\u0412\u043c\u0435\u0441\u0442\u043e \u043f\u043e\u0435\u0437\u0434\u0430 \u043d\u0430 \u043c\u0430\u0440\u0448\u0440\u0443\u0442\u0435 \u043c\u0435\u0436\u0434\u0443 \u0412\u0430\u043b\u0433\u043e\u0439 \u0438 \u042d\u043b\u044c\u0432\u043e\u0439 \u043a\u0443\u0440\u0441\u0438\u0440\u0443\u0435\u0442 \u0430\u0432\u0442\u043e\u0431\u0443\u0441."
        },
        {
            "id": 27748,
            "created_at": "2026-06-05T14:05:54.669+03:00",
            "updated_at": "2026-06-05T14:05:54.669+03:00",
            "ext_trip_id": "119",
            "realtime_data_enabled": false,
            "message_et": "Tallinna suunas reisimiseks tuleb Tartus \u00fcmber istuda teise rongi, mis v\u00e4ljub sama perrooni \u00e4\u00e4rest.",
            "message_en": "To travel towards Tallinn, please change to another train in Tartu, which departs from the same platform.",
            "message_ru": "\u0427\u0442\u043e\u0431\u044b \u0434\u043e\u0431\u0440\u0430\u0442\u044c\u0441\u044f \u0434\u043e \u0422\u0430\u043b\u043b\u0438\u043d\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u0441\u0434\u0435\u043b\u0430\u0439\u0442\u0435 \u043f\u0435\u0440\u0435\u0441\u0430\u0434\u043a\u0443 \u0432 \u0422\u0430\u0440\u0442\u0443 \u043d\u0430 \u0434\u0440\u0443\u0433\u043e\u0439 \u043f\u043e\u0435\u0437\u0434, \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u044e\u0449\u0438\u0439\u0441\u044f \u0441 \u0442\u043e\u0439 \u0436\u0435 \u043f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b."
        }
    ]
    if (messages && messages.length > 0) {
        const messageItem = document.createElement('p')
        messageItem.innerText = messages
            .map(msg => msg.message_et)
            .join("\n");
        messageItem.classList.add('messages');
        params.node.appendChild(messageItem)
    }
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

const toggle = document.getElementById("tripToggle");

toggle.addEventListener("change", () => {
    document.querySelectorAll(".trip").forEach(el => {
        el.classList.toggle("pink", toggle.checked);
    });
});