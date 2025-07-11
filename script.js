/**
 * Bharat Yatra Travel Website - Complete JavaScript Implementation
 */

// Global variables
let blogs = [];
let destinations = [];
let comments = [];
let users = []; // Added users array to store registered users
let currentUser = null;
let currentPage = 1;
const blogsPerPage = 6;

// Main initialization when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    setupEventListeners();
    loadPageSpecificContent();
    updateAuthUI(); // Initialize auth UI state
});

// DATA MANAGEMENT FUNCTIONS

/**
 * Initialize data from localStorage or create default data
 */
function initializeData() {
    // Load or create blogs data
    blogs = JSON.parse(localStorage.getItem('blogs')) || [
        {
            id: 1,
            title: "Trekking in the Himalayas",
            author: "Rahul Sharma",
            date: "May 15, 2023",
            location: "Himalayas",
            category: "adventure",
            content: "My unforgettable journey through the mighty Himalayan ranges...",
            image: "images/imgH.jpg"
        },
        {
            id: 2,
            title: "Spiritual Awakening in Varanasi",
            author: "Priya Patel",
            date: "April 28, 2023",
            location: "Varanasi",
            category: "spiritual",
            content: "Experiencing the divine energy of India's oldest living city...",
            image: "Varanasi.jpg"
        }
    ];

    // Load or create destinations data
    destinations = JSON.parse(localStorage.getItem('destinations')) || [
        {
            id: 1,
            name: "Ladakh",
            region: "north",
            description: "The land of high passes",
            image: "ladhak.jpg",
            highlights: ["Pangong Lake", "Nubra Valley", "Khardung La Pass"],
            content: "Ladakh is a high-altitude desert region..."
        },
        {
            id: 2,
            name: "Kerala",
            region: "south",
            description: "God's own country",
            image: "kerla.jpg",
            highlights: ["Backwaters", "Munnar Tea Gardens"],
            content: "Kerala is a tropical paradise..."
        }
    ];

    // Load or create comments data
    comments = JSON.parse(localStorage.getItem('comments')) || [
        {
            id: 1,
            blogId: 1,
            author: "TravelLover42",
            date: "June 2, 2023",
            text: "Amazing account of your trek!"
        }
    ];

    // Load or create users data
    users = JSON.parse(localStorage.getItem('users')) || [
        {
            id: 1,
            name: "Admin User",
            email: "admin@example.com",
            password: "admin123" // Note: In a real app, passwords should be hashed
        }
    ];

    // Initialize localStorage if empty
    if (!localStorage.getItem('blogs')) localStorage.setItem('blogs', JSON.stringify(blogs));
    if (!localStorage.getItem('destinations')) localStorage.setItem('destinations', JSON.stringify(destinations));
    if (!localStorage.getItem('comments')) localStorage.setItem('comments', JSON.stringify(comments));
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify(users));
}

// UI FUNCTIONALITY

/**
 * Setup all event listeners for the website
 */
function setupEventListeners() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }

    // Modal functionality
    setupModals();

    // Form submissions
    setupForms();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', smoothScroll);
    });
}

/**
 * Load content specific to each page
 */
function loadPageSpecificContent() {
    const path = window.location.pathname.split('/').pop();
    
    if (path === 'index.html' || path === '') {
        displayFeaturedBlogs();
    } 
    else if (path === 'blogs.html') {
        displayAllBlogs();
        setupBlogFilters();
    } 
    else if (path === 'blog-detail.html') {
        displayBlogDetail();
    } 
    else if (path === 'destinations.html') {
        displayDestinations();
        setupDestinationFilters();
    }
    else if (path === 'create-blog.html') {
        setupImagePreview();
        // Only show create blog form if user is logged in
        if (!currentUser) {
            document.getElementById('blogFormContainer').innerHTML = `
                <div class="auth-required">
                    <h3>Authentication Required</h3>
                    <p>You need to be logged in to create a blog post.</p>
                    <button id="loginFromBlogBtn" class="btn">Login</button>
                    <button id="signupFromBlogBtn" class="btn">Sign Up</button>
                </div>
            `;
            document.getElementById('loginFromBlogBtn').addEventListener('click', () => showModal('loginModal'));
            document.getElementById('signupFromBlogBtn').addEventListener('click', () => showModal('signupModal'));
        }
    }
}

