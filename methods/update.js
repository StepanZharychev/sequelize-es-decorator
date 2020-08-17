const methods = require('../config/constants').methods['sequelize'];

module.exports = (model, client, database, globalOptions) => {
    const originalUpdateMethod = model[methods.update];
    const options = model.getSearchOptions();

    model.originalUpdate = originalUpdateMethod;

    model[methods.update] = async (entry, operationOptions) => {
        operationOptions.returning = true;

        return new Promise(resolve => {
            model.originalUpdate(entry, operationOptions).then(updated => {
                let body = {};
                let updatedEntry = updated[1][0];

                if (updatedEntry) {
                    options.keys.map(key => {
                        body[key] = updatedEntry[key];
                    });

                    client.index({
                        index: `${database}_${options.type}`,
                        id: updatedEntry.id,
                        type: 'doc',
                        body
                    })
                        .then(() => resolve(updated))
                        .catch(err => {
                            globalOptions.handleError && globalOptions.handleError(err);
                            if (globalOptions.softMode) {
                                resolve(updated);
                            } else {
                                throw err;
                            }
                        });
                }
            });
        });
    };
};
