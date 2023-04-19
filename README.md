# cicd-incremental-versioning

This action locates the current version of the repository using its tags, increments it based on the inputs, then creates a tag for that new version at the current commit. Use it to automate the release deployment of a project.

## Configuration

### Input Parameters (`with`)

#### `GITHUB_TOKEN` (required)

Token to use to push to the repo. Pass in using `secrets.GITHUB_TOKEN`:

``` yaml
env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### `PREFIX`

Version prefix used to create tag, default value `test`:

``` yaml
with:
    PREFIX: test
```

#### `PER_BRANCH`

If specified, only tags merged to the same branch will be considered. Useful for maintenance branches. Note: this requires fetching the history when checking out:

``` yaml
with:
    PER_BRANCH: testing
```

#### `DRY_RUN`

If `true`, only calculate the new version and exit successfully, default value `false`.

``` yaml
with:
    DRY_RUN: false
```

### Example

``` yaml
jobs:
  tag:
    runs-on: ubuntu-latest
    steps:
      - name: Tagging
        uses: steplix/cicd-incremental-versioning@v2
        with:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
