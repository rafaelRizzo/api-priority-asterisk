import { autoPriorityByTrunkSchema, priorityAddSchema, priorityByTrunkSchema, priorityDeleteSchema } from '../schemas/prioritySchemas.js';
import { PriorityController } from "../controllers/priorityControllers.js"

import { mapTrunksToCache } from "../services/priorityServices.js";
import { validateToken } from "../middlewares/validateToken.js";
import cron from "node-cron"

const priorityController = new PriorityController();

/**
 *
 * Aqui ficará funções para lidar com as rotas de prioridades, será gerado uma tabela nova para armazenarmos os dados de prioridades de cada tronco, a criação dessa tabela juntamente com os tipos de dados da coluna estará no install.sh deste projeto!
 * ATENÇÃO NÃO RODE O MIGRATE NEM DB PUSH DO PRISMA !
 * 
*/

// Mapeamento dos troncos e sua correspoondente prioridade na inicialização
await mapTrunksToCache();

// Atualizo a cada 10min e coloco no cache
cron.schedule('*/10 * * * *', async () => {
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
            return reply.code(500).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }
    });

    // Rota para criar listar todas as prioridades
    fastify.get('/api/v1/priority', {
        preHandler: validateToken
    }, async (request, reply) => {
        try {
            const priorities_data = await priorityController.getAllPriority();

            return reply.code(200).send({ priorities: priorities_data });
        } catch (error) {
            return reply.code(500).send({ error: error.message || 'Erro ao listar as prioridades.' });
        }
    });

    /// Rota para listar prioridade pelo nome do tronco
    fastify.get('/api/v1/priority/:trunk', {
        preHandler: validateToken,
        schema: priorityByTrunkSchema
    }, async (request, reply) => {
        const { trunk } = request.params;

        try {
            const prioritiy_data = await priorityController.getByTrunkPriority({ trunk });

            return reply.code(200).send({ priority: prioritiy_data });
        } catch (error) {
            return reply.code(500).send({ error: error.message || 'Erro ao listar a prioridade do tronco.' });
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
            return reply.code(500).send({ error: error.message || 'Erro ao adicionar a prioridade.' });
        }
    });

    // Rota que de acordo com a quantidade de requisições a API do tronco, retornará qual a prioridade é necessaria para aquela empresa no momento
    fastify.get('/api/v1/autopriority/:trunk', {
        preHandler: validateToken,
        schema: autoPriorityByTrunkSchema
    }, priorityController.getAutoPriority);
}
