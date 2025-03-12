import { PriorityController } from "../controllers/priorityControllers.js";
import { cache } from "../utils/cache.js";
import { logger } from "../utils/logger.js";

const priorityController = new PriorityController();

export const mapTrunksToCache = async () => {
    try {
        const all_priorities = await priorityController.getAllPriority(); // Busca todas as prioridades
        all_priorities.forEach(priority => {
            cache.set(`priority_${priority.trunk}`, priority); // Armazena as prioridades por tronco no cache
        });
        logger.debug("Mapeamento de troncos realizado com sucesso.");
    } catch (error) {
        logger.debug("Erro ao mapear os troncos:", error);
    }
};