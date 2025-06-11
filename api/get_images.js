// api/get-images.js

// Importe le client Notion pour interagir avec l'API Notion
const { Client } = require('@notionhq/client');

// Initialise le client Notion avec votre clé API secrète.
// process.env.NOTION_API_KEY est une "variable d'environnement".
// Elle sera configurée plus tard sur Vercel, PAS ICI DIRECTEMENT DANS LE CODE.
const notion = new Client({ auth: process.env.NOTION_API_KEY });

// C'est la fonction principale qui sera exécutée par Vercel.
// 'req' contient la requête entrante (ce que le frontend lui envoie).
// 'res' permet d'envoyer une réponse au frontend.
module.exports = async (req, res) => {
  // Configure les en-têtes CORS pour permettre à votre frontend d'accéder à cette fonction.
  // C'est important pour la sécurité web.
  res.setHeader('Access-Control-Allow-Origin', '*'); // * = n'importe quel domaine (pour le développement)
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gère les requêtes OPTIONS (utilisées par les navigateurs avant une vraie requête GET)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Récupère l'ID de la base de données depuis les paramètres de l'URL du frontend.
  // Par exemple, si l'URL est /api/get-images?databaseId=VOTRE_ID, il récupère VOTRE_ID.
  const databaseId = req.query.databaseId;

  // Vérifie si l'ID de la base de données est fourni.
  if (!databaseId) {
    // Si non, renvoie une erreur 400 (Bad Request).
    return res.status(400).json({ error: 'L\'ID de la base de données est requis.' });
  }

  try {
    // Effectue une requête à l'API Notion pour obtenir les pages de la base de données.
    const response = await notion.databases.query({
      database_id: databaseId,
      // Vous pouvez ajouter des filtres ou des tris ici si vous le souhaitez.
      // Pour l'instant, on récupère tout.
    });

    const imageUrls = [];
    // Parcourt chaque page (chaque entrée) de la base de données Notion.
    for (const page of response.results) {
      // IMPORTANT : REMPLACEZ 'NomDeVotreProprieteFichiersEtMedias' par le VRAI NOM
      // de votre propriété de type "Fichiers & médias" dans votre base de données Notion.
      // C'est le nom que vous avez donné à la colonne où sont vos images.
      const filesProperty = page.properties['Visuel'];

      // Vérifie si la propriété existe et contient des fichiers.
      if (filesProperty && filesProperty.files && filesProperty.files.length > 0) {
        // Parcourt chaque fichier attaché à cette propriété.
        for (const file of filesProperty.files) {
          // Si c'est un fichier uploadé directement sur Notion
          if (file.type === 'file' && file.file.url) {
            imageUrls.push(file.file.url);
          }
          // Si c'est un lien vers un fichier externe (ex: de Unsplash, Google Drive)
          else if (file.type === 'external' && file.external.url) {
            imageUrls.push(file.external.url);
          }
        }
      }
    }

    // Renvoie les URLs des images au frontend en format JSON.
    res.status(200).json({ imageUrls });
  } catch (error) {
    // En cas d'erreur lors de la communication avec Notion, renvoie une erreur 500.
    console.error('Erreur lors de la récupération des images depuis Notion :', error);
    res.status(500).json({ error: 'Erreur interne du serveur lors de la récupération des images.' });
  }
};