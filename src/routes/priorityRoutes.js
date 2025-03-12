import { cache } from "../utils/cache.js";
import { convertToGotoIfTime } from '../utils/dateFunctions.js';
import { priorityAddSchema, priorityByTrunkSchema, priorityDeleteSchema } from '../schemas/prioritySchemas.js';
import { PriorityController } from "../controllers/priorityControllers.js"

import { mapTrunksToCache } from "../services/priorityServices.js";
import cron from "node-cron"
import { validateToken } from "../middlewares/validateToken.js";

const priorityController = new PriorityController();

/**
 *
 * Aqui ficará funções para lidar com as rotas de prioridades, será gerado uma tabela nova para armazenarmos os dados de prioridades de cada tronco, a criação dessa tabela juntamente com os tipos de dados da coluna estará no install.sh deste projeto!
 * ATENÇÃO NÃO RODE O MIGRATE NEM DB PUSH DO PRISMA !
 * 
*/

// Mapeamento dos troncos e sua correspoondente prioridade na inicialização
await mapTrunksToCache();


// Atualizo a cada 10 e coloco no cache
cron.schedule('* * * * *', async () => {
    await mapTrunksToCache();
});

export const priorityRoutes = async (fastify) => {
    // Rota para criar setar uma nova prioridade
    fastify.post('/api/v1/priority', {
        preHandler: validateToken,
        schema: priorityAddSchema
    }, async (request, reply) => {
        const { trunk, priority, start_date, end_date } = request.body;

        try {
            // Chama a função addPriority e aguarda a conclusão
            await priorityController.addPriority({ trunk, priority, start_date, end_date });

            return reply.code(200).send({ content: "Prioridade adicionada com sucesso." });
        } catch (error) {
            // Aqui você retorna o erro com a mensagem adequada
            return reply.code(400).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }
    });

    // Rota para criar listar todas as prioridades
    fastify.get('/api/v1/priority', {
        preHandler: validateToken
    }, async (request, reply) => {
        const priorities_data = await priorityController.getAllPriority();

        return reply.code(200).send({ priorities: priorities_data });
    });

    fastify.get('/api/v1/priority/:trunk', {
        preHandler: validateToken,
        schema: priorityByTrunkSchema
    }, async (request, reply) => {
        const { trunk } = request.params;

        try {
            let priorities_data_cache = cache.get(`priority_${trunk}`);

            if (!priorities_data_cache) {
                // Caso o cache não exista, retorna erro informando que o dado não está disponível
                console.log(`Cache não encontrado para o tronco ${trunk}`);

                return reply.code(404).send({ error: "Nenhuma prioridade encontrada no cache para o tronco informado" });
            }

            // Adicionando as propriedades formatadas diretamente no objeto
            const formattedPriority = {
                ...priorities_data_cache,
                formatted_start_date: convertToGotoIfTime(priorities_data_cache.start_date),
                formatted_end_date: convertToGotoIfTime(priorities_data_cache.end_date)
            };

            return reply.code(200).send({ priorities: formattedPriority });
        } catch (error) {
            console.error("Erro ao processar a solicitação:", error);
            return reply.code(500).send({ error: "Erro interno ao processar a solicitação" });
        }
    });

    // Rota para deletar uma prioridade pelo nome do tronco
    fastify.delete('/api/v1/priority/:trunk', { 
        preHandler: validateToken,
        schema: priorityDeleteSchema 
    }, async (request, reply) => {
        // Pegando os dados passados no body da requisição
        const { trunk } = request.params;

        try {
            await priorityController.deletePriority({ trunk })
            reply.code(200).send({ content: "Prioridade deletada com sucesso." });
        } catch (error) {
            console.log(error);
            return reply.code(400).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }
    });
}
