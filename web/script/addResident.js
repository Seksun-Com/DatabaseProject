const addResidentForm = document.getElementById('addResidentForm');

addResidentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const residentId = document.getElementById('residentId').value;
    const residentName = document.getElementById('residentName').value;
    const telNumber = document.getElementById('telNumber').value;
    const contact = document.getElementById('contact').value;

    try {
        if (residentId !== "" ||
            residentName !== "" ||
            telNumber !== "" ||
            contact !== "") {
            const response = await fetch('http://localhost:3000/addResident', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ResidentID: residentId,
                    ResidentName: residentName,
                    TelNumber: telNumber,
                    Contact: contact
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data);
            alert("Resident added successfully!");
            addResidentForm.reset();
        } else {
            alert("Please Enter Some Info");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred. Check server connection and try again.");
    }
});
