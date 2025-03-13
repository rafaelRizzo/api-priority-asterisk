export const priorityAddSchema = {
    body: {
        type: 'object',
        required: ['trunk', 'priority'],
        properties: {
            trunk: { type: 'string' },
            priority: { type: 'integer', minimum: 1, maximum: 10 },
            start_date: { type: 'string', pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$" },
            end_date: { type: 'string', pattern: "^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$" }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                content: { type: 'string' }
            }
        }
    }
};

export const priorityByTrunkSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                priority: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        trunk: { type: 'string' },
                        priority: { type: 'integer' },
                        start_date: { type: 'string', format: 'date-time' },
                        end_date: { type: 'string', format: 'date-time' },
                        created_date: { type: 'string', format: 'date-time' },
                        formatted_start_date: { type: 'string' },
                        formatted_end_date: { type: 'string' },
                    }
                }
            }
        }
    }
};

export const priorityDeleteSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                content: { type: 'string' }
            }
        }
    }
};

export const autoPriorityByTrunkSchema = {
    params: {
        type: 'object',
        required: ['trunk'],
        properties: {
            trunk: { type: 'string' }
        }
    },
    response: {
        200: {
            type: 'object',
            properties: {
                type: { type: 'string' },
                priority: { type: 'number' }
            }
        }
    }
};
