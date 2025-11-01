import { NextRequest } from "next/server";
import { rapportService } from "@/services/rapport.service";

export const rapportController = {
  async list(_req: NextRequest) {
    try {
      const data = await rapportService.listWithPhotos();
      return Response.json(data);
    } catch (error) {
      console.error('List error:', error);
      return Response.json({ error: "Erreur lors de la récupération des rapports" }, { status: 500 });
    }
  },

  async create(request: NextRequest) {
    try {
      const formData = await request.formData();
      
      console.log('FormData received:', {
        description: formData.get('description'),
        dateRapport: formData.get('dateRapport'),
        avancement: formData.get('avancement'),
        idPhase: formData.get('idPhase'),
        photosCount: formData.getAll('photos').length
      });

      // Extraire les champs texte
      const description = formData.get('description') as string;
      const dateRapport = formData.get('dateRapport') as string;
      const avancement = parseInt(formData.get('avancement') as string);
      const idPhase = formData.get('idPhase') as string;
      
      // Validation des champs requis
      if (!description || !dateRapport || !idPhase) {
        return Response.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
      }

      // Récupérer les fichiers - CORRECTION ICI
      const photos: { buffer: Buffer; originalName: string }[] = [];
      const photoFiles = formData.getAll('photos') as File[];
      
      console.log('Photos files found:', photoFiles.length);
      
      for (const file of photoFiles) {
        if (file && file.size > 0 && file.name) {
          console.log('Processing file:', file.name, file.size, file.type);
          const buffer = Buffer.from(await file.arrayBuffer());
          photos.push({
            buffer,
            originalName: file.name
          });
        }
      }
      
      // Validation des photos
      if (photos.length === 0) {
        return Response.json({ error: "Au moins une photo est obligatoire" }, { status: 400 });
      }

      console.log('Validated photos count:', photos.length);

      const rapportData = {
        description,
        dateRapport,
        avancement: avancement || 0,
        idPhase,
        validation: "en_attente" as const
      };
      
      console.log('Creating rapport with data:', rapportData);
      
      const result = await rapportService.createWithPhotos(rapportData, photos);
      return Response.json(result, { status: 201 });
    } catch (error) {
      console.error('Create error:', error);
      return Response.json({ 
        error: error instanceof Error ? error.message : "Erreur lors de la création du rapport" 
      }, { status: 500 });
    }
  },

  async update(request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const formData = await request.formData();
      
      console.log('Update FormData received:', {
        id: params.id,
        description: formData.get('description'),
        photosCount: formData.getAll('photos').length
      });

      // Extraire les champs texte
      const description = formData.get('description') as string;
      const dateRapport = formData.get('dateRapport') as string;
      const avancement = parseInt(formData.get('avancement') as string);
      const idPhase = formData.get('idPhase') as string;
      
      // Validation des champs requis
      if (!description || !dateRapport || !idPhase) {
        return Response.json({ error: "Tous les champs sont obligatoires" }, { status: 400 });
      }

      // Récupérer les nouveaux fichiers
      const newPhotos: { buffer: Buffer; originalName: string }[] = [];
      const photoFiles = formData.getAll('photos') as File[];
      
      for (const file of photoFiles) {
        if (file && file.size > 0 && file.name) {
          const buffer = Buffer.from(await file.arrayBuffer());
          newPhotos.push({
            buffer,
            originalName: file.name
          });
        }
      }
      
      const rapportData = {
        description,
        dateRapport,
        avancement: avancement || 0,
        idPhase
      };
      
      console.log('Updating rapport with new photos:', newPhotos.length);
      
      const success = await rapportService.updateWithPhotos(params.id, rapportData, newPhotos);
      if (!success) {
        return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Rapport modifié avec succès" });
    } catch (error) {
      console.error('Update error:', error);
      return Response.json({ 
        error: error instanceof Error ? error.message : "Erreur lors de la modification du rapport" 
      }, { status: 500 });
    }
  },

  async delete(_request: NextRequest, { params }: { params: { id: string } }) {
    try {
      const success = await rapportService.delete(params.id);
      if (!success) {
        return Response.json({ error: "Rapport non trouvé" }, { status: 404 });
      }
      return Response.json({ message: "Rapport supprimé avec succès" });
    } catch (error) {
      console.error('Delete error:', error);
      return Response.json({ 
        error: error instanceof Error ? error.message : "Erreur lors de la suppression du rapport" 
      }, { status: 500 });
    }
  },
};
