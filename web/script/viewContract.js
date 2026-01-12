
const getAllContractsButton = document.getElementById('getAllContractsButton');
const contractsTableBody = document.querySelector('#contractsTable tbody');
const searchInput = document.getElementById('searchInput');
const searchContractsButton = document.getElementById('searchContractsButton');


async function displayContracts(searchId = null) {
    try {
        let url = 'http://localhost:3000/getContracts';
        if (searchId) {
            url += `?searchId=${searchId}`;
        } else {
            url = 'http://localhost:3000/getAllContracts';
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const contracts = await response.json();
        if (!Array.isArray(contracts)) {
            contracts = [contracts];
        }

        contractsTableBody.innerHTML = '';

        contracts.forEach(contract => {
            const row = contractsTableBody.insertRow();
            row.insertCell().textContent = contract.ContractID;

            // Format DateIn
            const dateIn = new Date(contract.DateIn);
            row.insertCell().textContent = dateIn.toLocaleDateString(); // Format as local date

            // Format DateOut
            const dateOut = new Date(contract.DateOut);
            row.insertCell().textContent = dateOut.toLocaleDateString(); // Format as local date

            row.insertCell().textContent = contract.RoomNumber;
            row.insertCell().textContent = contract.ResidentID;
            row.insertCell().textContent = contract.EmployeeID;

            const actionsCell = row.insertCell();
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Edit';
            updateButton.addEventListener('click', () => updateContract(contract.ContractID));
            actionsCell.appendChild(updateButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteContract(contract.ContractID));
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error:', error);
        alert("Error getting contracts.");
    }
}

getAllContractsButton.addEventListener('click', async () => displayContracts());

searchContractsButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    displayContracts(searchTerm);
    searchInput.value = '';
})

async function updateContract(contractId) {
    const dateIn = prompt("Enter new Date In (leave blank to skip):");
    const dateOut = prompt("Enter new Date Out (leave blank to skip):");
    const roomNumber = prompt("Enter new Room Number (leave blank to skip):");
    const residentId = prompt("Enter new Resident ID (leave blank to skip):");
    const employeeId = prompt("Enter new Employee ID (leave blank to skip):");

    const updateData = {};

    if (dateIn) {
        updateData.DateIn = dateIn;
    }
    if (dateOut) {
        updateData.DateOut = dateOut;
    }
    if (roomNumber) {
        updateData.RoomNumber = roomNumber;
    }
    if (residentId) {
        updateData.ResidentID = residentId;
    }
    if (employeeId) {
        updateData.EmployeeID = employeeId;
    }

    if (Object.keys(updateData).length > 0) {
        try {
            const response = await fetch(`http://localhost:3000/updateContract/${contractId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Contract updated!");
            displayContracts();
        } catch (error) {
            console.error('Error:', error);
            alert("Error updating contract.");
        }
    } else {
        alert("No fields were updated.");
    }
}

async function deleteContract(contractId) {
    if (confirm("Are you sure you want to delete this contract?")) {
        try {
            const response = await fetch(`http://localhost:3000/deleteContract/${contractId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Contract deleted!");
            displayContracts();
        } catch (error) {
            console.error('Error:', error);
            alert("Error deleting contract.");
        }
    }
}