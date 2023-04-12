const { getInput, setOutput, setFailed } = require('@actions/core');
const { createTag, deleteTags, getRepoTags, getBranchTags } = require('./helpers/git.helper');
const { isValidTag, extractVersion, DEFAULT_VERSION } = require('./helpers/version.helper');

const prefix = getInput('PREFIX');
const dryRun = getInput('DRY_RUN');
const deleteUp = getInput('DELETE_UP');
const perBranch = getInput('PER_BRANCH');

const run = async () => {
    try {
        const latest = perBranch === 'true' ? await getMostRecentBranchVersion() : await getMostRecentRepoVersion();
        const version = latest + 1;
        const tag = `${prefix}${version}`;
        console.log(`Using tag prefix "${prefix}"`);

        setOutput('version', version.toString());
        setOutput('version-tag', tag);

        console.log(`Result: "${version.toString()}" (tag: "${tag}")`);

        if (dryRun !== 'true') {
            await createTag(tag);

            if (isValidTag(deleteUp)) {
                const tagsToDelete = await getTagsToDelete();
                await deleteTags(tagsToDelete);
            }
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

const getTagsToDelete = async () => {
    const tags = perBranch === 'true' ? await getBranchTags() : await getRepoTags();
    const versionUp = extractVersion(deleteUp);

    return tags
        .filter(tag => isValidTag(tag))
        .filter(tag => {
            const version = extractVersion(tag);
            return version < versionUp;
        });
};

run();
