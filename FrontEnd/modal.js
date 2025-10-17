// ========== GESTION DE LA MODALE ==========

const modal = document.getElementById('modal');
const editBtn = document.getElementById('edit-btn');
const closeBtn = document.querySelector('.close-modal');
const modalOverlay = document.querySelector('.modal-overlay');
const galleryView = document.getElementById('gallery-view');
const addPhotoView = document.getElementById('add-photo-view');
const btnAddPhoto = document.getElementById('btn-add-photo');
const backButton = document.querySelector('.back-button');
const photoInput = document.getElementById('photo-input');
const photoPreview = document.getElementById('photo-preview');
const uploadZone = document.querySelector('.upload-zone');
const titleInput = document.getElementById('title-input');
const categorySelect = document.getElementById('category-input');
const submitButton = document.querySelector('.submit-button');
const addPhotoForm = document.getElementById('add-photo-form');

async function loadCategories() {
    try {
        const response = await fetch('http://localhost:5678/api/categories');
        const categories = await response.json();
        
        categorySelect.innerHTML = '<option value=""></option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    } catch (error) {
        console.error('Erreur catégories:', error);
    }
}

// Prévisualisation de l'image
if (photoInput) {
    photoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        
        if (file) {
            // Vérifier la taille (4Mo max)
            if (file.size > 4 * 1024 * 1024) {
                alert('Le fichier est trop volumineux (4Mo maximum)');
                photoInput.value = '';
                return;
            }
            
            // Afficher la prévisualisation
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.classList.add('visible');
                uploadZone.classList.add('has-preview');
            };
            reader.readAsDataURL(file);
            validateForm();
        }
    });
}

function validateForm() {
    const hasFile = photoInput && photoInput.files.length > 0;
    const hasTitle = titleInput && titleInput.value.trim() !== '';
    const hasCategory = categorySelect && categorySelect.value !== '';
    
    if (submitButton) {
        submitButton.disabled = !(hasFile && hasTitle && hasCategory);
    }
}

// Écouteurs pour la validation
if (titleInput) titleInput.addEventListener('input', validateForm);
if (categorySelect) categorySelect.addEventListener('change', validateForm);

// Soumettre le formulaire
if (submitButton) {
    submitButton.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Vous devez être connecté');
            return;
        }
        
        // Vérifier que le formulaire est valide
        if (submitButton.disabled) {
            return;
        }
        
        const formData = new FormData();
        formData.append('image', photoInput.files[0]);
        formData.append('title', titleInput.value);
        formData.append('category', categorySelect.value);
        
        try {
            const response = await fetch('http://localhost:5678/api/works', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                // Recharger les galeries
                loadModalGallery();
                reloadMainGallery();
                
                // Réinitialiser le formulaire
                resetForm();
                
                // Retourner à la vue galerie
                showGalleryView();
            } else {
                alert('Erreur lors de l\'ajout du travail');
            }
        } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'ajout du travail');
        }
    });
}

function resetForm() {
    if (addPhotoForm) addPhotoForm.reset();
    if (photoPreview) {
        photoPreview.classList.remove('visible');
        photoPreview.src = '';
    }
    if (uploadZone) {
        uploadZone.classList.remove('has-preview');
    }
    if (submitButton) submitButton.disabled = true;
}


// Ouvrir la modale
function openModal() {
    modal.classList.add('active');
    showGalleryView();
    loadModalGallery();
}

// Fermer la modale
function closeModal() {
    modal.classList.remove('active');
    showGalleryView();
}

// Afficher vue galerie
function showGalleryView() {
    galleryView.classList.add('active');
    addPhotoView.classList.remove('active');
}

// Afficher vue ajout
function showAddPhotoView() {
    galleryView.classList.remove('active');
    addPhotoView.classList.add('active');
    loadCategories();
    resetForm();
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
        editBtn.classList.add('visible');
    }
});