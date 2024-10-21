// Array to store events (from local storage if available)
let events = JSON.parse(localStorage.getItem('events')) || [];

// Flags to control editing state
let isEditing = false;
let editIndex = null;

// Get DOM elements
const eventList = document.getElementById('eventList');
const totalEventsElem = document.getElementById('totalEvents');
const averageDistanceElem = document.getElementById('averageDistance');
const lastEventElem = document.getElementById('lastEvent');

// Function to save events to local storage
function saveEvents() {
    localStorage.setItem('events', JSON.stringify(events));
}

// Add or Update event (depending on mode)
function addOrUpdateEvent() {
    if (isEditing) {
        updateEvent();
    } else {
        addEvent();
    }
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

    // Reset the form and update display
    resetForm();
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
            const distanceBetweenEvents = event.kilometer - events[index - 1].kilometer;
            distanceDifferences.push(distanceBetweenEvents);

            // Calculate the time difference in days between this event and the previous
            const date1 = new Date(event.date);
            const date2 = new Date(events[index - 1].date);
            const timeBetweenEvents = Math.floor((date1 - date2) / (1000 * 60 * 60 * 24));
            timeDifferences.push(timeBetweenEvents);
        }

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

    if (window.eventChart) {
        window.eventChart.destroy();  // Destroy old chart instance if any
    }

    window.eventChart = new Chart(ctx, {
        type: 'line',
        data: {
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
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Event Trends Over Time'
            },
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Event Dates'
                    }
                }
            }
        }
    });
}

// Delete event by index
function deleteEvent(index) {
    events.splice(index, 1); // Remove the event at the specified index
    saveEvents(); // Save the updated list to local storage
    updateDisplay(); // Update the UI
}

// Edit event
function editEvent(index) {
    const event = events[index];
    document.getElementById('eventDate').value = event.date;
    document.getElementById('kilometerReading').value = event.kilometer;

    // Switch to "edit mode"
    isEditing = true;
    editIndex = index;

    // Change button text to "Update Event"
    const submitButton = document.querySelector('button');
    submitButton.textContent = 'Update Event';
}

// Update event
function updateEvent() {
    const eventDate = document.getElementById('eventDate').value;
    const kilometerReading = document.getElementById('kilometerReading').value;

    // Validate input
    if (!eventDate || !kilometerReading) {
        alert('Please fill out both fields.');
        return;
    }

    if (isEditing && editIndex !== null) {
        // Update the existing event
        events[editIndex] = {
            date: eventDate,
            kilometer: parseInt(kilometerReading, 10)
        };

        // Save the updated events to local storage
        saveEvents();

        // Reset form and mode
        resetForm();
    }
}

// Reset form after editing/adding
function resetForm() {
    document.getElementById('eventDate').value = '';
    document.getElementById('kilometerReading').value = '';
    document.querySelector('button').textContent = 'Log Event';
    isEditing = false;
    editIndex = null;
    updateDisplay();  // Update the display after resetting
}

// Load events from storage and update the display
window.onload = updateDisplay;
