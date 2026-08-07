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
        handleClickOnJourney(c.start, c.end, c.node);
    });
})

const datePicker = document.querySelector("date-picker-nav");

function getTallinnDate(date) {
    return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Europe/Tallinn",
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    }).format(date);
}

let selectedDate = getTallinnDate(new Date());

datePicker.addEventListener("date-change", event => {
    selectedDate = getTallinnDate(event.detail.date)

    if (otherJourneysAreHidden){
        clearLastSearch()
        startNewSearch()
    }
});

function handleClickOnJourney(start, destination, node) {
    prepareSearchParameters(start, destination, node);
    return otherJourneysAreHidden ? clearLastSearch() : startNewSearch();
}

function prepareSearchParameters(start, destination, node) {
    params.start1 = start;
    params.destination1 = destination;
    params.node = node;
}

function startNewSearch() {
    addLoadingText();
    toggleJourneysListVisibility();
    return getTimesForSingleJourney();
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
    const isInFuture = getTripDepartureIsInFuture(trip)
    let result = getFormattedJourneyTimes(trip.trips[0]);
    result += '  (' + trip.trips[0].ext_trip_id + ')'
    const isExpress = trip.trips[0].route_class === 'E'
    const messages = trip.trips[0].trip_messages;
    addSearchResultToJourney(result, isInFuture, isExpress, messages);
}

function getTripDepartureIsInFuture(trip) {
    const isFutureDateSelected = selectedDate !== getTallinnDate(new Date())
    const todayDepartureIsInFuture = trip.trips[0].departure_time_min > getMinutesFromMidnight()

    return isFutureDateSelected || todayDepartureIsInFuture;
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
            "date": selectedDate,
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