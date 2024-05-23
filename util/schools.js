const path = require('path');
const { promises: fs } = require('fs');

const dir = path.join(path.dirname(__filename), '../', 'docs');

async function getAllSchools() {
    console.log(`Fetching - all schools...`);
    const data = await fetch(`https://kg.sofia.bg/api/public/kg/type/school/all?filterType=by_region&kgType=0&regionId=0`)
        .then(res => { 
            console.log(`Data recieved - all schools`);
            return res.json();
        })
        .catch(err => {
            console.error(`Failed to fetch - all schools`);
            console.error(err);
            return null;
        });

    const schools = data.items.kinderGardens.map(school => {
        return {
            id: school.id,
            name: school.nameStr
        };
    });
    
    const result = { date: new Date().toISOString(), schools};
    await fs.writeFile(path.join(dir, `/schools.json`), JSON.stringify(result), 'utf8');

    return result;
};

module.exports = getAllSchools;