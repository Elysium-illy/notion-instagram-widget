// script.js

// --- Configuration (À MODIFIER !) ---
// REMPLACEZ 'VOTRE_URL_VERCEL_API' par l'URL que Vercel vous a donnée pour votre projet.
// Elle ressemble à : https://votre-projet.vercel.app
const VERCEL_PROJECT_URL = 'notion-instagram-widget-8chmymjkk-elysium-illys-projects.vercel.app';

// REMPLACEZ 'VOTRE_ID_DE_BASE_DE_DONNEES_NOTION' par l'ID de votre base de données Notion.
// Vous l'avez copié dans la Partie 1 (ex: a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6)
const NOTION_DATABASE_ID = '20ecf6e5f180817ca95cdf6fd7d5930a';
// --- Fin de la Configuration ---


// URL complète de notre fonction backend
const API_ENDPOINT = `${VERCEL_PROJECT_URL}/api/get-images`;

const appDiv = document.getElementById('app');

async function fetchAndDisplayImages() {
    try {
        // Affiche le message de chargement
        appDiv.innerHTML = '<div class="loading">Chargement des images...</div>';

        // Requête vers notre fonction backend pour obtenir les URLs des images
        const response = await fetch(`<span class="math-inline">\{API\_ENDPOINT\}?databaseId\=</span>{NOTION_DATABASE_ID}`);

        if (!response.ok) {
            // Si la réponse n'est pas OK (erreur HTTP), on lève une erreur
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`Erreur du serveur (${response.status}): ${errorData.error || errorData.message}`);
        }

        const data = await response.json(); // Convertit la réponse en JSON
        const imageUrls = data.imageUrls; // Récupère le tableau des URLs d'images

        if (!imageUrls || imageUrls.length === 0) {
            appDiv.innerHTML = '<div class="loading">Aucune image trouvée dans cette base de données Notion.</div>';
            return;
        }

        // Crée la grille pour les images
        const grid = document.createElement('div');
        grid.className = 'image-grid';

        // Pour chaque URL d'image reçue, crée un élément <img> et l'ajoute à la grille
        imageUrls.forEach(url => {
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Image de votre contenu Notion'; // Texte alternatif pour l'accessibilité
            // Optionnel: si vous voulez que cliquer sur l'image ouvre la page Notion correspondante
            // Cela nécessiterait de modifier votre backend pour renvoyer aussi l'ID de la page
            // et d'ajouter un lien ici :
            // const link = document.createElement('a');
            // link.href = `https://notion.so/${pageId}`;
            // link.target = '_blank';
            // link.appendChild(img);
            // grid.appendChild(link);

            grid.appendChild(img);
        });

        // Supprime le message de chargement et affiche la grille d'images
        appDiv.innerHTML = '';
        appDiv.appendChild(grid);

    } catch (error) {
        console.error('Erreur lors du chargement des images :', error);
        appDiv.innerHTML = `<div class="error-message">Une erreur est survenue : ${error.message}<br>Vérifiez la console (F12) pour plus de détails.</div>`;
    }
}

// Appelle la fonction pour charger et afficher les images au démarrage du widget
fetchAndDisplayImages();