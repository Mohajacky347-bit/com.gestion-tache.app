import { dbPool } from "@/lib/db";

export interface EmployeEntity {
  id: string;
  nom: string;
  prenom: string;
  fonction: string;
  contact: string;
  specialite?: string;
  disponibilite: "disponible" | "affecte" | "absent";
  tacheActuelle?: string;
  dateAbsence?: string;
  typeAbsence?: "conge" | "maladie";
}

export const employeModel = {
  async findAll(): Promise<EmployeEntity[]> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          nom, 
          prenom, 
          fonction,
          contact,
          specialite,
          disponibilite,
          tache_actuelle as tacheActuelle,
          date_absence as dateAbsence,
          type_absence as typeAbsence
         FROM employe 
         ORDER BY nom, prenom ASC`
      );
      
      const employes = (rows as any[]).map(row => ({
        id: String(row.id),
        nom: String(row.nom),
        prenom: String(row.prenom),
        fonction: String(row.fonction),
        contact: String(row.contact),
        specialite: row.specialite ? String(row.specialite) : undefined,
        disponibilite: row.disponibilite as "disponible" | "affecte" | "absent",
        tacheActuelle: row.tacheActuelle ? String(row.tacheActuelle) : undefined,
        dateAbsence: row.dateAbsence ? new Date(row.dateAbsence).toISOString().split('T')[0] : undefined,
        typeAbsence: row.typeAbsence as "conge" | "maladie" | undefined
      }));
      
      return employes;
    } catch (error) {
      console.error('Error fetching employes:', error);
      throw error;
    }
  },

  async findById(id: string): Promise<EmployeEntity | null> {
    try {
      const [rows] = await dbPool.query(
        `SELECT 
          id, 
          nom, 
          prenom, 
          fonction,
          contact,
          specialite,
          disponibilite,
          tache_actuelle as tacheActuelle,
          date_absence as dateAbsence,
          type_absence as typeAbsence
         FROM employe 
         WHERE id = ? LIMIT 1`,
        [id]
      );
      
      const arr = rows as any[];
      if (!arr.length) return null;
      
      const row = arr[0];
      return {
        id: String(row.id),
        nom: String(row.nom),
        prenom: String(row.prenom),
        fonction: String(row.fonction),
        contact: String(row.contact),
        specialite: row.specialite ? String(row.specialite) : undefined,
        disponibilite: row.disponibilite as "disponible" | "affecte" | "absent",
        tacheActuelle: row.tacheActuelle ? String(row.tacheActuelle) : undefined,
        dateAbsence: row.dateAbsence ? new Date(row.dateAbsence).toISOString().split('T')[0] : undefined,
        typeAbsence: row.typeAbsence as "conge" | "maladie" | undefined
      };
    } catch (error) {
      console.error('Error fetching employe by id:', error);
      throw error;
    }
  },

  async create(employe: Omit<EmployeEntity, 'id'>): Promise<EmployeEntity> {
    try {
      // Générer un ID automatique basé sur les IDs existants
      const existingEmployes = await this.findAll();
      const lastId = existingEmployes.reduce((max, emp) => {
        const num = parseInt(emp.id.replace('E', '')) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = `E${(lastId + 1).toString().padStart(3, '0')}`;

      const [result] = await dbPool.query(
        `INSERT INTO employe (id, nom, prenom, fonction, contact, specialite, disponibilite) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newId,
          employe.nom,
          employe.prenom,
          employe.fonction,
          employe.contact,
          employe.specialite || null,
          employe.disponibilite
        ]
      );
      
      return {
        id: newId,
        ...employe
      };
    } catch (error) {
      console.error('Error creating employe:', error);
      throw error;
    }
  },

  async update(id: string, employe: Partial<EmployeEntity>): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `UPDATE employe 
         SET nom = ?, prenom = ?, fonction = ?, contact = ?, specialite = ?, disponibilite = ?
         WHERE id = ?`,
        [
          employe.nom,
          employe.prenom,
          employe.fonction,
          employe.contact,
          employe.specialite || null,
          employe.disponibilite,
          id
        ]
      );
      
      const updateResult = result as any;
      return updateResult.affectedRows > 0;
    } catch (error) {
      console.error('Error updating employe:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const [result] = await dbPool.query(
        `DELETE FROM employe WHERE id = ?`,
        [id]
      );
      
      const deleteResult = result as any;
      return deleteResult.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting employe:', error);
      throw error;
    }
  }
};