// MOBILE MENU FUNCTIONALITY

function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    navLinks.classList.toggle('active');
    if (authButtons) authButtons.classList.toggle('active');
}

// MODAL FUNCTIONALITY

function setupModals() {
    // Modal open handlers
    document.getElementById('loginBtn')?.addEventListener('click', () => showModal('loginModal'));
    document.getElementById('signupBtn')?.addEventListener('click', () => showModal('signupModal'));

    // Modal close handlers
    document.querySelectorAll('.close').forEach(btn => 
        btn.addEventListener('click', closeModals)
    );

    // Modal switch handlers
    document.getElementById('loginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal('signupModal', 'loginModal');
    });
    
    document.getElementById('signupLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        switchModal('loginModal', 'signupModal');
    });

    // Close when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModals();
        }
    });
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Clear form errors when modal opens
        if (modalId === 'loginModal') {
            clearLoginErrors();
        } else if (modalId === 'signupModal') {
            clearSignupErrors();
        }
    }
}

function closeModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
    document.body.style.overflow = 'auto';
}

function switchModal(hideId, showId) {
    document.getElementById(hideId).style.display = 'none';
    document.getElementById(showId).style.display = 'block';
    
    // Clear form errors when switching modals
    if (showId === 'loginModal') {
        clearLoginErrors();
    } else if (showId === 'signupModal') {
        clearSignupErrors();
    }
}

function clearLoginErrors() {
    document.getElementById('loginEmailError').textContent = '';
    document.getElementById('loginPasswordError').textContent = '';
    document.getElementById('loginGeneralError').textContent = '';
}

function clearSignupErrors() {
    document.getElementById('signupNameError').textContent = '';
    document.getElementById('signupEmailError').textContent = '';
    document.getElementById('signupPasswordError').textContent = '';
    document.getElementById('signupConfirmError').textContent = '';
    document.getElementById('signupGeneralError').textContent = '';
}

// FORM HANDLING

function setupForms() {
    setupBlogForm();
    setupCommentForm();
    setupLoginForm();
    setupSignupForm();
    setupNewsletterForm();
}

function setupBlogForm() {
    const form = document.getElementById('blogForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('You need to be logged in to create a blog post.');
            showModal('loginModal');
            return;
        }
        
        const formData = new FormData(form);
        const newBlog = {
            id: blogs.length > 0 ? Math.max(...blogs.map(b => b.id)) + 1 : 1,
            title: formData.get('title'),
            author: currentUser.name || currentUser.email,
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            location: formData.get('location'),
            category: formData.get('category'),
            content: formData.get('content'),
            image: formData.get('image').size > 0 
                ? URL.createObjectURL(formData.get('image')) 
                : 'images/default-blog.jpg'
        };
        
        blogs.unshift(newBlog);
        localStorage.setItem('blogs', JSON.stringify(blogs));
        
        showCustomAlert(`Blog "${newBlog.title}" published successfully!`, 'success');
        window.location.href = 'blogs.html';
    });
}

function setupImagePreview() {
    const imageInput = document.getElementById('image');
    if (!imageInput) return;
    
    imageInput.addEventListener('change', function() {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        
        Array.from(this.files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '200px';
                img.style.maxHeight = '200px';
                img.style.margin = '10px';
                preview.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    });
}

function setupCommentForm() {
    const form = document.getElementById('commentForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!currentUser) {
            alert('You need to be logged in to post a comment.');
            showModal('loginModal');
            return;
        }
        
        const blogId = parseInt(new URLSearchParams(window.location.search).get('id'));
        const formData = new FormData(form);
        
        const newComment = {
            id: comments.length > 0 ? Math.max(...comments.map(c => c.id)) + 1 : 1,
            blogId,
            author: currentUser.name || 'Anonymous',
            date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            }),
            text: formData.get('text')
        };
        
        comments.push(newComment);
        localStorage.setItem('comments', JSON.stringify(comments));
        
        displayComments(blogId);
        form.reset();
        showCustomAlert('Comment posted successfully!', 'success');
    });
}

function setupLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = form.querySelector('#loginEmail').value.trim();
        const password = form.querySelector('#loginPassword').value.trim();
        
        // Clear previous errors
        clearLoginErrors();
        
        // Validate inputs
        let isValid = true;
        
        if (!email) {
            document.getElementById('loginEmailError').textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email)) {
            document.getElementById('loginEmailError').textContent = 'Please enter a valid email';
            isValid = false;
        }
        
        if (!password) {
            document.getElementById('loginPasswordError').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('loginPasswordError').textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Check if user exists
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = { 
                id: user.id,
                name: user.name,
                email: user.email 
            };
            showCustomAlert(`Welcome back, ${user.name || user.email}!`, 'success');
            closeModals();
            updateAuthUI();
            
            // Reload page if on create-blog page
            if (window.location.pathname.includes('create-blog.html')) {
                window.location.reload();
            }
        } else {
            document.getElementById('loginGeneralError').textContent = 'Invalid email or password';
        }
    });
}

function setupSignupForm() {
    const form = document.getElementById('signupForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('#signupName').value.trim();
        const email = form.querySelector('#signupEmail').value.trim();
        const password = form.querySelector('#signupPassword').value.trim();
        const confirm = form.querySelector('#signupConfirm').value.trim();
        
        // Clear previous errors
        clearSignupErrors();
        
        // Validate inputs
        let isValid = true;
        
        if (!name) {
            document.getElementById('signupNameError').textContent = 'Name is required';
            isValid = false;
        }
        
        if (!email) {
            document.getElementById('signupEmailError').textContent = 'Email is required';
            isValid = false;
        } else if (!validateEmail(email)) {
            document.getElementById('signupEmailError').textContent = 'Please enter a valid email';
            isValid = false;
        } else if (users.some(u => u.email === email)) {
            document.getElementById('signupEmailError').textContent = 'Email already registered';
            isValid = false;
        }
        
        if (!password) {
            document.getElementById('signupPasswordError').textContent = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            document.getElementById('signupPasswordError').textContent = 'Password must be at least 6 characters';
            isValid = false;
        }
        
        if (!confirm) {
            document.getElementById('signupConfirmError').textContent = 'Please confirm your password';
            isValid = false;
        } else if (password !== confirm) {
            document.getElementById('signupConfirmError').textContent = 'Passwords do not match';
            isValid = false;
        }
        
        if (!isValid) return;
        
        // Create new user
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password // Note: In a real app, passwords should be hashed
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        currentUser = { 
            id: newUser.id,
            name: newUser.name,
            email: newUser.email 
        };
        
        showCustomAlert(`Account created successfully! Welcome, ${name}!`, 'success');
        closeModals();
        updateAuthUI();
        
        // Reload page if on create-blog page
        if (window.location.pathname.includes('create-blog.html')) {
            window.location.reload();
        }
    });
}

function setupNewsletterForm() {
    const form = document.getElementById('newsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = form.querySelector('input').value.trim();
        
        if (!validateEmail(email)) {
            showCustomAlert('Please enter a valid email address', 'error');
            return;
        }
        
        showCustomAlert(`Thank you for subscribing with ${email}!`, 'success');
        form.reset();
    });
}

// AUTHENTICATION FUNCTIONS

function updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    const createBlogLink = document.querySelector('a[href="create-blog.html"]');
    
    if (authButtons) {
        if (currentUser) {
            authButtons.innerHTML = `
                <span>Welcome, ${currentUser.name || currentUser.email.split('@')[0]}</span>
                <button id="logoutBtn" class="btn">Logout</button>
            `;
            document.getElementById('logoutBtn').addEventListener('click', logoutUser);
            
            // Show create blog link if logged in
            if (createBlogLink) {
                createBlogLink.style.display = 'block';
            }
        } else {
            authButtons.innerHTML = `
                <button id="loginBtn" class="btn">Login</button>
                <button id="signupBtn" class="btn">Sign Up</button>
            `;
            // Reattach event listeners to new buttons
            document.getElementById('loginBtn').addEventListener('click', () => 
                showModal('loginModal'));
            document.getElementById('signupBtn').addEventListener('click', () => 
                showModal('signupModal'));
            
            // Hide create blog link if not logged in
            if (createBlogLink) {
                createBlogLink.style.display = 'none';
            }
        }
    }
}

