// Chill'n Shakers - JavaScript Functionality

// User Session Management
let currentUser = null;
let userReservations = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkUserSession();
    initializeChatbot();
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

// Chatbot Functions
let chatbotOpen = false;

function toggleChatbot() {
    const chatbot = document.getElementById('chatbotWindow');
    chatbot.classList.toggle('active');
    chatbotOpen = chatbot.classList.contains('active');
}

function initializeChatbot() {
    // Add welcome message
    addBotMessage('Hello! I\'m Chill\'n AI, your virtual assistant. I can help you with information about our services, pricing, availability, and more. How can I assist you today?');
}

function handleChatbotKeypress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (message) {
        addUserMessage(message);
        input.value = '';
        
        // Simulate AI response
        setTimeout(() => {
            generateAIResponse(message);
        }, 500);
    }
}

function quickQuestion(question) {
    document.getElementById('chatbotInput').value = question;
    sendChatbotMessage();
}

function addUserMessage(message) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function addBotMessage(message) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
        </div>
    `;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// AI Response Generator (Simulated)
function generateAIResponse(userMessage) {
    const message = userMessage.toLowerCase();
    let response = '';
    
    // Simple keyword-based responses
    if (message.includes('service') || message.includes('offer')) {
        response = `We offer a variety of services at Chill'n Shakers:\n\n` +
            `🍽️ <strong>Food Cart Services</strong> - Mobile food carts for events starting at $150\n\n` +
            `🎉 <strong>Catering Services</strong> - Full-service catering from $500\n\n` +
            `🎂 <strong>Special Events</strong> - Custom quotes for celebrations\n\n` +
            `📦 <strong>Meal Packages</strong> - Starting at $12/person\n\n` +
            `👨‍🍳 <strong>Private Dining</strong> - From $300/event\n\n` +
            `🏢 <strong>Corporate Services</strong> - From $200/event\n\n` +
            `Would you like more information about any specific service?`;
    } 
    else if (message.includes('price') || message.includes('cost') || message.includes('pricing')) {
        response = `Here's a quick overview of our pricing:\n\n` +
            `• Food Carts: Starting at $150/event\n` +
            `• Catering: Starting at $500/event\n` +
            `• Meal Packages: From $12/person\n` +
            `• Private Dining: From $300/event\n` +
            `• Corporate: From $200/event\n\n` +
            `All prices vary based on menu selection, guest count, and event details. Would you like to request a custom quote?`;
    }
    else if (message.includes('deliver') || message.includes('delivery')) {
        response = `Yes, we do offer delivery services! 🚚\n\n` +
            `Our delivery area covers all major locations. Delivery fees may apply depending on distance. ` +
            `We also offer pickup options if you'd prefer to collect your order.\n\n` +
            `Would you like to place an order or get more details?`;
    }
    else if (message.includes('book') || message.includes('reservation') || message.includes('reserve')) {
        response = `To make a reservation, you can:\n\n` +
            `1. Click the "Reservation" button in the navigation\n` +
            `2. Fill out the reservation form with your event details\n` +
            `3. Create an account to save your reservation history\n\n` +
            `Would you like me to help you with the reservation process?`;
    }
    else if (message.includes('menu') || message.includes('food')) {
        response = `Our menu features a wide variety of delicious options! 🍔\n\n` +
            `We offer:\n` +
            `• Gourmet Burgers & Sandwiches\n` +
            `• Fresh Salads\n` +
            `• BBQ & Grilled Specialties\n` +
            `• Vegetarian & Vegan Options\n` +
            `• Desserts & Beverages\n\n` +
            `We can also customize menus based on your preferences and dietary requirements. ` +
            `Would you like to discuss menu options for your event?`;
    }
    else if (message.includes('contact') || message.includes('phone') || message.includes('email') || message.includes('location')) {
        response = `You can reach us at:\n\n` +
            `📞 Phone: (555) 123-4567\n` +
            `📧 Email: info@chillnshakers.com\n` +
            `🕐 Hours: Mon-Sun 8AM - 8PM\n\n` +
            `Or use our contact form in the "Contact Us" section. We're happy to answer any questions!`;
    }
    else if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        response = `Hello there! 👋 Welcome to Chill'n Shakers!\n\n` +
            `I'm here to help you learn about our services and answer any questions you might have. ` +
            `What would you like to know?`;
    }
    else if (message.includes('thank')) {
        response = `You're welcome! 😊 We're here to help.\n\n` +
            `Feel free to ask if you have any more questions about our services, ` +
            `pricing, or anything else we can assist you with!`;
    }
    else {
        response = `Thank you for your question! Here's how I can help:\n\n` +
            `I can provide information about:\n` +
            `• Our services and what we offer\n` +
            `• Pricing and packages\n` +
            `• How to book a reservation\n` +
            `• Delivery options\n` +
            `• Menu options\n` +
            `• Contact information\n\n` +
            `Please let me know what you'd like to know more about, or feel free to use our contact form for specific inquiries!`;
    }
    
    addBotMessage(response);
}

// Close modals when clicking outside
window.onclick = function(event) {
    const loginModal = document.getElementById('loginModal');
    const reservationModal = document.getElementById('reservationModal');
    
    if (event.target === loginModal) {
        closeLoginModal();
    }
    if (event.target === reservationModal) {
        closeReservationModal();
    }
};

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
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
