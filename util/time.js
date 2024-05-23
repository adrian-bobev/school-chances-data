function sleep(ms) {
    console.log(`Sleeping for ${ms/1000} seconds... ${new Date().toISOString()}`);
    return new Promise((resolve) => {
        setTimeout(function() {
            console.log(`Woke up after ${ms/1000} seconds... ${new Date().toISOString()}`);
            resolve();
        }, ms);
    });
}

module.exports = sleep;