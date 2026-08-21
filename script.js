document.addEventListener('DOMContentLoaded', () => {
    // --- 1. TAB SWITCHING LOGIC ---
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');

            // Remove active class from all buttons and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active-content'));

            // Add active class to clicked button and target content
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active-content');
            
            // If Others tab, let iframe handle scrolling to preserve position: fixed
            if (targetTab === 'tab-others') {
                window.scrollTo(0, 0);
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });
    });

    // --- 2. PARTICLE FLOATING ANIMATION SETUP ---
    createParticles();

    // --- 3. DYNAMIC YEAR ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
    // --- 4. APP STORE COMING SOON ---
    const appStoreBtns = document.querySelectorAll('a[href="#"], a[href=""]'); // Targeting generic # links for now, or specific class

    // Specifically target the App Store button if it has a unique class or ID. 
    // Since it currently has class "btn-secondary" and href="#", I'll be more specific if possible or add an ID in HTML step.
    // For now, let's find the one with fa-apple

    const appleBtn = Array.from(document.querySelectorAll('.btn-secondary')).find(btn => btn.innerHTML.includes('fa-apple'));

    if (appleBtn) {
        appleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast();
        });
    }
});

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

function createParticles() {
    const particleCount = 20;
    const body = document.querySelector('body');

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Random size
        const size = Math.random() * 5 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random position
        particle.style.left = `${Math.random() * 100}vw`;

        // Random duration
        const duration = Math.random() * 15 + 10;
        particle.style.animationDuration = `${duration}s`;

        // Random delay
        particle.style.animationDelay = `${Math.random() * 5}s`;

        body.appendChild(particle);
    }
}

// --- 5. CONTACT FORM HANDLING (StaticForms) ---
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const status = document.getElementById("form-status");
        const data = new FormData(event.target);

        // Convert FormData to JSON for StaticForms
        const jsonObject = Object.fromEntries(data.entries());

        // Check if params are correct (Access Key is handled in HTML)
        if (!jsonObject.accessKey || jsonObject.accessKey === "YOUR_ACCESS_KEY_HERE") {
            // Just a fallback check, though user already updated HTML
            console.warn("Access Key might be missing or default.");
        }

        status.innerHTML = "Sending...";
        status.style.color = "#9ca3af";

        fetch("https://api.staticforms.xyz/submit", {
            method: "POST",
            body: JSON.stringify(jsonObject),
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }).then(response => response.json())
            .then(result => {
                if (result.success) {
                    status.innerHTML = "Thanks for your inquiry! We'll stay in touch.";
                    status.style.color = "#4ade80"; // Green
                    contactForm.reset();
                } else {
                    status.innerHTML = result.message || "Oops! There was a problem submitting your form";
                    status.style.color = "#f87171"; // Red
                }
            }).catch(error => {
                console.error(error);
                status.innerHTML = "Oops! There was a problem submitting your form";
                status.style.color = "#f87171"; // Red
            });
    });
}
