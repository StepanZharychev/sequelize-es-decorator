const elasticsearch = require('@elastic/elasticsearch');
const {typeCheck} = require('type-check');
const {types} = require('./config/constants');
const decorateAdd = require('./methods/add');
const decorateUpdate = require('./methods/update');
const decorateRemove = require('./methods/remove');
const decorateIndex = require('./methods/index');
const decorateApplySettings = require('./methods/applySettings');

class Decorator {
    constructor(esConfig, database, indexSetting, options) {
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

        this.indexSetting = indexSetting;
        this.options = options || {};
    }

    decorate(model) {
        if (model.getSearchOptions) {
            const options = model.getSearchOptions();

            if (options && typeCheck(types.modelIndexConfig, options)) {
                this.client.indices.exists({
                    index: `${this.database}_${options.type}`
                }).then(res => {
                    const status = !(res.statusCode === 404);
                    if (!status) {
                        this.client.indices.create(this.indexSetting ? {
                            index: `${this.database}_${options.type}`,
                            body: {
                                settings: this.indexSetting
                            }
                        } : {
                            index: `${this.database}_${options.type}`
                        });
                    }
                });

                decorateAdd(model, this.client, this.database, this.options);
                decorateUpdate(model, this.client, this.database, this.options);
                decorateRemove(model, this.client, this.database, this.options);
                decorateIndex(model, this.client, this.database);
                decorateApplySettings(model, this.client, this.database, this.indexSetting);

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
