import { dbPool } from "@/lib/db";
import fs from 'fs/promises';
import path from 'path';

export interface PhotoEntity {
  id: string; // Reste en string pour la compatibilité
  idRapport: string;
  nom_fichier: string;
  ordre: number;
  created_at: string;
}

export const photoService = {
  async createPhotos(idRapport: string, photos: { nom_fichier: string; ordre: number }[]): Promise<PhotoEntity[]> {
  try {
    const createdPhotos: PhotoEntity[] = [];
    
    for (const [index, photo] of photos.entries()) {
      console.log(`Creating photo ${index + 1}/${photos.length} for rapport ${idRapport}`);
      
      // Insérer sans spécifier l'ID (la base le génère automatiquement)
      const [result] = await dbPool.query(
        `INSERT INTO rapport_photos (idRapport, nom_fichier, ordre) VALUES (?, ?, ?)`,
        [idRapport, photo.nom_fichier, photo.ordre]
      );
      
      // Récupérer l'ID généré automatiquement
      const insertResult = result as any;
      const photoId = insertResult.insertId.toString();
      
      console.log(`Photo created with auto-generated ID: ${photoId}`);
      
      createdPhotos.push({
        id: photoId,
        idRapport,
        nom_fichier: photo.nom_fichier,
        ordre: photo.ordre,
        created_at: new Date().toISOString()
      });
    }
    
    console.log(`Successfully created ${createdPhotos.length} photos for rapport ${idRapport}`);
    return createdPhotos;
  } catch (error) {
    console.error('Error creating photos:', error);
    throw error;
  }
},


  async getByRapport(idRapport: string): Promise<PhotoEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT * FROM rapport_photos WHERE idRapport = ? ORDER BY ordre ASC`,
        [idRapport]
      );
      
      return (rows as any[]).map(row => ({
        id: String(row.id),
        idRapport: String(row.idRapport),
        nom_fichier: String(row.nom_fichier),
        ordre: Number(row.ordre),
        created_at: new Date(row.created_at).toISOString()
      }));
    } catch (error) {
      console.error('Error fetching photos by rapport:', error);
      throw error;
    }
  },

  async deleteByRapport(idRapport: string): Promise<boolean> {
    try {
      // Récupérer les noms de fichiers pour suppression physique
      const photos = await this.getByRapport(idRapport);
      
      // Supprimer les fichiers physiques
      for (const photo of photos) {
        await this.deletePhysicalFile(idRapport, photo.nom_fichier);
      }
      
      // Supprimer de la base de données
      const [result] = await dbPool.query(
        `DELETE FROM rapport_photos WHERE idRapport = ?`,
        [idRapport]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting photos by rapport:', error);
      throw error;
    }
  },

  async deletePhysicalFile(idRapport: string, nomFichier: string): Promise<void> {
    try {
      const filePath = path.join(process.cwd(), 'storage', 'uploads', 'rapports', idRapport, nomFichier);
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting physical file:', error);
      // Ne pas throw pour éviter de bloquer si un fichier n'existe pas
    }
  },

  // Sauvegarde physique des fichiers
  async savePhysicalFiles(idRapport: string, files: { buffer: Buffer; originalName: string }[]): Promise<{ nom_fichier: string; ordre: number }[]> {
    try {
      const uploadDir = path.join(process.cwd(), 'storage', 'uploads', 'rapports', idRapport);
      
      // Créer le dossier s'il n'existe pas
      await fs.mkdir(uploadDir, { recursive: true });
      
      const savedFiles: { nom_fichier: string; ordre: number }[] = [];
      
      for (const [index, file] of files.entries()) {
        const extension = path.extname(file.originalName);
        const nomFichier = `${idRapport}_${index + 1}${extension}`;
        const filePath = path.join(uploadDir, nomFichier);
        
        // Sauvegarder le fichier
        await fs.writeFile(filePath, file.buffer);
        
        savedFiles.push({
          nom_fichier: nomFichier,
          ordre: index
        });
      }
      
      return savedFiles;
    } catch (error) {
      console.error('Error saving physical files:', error);
      throw error;
    }
  }
};