function logoutUser() {
    currentUser = null;
    showCustomAlert('You have been logged out.', 'info');
    updateAuthUI();
    
    // If on create-blog page, redirect to home
    if (window.location.pathname.includes('create-blog.html')) {
        window.location.href = 'index.html';
    }
}

// CONTENT DISPLAY FUNCTIONS

function displayFeaturedBlogs() {
    const container = document.getElementById('featuredBlogs');
    if (!container) return;
    
    const featured = blogs.slice(0, 3);
    container.innerHTML = featured.map(blog => `
        <div class="blog-card">
            <img src="${blog.image}" alt="${blog.location}">
            <div class="blog-content">
                <span class="category-tag ${blog.category}">
                    ${blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </span>
                <h3>${blog.title}</h3>
                <p class="meta">By ${blog.author} | ${blog.date}</p>
                <p>${blog.content.substring(0, 100)}...</p>
                <a href="blog-detail.html?id=${blog.id}" class="read-more">Read More</a>
            </div>
        </div>
    `).join('');
}

function displayAllBlogs() {
    renderBlogs();
}

function renderBlogs(page = 1) {
    const container = document.getElementById('blogContainer');
    if (!container) return;
    
    const filteredBlogs = getFilteredBlogs();
    const paginatedBlogs = paginateData(filteredBlogs, page);
    
    container.innerHTML = paginatedBlogs.length > 0 
        ? paginatedBlogs.map(blog => createBlogCard(blog)).join('')
        : '<p class="no-results">No blogs found matching your criteria.</p>';
    
    updatePaginationControls(filteredBlogs.length, page);
}

