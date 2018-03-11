# Sequelize Elastic Search Decorator

[![NPM](https://nodei.co/npm/sequelize-es-decorator.png)](https://nodei.co/npm/sequelize-es-decorator/)

It's a decorator for [Sequelize ORM](https://www.npmjs.com/package/sequelize) that extends methods with auto-indexing into the [Elastic Search](https://www.npmjs.com/package/elasticsearch).

- [Installation](#installation)
- [Setup](#setup)
- [Decoration](#decoration)
- [Reindex](#reindex)
- [Search](#search)

## Installation

```bash
npm i --save sequelize-es-decorator
```

## Setup

Import dependency - it's going to be class Decorator:

``` javascript
const Decorator = require('sequelize-es-decorator');
```

Initialize class instance:

``` javascript
const decorator = new Decorator(esConfig, database);
```

* **esConfig** - _Object_ - configuration for elastic search instance. (all the parameters can be found [here](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/configuration.html));
* **database** - _String_ - name of your database that will be used for index creation;

## Decoration

Before the decoration add _class method_ **getSearchOptions** to Sequelize model in this way (method is required):

``` javascript
model.getSearchOptions = () => {
    return {
        type: '<your_index_type>',
        keys: [<keys_of_entity_to_be_indexed>]
    }
};
```

* **type** - _String_ - type of search index that will be used for indexing and identifying of entries (you can name it the same way as you name the table of db to be consistent);
* **keys** - _Array\<String\>_ - keys of table entry to be indexed;

After you can just decorate the model in this way (and export it outside for example):

``` javascript
module.exports = decorator.decorate(model)
```

## Reindex

You can reindex decorated model fully in this way:

``` javascript
model.index();
```

## Search

Will be available in future release. For now you can use [common es search](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search);