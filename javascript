

// User Session Management
let currentUser = null;
let userReservations = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    setupScrollEffects();
    setupFormValidation();
});

// Check for existing user session
function checkUserSession() {
    const savedUser = localStorage.getItem('chillnshakers_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
        
        // Load user's reservations
        const savedReservations = localStorage.getItem('chillnshakers_reservations');
        if (savedReservations) {
            userReservations = JSON.parse(savedReservations);
        }
    }
}

// Save user session
function saveUserSession(user) {
    localStorage.setItem('chillnshakers_user', JSON.stringify(user));
}

// Save reservations
function saveReservations() {
    localStorage.setItem('chillnshakers_reservations', JSON.stringify(userReservations));
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const navLinks = document.querySelector('.nav-links');
    const userInitials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    // Create user menu element
    const userMenuHTML = `
        <div class="user-menu">
            <div class="user-avatar">${userInitials}</div>
            <span class="user-name">${currentUser.name}</span>
            <button class="btn-logout" onclick="handleLogout()">Logout</button>
        </div>
    `;
    
    // Replace login button with user menu
    const loginBtn = navLinks.querySelector('.btn-login');
    if (loginBtn) {
        loginBtn.outerHTML = userMenuHTML;
    }
    
    // Also update mobile menu
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        const mobileLoginBtn = mobileMenu.querySelector('.btn-login');
        if (mobileLoginBtn) {
            mobileLoginBtn.outerHTML = userMenuHTML;
        }
    }
    
    // Show My Reservations button when logged in
    const myReservationsBtn = document.getElementById('btnMyReservations');
    if (myReservationsBtn) {
        myReservationsBtn.style.display = 'inline-block';
    }
    
    // Update reservation form if logged in
    updateReservationFormForUser();
}

// Update reservation form with user info
function updateReservationFormForUser() {
    if (currentUser) {
        const authMessage = document.getElementById('reservationAuthMessage');
        const reservationForm = document.getElementById('reservationForm');
        
        if (authMessage && reservationForm) {
            authMessage.style.display = 'none';
            reservationForm.style.display = 'block';
            
            // Pre-fill user info
            document.getElementById('resName').value = currentUser.name || '';
            document.getElementById('resEmail').value = currentUser.email || '';
        }
    }
}

// Modal Functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openReservationModal() {
    const modal = document.getElementById('reservationModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Check if user is logged in
    if (!currentUser) {
        const authMessage = document.getElementById('reservationAuthMessage');
        const reservationForm = document.getElementById('reservationForm');
        
        if (authMessage && reservationForm) {
            authMessage.style.display = 'block';
            reservationForm.style.display = 'none';
        }
    } else {
        updateReservationFormForUser();
    }
}