// import { dbPool } from "@/lib/db";

// export interface EmployeEntity {
//   id: string;
//   nom: string;
//   prenom: string;
//   fonction: string;
//   contact: string;
//   specialite?: string;
//   disponibilite: "disponible" | "affecte" | "absent";
//   tacheActuelle?: string;
//   dateAbsence?: string;
//   typeAbsence?: "conge" | "maladie";
// }

// export const employeModel = {
//   async findAll(): Promise<EmployeEntity[]> {
//     try {
//       const [rows] = await dbPool.query(
//         `SELECT 
//           id, 
//           nom, 
//           prenom, 
//           fonction,
//           contact,
//           specialite,
//           disponibilite,
//           tache_actuelle as tacheActuelle,
//           date_absence as dateAbsence,
//           type_absence as typeAbsence
//          FROM employe 
//          ORDER BY nom, prenom ASC`
//       );
      
//       const employes = (rows as any[]).map(row => ({
//         id: String(row.id),
//         nom: String(row.nom),
//         prenom: String(row.prenom),
//         fonction: String(row.fonction),
//         contact: String(row.contact),
//         specialite: row.specialite ? String(row.specialite) : undefined,
//         disponibilite: row.disponibilite as "disponible" | "affecte" | "absent",
//         tacheActuelle: row.tacheActuelle ? String(row.tacheActuelle) : undefined,
//         dateAbsence: row.dateAbsence ? new Date(row.dateAbsence).toISOString().split('T')[0] : undefined,
//         typeAbsence: row.typeAbsence as "conge" | "maladie" | undefined
//       }));
      
//       return employes;
//     } catch (error) {
//       console.error('Error fetching employes:', error);
//       throw error;
//     }
//   },

//   async findById(id: string): Promise<EmployeEntity | null> {
//     try {
//       const [rows] = await dbPool.query(
//         `SELECT 
//           id, 
//           nom, 
//           prenom, 
//           fonction,
//           contact,
//           specialite,
//           disponibilite,
//           tache_actuelle as tacheActuelle,
//           date_absence as dateAbsence,
//           type_absence as typeAbsence
//          FROM employe 
//          WHERE id = ? LIMIT 1`,
//         [id]
//       );
      
//       const arr = rows as any[];
//       if (!arr.length) return null;
      
//       const row = arr[0];
//       return {
//         id: String(row.id),
//         nom: String(row.nom),
//         prenom: String(row.prenom),
//         fonction: String(row.fonction),
//         contact: String(row.contact),
//         specialite: row.specialite ? String(row.specialite) : undefined,
//         disponibilite: row.disponibilite as "disponible" | "affecte" | "absent",
//         tacheActuelle: row.tacheActuelle ? String(row.tacheActuelle) : undefined,
//         dateAbsence: row.dateAbsence ? new Date(row.dateAbsence).toISOString().split('T')[0] : undefined,
//         typeAbsence: row.typeAbsence as "conge" | "maladie" | undefined
//       };
//     } catch (error) {
//       console.error('Error fetching employe by id:', error);
//       throw error;
//     }
//   }
// };

// // import { dbPool } from "@/lib/db";

// // export interface EmployeeEntity {
// //   idEmploye: string;
// //   nom: string;
// //   prenom: string;
// //   matricule: string;
// //   fonction: string;
// //   contact: string;
// //   specialite: string;
// //   disponibilite: "disponible" | "affecte" | "absent";
// // }

