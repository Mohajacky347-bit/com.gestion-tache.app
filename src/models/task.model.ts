import { dbPool } from "@/lib/db";

export interface TaskEntity {
  id: string;
  description: string;
  dateDebut: string;
  dateFin: string;
  dateFinReel?: string;
  statut: string;
  id_brigade?: number;
  id_equipe?: number;
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
  async findAll(filters?: { brigadeId?: number; equipeId?: number }): Promise<TaskEntity[]> {
    const where: string[] = [];
    const params: any[] = [];

    if (filters?.brigadeId) {
      where.push("id_brigade = ?");
      params.push(filters.brigadeId);
    }

    if (filters?.equipeId) {
      where.push("id_equipe = ?");
      params.push(filters.equipeId);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await dbPool.query(
      `SELECT 
        id, 
        description, 
        dateDebut, 
        datefin as dateFin, 
        date_fin_reel as dateFinReel, 
        statut,
        id_brigade,
        id_equipe
       FROM tache 
       ${whereClause}
       ORDER BY dateDebut DESC`,
      params
    );
    
    const tasks = (rows as any[]).map(row => ({
      id: String(row.id),
      description: String(row.description),
      dateDebut: String(row.dateDebut),
      dateFin: String(row.dateFin),
      dateFinReel: row.dateFinReel ? String(row.dateFinReel) : undefined,
      statut: String(row.statut),
      id_brigade: row.id_brigade ? Number(row.id_brigade) : undefined,
      id_equipe: row.id_equipe ? Number(row.id_equipe) : undefined
    }));
    
    return tasks;
  },

  async findById(id: string): Promise<TaskEntity | null> {
    const [rows] = await dbPool.query(
      `SELECT 
        id, 
        description, 
        dateDebut, 
        datefin as dateFin, 
        date_fin_reel as dateFinReel, 
        statut,
        id_brigade,
        id_equipe
       FROM tache 
       WHERE id = ? LIMIT 1`,
      [id]
    );
    
    const arr = rows as any[];
    if (!arr.length) return null;
    
    const row = arr[0];
    return {
      id: String(row.id),
      description: String(row.description),
      dateDebut: String(row.dateDebut),
      dateFin: String(row.dateFin),
      dateFinReel: row.dateFinReel ? String(row.dateFinReel) : undefined,
      statut: String(row.statut),
      id_brigade: row.id_brigade ? Number(row.id_brigade) : undefined,
      id_equipe: row.id_equipe ? Number(row.id_equipe) : undefined
    };
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
      `INSERT INTO tache (id, description, dateDebut, datefin, date_fin_reel, statut, id_brigade, id_equipe) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId, 
        task.description, 
        task.dateDebut, 
        task.dateFin, 
        task.dateFinReel, 
        task.statut,
        task.id_brigade || null,
        task.id_equipe || null
      ]
    );
    
    return {
      ...task,
      id: newId
    };
  },

  async update(id: string, task: Omit<TaskEntity, "id">): Promise<boolean> {
    const [result] = await dbPool.query(
      `UPDATE tache 
       SET description = ?, dateDebut = ?, datefin = ?, 
           date_fin_reel = ?, statut = ?, id_brigade = ?, id_equipe = ?
       WHERE id = ?`,
      [
        task.description, 
        task.dateDebut, 
        task.dateFin, 
        task.dateFinReel, 
        task.statut,
        task.id_brigade || null,
        task.id_equipe || null,
        id
      ]
    );
    
    return (result as any).affectedRows > 0;
  },

  async delete(id: string): Promise<boolean> {
    const [result] = await dbPool.query("DELETE FROM tache WHERE id = ?", [id]);
    return (result as any).affectedRows > 0;
  },

  // Gestion des matériels (gardé pour compatibilité)
  async assignMateriels(idTache: string, materiels: { nom: string; quantite: number }[]): Promise<void> {
    await dbPool.query("DELETE FROM tache_materiel WHERE idTache = ?", [idTache]);
    
    for (const materiel of materiels) {
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
    
    const phases = (rows as any[]).map(row => ({
      id: String(row.id),
      idTache: String(row.idTache),
      nom: String(row.nom),
      description: String(row.description),
      dureePrevue: Number(row.dureePrevue),
      dateDebut: String(row.dateDebut),
      dateFin: String(row.dateFin),
      statut: String(row.statut)
    }));
    
    return phases;
  },

  async findMaterialsByBrigade(id_brigade: number): Promise<Array<{
    materielId: string;
    nom: string;
    type: string;
    stock: number;
    disponible: boolean;
    quantiteUtilisee: number;
    tache: {
      id: string;
      description: string;
      statut: string;
      dateDebut: string;
      dateFin: string;
    };
  }>> {
    const [rows] = await dbPool.query(
      `SELECT
        m.id as materielId,
        m.nom,
        m.type,
        m.quantite as stock,
        m.disponible,
        tm.quantiteUtilisee,
        t.id as tacheId,
        t.description as tacheDescription,
        t.statut as tacheStatut,
        t.dateDebut,
        t.datefin as dateFin
      FROM tache t
      INNER JOIN tache_materiel tm ON tm.idTache = t.id
      INNER JOIN materiel m ON m.id = tm.idMateriel
      WHERE t.id_brigade = ?
      ORDER BY t.dateDebut DESC`,
      [id_brigade]
    );

    return (rows as any[]).map(row => ({
      materielId: String(row.materielId),
      nom: String(row.nom),
      type: String(row.type),
      stock: Number(row.stock),
      disponible: row.disponible === 1,
      quantiteUtilisee: Number(row.quantiteUtilisee ?? 0),
      tache: {
        id: String(row.tacheId),
        description: String(row.tacheDescription),
        statut: String(row.tacheStatut),
        dateDebut: row.dateDebut ? String(row.dateDebut) : "",
        dateFin: row.dateFin ? String(row.dateFin) : "",
      },
    }));
  }
};