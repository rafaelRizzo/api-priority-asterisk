import { v7 } from "uuid";

/**
 * 
 * Aqui ficará a função de gerar um uuid, ele é extremamente rápido, ordenado e com baixa colisão, ele não é usado para identificar um tronco mas sim para identificar uma prioridade de um tronco, com ele você pode alterar uma prioridade já existente..
 * 
 */

export const generateUUID = () => v7();