// Scroll Reveal Logic (The scrolling story effect)
const reveals = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 120; // Trigger threshold

    reveals.forEach(reveal => {
        const elementTop = reveal.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('active');
        }
    });
};

// Listen for scroll events
window.addEventListener('scroll', revealOnScroll);
// Trigger immediately on load to catch elements already in view
window.addEventListener('load', revealOnScroll);


// Fullscreen Image Modal Logic
const modal = document.getElementById('image-modal');
const modalImg = document.getElementById('full-image');
const gridImages = document.querySelectorAll('.grid-img');
const closeBtn = document.querySelector('.close');

if (modal && modalImg && closeBtn) {
    gridImages.forEach(img => {
        img.addEventListener('click', () => {
            modal.classList.remove('hidden');
            modalImg.src = img.src;
        });
    });

    const closeModal = () => {
        modal.classList.add('hidden');
        setTimeout(() => { modalImg.src = ""; }, 300);
    };

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
}

// Easter Egg Logic: 3 clicks on the brand name triggers Overdrive mode
const brandName = document.getElementById('brand-name');
let clickCount = 0;
let clickTimer;

if (brandName) {
    brandName.addEventListener('click', () => {
        clickCount++;
        
        // Clear the previous timer so rapid clicks don't reset immediately
        clearTimeout(clickTimer);

        if (clickCount === 3) {
            // Toggle the overdrive class on the body
            document.body.classList.toggle('overdrive');
            clickCount = 0; // Reset after triggering
        } else {
            // If they don't click again within 1.2 seconds, reset the counter
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 1200);
        }
    });
}
