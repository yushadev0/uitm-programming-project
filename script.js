// --- DOM Elements ---
const form = document.getElementById('signup-form');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const ageInput = document.getElementById('age');
const trackInput = document.getElementById('track');
const termsCheckbox = document.getElementById('terms');
const submitBtn = document.getElementById('submit-btn');
const participantList = document.getElementById('participant-list');
const participantCount = document.getElementById('participant-count');
const searchInput = document.getElementById('searchInput');

// --- State Management ---
let participants = [];
let editId = null; // Tracks the ID of the participant being edited

// --- Initialization ---
function init() {
    // Option D: Load data from localStorage
    const storedParticipants = localStorage.getItem('workshopParticipants');
    if (storedParticipants) {
        participants = JSON.parse(storedParticipants);
    }
    renderParticipants(participants);
}

// --- Event Listeners ---
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    if (validateForm()) {
        saveParticipant();
        clearForm(); // Resets the form and refreshes the list after saving
    }
});

// Option C: Search Functionality
searchInput.addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    const filteredParticipants = participants.filter(p => 
        p.fullName.toLowerCase().includes(searchTerm) || 
        p.email.toLowerCase().includes(searchTerm)
    );
    
    renderParticipants(filteredParticipants);
});

// --- Core Functions ---

function validateForm() {
    const errors = [];

    if (fullNameInput.value.trim() === '') {
        errors.push("Full name is required.");
    }
    
    if (!emailInput.value.trim().includes('@') || !emailInput.value.trim().includes('.')) {
        errors.push("Email is invalid.");
    }

    const ageValue = Number(ageInput.value);
    if (ageValue <= 0) {
        errors.push("Age must be greater than 0.");
    } else if (ageValue < 18) {
        errors.push("Age must be at least 18.");
    }

    if (trackInput.value === '') {
        errors.push("Workshop track must be selected.");
    }

    if (!termsCheckbox.checked) {
        errors.push("You must accept the terms.");
    }

    // SweetAlert2 Error Notification
    if (errors.length > 0) {
        Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            html: errors.join('<br>'),
            confirmButtonColor: '#3498db'
        });
        return false;
    }

    return true;
}

function saveParticipant() {
    if (editId !== null) {
        // --- EDIT MODE (UPDATE) ---
        const index = participants.findIndex(p => p.id === editId);
        if (index !== -1) {
            participants[index].fullName = fullNameInput.value.trim();
            participants[index].email = emailInput.value.trim();
            participants[index].age = Number(ageInput.value);
            participants[index].track = trackInput.value;

            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: `${participants[index].fullName} has been successfully updated.`,
                confirmButtonColor: '#27ae60'
            });
        }
    } else {
        // --- NEW REGISTRATION MODE (CREATE) ---
        const newParticipant = {
            id: Date.now().toString(), // Generate unique ID
            fullName: fullNameInput.value.trim(),
            email: emailInput.value.trim(),
            age: Number(ageInput.value),
            track: trackInput.value
        };

        participants.push(newParticipant);

        Swal.fire({
            icon: 'success',
            title: 'Registered!',
            html: `<strong>${newParticipant.fullName}</strong> has been signed up.<br>Track: ${newParticipant.track}`,
            confirmButtonColor: '#3498db'
        });
    }

    // Persist data (Option D)
    localStorage.setItem('workshopParticipants', JSON.stringify(participants));
}

function renderParticipants(listToRender) {
    participantList.innerHTML = '';
    participantCount.textContent = participants.length;

    listToRender.forEach(participant => {
        const li = document.createElement('li');
        
        // Information Area
        const infoDiv = document.createElement('div');
        infoDiv.className = 'participant-info';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'participant-name';
        nameSpan.textContent = participant.fullName;

        const detailsSpan = document.createElement('span');
        detailsSpan.className = 'participant-details';
        detailsSpan.textContent = `Email: ${participant.email} | Age: ${participant.age} | Track: ${participant.track}`;

        infoDiv.appendChild(nameSpan);
        infoDiv.appendChild(detailsSpan);

        // Button Area
        const btnDiv = document.createElement('div');
        btnDiv.className = 'action-btns';

        // Edit / Cancel Button Control
        const editBtn = document.createElement('button');
        
        if (participant.id === editId) {
            // If this row is currently being edited, change the button to "X"
            editBtn.className = 'action-btn cancel-btn';
            editBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            editBtn.title = 'Cancel Edition';
            editBtn.addEventListener('click', clearForm); // Cancel mode and clear form on click
        } else {
            // Normal state: use the pen icon
            editBtn.className = 'action-btn edit-btn';
            editBtn.innerHTML = '<i class="fa-solid fa-pen-to-square"></i>';
            editBtn.title = 'Edit Participant';
            editBtn.addEventListener('click', () => startEdit(participant.id));
        }

        // Delete Button (Option A)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'action-btn delete-btn';
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
        deleteBtn.title = 'Delete Participant';
        deleteBtn.addEventListener('click', () => deleteParticipant(participant.id));

        btnDiv.appendChild(editBtn);
        btnDiv.appendChild(deleteBtn);

        li.appendChild(infoDiv);
        li.appendChild(btnDiv);
        
        participantList.appendChild(li);
    });
}

function startEdit(id) {
    const participant = participants.find(p => p.id === id);
    if (!participant) return;

    // Fill the form with participant data
    fullNameInput.value = participant.fullName;
    emailInput.value = participant.email;
    ageInput.value = participant.age;
    trackInput.value = participant.track;
    termsCheckbox.checked = true;

    // Switch form button to update mode
    editId = id;
    submitBtn.textContent = 'Update Participant';
    submitBtn.classList.add('update-mode');
    
    // Re-render the list so the clicked button turns into an 'X'
    renderParticipants(participants);
    
    // Smoothly scroll the page up to the form
    form.scrollIntoView({ behavior: 'smooth' });
}

function deleteParticipant(id) {
    const participant = participants.find(p => p.id === id);
    if (!participant) return;

    // SweetAlert2 Safe Confirmation Dialog (Option A)
    Swal.fire({
        title: 'Are you sure?',
        text: `You are about to remove ${participant.fullName} from the list.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#c0392b',
        cancelButtonColor: '#7f8c8d',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            participants = participants.filter(p => p.id !== id);
            localStorage.setItem('workshopParticipants', JSON.stringify(participants));
            
            // If the deleted item is currently being edited, clear the form too
            if (editId === id) {
                clearForm();
            } else {
                renderParticipants(participants);
            }
            searchInput.value = '';

            Swal.fire({
                title: 'Deleted!',
                text: 'Participant has been removed.',
                icon: 'success',
                confirmButtonColor: '#3498db'
            });
        }
    });
}

function clearForm() {
    form.reset();
    editId = null;
    submitBtn.textContent = 'Sign Up';
    submitBtn.classList.remove('update-mode');
    
    // Re-render the list to change the "X" button back to a pen
    renderParticipants(participants);
}

// Initialize the application
init();