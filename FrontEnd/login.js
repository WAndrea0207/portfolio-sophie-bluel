// URL de l'API de connexion
const LOGIN_URL = 'http://localhost:5678/api/users/login';

// Gestionnaire de soumission du formulaire
document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Empêche le rechargement de la page
    
    // Récupération des valeurs du formulaire
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        // Appel à l'API de connexion
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        // Vérification de la réponse
        if (response.ok) {
            // Connexion réussie
            const data = await response.json();
            
            // Stockage du token dans le localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.userId);
            
            // Redirection vers la page d'accueil
            window.location.href = 'index.html';
            
        } else {
            // Erreur d'authentification
            showError('Erreur dans l’identifiant ou le mot de passe');
    
        } 
        }
        
     catch (error) {
        console.error('Erreur:', error);
        showError('Erreur réseau. Vérifiez votre connexion.');
    }
});

// Fonction pour afficher les messages d'erreur
function showError(message) {
    // Supprimer les anciens messages d'erreur
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Créer et afficher le nouveau message
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.marginTop = '10px';
    errorElement.style.textAlign = 'center';
    
    // Insérer après le formulaire
    const form = document.getElementById('login-form');
    form.appendChild(errorElement);
};