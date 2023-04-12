const { getInput } = require('@actions/core');
const { getExecOutput } = require('@actions/exec');
const { getOctokit, context } = require('@actions/github');

const githubToken = getInput('GITHUB_TOKEN');

const fetchTags = async () => {
    const fetch = await getExecOutput('git', ['fetch', '--tags', '--quiet'], { cwd: '.' });

    if (fetch.exitCode !== 0) {
        console.log(fetch.stderr);
        process.exit(fetch.exitCode);
    }
};

exports.getRepoTags = async () => {
    const octokit = getOctokit(githubToken);

    const { data: tags } = await octokit.rest.git.listMatchingRefs({
        ...context.repo,
        ref: 'tags/'
    });

    return tags.map(tag => tag.ref.replace(/^refs\/tags\//g, ''));
};

exports.getBranchTags = async () => {
    await fetchTags();

    const tags = await getExecOutput('git', ['tag', '--no-column', '--merged'], { cwd: '.' });
    if (tags.exitCode !== 0) {
        console.log(tags.stderr);
        process.exit(tags.exitCode);
    }

    return tags.stdout.split('\n');
};

exports.createTag = async (tag) => {
    const octokit = getOctokit(githubToken);
    const ref = `refs/tags/${tag}`;

    await octokit.rest.git.createRef({
        ...context.repo,
        sha: context.sha,
        ref
    });
};

exports.deleteTags = async (tags) => {
    const octokit = getOctokit(githubToken);

    for (const tag of tags) {
        console.log(`Deleting tag ${tag}`);

        const ref = `refs/tags/${tag}`;
        await octokit.rest.git.deleteRef({
            ...context.repo,
            ref
        });
    }
};
