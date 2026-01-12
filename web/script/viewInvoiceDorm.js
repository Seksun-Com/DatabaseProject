const getAllInvoicesButton = document.getElementById('getAllInvoicesButton');
const invoicesTableBody = document.querySelector('#invoicesTable tbody');
const searchInput = document.getElementById('searchInput');
const searchInvoicesButton = document.getElementById('searchInvoicesButton');

async function displayInvoices(searchId = null) {
    try {
        let url = 'http://localhost:3000/getInvoices';
        if (searchId) {
            url += `?searchId=${searchId}`;
        } else {
            url = 'http://localhost:3000/getAllInvoices';
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const invoices = await response.json();
        if (!Array.isArray(invoices)) {
            invoices = [invoices];
        }

        invoicesTableBody.innerHTML = '';

        invoices.forEach(invoice => {
            const row = invoicesTableBody.insertRow();
            row.insertCell().textContent = invoice.InvoiceID;
            row.insertCell().textContent = invoice.RoomNumber;
            row.insertCell().textContent = invoice.ResidentID;
            row.insertCell().textContent = invoice.WaterCost;
            row.insertCell().textContent = invoice.ElectricityCost;
            row.insertCell().textContent = invoice.Rent;
            row.insertCell().textContent = invoice.TotalAmount;

            const actionsCell = row.insertCell();
            const updateButton = document.createElement('button');
            updateButton.textContent = 'Edit';
            let cleanInvoiceID = invoice.InvoiceID.toString().split(':')[0]; // Sanitize invoiceID
            updateButton.addEventListener('click', () => updateInvoice(cleanInvoiceID));
            actionsCell.appendChild(updateButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', () => deleteInvoice(cleanInvoiceID)); // Sanitize invoiceID
            actionsCell.appendChild(deleteButton);
        });
    } catch (error) {
        console.error('Error:', error);
        alert("Error getting invoices.");
    }
}

getAllInvoicesButton.addEventListener('click', async () => displayInvoices());

searchInvoicesButton.addEventListener('click', async () => {
    const searchTerm = searchInput.value;
    displayInvoices(searchTerm);
    searchInput.value = '';
});

async function updateInvoice(invoiceId) {
    const roomNumber = prompt("Enter new Room Number (leave blank to skip):");
    const residentId = prompt("Enter new Resident ID (leave blank to skip):");
    const waterCost = prompt("Enter new Water Cost (leave blank to skip):");
    const electricityCost = prompt("Enter new Electricity Cost (leave blank to skip):");
    const rent = prompt("Enter new Rent (leave blank to skip):");

    const updateData = {};
    if (roomNumber) {
        updateData.RoomNumber = roomNumber;
    }
    if (residentId) {
        updateData.ResidentID = residentId;
    }
    if (waterCost) {
        updateData.WaterCost = waterCost;
    }
    if (electricityCost) {
        updateData.ElectricityCost = electricityCost;
    }
    if (rent) {
        updateData.Rent = rent;
    }


    if (Object.keys(updateData).length > 0) {
        try {
            const response = await fetch(`http://localhost:3000/updateInvoices/${invoiceId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Invoice updated!");
            displayInvoices();
        } catch (error) {
            console.error('Error:', error);
            alert("Error updating invoice.");
        }
    } else {
        alert("No fields were updated.");
    }
}

async function deleteInvoice(invoiceId) {
    if (confirm("Are you sure you want to delete this invoice?")) {
        try {
            const response = await fetch(`http://localhost:3000/deleteInvoices/${invoiceId}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            alert("Invoice deleted!");
            displayInvoices();
        } catch (error) {
            console.error('Error:', error);
            alert("Error deleting invoice.");
        }
    }
}
