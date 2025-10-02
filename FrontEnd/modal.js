// ========== GESTION DE LA MODALE ==========

const modal = document.getElementById('modal');
const editBtn = document.getElementById('edit-btn');
const closeBtn = document.querySelector('.close-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const galleryView = document.getElementById('gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const btnAddPhoto = document.getElementById('btn-add-photo');
const backButton = document.querySelector('.back-button');

// Ouvrir la modale
function openModal() {
    modal.style.display = 'block';
    showGalleryView();
    loadModalGallery();
}

// Fermer la modale
function closeModal() {
    modal.style.display = 'none';
    showGalleryView();
}

// Afficher vue galerie
function showGalleryView() {
    galleryView.style.display = 'block';
    addPhotoView.style.display = 'none';
}

// Afficher vue ajout
function showAddPhotoView() {
    galleryView.style.display = 'none';
    addPhotoView.style.display = 'block';
}

// Charger les travaux dans la modale
async function loadModalGallery() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        const works = await response.json();
        
        const modalGallery = document.querySelector('.modal-gallery');
        modalGallery.innerHTML = '';
        
        works.forEach(work => {
            const figure = document.createElement('figure');
            figure.innerHTML = `
                <img src="${work.imageUrl}" alt="${work.title}">
                <button class="delete-icon" data-id="${work.id}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            modalGallery.appendChild(figure);
        });
        
        // Écouteurs pour supprimer
        document.querySelectorAll('.delete-icon').forEach(btn => {
            btn.addEventListener('click', () => deleteWork(btn.dataset.id));
        });
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Supprimer un travail
async function deleteWork(workId) {
    const token = localStorage.getItem('authToken');
    
    if (!confirm('Supprimer ce travail ?')) return;
    
    try {
        const response = await fetch(`http://localhost:5678/api/works/${workId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            loadModalGallery();
            reloadMainGallery();
        }
    } catch (error) {
        console.error('Erreur:', error);
    }
}

// Fonction pour recharger la galerie principale
async function reloadMainGallery() {
    try {
        const response = await fetch('http://localhost:5678/api/works');
        const projects = await response.json();
        
        // Mettre à jour allProjects global
        if (window.allProjects) {
            window.allProjects = projects;
        }
        
        // Recharger l'affichage
        const gallery = document.querySelector('.gallery');
        gallery.innerHTML = '';
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
    } catch (error) {
        console.error('Erreur lors du rechargement:', error);
    }
}
// Écouteurs
if (editBtn) editBtn.addEventListener('click', openModal);
if (closeBtn) closeBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);
if (btnAddPhoto) btnAddPhoto.addEventListener('click', showAddPhotoView);
if (backButton) backButton.addEventListener('click', showGalleryView);

// Afficher le bouton si connecté
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token && editBtn) {
        editBtn.style.display = 'inline';
    }
});