// // export const employeeModel = {
// //   async findAll(): Promise<EmployeeEntity[]> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        ORDER BY nom ASC, prenom ASC`
// //     );
// //     return rows as EmployeeEntity[];
// //   },

// //   async findById(idEmploye: string): Promise<EmployeeEntity | null> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        WHERE idEmploye = ? LIMIT 1`,
// //       [idEmploye]
// //     );
// //     const arr = rows as EmployeeEntity[];
// //     return arr.length ? arr[0] : null;
// //   },

// //   async findByMatricule(matricule: string): Promise<EmployeeEntity | null> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        WHERE matricule = ? LIMIT 1`,
// //       [matricule]
// //     );
// //     const arr = rows as EmployeeEntity[];
// //     return arr.length ? arr[0] : null;
// //   },

// //   async findBySpecialite(specialite: string): Promise<EmployeeEntity[]> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        WHERE specialite = ? 
// //        ORDER BY nom ASC, prenom ASC`,
// //       [specialite]
// //     );
// //     return rows as EmployeeEntity[];
// //   },

// //   async findByDisponibilite(disponibilite: EmployeeEntity['disponibilite']): Promise<EmployeeEntity[]> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        WHERE disponibilite = ? 
// //        ORDER BY nom ASC, prenom ASC`,
// //       [disponibilite]
// //     );
// //     return rows as EmployeeEntity[];
// //   },

// //   async findAvailable(): Promise<EmployeeEntity[]> {
// //     return this.findByDisponibilite("disponible");
// //   },

// //   async search(term: string): Promise<EmployeeEntity[]> {
// //     const [rows] = await dbPool.query(
// //       `SELECT idEmploye, nom, prenom, matricule, fonction, contact, specialite, disponibilite 
// //        FROM employes 
// //        WHERE nom LIKE ? OR prenom LIKE ? OR matricule LIKE ? OR fonction LIKE ? OR specialite LIKE ?
// //        ORDER BY nom ASC, prenom ASC`,
// //       [`%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`]
// //     );
// //     return rows as EmployeeEntity[];
// //   },

// //   async create(employee: Omit<EmployeeEntity, 'idEmploye'>): Promise<string> {
// //     const [result] = await dbPool.query(
// //       `INSERT INTO employes (nom, prenom, matricule, fonction, contact, specialite, disponibilite) 
// //        VALUES (?, ?, ?, ?, ?, ?, ?)`,
// //       [employee.nom, employee.prenom, employee.matricule, employee.fonction, employee.contact, employee.specialite, employee.disponibilite]
// //     );
// //     return (result as any).insertId;
// //   },

// //   async update(idEmploye: string, employee: Partial<Omit<EmployeeEntity, 'idEmploye'>>): Promise<boolean> {
// //     const fields = [];
// //     const values = [];
    
// //     Object.entries(employee).forEach(([key, value]) => {
// //       if (value !== undefined) {
// //         fields.push(`${key} = ?`);
// //         values.push(value);
// //       }
// //     });
    
// //     if (fields.length === 0) return false;
    
// //     values.push(idEmploye);
// //     const [result] = await dbPool.query(
// //       `UPDATE employes SET ${fields.join(', ')} WHERE idEmploye = ?`,
// //       values
// //     );
    
// //     return (result as any).affectedRows > 0;
// //   },

// //   async updateDisponibilite(idEmploye: string, disponibilite: EmployeeEntity['disponibilite']): Promise<boolean> {
// //     const [result] = await dbPool.query(
// //       `UPDATE employes SET disponibilite = ? WHERE idEmploye = ?`,
// //       [disponibilite, idEmploye]
// //     );
// //     return (result as any).affectedRows > 0;
// //   },

// //   async delete(idEmploye: string): Promise<boolean> {
// //     const [result] = await dbPool.query(
// //       `DELETE FROM employes WHERE idEmploye = ?`,
// //       [idEmploye]
// //     );
// //     return (result as any).affectedRows > 0;
// //   }
// // };
