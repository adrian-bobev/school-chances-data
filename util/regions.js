const path = require('path');
const { promises: fs } = require('fs');
const REGIONS_LENGTH = 24;

const dir = path.join(path.dirname(__filename), '../', 'docs');

async function getRegionsDataByDraft(draft) {
    const regions = await Promise.all(
        Array.from({ length: REGIONS_LENGTH }, (_, i) => {
            const regionId = i + 1;
            console.log(`Fetching - region ${regionId} (draft: ${draft})...`);
            return fetch(`https://kg.sofia.bg/api/public/free/spots/school?timeMode=all&draft=${draft}&regionId=${i + 1}`)
                .then(res => { 
                    console.log(`Data recieved - region ${regionId} (draft: ${draft})`);
                    return res.json();
                })
                .catch(err => {
                    console.error(`Failed to fetch - region ${regionId} (draft: ${draft})`);
                    throw new Error(
                        `Failed to fetch - region ${regionId} (draft: ${draft}). Stopping... the build. Use old data....
                        ---------------------------------
                    ${err}`);
                });
        })
    );

    const groups = regions.reduce((acc, region) => {
        const groups = region?.items?.freeSpots?.listZavedenia.map(school => {
            const group = school.dz.groups.find(group => group.draft === draft);

            return {
                id: group.id,
                name: school.dz.name,
                schoolId: school.dz.id,
                regionId: region.items.freeSpots.selectedRegion.region.id,
                regionName: region.items.freeSpots.selectedRegion.region.name
            };
        });

        return [...acc, ...groups];
    }, []);

    const result = { date: new Date().toISOString(), groups};

    debugger

    return result;
};

async function getAllRegions() {
    console.log(`Fetching - all regions...`);
    const result = await fetch(`https://kg.sofia.bg/api/public/regions/all`).then(res => {
        console.log(`Data recieved = all regions`);
        return res.json();
    }).catch(err => {
        console.error(`Failed to fetch - all regions`);
        throw new Error(
            `Failed to fetch - all regions
            ---------------------------------
        ${err}`);
    });;

    await fs.writeFile(path.join(dir, `/regions.json`), JSON.stringify(result), 'utf8');
}

module.exports = {
    getAllRegions,
    getRegionsDataByDraft
};