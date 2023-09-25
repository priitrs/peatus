let stops = {
    "Hagudi" : "64-6298-5",
    "Tallinn" : "64-6298-93"
}

const toTallinnButton = document.getElementById('data');

function getMinutesFromMidnight() {
    const currentDate = new Date();
    const currentTime = currentDate.getTime();
    currentDate.setHours(0, 0, 0, 0);
    return Math.round((currentTime - currentDate.getTime()) / (1000 * 60));
}

toTallinnButton.addEventListener(('click'), () => {
    fetchData(stops.Hagudi, stops.Tallinn).then(res => {
        console.log(res);
        const currentMinutesFromMidnight = getMinutesFromMidnight();

        res.forEach(trip => {
            let tripData = trip.trips[0]
            if (tripData.departure_time_min > currentMinutesFromMidnight) {
                let departure = new Date(tripData.departure_time);
                let arrival = new Date(tripData.arrival_time);
                const listItem = document.createElement('p')
                listItem.innerText = departure.toLocaleTimeString() + ' - ' + arrival.toLocaleTimeString();
                toTallinnButton.appendChild(listItem)
                // console.log(departure.toLocaleTimeString() + ' - ' + arrival.toLocaleTimeString())
            }
        });
    }).catch(e => {
        console.log(e)
    });
});

function fetchData(originStop, destinationStop) {
    return fetch('https://api.ridango.com/v2/64/intercity/stopareas/trips/direct', {
        method: 'PUT',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify({
            "date": "2023-09-22",
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
