const API_URL = 'http://localhost:5678/api/works';
const CATEGORIES_URL = 'http://localhost:5678/api/categories';

let allProjects = []; // Stocker tous les projets pour le filtrage

// Rendre allProjects accessible globalement
window.allProjects = allProjects;

async function loadProjects() {
    try {
        const [projects, categories] = await Promise.all([
            fetch(API_URL).then(r => r.json()),
            getCategories()
        ]);
        
        allProjects = projects; // Sauvegarder pour le filtrage
        window.allProjects = projects; // Mettre à jour la variable globale
        console.log('✅ Projets et catégories récupérés');
        
        clearGallery();
        displayProjects(allProjects);
        createFilterButtons(categories);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
    }
}

async function getCategories() {
    try {
        const response = await fetch(CATEGORIES_URL);
        if (!response.ok) throw new Error('Erreur catégories');
        return await response.json();
    } catch (error) {
        console.error('Erreur catégories:', error);
        return [];
    }
}

function createFilterButtons(categories) {
    // Vérifier si les filtres existent déjà
    let filtersContainer = document.querySelector('.filters');
    if (filtersContainer) {
        filtersContainer.remove(); 
    }
    
    filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters';
    
    // Bouton "Tous"
    const allButton = document.createElement('button');
    allButton.textContent = 'Tous';
    allButton.className = 'filter-btn active';
    allButton.addEventListener('click', () => filterProjects('all'));
    filtersContainer.appendChild(allButton);
    
    // Boutons pour chaque catégorie
    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.className = 'filter-btn';
        button.dataset.categoryId = category.id;
        button.addEventListener('click', () => filterProjects(category.id));
        filtersContainer.appendChild(button);
    });
    
    // Insérer les filtres
    const portfolioSection = document.querySelector('#portfolio');
    const gallery = document.querySelector('.gallery');
    portfolioSection.insertBefore(filtersContainer, gallery);
}

function filterProjects(categoryId) {
    // Mettre à jour les boutons actifs
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    let filteredProjects;
    if (categoryId === 'all') {
        document.querySelector('.filter-btn').classList.add('active');
        filteredProjects = allProjects;
    } else {
        document.querySelector(`[data-category-id="${categoryId}"]`).classList.add('active');
        filteredProjects = allProjects.filter(project => project.categoryId == categoryId);
    }
    
    clearGallery();
    displayProjects(filteredProjects);
}

function clearGallery() {
    const gallery = document.querySelector('.gallery');
    if (gallery) gallery.innerHTML = '';
}

function displayProjects(projects) {
    const gallery = document.querySelector('.gallery');
    projects.forEach(project => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = project.imageUrl;
        img.alt = project.title;
        img.crossOrigin = "anonymous";
        
        const figcaption = document.createElement('figcaption');
        figcaption.textContent = project.title;
        
        figure.appendChild(img);
        figure.appendChild(figcaption);
        gallery.appendChild(figure);
    });
}

// Démarrer
document.addEventListener('DOMContentLoaded', loadProjects);