const elasticsearch = require('elasticsearch');
const { typeCheck } = require('type-check');
const { types } = require('./config/constants');
const decorateAdd = require('./methods/add');
const decorateUpdate = require('./methods/update');
const decorateRemove = require('./methods/remove');
const decorateIndex = require('./methods/index');

class Decorator {
    constructor(esConfig, database) {
        if (esConfig) {
            this.client = new elasticsearch.Client(esConfig);
        } else {
            throw new Error('Used the wrong type of ES config. Check http://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html');
        }

        if (database && typeCheck(types.databaseName, database)) {
            this.database = database;
        } else {
            throw new Error('Database name must be non-empty string.');
        }
    }

    decorate(model) {
        if (model.getSearchOptions) {
            const options = model.getSearchOptions();

            if (options && typeCheck(types.modelIndexConfig, options)) {
                this.client.indices.exists({
                    index: `${this.database}_${options.type}`
                }).then(status => {
                    if (!status) {
                        this.client.indices.create({
                            index: `${this.database}_${options.type}`
                        });
                    }
                });

                decorateAdd(model, this.client, this.database);
                decorateUpdate(model, this.client, this.database);
                decorateRemove(model, this.client, this.database);
                decorateIndex(model, this.client, this.database);

                return model;
            } else {
                throw new Error('Configuration for model indexing doesn\'t meet required format.')
            }
        } else {
            throw new Error('Model should have class method getSearchOptions, which returns proper configuration.')
        }
    }
}

module.exports = Decorator;