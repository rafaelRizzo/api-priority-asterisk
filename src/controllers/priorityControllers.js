import { PriorityModel } from "../models/priorityModels.js";
import { cache } from "../utils/cache.js";
import { convertToISO } from "../utils/dateFunctions.js";

const priorityModel = new PriorityModel();

/**
 * 
 * Aqui é o controller das prioridades.
 * 
*/

export class PriorityController {
    addPriority = async ({ trunk, priority, start_date, end_date, created_date }) => {
        const now = new Date();

        // Se não for passado start_date e end_date, definir valores padrão
        start_date = start_date ? convertToISO(start_date) : convertToISO(now);
        end_date = end_date ? convertToISO(end_date) : convertToISO(new Date(now.setFullYear(now.getFullYear() + 100)));

        // Obtendo a data atual com UTC-3 no formato ISO
        created_date = convertToISO(new Date());

        const priority_data = await priorityModel.addPriority({ trunk, priority, start_date, end_date, created_date });
        return priority_data;
    }

    getAllPriority = async () => {
        let priorities_data_cache = cache.get("priorities");
        let priorities_data;

        if (!priorities_data_cache) {
            priorities_data = await priorityModel.getAllPriority();
        }

        return priorities_data;
    }

    getByTrunkPriority = async ({ trunk }) => {
        const priority_data = await priorityModel.getByTrunkPriority({ trunk });
        return priority_data;
    }

    deletePriority = async ({ trunk }) => {
        const priority_data = await priorityModel.deletePriority({ trunk });
        return priority_data;
    }
}