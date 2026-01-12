import { dbPool } from "@/lib/db";
import { PhotoEntity, photoService } from "@/services/photo.service";

export interface RapportEntity {
  id: string;
  description: string;
  dateRapport: string;
  photoUrl?: string;
  avancement: number;
  idPhase: string;
  validation: "en_attente" | "a_reviser" | "approuve";
}

// Fonctions de mapping séparées
const mapValidation = (validationDB: string): "en_attente" | "a_reviser" | "approuve" => {
  switch (validationDB) {
    case "En attente": return "en_attente";
    case "À réviser": return "a_reviser";
    case "Approuvé": return "approuve";
    default: return "en_attente";
  }
};

const mapValidationToDB = (validation: "en_attente" | "a_reviser" | "approuve"): string => {
  switch (validation) {
    case "en_attente": return "En attente";
    case "a_reviser": return "À réviser";
    case "approuve": return "Approuvé";
  }
};

const mapValidationChefToDB = (validation: "En attente" | "À réviser" | "Approuvé"): string => {
  return validation; // Les noms correspondent déjà
};

export const rapportModel = {
  async findAll(): Promise<RapportEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          description, 
          dateRapport, 
          photoUrl,
          avancement,
          idPhase,
          validation
         FROM rapport 
         ORDER BY dateRapport DESC`
      );
      
      const rapports = (rows as any[]).map(row => ({
        id: String(row.id),
        description: String(row.description),
        dateRapport: new Date(row.dateRapport).toISOString().split('T')[0],
        photoUrl: row.photoUrl ? String(row.photoUrl) : undefined,
        avancement: Number(row.avancement),
        idPhase: String(row.idPhase),
        validation: mapValidation(row.validation)
      }));
      
      return rapports;
    } catch (error) {
      console.error('Error fetching rapports:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<RapportEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          description, 
          dateRapport, 
          photoUrl,
          avancement,
          idPhase,
          validation
         FROM rapport 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: String(row.id),
        description: String(row.description),
        dateRapport: new Date(row.dateRapport).toISOString().split('T')[0],
        photoUrl: row.photoUrl ? String(row.photoUrl) : undefined,
        avancement: Number(row.avancement),
        idPhase: String(row.idPhase),
        validation: mapValidation(row.validation)
      };
    } catch (error) {
      console.error('Error fetching rapport by id:', error);
      throw error;
    }
  },

  async create(rapport: Omit<RapportEntity, 'id'>): Promise<RapportEntity> {
    try {
      // Générer un ID automatique
      const existingRapports = await this.findAll();
      const lastId = existingRapports.reduce((max, rap) => {
        const num = parseInt(rap.id.replace('R', '')) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = `R${(lastId + 1).toString().padStart(3, '0')}`;

      const [result] = await dbPool.query(
        `INSERT INTO rapport (id, description, dateRapport, photoUrl, avancement, idPhase, validation) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          rapport.description,
          rapport.dateRapport,
          rapport.photoUrl || null,
          rapport.avancement,
          rapport.idPhase,
          mapValidationToDB(rapport.validation)
        ]
      );
      
      return {
        id: newId,
        ...rapport
      };
    } catch (error) {
      console.error('Error creating rapport:', error);
      throw error;
    }
  },

  async update(id: string, rapport: Partial<RapportEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE rapport 
         SET description = ?, dateRapport = ?, photoUrl = ?, avancement = ?, idPhase = ?, validation = ?
         WHERE id = ?`,
        [
          rapport.description,
          rapport.dateRapport,
          rapport.photoUrl || null,
          rapport.avancement,
          rapport.idPhase,
          mapValidationToDB(rapport.validation!),
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating rapport:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM rapport WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting rapport:', error);
      throw error;
    }
  },

  //Methode pour le rapport chef section
  async updateValidation(id: string, validation: "En attente" | "À réviser" | "Approuvé", commentaire?: string): Promise<boolean> {
  try {
    // Utilisez la nouvelle fonction pour la page chef
    const validationDB = mapValidationChefToDB(validation);
    
    const [result] = await dbPool.query(
      `UPDATE rapport 
       SET validation = ?, commentaire = ?
       WHERE id = ?`,
      [
        validationDB,
        commentaire || null,
        id
      ]
    );
    
    const updateResult = result as any;
    return updateResult.affectedRows > 0;
  } catch (error) {
    console.error('Error updating rapport validation:', error);
    throw error;
  }
},

async createWithPhotos(rapport: Omit<RapportEntity, 'id'>, photos: { buffer: Buffer; originalName: string }[]): Promise<{ rapport: RapportEntity; photos: PhotoEntity[] }> {
    try {
      // Créer d'abord le rapport
      const rapportCree = await this.create(rapport);
      
      // Sauvegarder les photos physiquement
      const savedFiles = await photoService.savePhysicalFiles(rapportCree.id, photos);
      
      // Créer les entrées en base de données
      const photosCreees = await photoService.createPhotos(rapportCree.id, savedFiles);
      
      return {
        rapport: rapportCree,
        photos: photosCreees
      };
    } catch (error) {
      console.error('Error creating rapport with photos:', error);
      throw error;
    }
  },

  async updateWithPhotos(id: string, rapport: Partial<RapportEntity>, newPhotos: { buffer: Buffer; originalName: string }[]): Promise<boolean> {
    try {
      // Mettre à jour le rapport
      const success = await this.update(id, rapport);
      if (!success) return false;
      
      if (newPhotos.length > 0) {
        // Supprimer les anciennes photos
        await photoService.deleteByRapport(id);
        
        // Sauvegarder les nouvelles photos
        const savedFiles = await photoService.savePhysicalFiles(id, newPhotos);
        await photoService.createPhotos(id, savedFiles);
      }
      
      return true;
    } catch (error) {
      console.error('Error updating rapport with photos:', error);
      throw error;
    }
  },

  async findByIdWithPhotos(id: string): Promise<(RapportEntity & { photos: PhotoEntity[] }) | null> {
    try {
      const rapport = await this.findById(id);
      if (!rapport) return null;
      
      const photos = await photoService.getByRapport(id);
      
      return {
        ...rapport,
        photos
      };
    } catch (error) {
      console.error('Error fetching rapport with photos:', error);
      throw error;
    }
  },

  async findAllWithPhotos(): Promise<(RapportEntity & { photos: PhotoEntity[] })[]> {
    try {
      const rapports = await this.findAll();
      const rapportsWithPhotos: (RapportEntity & { photos: PhotoEntity[] })[] = [];
      
      for (const rapport of rapports) {
        const photos = await photoService.getByRapport(rapport.id);
        rapportsWithPhotos.push({
          ...rapport,
          photos
        });
      }
      
      return rapportsWithPhotos;
    } catch (error) {
      console.error('Error fetching rapports with photos:', error);
      throw error;
    }
  },

  async findByTaskId(idTache: string): Promise<(RapportEntity & { photos: PhotoEntity[]; phaseNom?: string })[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          r.id, 
          r.description, 
          r.dateRapport, 
          r.photoUrl,
          r.avancement,
          r.idPhase,
          r.validation,
          p.nom as phaseNom
         FROM rapport r
         INNER JOIN phase p ON r.idPhase = p.id
         WHERE p.idTache = ?
         ORDER BY r.dateRapport DESC`,
        [idTache]
      );
      
      const rowsArray = rows as any[];
      if (!rowsArray.length) return [];
      
      // Charger les photos pour tous les rapports en parallèle
      const rapports = await Promise.all(
        rowsArray.map(async (row) => {
          const photos = await photoService.getByRapport(String(row.id));
          return {
            id: String(row.id),
            description: String(row.description),
            dateRapport: new Date(row.dateRapport).toISOString().split('T')[0],
            photoUrl: row.photoUrl ? String(row.photoUrl) : undefined,
            avancement: Number(row.avancement),
            idPhase: String(row.idPhase),
            validation: mapValidation(row.validation),
            photos,
            phaseNom: row.phaseNom ? String(row.phaseNom) : undefined
          };
        })
      );
      
      return rapports;
    } catch (error) {
      console.error('Error fetching rapports by task id:', error);
      throw error;
    }
  }

};
