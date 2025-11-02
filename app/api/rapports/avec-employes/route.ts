import { NextRequest } from "next/server";
import { dbPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const [rapportsRows] = await dbPool.query(`
      SELECT 
        r.id,
        r.description,
        r.dateRapport,
        r.photoUrl,
        r.avancement,
        r.idPhase,
        r.validation,
        r.commentaire,
        p.nom as phase_nom,
        p.idTache,
        t.description as tache_description
      FROM rapport r
      LEFT JOIN phase p ON r.idPhase = p.id
      LEFT JOIN tache t ON p.idTache = t.id
      ORDER BY r.dateRapport DESC
    `);

    // Pour chaque rapport, récupérer les employés ET les photos
    const rapportsAvecEmployes = await Promise.all(
      (rapportsRows as any[]).map(async (rapport) => {
        // Récupérer les employés
        const [employesRows] = await dbPool.query(`
          SELECT 
            e.id,
            e.nom,
            e.prenom,
            e.fonction
          FROM employe e
          INNER JOIN tache_employe te ON e.id = te.idEmploye
          WHERE te.idTache = ?
        `, [rapport.idTache]);

        // Récupérer les photos (nouveau système)
        const [photosRows] = await dbPool.query(`
          SELECT 
            id,
            nom_fichier,
            ordre
          FROM rapport_photos 
          WHERE idRapport = ?
          ORDER BY ordre ASC
        `, [rapport.id]);

        return {
          id: rapport.id,
          description: rapport.description,
          dateRapport: rapport.dateRapport,
          photoUrl: rapport.photoUrl,
          avancement: rapport.avancement,
          idPhase: rapport.idPhase,
          validation: rapport.validation,
          commentaire: rapport.commentaire,
          phase: {
            id: rapport.idPhase,
            nom: rapport.phase_nom,
            tache: rapport.idTache ? {
              id: rapport.idTache,
              description: rapport.tache_description
            } : undefined
          },
          employes: (employesRows as any[]).map(emp => ({
            id: emp.id,
            nom: emp.nom,
            prenom: emp.prenom,
            fonction: emp.fonction
          })),
          photos: (photosRows as any[]).map(photo => ({
            id: photo.id.toString(),
            nom_fichier: photo.nom_fichier,
            ordre: photo.ordre
          }))
        };
      })
    );

    return Response.json(rapportsAvecEmployes);
  } catch (error) {
    console.error('Error fetching rapports with employes:', error);
    return Response.json({ error: "Erreur lors de la récupération des rapports" }, { status: 500 });
  }
}
