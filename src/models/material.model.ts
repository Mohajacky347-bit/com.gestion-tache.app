import { dbPool } from "@/lib/db";

export interface MaterialEntity {
  id: string;
  nom: string;
  type: string;
  quantite: number;
  etat: "disponible" | "utilise";
}

export const materialModel = {
  async findAll(): Promise<MaterialEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          nom, 
          type, 
          quantite,
          disponible
         FROM materiel 
         ORDER BY nom ASC`
      );
      
      // Conversion du booléen disponible en état
      const materials = (rows as any[]).map(row => ({
        id: String(row.id),
        nom: String(row.nom),
        type: String(row.type),
        quantite: Number(row.quantite),
        etat: row.disponible ? "disponible" as const : "utilise" as const
      }));
      
      return materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<MaterialEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          nom, 
          type, 
          quantite,
          disponible
         FROM materiel 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: row.id,
        nom: row.nom,
        type: row.type,
        quantite: row.quantite,
        etat: row.disponible ? "disponible" : "utilise"
      };
    } catch (error) {
      console.error('Error fetching material by id:', error);
      throw error;
    }
  },
  async create(material: Omit<MaterialEntity, 'id'>): Promise<MaterialEntity> {
  try {
    // Générer un ID automatique basé sur les IDs existants
    const existingMaterials = await this.findAll();
    const lastId = existingMaterials.reduce((max, mat) => {
      const num = parseInt(mat.id.replace('M', '')) || 0;
      return num > max ? num : max;
    }, 0);
    const newId = `M${(lastId + 1).toString().padStart(3, '0')}`;

    const [result] = await dbPool.query(
      `INSERT INTO materiel (id, nom, type, quantite, disponible) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        newId,
        material.nom,
        material.type,
        material.quantite,
        material.etat === "disponible" ? 1 : 0
      ]
    );
    
    return {
      id: newId,
      ...material
    };
  } catch (error) {
    console.error('Error creating material:', error);
    throw error;
  }
},

  // async create(material: Omit<MaterialEntity, 'id'>): Promise<MaterialEntity> {
  //   try {
  //     const [result] = await dbPool.query(
  //       `INSERT INTO materiel (nom, type, quantite, disponible) 
  //        VALUES (?, ?, ?, ?)`,
  //       [
  //         material.nom,
  //         material.type,
  //         material.quantite,
  //         material.etat === "disponible" ? 1 : 0
  //       ]
  //     );
      
  //     const insertResult = result as any;
  //     return {
  //       id: insertResult.insertId.toString(),
  //       ...material
  //     };
  //   } catch (error) {
  //     console.error('Error creating material:', error);
  //     throw error;
  //   }
  // },

  async update(id: string, material: Partial<MaterialEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE materiel 
         SET nom = ?, type = ?, quantite = ?, disponible = ?
         WHERE id = ?`,
        [
          material.nom,
          material.type,
          material.quantite,
          material.etat === "disponible" ? 1 : 0,
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating material:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM materiel WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting material:', error);
      throw error;
    }
  }
};
