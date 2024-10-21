// Array to store events (from local storage if available)
let events = JSON.parse(localStorage.getItem('events')) || [];

// Get DOM elements
const eventList = document.getElementById('eventList');
const totalEventsElem = document.getElementById('totalEvents');
const averageDistanceElem = document.getElementById('averageDistance');
const lastEventElem = document.getElementById('lastEvent');

// Function to save events to local storage
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Add a new event
function addEvent() {
    const eventDate = document.getElementById('eventDate').value;
    const kilometerReading = document.getElementById('kilometerReading').value;

    // Validate input
    if (!eventDate || !kilometerReading) {
        alert('Please fill out both fields.');
        return;
    }

    const event = {
        date: eventDate,
        kilometer: parseInt(kilometerReading, 10)
    };

    // Add the new event to the array
    events.push(event);
    events.sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

    // Save events to local storage
    saveEvents();

    // Update the display
    updateDisplay();
}

// Update the display and summary
function updateDisplay() {
    eventList.innerHTML = '';  // Clear the event list
    let totalDistance = 0;
    let lastEvent = null;
    let secondLastEvent = null;

    let timeDifferences = []; // Days between events
    let distanceDifferences = []; // Kilometers between events
    let eventDates = []; // For labels in the graph

    // Loop through events and display them
    events.forEach((event, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `Event ${index + 1} - Date: ${event.date}, Kilometer: ${event.kilometer}`;
        
        // Add Edit and Delete buttons
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editEvent(index);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteEvent(index);

        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);

        eventList.appendChild(listItem);

        // Track the total distance
        if (index > 0) {
            totalDistance += event.kilometer - events[index - 1].kilometer;
            const distanceBetweenEvents = event.kilometer - events[index - 1].kilometer;
            distanceDifferences.push(distanceBetweenEvents);

            // Calculate the time difference in days between this event and the previous
            const date1 = new Date(event.date);
            const date2 = new Date(events[index - 1].date);
            const timeBetweenEvents = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
            timeDifferences.push(timeBetweenEvents);
        }

        // Track the last and second-last events
        secondLastEvent = lastEvent;
        lastEvent = event;

        // Collect dates for graph labels
        eventDates.push(event.date);
    });

    // Update the summary
    totalEventsElem.textContent = events.length;
    averageDistanceElem.textContent = events.length > 1 ? (totalDistance / (events.length - 1)).toFixed(2) : 0;
    lastEventElem.textContent = lastEvent ? `Date: ${lastEvent.date}, Kilometer: ${lastEvent.kilometer}` : 'None';

    // Display distance between the last two events
    if (lastEvent && secondLastEvent) {
        const distanceBetweenLastEvents = lastEvent.kilometer - secondLastEvent.kilometer;
        document.getElementById('distanceBetweenLastEvents').textContent = distanceBetweenLastEvents;
    } else {
        document.getElementById('distanceBetweenLastEvents').textContent = 'N/A';
    }

    // Update the chart
    updateChart(eventDates, timeDifferences, distanceDifferences);
}

// Function to create or update the chart
function updateChart(labels, timeDifferences, distanceDifferences) {
    const ctx = document.getElementById('eventChart').getContext('2d');
    
    const chartData = {
        labels: labels,
        datasets: [
            {
                label: 'Days Between Events',
                data: timeDifferences,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            },
            {
                label: 'Kilometers Between Events',
                data: distanceDifferences,
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 2,
                fill: false
            }
        ]
    };

    if (window.eventChart) {
        window.eventChart.destroy();  // If chart exists, destroy it before creating a new one
    }

    window.eventChart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Event Trends Over Time'
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                }
            }
        }
    });
}

// Load events from local storage and display them on page load
window.onload = function() {
    updateDisplay();
};
