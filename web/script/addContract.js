const addContractForm = document.getElementById('addContractForm');

addContractForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const contractId = document.getElementById('contractId').value;
    const dateIn = document.getElementById('dateIn').value;
    const dateOut = document.getElementById('dateOut').value;
    const roomNumber = document.getElementById('roomNumber').value;
    const residentId = document.getElementById('residentId').value;
    const employeeId = document.getElementById('employeeId').value;

    try {
        if (contractId != "" ||
            dateIn != "" ||
            dateOut != "" ||
            roomNumber != "" ||
            residentId != "" ||
            employeeId != "") {
            const response = await fetch('http://localhost:3000/addContract', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ContractID: contractId,
                    DateIn: dateIn,
                    DateOut: dateOut,
                    RoomNumber: roomNumber,
                    ResidentID: residentId,
                    EmployeeID: employeeId
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            alert("Contract added successfully!");
            addContractForm.reset();
        } else {
            alert("Please Enter Some Info");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred. Check server connection and try again.");
    }
});