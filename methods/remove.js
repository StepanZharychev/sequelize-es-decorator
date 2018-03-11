const methods = require('../config/constants').methods['sequelize'];

module.exports = (model, client, database) => {
    const originalRemove = model[methods.remove];
    const options = model.getSearchOptions();

    model.originalRemove = originalRemove;

    model[methods.remove] = async operationOptions => {
        let entries = await model.findAll({
            attributes: {
                include: ['id']
            },
            ...operationOptions
        });
        const removed = await model.originalRemove(operationOptions);

        let totalLength = entries.length;
        let processedLength = 0;

        for (let index = 0; index < entries.length; index++) {
            let entry = entries[index];

            await client.delete({
                index: `${database}_${options.type}`,
                id: entry.id,
                type: 'doc'
            });

            processedLength++;

            if (processedLength === totalLength) {
                return removed;
            }
        }
    };
};