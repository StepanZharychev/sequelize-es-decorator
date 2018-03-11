const methods = require('../config/constants').methods['sequelize'];

module.exports = (model, client, database) => {
    const originalCreateMethod = model[methods.create];
    const options = model.getSearchOptions();

    model.originalCreate = originalCreateMethod;

    model[methods.create] = async entry => {
        return new Promise(resolve => {
            model.originalCreate(entry).then(created => {
                let body = {};

                options.keys.map(key => {
                    body[key] = created[key];
                });

                client.index({
                    index: `${database}_${options.type}`,
                    id: created.id,
                    type: 'doc',
                    body
                }).then(() => resolve(created));
            });
        });
    };
};