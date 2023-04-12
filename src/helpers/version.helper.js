const { getInput } = require('@actions/core');

const prefix = getInput('PREFIX');

const prefixRegex = new RegExp(`^${prefix}`, 'g');

exports.DEFAULT_VERSION = 0;

exports.isValidTag = (tag) => {
    if (!tag) return false;
    if (prefixRegex.test(tag)) return false;
    const strVer = tag.replace(prefixRegex, '');
    const version = Number(strVer);
    return !isNaN(version);
};

exports.extractVersion = (tag) => {
    const strVer = tag.replace(prefixRegex, '');
    return Number(strVer);
};
