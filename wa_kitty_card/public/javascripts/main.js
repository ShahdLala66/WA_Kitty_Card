// Interactive Cat Behaviors
document.addEventListener('DOMContentLoaded', function() {
    
    // Array of cat reactions and messages
    const catReactions = [
        { message: " Scratch my belly!", animation: 'cat-happy' },
        { message: " Pet me please!", animation: 'cat-excited' },
        { message: " Let me nap...", animation: 'cat-sleepy' },
        { message: " Meow meow!", animation: 'cat-happy' },
        { message: " I'm so fluffy!", animation: 'cat-excited' },
        { message: " Play with me!", animation: 'cat-happy' },
        { message: " Feed me tuna!", animation: 'cat-excited' },
        { message: " I'm the cutest!", animation: 'cat-happy' },
        { message: " Love me hooman!", animation: 'cat-excited' },
        { message: " Fish please!", animation: 'cat-happy' }
    ];

    // Function to create clouds with cats
    function createCloudsWithCats() {
        const container = document.querySelector('.helloKitty') || document.body;
        const cloudCount = 1; // Number of clouds
        const cloudClasses = ['cloud-medium'];
        
        const catGifs = [
            '/assets/images/ZayneChillingGif.gif',
            '/assets/images/ZayneGrid1.gif',
            '/assets/images/ZayneChillingGif.gif',
            '/assets/images/ZayneGrid1.gif'
        ];

        for (let i = 0; i < cloudCount; i++) {
            // Create cloud
            const cloud = document.createElement('div');
            cloud.className = `cloud ${cloudClasses[i]}`;
            
            // Create cat container
            const catContainer = document.createElement('div');
            catContainer.className = 'cat-container cat-idle';
            catContainer.dataset.catId = i;
            
            // Create cat image with your actual GIFs
            const catImg = document.createElement('img');
            catImg.src = catGifs[i];
            catImg.alt = `Zayne ${i + 1}`;
            catImg.onerror = function() {
                console.error('Failed to load GIF:', this.src);

                this.style.fontSize = '60px';
                this.alt = '🐱';
                this.outerHTML = `<span style="font-size: 60px;">🐱</span>`;
            };
            
            // Create thought bubble
            const thoughtBubble = document.createElement('div');
            thoughtBubble.className = 'thought-bubble';
            
            // Add elements to cat container
            catContainer.appendChild(catImg);
            catContainer.appendChild(thoughtBubble);
            
            // Add cat to cloud
            cloud.appendChild(catContainer);
            
            // Add cloud to container
            container.appendChild(cloud);
            
            // Add click event listener
            setupCatInteraction(catContainer, thoughtBubble);
        }
    }

    // Function to setup cat interaction
    function setupCatInteraction(catContainer, thoughtBubble) {
        let currentTimeout = null;
        
        catContainer.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Clear previous timeout
            if (currentTimeout) {
                clearTimeout(currentTimeout);
            }
            
            // Remove all animation classes
            catContainer.classList.remove('cat-idle', 'cat-happy', 'cat-sleepy', 'cat-excited');
            
            // Get random reaction
            const reaction = catReactions[Math.floor(Math.random() * catReactions.length)];
            
            // Add new animation
            catContainer.classList.add(reaction.animation);
            
            // Show thought bubble
            thoughtBubble.textContent = reaction.message;
            thoughtBubble.classList.add('active');
            
            // Hide thought bubble after 3 seconds
            currentTimeout = setTimeout(() => {
                thoughtBubble.classList.remove('active');
                catContainer.classList.remove('cat-happy', 'cat-sleepy', 'cat-excited');
                catContainer.classList.add('cat-idle');
            }, 3000);
            ;
        });
        
        // Also trigger on hover (optional)
        catContainer.addEventListener('mouseenter', function() {
            if (!thoughtBubble.classList.contains('active')) {
                const quickMessage = catReactions[Math.floor(Math.random() * catReactions.length)].message;
                thoughtBubble.textContent = quickMessage;
                thoughtBubble.classList.add('active');
                
                setTimeout(() => {
                    if (catContainer.matches(':hover')) {
                        thoughtBubble.classList.remove('active');
                    }
                }, 1500);
            }
        });
    }
    // Initialize everything
    createCloudsWithCats();

    // Make cats occasionally react on their own
    setInterval(() => {
        const cats = document.querySelectorAll('.cat-container');
        const randomCat = cats[Math.floor(Math.random() * cats.length)];
        if (randomCat && Math.random() > 0.7) {
            randomCat.click();
        }
    }, 10000); // Every 10 seconds, 30% chance a random cat reacts
});

// Export functions for use in other scripts if needed
window.KittyCatInteractive = {
    reactions: [
        { message: " Scratch my belly!", animation: 'cat-happy' },
        { message: " Pet me please!", animation: 'cat-excited' },
        { message: " Let me nap...", animation: 'cat-sleepy' }
    ]
};
