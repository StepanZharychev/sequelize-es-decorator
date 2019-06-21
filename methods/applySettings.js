module.exports = (model, client, database, initialSettings) => {
    const options = model.getSearchOptions();

    model.applySettings = async (settings = initialSettings) => {
        await client.indices.close({index: `${database}_${options.type}`});
        await client.indices.putSettings({index: `${database}_${options.type}`, body: settings});
        await client.indices.open({index: `${database}_${options.type}`});

        return 'applied';
    };
};