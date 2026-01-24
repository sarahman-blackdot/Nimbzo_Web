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
        });
    });

    // --- 2. PARTICLE FLOATING ANIMATION SETUP ---
    createParticles();

    // --- 3. DYNAMIC YEAR ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
        yearSpan.innerText = new Date().getFullYear();
    }
});

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

// Simple Form Alert (for demo purposes)
function handleNotify(e) {
    e.preventDefault();
    alert("Thanks! You'll be notified when Nimbzo launches.");
}

function handleContact(e) {
    e.preventDefault();
    alert("Message sent! Our team will reach out shortly.");
}
