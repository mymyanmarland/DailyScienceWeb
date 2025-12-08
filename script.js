// Global variable to store posts after fetching
let allPosts = [];

document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('blog-grid-container');
    const searchInput = document.getElementById('searchInput');

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
            renderPosts(allPosts); // Initial render
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
            gridContainer.innerHTML = `<p style="text-align:center; color: red;">Error loading posts. Please check your local server.</p>`;
        });

    // Search Feature Logic
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredPosts = allPosts.filter(post => 
            post.title.toLowerCase().includes(searchTerm) || 
            post.summary.toLowerCase().includes(searchTerm) ||
            post.category.toLowerCase().includes(searchTerm)
        );
        renderPosts(filteredPosts);
    });
});

// Function to render posts to the grid
const renderPosts = (postsToRender) => {
    const gridContainer = document.getElementById('blog-grid-container');
    
    if (postsToRender.length === 0) {
        gridContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); grid-column: 1/-1;">No articles found matching your criteria.</p>';
        return;
    }

    let postsHTML = '';
    postsToRender.forEach(post => {
        postsHTML += createCard(post);
    });
    gridContainer.innerHTML = postsHTML;
};

// Category Filter Logic (Called from HTML onclick)
function filterCategory(category) {
    if (category === 'all') {
        renderPosts(allPosts);
    } else {
        const filtered = allPosts.filter(post => post.category === category);
        renderPosts(filtered);
    }
    
    // Optional: Scroll to grid
    document.getElementById('latest').scrollIntoView({behavior: 'smooth'});
}

// Function to create HTML for a single card
const createCard = (post) => {
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
                <a class="read-more" onclick="openArticle(${post.id})">Read Full Article <span>→</span></a>
            </div>
        </article>
    `;
};

// Modal Logic
function openArticle(id) {
    const post = allPosts.find(p => p.id === id);
    if (!post) return;

    // Populate Modal
    document.getElementById('modal-img').src = post.imageURL;
    document.getElementById('modal-title').textContent = post.title;
    document.getElementById('modal-date').textContent = post.date;
    document.getElementById('modal-category').textContent = post.category;
    document.getElementById('modal-body').innerHTML = post.fullContent || `<p>${post.summary}</p>`;

    // Show Modal
    document.getElementById('article-modal').classList.add('active');
    document.body.style.overflow = 'hidden'; 
}

function closeArticle() {
    document.getElementById('article-modal').classList.remove('active');
    document.body.style.overflow = 'auto'; 
}

document.getElementById('article-modal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeArticle();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeArticle();
    }
});