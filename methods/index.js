module.exports = (model, client, database) => {
    const options = model.getSearchOptions();

    model.index = async () => {
        let entries = await model.findAll();

        let totalLength = entries.length;
        let processedLength = 0;

        for (let index = 0; index < entries.length; index++) {
            let entry = entries[index];
            let body = {};

            options.keys.map(key => {
                body[key] = entry[key];
            });

            await client.index({
                index: `${database}_${options.type}`,
                id: entry.id,
                type: 'doc',
                body
            });

            processedLength++;

            if (processedLength === totalLength) {
                return processedLength;
            }
        }
    };
};