function getFilteredBlogs() {
    const searchTerm = document.getElementById('blogSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('blogFilter')?.value || 'all';
    
    let filtered = [...blogs];
    
    if (searchTerm) {
        filtered = filtered.filter(blog => 
            blog.title.toLowerCase().includes(searchTerm) || 
            blog.content.toLowerCase().includes(searchTerm) ||
            blog.location.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterValue !== 'all') {
        filtered = filtered.filter(blog => blog.category === filterValue);
    }
    
    return filtered;
}

function createBlogCard(blog) {
    return `
        <div class="blog-card">
            <img src="${blog.image}" alt="${blog.location}">
            <div class="blog-content">
                <span class="category-tag ${blog.category}">
                    ${blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </span>
                <h3>${blog.title}</h3>
                <p class="meta">By ${blog.author} | ${blog.date}</p>
                <p>${blog.content.substring(0, 150)}...</p>
                <a href="blog-detail.html?id=${blog.id}" class="read-more">Read More</a>
            </div>
        </div>
    `;
}

function setupBlogFilters() {
    document.getElementById('blogSearch')?.addEventListener('input', () => {
        currentPage = 1;
        renderBlogs();
    });
    
    document.getElementById('blogFilter')?.addEventListener('change', () => {
        currentPage = 1;
        renderBlogs();
    });
}

function displayDestinations() {
    renderDestinations();
}

function renderDestinations() {
    const container = document.getElementById('destinationsContainer');
    if (!container) return;
    
    const filteredDestinations = getFilteredDestinations();
    
    container.innerHTML = filteredDestinations.length > 0
        ? filteredDestinations.map(dest => createDestinationCard(dest)).join('')
        : '<p class="no-results">No destinations found matching your criteria.</p>';
}

function getFilteredDestinations() {
    const searchTerm = document.getElementById('destinationSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('regionFilter')?.value || 'all';
    
    let filtered = [...destinations];
    
    if (searchTerm) {
        filtered = filtered.filter(dest => 
            dest.name.toLowerCase().includes(searchTerm) || 
            dest.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filterValue !== 'all') {
        filtered = filtered.filter(dest => dest.region === filterValue);
    }
    
    return filtered;
}

function createDestinationCard(destination) {
    return `
        <div class="destination-card">
            <img src="${destination.image}" alt="${destination.name}">
            <div class="destination-content">
                <h3>${destination.name}</h3>
                <p>${destination.description}</p>
                <div class="highlights">
                    <h4>Highlights:</h4>
                    <ul>
                        ${destination.highlights.map(h => `<li>${h}</li>`).join('')}
                    </ul>
                </div>
                <a href="blog-detail.html?destination=${destination.id}" class="btn">Read Experiences</a>
            </div>
        </div>
    `;
}

function setupDestinationFilters() {
    document.getElementById('destinationSearch')?.addEventListener('input', renderDestinations);
    document.getElementById('regionFilter')?.addEventListener('change', renderDestinations);
}

function displayBlogDetail() {
    const container = document.getElementById('blogDetailContainer');
    if (!container) return;
    
    const blogId = parseInt(new URLSearchParams(window.location.search).get('id'));
    const blog = blogs.find(b => b.id === blogId);
    
    if (blog) {
        container.innerHTML = `
            <h2>${blog.title}</h2>
            <div class="blog-meta">
                <span>By ${blog.author}</span>
                <span>${blog.date}</span>
                <span class="category-tag ${blog.category}">
                    ${blog.category.charAt(0).toUpperCase() + blog.category.slice(1)}
                </span>
            </div>
            <div class="blog-content">
                <img src="${blog.image}" alt="${blog.location}">
                <h3>${blog.location}</h3>
                <p>${blog.content}</p>
            </div>
        `;
        
        displayComments(blogId);
    } else {
        container.innerHTML = '<p>Blog not found. <a href="blogs.html">Browse all blogs</a></p>';
    }
}

function displayComments(blogId) {
    const container = document.getElementById('commentsList');
    if (!container) return;
    
    const blogComments = comments.filter(c => c.blogId === blogId);
    
    container.innerHTML = blogComments.length > 0
        ? blogComments.map(comment => `
            <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-date">${comment.date}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('')
        : '<p>No comments yet. Be the first to share your thoughts!</p>';
}

// UTILITY FUNCTIONS

function paginateData(data, page) {
    const start = (page - 1) * blogsPerPage;
    return data.slice(start, start + blogsPerPage);
}

function updatePaginationControls(totalItems, currentPage) {
    const totalPages = Math.ceil(totalItems / blogsPerPage);
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    if (!prevBtn || !nextBtn || !pageInfo) return;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            renderBlogs(currentPage - 1);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            renderBlogs(currentPage + 1);
        }
    };
}

function smoothScroll(e) {
    e.preventDefault();
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
        window.scrollTo({
            top: targetElement.offsetTop - 70,
            behavior: 'smooth'
        });
        
        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        const authButtons = document.querySelector('.auth-buttons');
        if (window.innerWidth <= 992) {
            if (navLinks) navLinks.classList.remove('active');
            if (authButtons) authButtons.classList.remove('active');
        }
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showCustomAlert(message, type = 'info') {
    // Remove any existing alerts
    const existingAlert = document.querySelector('.custom-alert');
    if (existingAlert) existingAlert.remove();
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `custom-alert ${type}`;
    alert.textContent = message;
    
    // Add to body
    document.body.appendChild(alert);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        alert.classList.add('fade-out');
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// Add CSS for custom alerts
const alertStyles = document.createElement('style');
alertStyles.textContent = `
    .custom-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        transform: translateX(200%);
        animation: slideIn 0.5s forwards;
    }
    
    .custom-alert.success {
        background-color: #4CAF50;
    }
    
    .custom-alert.error {
        background-color: #F44336;
    }
    
    .custom-alert.info {
        background-color: #2196F3;
    }
    
    .custom-alert.fade-out {
        animation: fadeOut 0.5s forwards;
    }
    
    @keyframes slideIn {
        to { transform: translateX(0); }
    }
    
    @keyframes fadeOut {
        to { opacity: 0; }
    }
`;
document.head.appendChild(alertStyles);