function closeReservationModal() {
    const modal = document.getElementById('reservationModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// My Reservations Modal Functions
function openMyReservationsModal() {
    const modal = document.getElementById('myReservationsModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Populate reservations
    displayUserReservations();
}

function closeMyReservationsModal() {
    const modal = document.getElementById('myReservationsModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function displayUserReservations() {
    const contentDiv = document.getElementById('myReservationsContent');
    
    if (!currentUser) {
        contentDiv.innerHTML = `
            <div class="auth-required">
                <i class="fas fa-lock"></i>
                <p>Please <a href="#" onclick="closeMyReservationsModal(); openLoginModal();">login</a> to view your reservations.</p>
            </div>
        `;
        return;
    }
    
    // Get user's reservations from localStorage
    const allReservations = JSON.parse(localStorage.getItem('chillnshakers_reservations') || '[]');
    const userReservations = allReservations.filter(res => res.email === currentUser.email);
    
    if (userReservations.length === 0) {
        contentDiv.innerHTML = `
            <div class="no-reservations">
                <i class="fas fa-calendar-times"></i>
                <h3>No Reservations Yet</h3>
                <p>You haven't made any reservations yet.</p>
                <button class="btn-primary" onclick="closeMyReservationsModal(); openReservationModal();">
                    <i class="fas fa-calendar-plus"></i> Make a Reservation
                </button>
            </div>
        `;
        return;
    }
    
    // Sort reservations by date (newest first)
    userReservations.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    let reservationsHTML = '<div class="reservations-list">';
    
    userReservations.forEach(res => {
        const serviceTypeLabels = {
            'food-cart': 'Food Cart',
            'catering': 'Catering',
            'special-event': 'Special Event',
            'private-dining': 'Private Dining'
        };
        
        const statusClass = res.status === 'confirmed' ? 'status-confirmed' : 'status-pending';
        const statusLabel = res.status === 'confirmed' ? 'Confirmed' : 'Pending';
        
        // Format date
        const dateObj = new Date(res.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        // Format time
        const timeObj = new Date(`2000-01-01T${res.time}`);
        const formattedTime = timeObj.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
        });
        
        reservationsHTML += `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-service">
                        <i class="fas fa-utensils"></i>
                        <span>${serviceTypeLabels[res.serviceType] || res.serviceType}</span>
                    </div>
                    <span class="reservation-status ${statusClass}">${statusLabel}</span>
                </div>
                <div class="reservation-details">
                    <div class="detail-row">
                        <div class="detail-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <div>
                                <label>Where</label>
                                <span>${res.location}</span>
                            </div>
                        </div>
                    </div>
                    <div class="detail-row">
                        <div class="detail-item">
                            <i class="fas fa-calendar-alt"></i>
                            <div>
                                <label>When</label>
                                <span>${formattedDate} at ${formattedTime}</span>
                            </div>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-users"></i>
                            <div>
                                <label>Guests</label>
                                <span>${res.guests} guests</span>
                            </div>
                        </div>
                    </div>
                    ${res.details ? `
                    <div class="detail-row">
                        <div class="detail-item full-width">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <label>Additional Details</label>
                                <span>${res.details}</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
                <div class="reservation-footer">
                    <span class="reservation-id">Booking ID: #${res.id}</span>
                </div>
            </div>
        `;
    });
    
    reservationsHTML += '</div>';
    contentDiv.innerHTML = reservationsHTML;
}

// Tab switching
function switchTab(tab) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    if (tab === 'login') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
        tabBtns[0].classList.add('active');
        tabBtns[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
        tabBtns[0].classList.remove('active');
        tabBtns[1].classList.add('active');
    }
}

// Login Handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Simulate login (in real app, this would be an API call)
    const users = JSON.parse(localStorage.getItem('chillnshakers_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) {
        currentUser = { name: user.name, email: user.email };
        saveUserSession(currentUser);
        updateUIForLoggedInUser();
        closeLoginModal();
        showToast('Welcome back, ' + currentUser.name + '!');
        
        // Clear form
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        showToast('Invalid email or password. Please try again or register.');
    }
}

// Register Handler
function handleRegister(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirm').value;
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showToast('Passwords do not match. Please try again.');
        return;
    }
    
    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('chillnshakers_users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('An account with this email already exists. Please login.');
        return;
    }
    
    // Save new user
    users.push({ name, email, password });
    localStorage.setItem('chillnshakers_users', JSON.stringify(users));
    
    // Set as current user
    currentUser = { name, email };
    saveUserSession(currentUser);
    updateUIForLoggedInUser();
    closeLoginModal();
    showToast('Account created successfully! Welcome, ' + name + '!');
    
    // Clear form
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirm').value = '';
}

// Google Login Handler (Simulation)
function handleGoogleLogin() {
    // In a real application, this would use Google OAuth API
    // For demo purposes, we'll simulate the Google login flow
    
    showToast('Connecting to Google...');
    
    // Simulate Google OAuth popup and authentication
    setTimeout(() => {
        // Create a simulated Google user
        const googleUser = {
            name: 'Google User',
            email: 'user@gmail.com',
            isGoogleAccount: true
        };
        
        // Save to users list if not exists
        const users = JSON.parse(localStorage.getItem('chillnshakers_users') || '[]');
        if (!users.find(u => u.email === googleUser.email)) {
            users.push({
                name: googleUser.name,
                email: googleUser.email,
                password: 'google_auth_' + Date.now(),
                isGoogle: true
            });
            localStorage.setItem('chillnshakers_users', JSON.stringify(users));
        }
        
        currentUser = { name: googleUser.name, email: googleUser.email };
        saveUserSession(currentUser);
        updateUIForLoggedInUser();
        closeLoginModal();
        showToast('Successfully connected with Google!');
    }, 1500);
}

// Logout Handler
function handleLogout() {
    currentUser = null;
    userReservations = [];
    localStorage.removeItem('chillnshakers_user');
    localStorage.removeItem('chillnshakers_reservations');
    
    // Reload page to reset UI
    location.reload();
}

// Inquiry Form Handler
function setupFormValidation() {
    const inquiryForm = document.getElementById('inquiryForm');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', handleInquirySubmit);
    }
    
    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
    }
}

function handleInquirySubmit(event) {
    event.preventDefault();
    
    const formData = {
        name: document.getElementById('inquiryName').value,
        email: document.getElementById('inquiryEmail').value,
        phone: document.getElementById('inquiryPhone').value,
        type: document.getElementById('inquiryType').value,
        message: document.getElementById('inquiryMessage').value,
        timestamp: new Date().toISOString()
    };
    
    // Save inquiry to local storage (in real app, this would be sent to server)
    const inquiries = JSON.parse(localStorage.getItem('chillnshakers_inquiries') || '[]');
    inquiries.push(formData);
    localStorage.setItem('chillnshakers_inquiries', JSON.stringify(inquiries));
    
    showToast('Thank you! Your inquiry has been submitted. We will contact you soon.');
    
    // Clear form
    event.target.reset();
}

function handleReservationSubmit(event) {
    event.preventDefault();
    
    if (!currentUser) {
        showToast('Please login to make a reservation.');
        openLoginModal();
        return;
    }
    
    const reservationData = {
        id: Date.now(),
        userEmail: currentUser.email,
        name: document.getElementById('resName').value,
        email: document.getElementById('resEmail').value,
        phone: document.getElementById('resPhone').value,
        serviceType: document.getElementById('resType').value,
        date: document.getElementById('resDate').value,
        time: document.getElementById('resTime').value,
        guests: document.getElementById('resGuests').value,
        location: document.getElementById('resLocation').value,
        details: document.getElementById('resDetails').value,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Save reservation
    userReservations.push(reservationData);
    saveReservations();
    
    showToast('Reservation submitted successfully! We will confirm via email shortly.');
    
    // Close modal and reset form
    closeReservationModal();
    event.target.reset();
}

// Mobile Menu
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

function closeMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.remove('active');
}

// Scroll Effects
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('active');
    
    setTimeout(() => {
        toast.classList.remove('active');
    }, 4000);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const reservationModal = document.getElementById('reservationModal');
    const myReservationsModal = document.getElementById('myReservationsModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === reservationModal) {
        closeReservationModal();
    }
    if (event.target === myReservationsModal) {
        closeMyReservationsModal();
    }
};

// Smooth scroll for anchor links
document.querySelectorAll('a[href^=\"#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Set minimum date for reservation (today)
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('resDate');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
});
