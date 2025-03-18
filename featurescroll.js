document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to the features link
    const featuresLink = document.getElementById('features-link');
    
    if (featuresLink) {
        featuresLink.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            
            // Get the target element
            const featuresSection = document.getElementById('chat-input');
            
            if (featuresSection) {
                // Scroll smoothly to the features section
                featuresSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Update active class
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => link.classList.remove('active'));
                this.classList.add('active');
            }
        });
    }
});