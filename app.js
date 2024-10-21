let events = [];
let totalDistance = 0;

// Function to add or update an event
function addOrUpdateEvent() {
    const dateInput = document.getElementById('eventDate').value;
    const kmInput = parseFloat(document.getElementById('kilometerReading').value);

    if (!dateInput || isNaN(kmInput)) {
        alert('Please enter valid date and kilometer reading.');
        return;
    }

    // Create an event object
    const event = {
        date: new Date(dateInput),
        kilometers: kmInput
    };

    // Push the event to the events array
    events.push(event);
    renderEventList();
    updateSummary();
    renderChart();
}

// Function to render the event list
function renderEventList() {
    const eventList = document.getElementById('eventList');
    eventList.innerHTML = '';

    events.forEach((event, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${event.date.toDateString()} - ${event.kilometers} km`;
        
        // Edit button
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.onclick = () => editEvent(index);
        
        // Delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteEvent(index);
        
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
        eventList.appendChild(listItem);
    });
}

// Function to update the summary section
function updateSummary() {
    const totalEvents = events.length;
    const totalDistance = events.reduce((acc, event) => acc + event.kilometers, 0);
    const lastEvent = totalEvents > 0 ? events[totalEvents - 1] : null;
    const distanceBetweenLastEvents = totalEvents > 1 ? (events[totalEvents - 1].kilometers - events[totalEvents - 2].kilometers) : 'N/A';
    
    document.getElementById('totalEvents').textContent = totalEvents;
    document.getElementById('averageDistance').textContent = totalEvents > 0 ? (totalDistance / totalEvents).toFixed(2) : '0';
    document.getElementById('lastEvent').textContent = lastEvent ? `${lastEvent.date.toDateString()} - ${lastEvent.kilometers} km` : 'None';
    document.getElementById('distanceBetweenLastEvents').textContent = distanceBetweenLastEvents;
}

// Function to edit an event
function editEvent(index) {
    const event = events[index];
    document.getElementById('eventDate').value = event.date.toISOString().split('T')[0]; // Format date for input
    document.getElementById('kilometerReading').value = event.kilometers;
    
    // Remove the event and allow for updating
    events.splice(index, 1);
    renderEventList();
    updateSummary();
    renderChart();
}

// Function to delete an event
function deleteEvent(index) {
    events.splice(index, 1);
    renderEventList();
    updateSummary();
    renderChart();
}

// Function to render the trend chart
function renderChart() {
    const ctx = document.getElementById('eventChart').getContext('2d');

    // Clear previous chart if exists
    if (window.eventChart) {
        window.eventChart.destroy();
    }

    const labels = events.map(event => event.date.toDateString());
    const data = events.map(event => event.kilometers);
    
    window.eventChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Kilometers',
                data: data,
                borderColor: 'rgba(52, 152, 219, 1)',
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                fill: true,
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
