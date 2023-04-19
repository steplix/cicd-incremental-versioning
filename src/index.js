const { getInput, setOutput, setFailed } = require('@actions/core');
const { createTag, getRepoTags, getBranchTags } = require('./helpers/git.helper');
const { isValidTag, extractVersion, DEFAULT_VERSION } = require('./helpers/version.helper');

const prefix = getInput('PREFIX');
const dryRun = getInput('DRY_RUN');
const perBranch = getInput('PER_BRANCH');

const run = async () => {
    try {
        const latest = perBranch === 'true' ? await getMostRecentBranchVersion() : await getMostRecentRepoVersion();
        const version = latest + 1;
        const tag = `${prefix}${version}`;
        console.log(`Using tag prefix "${prefix}"`);

        setOutput('VERSION', version.toString());
        setOutput('VERSION_TAG', tag);

        console.log(`Result: "${version.toString()}" (tag: "${tag}")`);

        if (dryRun !== 'true') {
            await createTag(tag);
        }
    }
    catch (error) {
        setFailed(error.message);
    }
};

const getMostRecentRepoVersion = async () => {
    console.log('Getting list of tags from repository');

    const tags = await getRepoTags();
    const versions = tags
        .filter(tag => isValidTag(tag))
        .map(tag => extractVersion(tag))
        .sort((a, b) => b - a);

    return versions[0] || DEFAULT_VERSION;
};

const getMostRecentBranchVersion = async () => {
    console.log('Getting list of tags from branch');

    const tags = await getBranchTags();
    const versions = tags
        .filter(tag => isValidTag(tag))
        .map(tag => extractVersion(tag))
        .sort((a, b) => b - a);

    return versions[0] || DEFAULT_VERSION;
};

run();
