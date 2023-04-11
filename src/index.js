const core = require('@actions/core');
const gitHelper = require('./helpers/git.helper');
const versionHelper = require('./helpers/version.helper');

const prefix = core.getInput('PREFIX');
const dryRun = core.getInput('DRY_RUN');
const deleteUp = core.getInput('DELETE_UP');
const perBranch = core.getInput('PER_BRANCH');

const run = async () => {
    try {
        const latest = perBranch === 'true' ? await getMostRecentBranchVersion() : await getMostRecentRepoVersion();
        const version = latest + 1;
        const tag = `${prefix}${version}`;
        console.log(`Using tag prefix "${prefix}"`);

        core.setOutput('version', version.toString());
        core.setOutput('version-tag', tag);

        console.log(`Result: "${version.toString()}" (tag: "${tag}")`);

        if (dryRun !== 'true') {
            await gitHelper.createTag(tag);

            if (versionHelper.isValidTag(deleteUp)) {
                const tagsToDelete = await getTagsToDelete();
                await gitHelper.deleteTags(tagsToDelete);
            }
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
};

const getMostRecentRepoVersion = async () => {
    console.log('Getting list of tags from repository');

    const tags = await gitHelper.getRepoTags();
    const versions = tags
        .filter(tag => versionHelper.isValidTag(tag))
        .map(tag => versionHelper.extractVersion(tag))
        .sort((a, b) => b - a);

    return versions[0] || versionHelper.DEFAULT_VERSION;
};

const getMostRecentBranchVersion = async () => {
    console.log('Getting list of tags from branch');

    const tags = await gitHelper.getBranchTags();
    const versions = tags
        .filter(tag => versionHelper.isValidTag(tag))
        .map(tag => versionHelper.extractVersion(tag))
        .sort((a, b) => b - a);

    return versions[0] || versionHelper.DEFAULT_VERSION;
};

const getTagsToDelete = async () => {
    const tags = perBranch === 'true' ? await gitHelper.getBranchTags() : await gitHelper.getRepoTags();
    const versionUp = versionHelper.extractVersion(deleteUp);

    return tags
        .filter(tag => versionHelper.isValidTag(tag))
        .filter(tag => {
            const version = versionHelper.extractVersion(tag);
            return version < versionUp;
        });
};

run();
