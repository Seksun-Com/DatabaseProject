const getAllResidentsButton = document.getElementById('getAllResidentsButton');
const residentsTableBody = document.querySelector('#residentsTable tbody');
const searchInput = document.getElementById('searchInput');
const searchResidentsButton = document.getElementById('searchResidentsButton');

async function displayResidents(searchId = null, searchName = null) {
    try {
        let url = 'http://localhost:3000/getResidents';

        if (searchId) {
            url += `?id=${searchId}`;
        } else if (searchName) {
            url += `?name=${searchName}`;
        } else {
            url = 'http://localhost:3000/getAllResidents'
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const residents = await response.json();
        if (!Array.isArray(residents)) {
            residents = [residents];
        }

        residentsTableBody.innerHTML = '';

        residents.forEach(resident => {
            if (resident) {
                const row = residentsTableBody.insertRow();
                row.insertCell().textContent = resident.ResidentID;
                row.insertCell().textContent = resident.ResidentName;
                row.insertCell().textContent = resident.TelNumber;
                row.insertCell().textContent = resident.Contact;
                row.insertCell().textContent = resident.RoomNumber;

                const actionsCell = row.insertCell();
                const updateButton = document.createElement('button');
                updateButton.textContent = 'Edit';
                updateButton.addEventListener('click', () => updateResident(resident.ResidentID));
                actionsCell.appendChild(updateButton);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteResident(resident.ResidentID));
                actionsCell.appendChild(deleteButton);
            }
        });
    } catch (error) {
        console.error('Error:', error);
        alert("Error getting residents.");
    }
}

getAllResidentsButton.addEventListener('click', async () => displayResidents());

searchResidentsButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    if (isNaN(searchTerm)) {
        displayResidents(null, searchTerm);
    } else {
        displayResidents(searchTerm, null);
    }
    searchInput.value = '';
});

async function updateResident(residentId) {
    const residentName = prompt("Enter new Resident Name (leave blank to skip):");
    const telNumber = prompt("Enter new Tel Number (leave blank to skip):");
    const contact = prompt("Enter new Contact (leave blank to skip):");

    const updateData = {};

    if (residentName) {
        updateData.ResidentName = residentName;
    }

    if (telNumber) {
        updateData.TelNumber = telNumber;
    }

    if (contact) {
        updateData.Contact = contact;
    }

    if (Object.keys(updateData).length > 0) {
        try {
            const response = await fetch(`http://localhost:3000/updateResident/${residentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Resident updated!");
            displayResidents();
        } catch (error) {
            console.error('Error:', error);
            alert("Error updating resident.");
        }
    } else {
        alert("No fields were updated.");
    }
}

async function deleteResident(residentId) {
    if (confirm("Are you sure you want to delete this resident?")) {
        try {
            const response = await fetch(`http://localhost:3000/deleteResident/${residentId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Resident deleted!");
            displayResidents();
        } catch (error) {
            console.error('Error:', error);
            alert("Error deleting resident.");
        }
    }
}