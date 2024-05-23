const path = require('path');
const { promises: fs } = require('fs');
const { getRegionsDataByDraft } = require('./regions');

const dir = path.join(path.dirname(__filename), '../', 'docs');
const sleep = require('./time');


function extractChildProps(child) {
    const stringPoints = `${child.points}`;
    const group = parseInt(stringPoints[0]);
    const points = parseInt(stringPoints.slice(1));
    return {
        childNum: child.childNum,
        name: getString(child.firstName) + getString(child.middleName) + getString(child.lastName),
        wishOrder: child.wishOrder,
        points,
        group
    };
}

function getString(letter) {
    return letter ? letter : '';
}

async function getGroupsByDraft(draft) {
    const lists = [];
    const regions = await getRegionsDataByDraft(draft);
    
    for (var i = 0; i < regions.groups.length; i++) {
        const group = regions.groups[i];

        if (i % 40 === 0) {
            await sleep(5000);
        }
        console.log(`Fetching - group ${group.id} (draft: ${draft})...`);
        await fetch(`https://kg.sofia.bg/api/stat-rating/waiting/${group.id}`)
            .then(async res => {
                console.log(`Data recieved - group ${group.id} (draft: ${draft}), name: ${group.name}`);
                const data = await res.json();
                lists.push(data);;
            })
            .catch(err => {
                console.error(`Failed to fetch - group ${group.id} (draft: ${draft}), name: ${group.name}`);
                console.error(err);
                return null;
            });
    };

    const groups = regions.groups.map((group, index) => {
        return {
            ...group,
            freeCommon: lists[index]?.items?.freeCommon || lists[index]?.items?.freeSpots,
            freeSocial: lists[index]?.items?.freeSocial || 0,
            listCommon: lists[index]?.items?.listCommon?.map(extractChildProps) || lists[index]?.items?.listWaiting?.map(extractChildProps) || [],
            listSocial: lists[index]?.items?.listSocial?.map(extractChildProps) || []
        }
    });

    const result = { date: new Date().toISOString(), groups };

    await fs.writeFile(path.join(dir, `/${draft}.json`), JSON.stringify(result), 'utf8');

    return result;
};

module.exports = getGroupsByDraft;