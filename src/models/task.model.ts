import { dbPool } from "@/lib/db";

export interface TaskEntity {
  id: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  statut: string;
}

export interface PhaseEntity {
  id: string;
  idTache: string;
  nom: string;
  description: string;
  dureePrevue: number;
  dateDebut: string;
  dateFin: string;
  statut: string;
}

export const taskModel = {
  async findAll(): Promise<TaskEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT id, description, dateDebut, datefin as dateFin, 
              date_fin_reel as dateFinReel, statut 
       FROM tache ORDER BY dateDebut DESC`
    );
    return rows as TaskEntity[];
  },

  async findById(id: string): Promise<TaskEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT id, description, dateDebut, datefin as dateFin, 
              date_fin_reel as dateFinReel, statut 
       FROM tache WHERE id = ? LIMIT 1`,
      [id]
    );
    const arr = rows as TaskEntity[];
    return arr.length ? arr[0] : null;
  },

  async create(task: Omit<TaskEntity, "id">): Promise<TaskEntity> {
    // Générer un ID unique basé sur le dernier ID existant
    const [lastTask] = await dbPool.query(
      "SELECT id FROM tache ORDER BY id DESC LIMIT 1"
    );
    const lastTasks = lastTask as { id: string }[];
    const lastId = lastTasks[0]?.id || "T000";
    const lastNumber = parseInt(lastId.replace('T', '')) || 0;
    const newId = `T${String(lastNumber + 1).padStart(3, '0')}`;

    await dbPool.query(
      `INSERT INTO tache (id, description, dateDebut, datefin, date_fin_reel, statut) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newId, task.description, task.dateDebut, task.dateFin, task.dateFinReel, task.statut]
    );
    
    return {
      ...task,
      id: newId
    };
  },

  async update(id: string, task: Omit<TaskEntity, "id">): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE tache SET description = ?, dateDebut = ?, datefin = ?, 
                         date_fin_reel = ?, statut = ? 
       WHERE id = ?`,
      [task.description, task.dateDebut, task.dateFin, task.dateFinReel, task.statut, id]
    );
    
    return (result as any).affectedRows > 0;
  },

  async delete(id: string): Promise<boolean> {
    // Les contraintes CASCADE vont supprimer automatiquement les relations
    const [result] = await dbPool.query("DELETE FROM tache WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  },

  // Gestion des employés
  async assignEmployes(idTache: string, employes: string[]): Promise<void> {
    await dbPool.query("DELETE FROM tache_employe WHERE idTache = ?", [idTache]);
    
    for (const employeNom of employes) {
      // Trouver l'ID de l'employé par son nom
      const [employeRows] = await dbPool.query(
        "SELECT id FROM employe WHERE CONCAT(prenom, ' ', nom) = ? LIMIT 1",
        [employeNom]
      );
      const employesFound = employeRows as { id: string }[];
      
      if (employesFound.length > 0) {
        await dbPool.query(
          "INSERT INTO tache_employe (idTache, idEmploye) VALUES (?, ?)",
          [idTache, employesFound[0].id]
        );
      }
    }
  },

  async getEmployesByTask(idTache: string): Promise<string[]> {
    const [rows] = await dbPool.query(
      `SELECT e.nom, e.prenom 
       FROM tache_employe te 
       JOIN employe e ON te.idEmploye = e.id 
       WHERE te.idTache = ?`,
      [idTache]
    );
    const employes = rows as { nom: string; prenom: string }[];
    return employes.map(emp => `${emp.prenom} ${emp.nom}`);
  },

  // Gestion des matériels
  async assignMateriels(idTache: string, materiels: { nom: string; quantite: number }[]): Promise<void> {
    await dbPool.query("DELETE FROM tache_materiel WHERE idTache = ?", [idTache]);
    
    for (const materiel of materiels) {
      // Trouver l'ID du matériel par son nom
      const [materielRows] = await dbPool.query(
        "SELECT id FROM materiel WHERE nom = ? LIMIT 1",
        [materiel.nom]
      );
      const materielsFound = materielRows as { id: string }[];
      
      if (materielsFound.length > 0) {
        await dbPool.query(
          "INSERT INTO tache_materiel (idTache, idMateriel, quantiteUtilisee) VALUES (?, ?, ?)",
          [idTache, materielsFound[0].id, materiel.quantite]
        );
      }
    }
  },

  async getMaterielsByTask(idTache: string): Promise<{ nom: string; quantite: number }[]> {
    const [rows] = await dbPool.query(
      `SELECT m.nom, tm.quantiteUtilisee as quantite
       FROM tache_materiel tm 
       JOIN materiel m ON tm.idMateriel = m.id 
       WHERE tm.idTache = ?`,
      [idTache]
    );
    return rows as { nom: string; quantite: number }[];
  },

  // Gestion des phases
  async createPhases(idTache: string, phases: Omit<PhaseEntity, "id" | "idTache">[]): Promise<void> {
    await dbPool.query("DELETE FROM phase WHERE idTache = ?", [idTache]);
    
    for (const phase of phases) {
      // Générer un ID unique pour chaque phase
      const [lastPhase] = await dbPool.query(
        "SELECT id FROM phase ORDER BY id DESC LIMIT 1"
      );
      const lastPhases = lastPhase as { id: string }[];
      const lastId = lastPhases[0]?.id || "P000";
      const lastNumber = parseInt(lastId.replace('P', '')) || 0;
      const newPhaseId = `P${String(lastNumber + 1).padStart(3, '0')}`;

      await dbPool.query(
        `INSERT INTO phase (id, idTache, nom, description, dureePrevue, dateDebut, dateFin, statut) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [newPhaseId, idTache, phase.nom, phase.description, phase.dureePrevue, phase.dateDebut, phase.dateFin, phase.statut]
      );
    }
  },

  async getPhasesByTask(idTache: string): Promise<PhaseEntity[]> {
    const [rows] = await dbPool.query(
      `SELECT id, idTache, nom, description, dureePrevue, dateDebut, dateFin, statut 
       FROM phase WHERE idTache = ? ORDER BY dateDebut ASC`,
      [idTache]
    );
    return rows as PhaseEntity[];
  }
};



// import { dbPool } from "@/lib/db";

// export interface TaskEntity {
//   idTache: string;
//   titre: string;
//   description: string;
//   priorite: "basse" | "normale" | "haute" | "critique";
//   dateDebutPrev: string;
//   dateFinPrev: string;
//   dateDebutReel?: string | null;
//   dateFinReel?: string | null;
//   statut: "planifie" | "en_cours" | "termine" | "annule" | "en_pause";
//   idPhase: string;
// }

// export const taskModel = {
//   async findAll(): Promise<TaskEntity[]> {
//     const [rows] = await dbPool.query(
//       `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
//        FROM taches 
//        ORDER BY priorite DESC, dateDebutPrev ASC`
//     );
//     return rows as TaskEntity[];
//   },

//   async findById(idTache: string): Promise<TaskEntity | null> {
//     const [rows] = await dbPool.query(
//       `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
//        FROM taches 
//        WHERE idTache = ? LIMIT 1`,
//       [idTache]
//     );
//     const arr = rows as TaskEntity[];
//     return arr.length ? arr[0] : null;
//   },

//   async findByPhase(idPhase: string): Promise<TaskEntity[]> {
//     const [rows] = await dbPool.query(
//       `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
//        FROM taches 
//        WHERE idPhase = ? 
//        ORDER BY priorite DESC, dateDebutPrev ASC`,
//       [idPhase]
//     );
//     return rows as TaskEntity[];
//   },

//   async findByStatus(statut: TaskEntity['statut']): Promise<TaskEntity[]> {
//     const [rows] = await dbPool.query(
//       `SELECT idTache, titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase 
//        FROM taches 
//        WHERE statut = ? 
//        ORDER BY priorite DESC, dateDebutPrev ASC`,
//       [statut]
//     );
//     return rows as TaskEntity[];
//   },

//   async create(task: Omit<TaskEntity, 'idTache'>): Promise<string> {
//     const [result] = await dbPool.query(
//       `INSERT INTO taches (titre, description, priorite, dateDebutPrev, dateFinPrev, dateDebutReel, dateFinReel, statut, idPhase) 
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//       [task.titre, task.description, task.priorite, task.dateDebutPrev, task.dateFinPrev, task.dateDebutReel, task.dateFinReel, task.statut, task.idPhase]
//     );
//     return (result as any).insertId;
//   },

//   async update(idTache: string, task: Partial<Omit<TaskEntity, 'idTache'>>): Promise<boolean> {
//     const fields = [];
//     const values = [];
    
//     Object.entries(task).forEach(([key, value]) => {
//       if (value !== undefined) {
//         fields.push(`${key} = ?`);
//         values.push(value);
//       }
//     });
    
//     if (fields.length === 0) return false;
    
//     values.push(idTache);
//     const [result] = await dbPool.query(
//       `UPDATE taches SET ${fields.join(', ')} WHERE idTache = ?`,
//       values
//     );
    
//     return (result as any).affectedRows > 0;
//   },

//   async delete(idTache: string): Promise<boolean> {
//     const [result] = await dbPool.query(
//       `DELETE FROM taches WHERE idTache = ?`,
//       [idTache]
//     );
//     return (result as any).affectedRows > 0;
//   }
// };
