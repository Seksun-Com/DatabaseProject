const addInvoiceForm = document.getElementById('addInvoiceForm');

addInvoiceForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invoiceId = document.getElementById('invoiceId').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const residentId = document.getElementById('residentId').value;
    const waterCost = parseFloat(document.getElementById('waterCost').value) || 0;
const electricityCost = parseFloat(document.getElementById('electricityCost').value) || 0;
const rent = parseFloat(document.getElementById('rent').value) || 0;
const totalAmount = waterCost + electricityCost + rent;
    try {
        if (invoiceId != '' ||
            waterCost != '' ||
            electricityCost != '' ||
            rent != '' ||
            totalAmount != '' ||
            roomNumber != '' ||
            residentId != '') {
            const response = await fetch('http://localhost:3000/addInvoices', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    InvoiceID: invoiceId,
                    WaterCost: waterCost,
                    ElectricityCost: electricityCost,
                    Rent: rent,
                    TotalAmount: totalAmount,
                    RoomNumber: roomNumber,
                    ResidentID: residentId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            alert("Invoice added successfully!");
            addInvoiceForm.reset();
        } else {
            alert("Please Enter Some Info");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred. Check server connection and try again.");
    }
});