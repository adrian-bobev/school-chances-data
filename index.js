const getGroupsByDraft = require('./util/groups');
const getAllSchools = require('./util/schools');
const { getAllRegions } = require('./util/regions');

async function run() {
    const year = new Date().getFullYear() - 7;

    await getAllRegions();
    await getAllSchools();
    await getGroupsByDraft(year);
}

run();