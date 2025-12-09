// Global variable to store posts after fetching
let allPosts = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check which page we are on by looking for specific containers
    const gridContainer = document.getElementById('blog-grid-container');      // On index.html
    const articleContainer = document.getElementById('article-detail-container'); // On article.html
    const searchInput = document.getElementById('searchInput');                // On index.html

    // Fetch data from local JSON file
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(posts => {
            allPosts = posts;
            
            // Scenario 1: We are on the Home Page
            if (gridContainer) {
                renderPosts(allPosts);
            }

            // Scenario 2: We are on the Article Detail Page
            if (articleContainer) {
                loadArticleDetail();
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            // Show error on whichever container exists
            const container = gridContainer || articleContainer;
            if (container) {
                container.innerHTML = `<p style="text-align:center; color: red;">Error loading data. Please ensure you are running on a local server (Live Server).</p>`;
            }
        });

    // Search Feature Logic (Only if search input exists)
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredPosts = allPosts.filter(post => 
                post.title.toLowerCase().includes(searchTerm) || 
                post.summary.toLowerCase().includes(searchTerm) ||
                post.category.toLowerCase().includes(searchTerm)
            );
            renderPosts(filteredPosts);
        });
    }
});

// ==========================================
// HOME PAGE FUNCTIONS
// ==========================================

// Function to render posts to the grid
function renderPosts(postsToRender) {
    const gridContainer = document.getElementById('blog-grid-container');
    if (!gridContainer) return; // Guard clause

    if (postsToRender.length === 0) {
        gridContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;">No articles found matching your criteria.</p>';
        return;
    }

    let postsHTML = '';
    postsToRender.forEach(post => {
        postsHTML += createCard(post);
    });
    gridContainer.innerHTML = postsHTML;
}

// Function to create HTML for a single card
const createCard = (post) => {
    // Note: Replaced 'onclick' with 'href' to navigate to new page
    return `
        <article class="card">
            <div class="card-image">
                <span class="category-tag">${post.category}</span>
                <img src="${post.imageURL}" alt="${post.title}" loading="lazy" 
                        onerror="this.src='https://placehold.co/600x400/1a1a2e/00f3ff?text=Science'">
            </div>
            <div class="card-content">
                <div class="card-date">
                    <span>📅</span> ${post.date}
                </div>
                <h3 class="card-title">${post.title}</h3>
                <p class="card-summary">${post.summary}</p>
                <a href="article.html?id=${post.id}" class="read-more">Read Full Article <span>→</span></a>
            </div>
        </article>
    `;
};

// Category Filter Logic (Called from HTML onclick)
function filterCategory(category) {
    if (category === 'all') {
        renderPosts(allPosts);
    } else {
        const filtered = allPosts.filter(post => post.category === category);
        renderPosts(filtered);
    }
    
    // Scroll to grid
    const latestSection = document.getElementById('latest');
    if (latestSection) {
        latestSection.scrollIntoView({behavior: 'smooth'});
    }
}

// ==========================================
// ARTICLE DETAIL PAGE FUNCTIONS
// ==========================================

function loadArticleDetail() {
    const container = document.getElementById('article-detail-container');
    
    // 1. Get the 'id' from the URL (e.g., article.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get('id'));

    // 2. Find the post in our data
    const post = allPosts.find(p => p.id === postId);

    // 3. Handle case where post is not found
    if (!post) {
        container.innerHTML = `
            <div style="text-align:center; padding: 50px;">
                <h2 style="color:red; margin-bottom: 20px;">Article not found!</h2>
                <a href="index.html" class="read-more" style="justify-content:center;">← Go Back Home</a>
            </div>`;
        return;
    }

    // 4. Render the full article
    // Note: We added Share Buttons here
    container.innerHTML = `
        <article class="full-article">
            <div class="article-header">
                <span class="article-badge">${post.category}</span>
                <span class="article-date">📅 ${post.date}</span>
                <h1 class="article-main-title">${post.title}</h1>
            </div>

            <img src="${post.imageURL}" alt="${post.title}" class="article-hero-img"
                 onerror="this.src='https://placehold.co/800x400/1a1a2e/00f3ff?text=Science'">

            <!-- Share Buttons Section -->
            <div class="share-section">
                <span>Share this:</span>
                <button onclick="shareTo('facebook')" class="share-btn fb">Facebook</button>
                <button onclick="shareTo('twitter', '${post.title.replace(/'/g, "\\'")}')" class="share-btn tw">Twitter</button>
                <button onclick="copyLink()" class="share-btn cp">Copy Link</button>
            </div>

            <div class="article-body">
                ${post.fullContent || `<p>${post.summary}</p><p><i>(Full content coming soon...)</i></p>`}
            </div>
        </article>
    `;
    
    // Update Page Title
    document.title = `${post.title} | Daily Science`;
}

// Share Logic Functions
function shareTo(platform, title = '') {
    const url = encodeURIComponent(window.location.href);
    let shareUrl = '';

    if (platform === 'facebook') {
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    } else if (platform === 'twitter') {
        const text = encodeURIComponent(title);
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
    }

    // Open in a small popup window
    window.open(shareUrl, '_blank', 'width=600,height=400');
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
        alert("Link copied to clipboard! ✅");
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}