import { TrunksModel } from "../models/trunksModels.js";
import { logger } from './../utils/logger.js';

const trunksModel = new TrunksModel();

/**
 * 
 * Aqui é o controller do trunks.
 * Ele é responsável por receber as requisições da rota, processar os dados e retornar um resultado, nesse caso como é um get não tem nada que precisa ser pego na requisição, apenas fazer a operação para buscar os troncos e retornar.
 * 
*/

export class TrunksController {
    getTrunks = async () => {
        const trunks_data = await trunksModel.getAll();
        return trunks_data;
    }
}