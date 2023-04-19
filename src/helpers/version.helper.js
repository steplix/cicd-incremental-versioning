const { getInput } = require('@actions/core');

const prefix = getInput('PREFIX');

const prefixRegex = new RegExp(`^${prefix}`, 'g');

exports.DEFAULT_VERSION = 0;

exports.isValidTag = (tag) => {
    if (!tag) return false;
    if (typeof tag !== 'string') return false;
    const match = tag.match(prefixRegex);
    if (!match) return false;
    if (match.length !== 1) return false;
    if (match[0] !== prefix) return false;

    const strVer = tag.replace(prefixRegex, '');
    const version = Number(strVer);
    return !isNaN(version);
};

exports.extractVersion = (tag) => {
    const strVer = tag.replace(prefixRegex, '');
    return Number(strVer);
};
